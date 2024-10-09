import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from '../../src/queue/queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from '../../src/entities/ticket.entity';
import { Service } from '../../src/entities/service.entity';
import { Visitor } from '../../src/entities/visitor.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

describe('QueueService - Время обработки', () => {
  let service: QueueService;
  let ticketRepository: Repository<Ticket>;
  let serviceRepository: Repository<Service>;
  let visitorRepository: Repository<Visitor>;
  let configService: ConfigService;

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
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SERVICE_PROCESSING_TIME') {
                return 5000;
              }
              return null;
            }),
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
    configService = module.get<ConfigService>(ConfigService);
  });

  it('должен занять как минимум определенное время обработки для создания билета', async () => {
    jest.useFakeTimers();
    jest.setTimeout(20000);

    const mockedService = new Service();
    mockedService.id = uuidv4();
    mockedService.name = 'Тестовая Услуга';

    const mockedVisitor = new Visitor();
    mockedVisitor.id = uuidv4();
    mockedVisitor.name = 'Vlad Kuznetsov';

    serviceRepository.findOne = jest.fn().mockResolvedValue(mockedService);
    visitorRepository.findOne = jest.fn().mockResolvedValue(mockedVisitor);
    visitorRepository.find = jest.fn().mockResolvedValue([]);
    ticketRepository.find = jest.fn().mockResolvedValue([]);
    ticketRepository.save = jest.fn().mockResolvedValue(new Ticket());

    const serviceId = mockedService.id;
    const createVisitDto = {
      serviceId,
      visitorName: mockedVisitor.name,
    };

    const start = Date.now();

    const ticketPromise = service.createTicket(serviceId, createVisitDto);

    jest.advanceTimersByTime(5000);

    await ticketPromise;

    const end = Date.now();

    const elapsed = end - start;
    const expectedProcessingTime = configService.get<number>(
      'SERVICE_PROCESSING_TIME',
      5000,
    );

    expect(elapsed).toBeGreaterThanOrEqual(expectedProcessingTime);

    jest.useRealTimers();
  });
});
