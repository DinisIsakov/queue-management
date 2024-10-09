import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from '../../src/queue/queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from '../../src/entities/ticket.entity';
import { Service } from '../../src/entities/service.entity';
import { Visitor } from '../../src/entities/visitor.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Status } from '../../src/entities/status.enum';

describe('QueueService - Создание билета', () => {
  let service: QueueService;
  let ticketRepository: Repository<Ticket>;
  let serviceRepository: Repository<Service>;
  let visitorRepository: Repository<Visitor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Service),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Visitor),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            create: jest.fn().mockImplementation((visitorData) => {
              const visitor = new Visitor();
              visitor.name = visitorData.name;
              return visitor;
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(5000),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    ticketRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    serviceRepository = module.get<Repository<Service>>(
      getRepositoryToken(Service),
    );
    visitorRepository = module.get<Repository<Visitor>>(
      getRepositoryToken(Visitor),
    );
  });

  it('должен создать билет', async () => {
    const serviceId = uuidv4();
    const createVisitDto = {
      serviceId,
      visitorName: 'Vlad Kuznetsov',
    };

    const mockedService = new Service();
    mockedService.id = serviceId;
    mockedService.name = 'Тестовая услуга';
    serviceRepository.findOne = jest.fn().mockResolvedValue(mockedService);

    const mockedVisitor = new Visitor();
    mockedVisitor.id = uuidv4();
    mockedVisitor.name = createVisitDto.visitorName;

    visitorRepository.findOne = jest.fn().mockResolvedValue(mockedVisitor);

    visitorRepository.find = jest.fn().mockResolvedValue([]);

    const mockedTicket = new Ticket();
    mockedTicket.id = uuidv4();
    mockedTicket.issueDate = new Date();
    mockedTicket.status = Status.QUEUED;
    mockedTicket.service = mockedService;
    mockedTicket.visitor = mockedVisitor;

    ticketRepository.save = jest.fn().mockResolvedValue(mockedTicket);

    const ticket = await service.createTicket(serviceId, createVisitDto);

    expect(ticket).toBeDefined();
    expect(ticket.visitor.name).toEqual('Vlad Kuznetsov');
    expect(ticket.service.name).toBe('Тестовая услуга');
    expect(ticket.status).toBe(Status.QUEUED);
  });

  it('должен выбросить NotFoundException, если услуга не найдена', async () => {
    const serviceId = uuidv4();
    const createVisitDto = {
      serviceId,
      visitorName: 'Vlad Kuznetsov',
    };

    serviceRepository.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.createTicket(serviceId, createVisitDto),
    ).rejects.toThrow(`Услуга с ID '${serviceId}' не найдена.`);
  });

  it('должен создать нового посетителя, если посетитель не найден', async () => {
    const serviceId = uuidv4();
    const createVisitDto = {
      serviceId,
      visitorName: 'Vlad Kuznetsov',
    };

    const mockedService = new Service();
    mockedService.id = serviceId;
    mockedService.name = 'Тестовая услуга';
    serviceRepository.findOne = jest.fn().mockResolvedValue(mockedService);

    visitorRepository.findOne = jest.fn().mockResolvedValue(null);
    visitorRepository.find = jest.fn().mockResolvedValue([]);

    const newVisitor = new Visitor();
    newVisitor.id = uuidv4();
    newVisitor.name = createVisitDto.visitorName;
    visitorRepository.create = jest.fn().mockReturnValue(newVisitor);
    visitorRepository.save = jest.fn().mockResolvedValue(newVisitor);

    const ticket = await service.createTicket(serviceId, createVisitDto);

    expect(visitorRepository.create).toHaveBeenCalledWith({
      name: createVisitDto.visitorName,
      ticketNumber: 0,
    });

    expect(visitorRepository.save).toHaveBeenCalledWith(newVisitor);
    expect(ticket).toBeDefined();
    expect(ticket.visitor.name).toEqual(createVisitDto.visitorName);
  });

  it('должен вернуть null, если билеты не найдены в getNextTicket', async () => {
    ticketRepository.find = jest.fn().mockResolvedValue([]);

    const nextTicket = await service['getNextTicket']();

    expect(nextTicket).toBeNull();
  });
});
