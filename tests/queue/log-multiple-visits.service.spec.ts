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

describe('QueueService - Логирование нескольких посетителей', () => {
  let service: QueueService;
  let ticketRepository: Repository<Ticket>;
  let serviceRepository: Repository<Service>;
  let visitorRepository: Repository<Visitor>;

  let ticketNumberCounter = 0;

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
            query: jest.fn(),
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
            query: jest.fn(),
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

    ticketNumberCounter = 0;
  });

  it('должен логировать уведомление о завершении визита для нескольких посетителей', async () => {
    const mockedService: Service = {
      id: uuidv4(),
      name: 'Тестовая Услуга',
    } as Service;

    const loggerSpy = jest.spyOn(service['logger'], 'log');

    jest.spyOn(serviceRepository, 'findOne').mockResolvedValue(mockedService);

    jest
      .spyOn(visitorRepository, 'save')
      .mockImplementation(async (visitor) => {
        ticketNumberCounter++;
        return {
          id: visitor.id || uuidv4(),
          name: visitor.name,
          ticketNumber: ticketNumberCounter,
          status: visitor.status || Status.QUEUED,
        } as Visitor;
      });

    jest.spyOn(ticketRepository, 'save').mockImplementation(async (ticket) => {
      return {
        id: ticket.id || uuidv4(),
        issueDate: ticket.issueDate || new Date(),
        status: ticket.status || Status.QUEUED,
        service: ticket.service,
        visitor: ticket.visitor,
      } as Ticket;
    });

    const usersCount = [1, 2, 3];
    for (const count of usersCount) {
      const mockedVisitor: Visitor = {
        id: uuidv4(),
        name: `Visitor ${count}`,
        ticketNumber: count,
        status: Status.QUEUED,
      } as Visitor;

      jest.spyOn(visitorRepository, 'findOne').mockResolvedValue(mockedVisitor);
      visitorRepository.find = jest.fn().mockResolvedValue([]);

      const createVisitDto = {
        serviceId: mockedService.id,
        visitorName: mockedVisitor.name,
      };
      await service.createTicket(createVisitDto.serviceId, createVisitDto);
    }

    usersCount.forEach((count) => {
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Выдан талон`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Visitor ${count}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`на услугу: ${mockedService.name}`),
      );
    });

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('В очереди больше нет посетителей.'),
    );
  });
});
