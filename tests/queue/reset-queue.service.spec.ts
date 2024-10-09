import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from '../../src/queue/queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from '../../src/entities/ticket.entity';
import { Service } from '../../src/entities/service.entity';
import { Visitor } from '../../src/entities/visitor.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

describe('QueueService - Сброс очереди', () => {
  let service: QueueService;
  let ticketRepository: Repository<Ticket>;
  let visitorRepository: Repository<Visitor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
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
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Service),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Visitor),
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    ticketRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    visitorRepository = module.get<Repository<Visitor>>(
      getRepositoryToken(Visitor),
    );
  });

  it('должен сбросить очередь, используя truncate', async () => {
    const truncateSpy = jest
      .spyOn(ticketRepository, 'query')
      .mockResolvedValue([]);
    const visitorTruncateSpy = jest
      .spyOn(visitorRepository, 'query')
      .mockResolvedValue([]);

    await service.resetQueue();

    expect(truncateSpy).toHaveBeenCalledWith(
      'TRUNCATE TABLE "tickets" CASCADE',
    );
    expect(visitorTruncateSpy).toHaveBeenCalledWith(
      'TRUNCATE TABLE "visitors" CASCADE',
    );
  });

  it('должен выбросить ошибку, если truncate не удался', async () => {
    jest
      .spyOn(ticketRepository, 'query')
      .mockRejectedValue(new Error('Ошибка базы данных'));

    await expect(service.resetQueue()).rejects.toThrow('Ошибка базы данных');
  });
});
