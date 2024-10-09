import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { Service } from '../entities/service.entity';
import { Visitor } from '../entities/visitor.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ConfigService } from '@nestjs/config';
import { Status } from '../entities/status.enum';
import { validate as isUUID } from 'uuid';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly processingTime: number;
  private activeHandlers: number = 0;
  private noVisitorsLogged = false;

  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Visitor) private visitorRepository: Repository<Visitor>,
    private readonly configService: ConfigService,
  ) {
    this.processingTime =
      this.configService.get<number>('SERVICE_PROCESSING_TIME') || 5000;
  }

  async createTicket(
    serviceId: string,
    createVisitDto: CreateVisitDto,
  ): Promise<Ticket> {
    this.validateServiceId(serviceId);
    this.validateVisitorName(createVisitDto.visitorName);

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Услуга с ID '${serviceId}' не найдена.`);
    }

    const existingTicket = await this.findVisitorByNameAndService(
      createVisitDto.visitorName,
      serviceId,
    );
    if (existingTicket) {
      throw new ConflictException(
        `Посетитель с именем '${createVisitDto.visitorName}' уже зарегистрирован для данной услуги.`,
      );
    }

    let visitor = await this.visitorRepository.findOne({
      where: { name: createVisitDto.visitorName },
    });

    if (!visitor) {
      visitor = this.visitorRepository.create({
        name: createVisitDto.visitorName,
        ticketNumber: 0,
      });
      await this.visitorRepository.save(visitor);
    }

    const lastVisitor = await this.visitorRepository.findOne({
      where: { ticketNumber: Not(IsNull()) },
      order: { ticketNumber: 'DESC' },
    });

    visitor.ticketNumber = lastVisitor ? lastVisitor.ticketNumber + 1 : 1;

    visitor.status = Status.QUEUED;
    await this.visitorRepository.save(visitor);

    const ticket = new Ticket();
    ticket.issueDate = new Date();
    ticket.service = service;
    ticket.visitor = visitor;
    ticket.status = Status.QUEUED;

    await this.ticketRepository.save(ticket);

    this.logger.log(
      `Выдан талон: ${visitor.ticketNumber} для посетителя: ${visitor.name}, на услугу: ${service.name}.`,
    );

    this.handleNextTicket();

    return ticket;
  }

  async findVisitorByNameAndService(
    visitorName: string,
    serviceId: string,
  ): Promise<Ticket | undefined> {
    return this.ticketRepository.findOne({
      where: {
        visitor: {
          name: visitorName,
        },
        service: {
          id: serviceId,
        },
        status: Status.QUEUED,
      },
      relations: ['visitor', 'service'],
    });
  }

  async getAllVisitorsInQueue(): Promise<Visitor[]> {
    return await this.visitorRepository.find({
      where: { status: Status.QUEUED },
      order: { ticketNumber: 'ASC' },
    });
  }

  private async handleNextTicket(): Promise<void> {
    if (this.activeHandlers === 0) {
      const nextTicket = await this.getNextTicket();
      if (nextTicket) {
        this.processTicket(nextTicket);
      } else if (!this.noVisitorsLogged) {
        this.logger.log('В очереди больше нет посетителей.');
        this.noVisitorsLogged = true;
      }
    }
  }

  private async processTicket(nextTicket: Ticket): Promise<void> {
    this.activeHandlers++;
    this.noVisitorsLogged = false;

    nextTicket.status = Status.IN_PROGRESS;
    nextTicket.visitor.status = Status.IN_PROGRESS;
    await this.ticketRepository.save(nextTicket);
    await this.visitorRepository.save(nextTicket.visitor);

    this.logger.log(
      `Начало обработки талона: ${nextTicket.visitor.ticketNumber} для посетителя: ${nextTicket.visitor.name} по услуге: ${nextTicket.service.name}.`,
    );

    try {
      await this.waitProcessingTime();
      this.activeHandlers--;

      nextTicket.status = Status.COMPLETED;
      nextTicket.visitor.status = Status.COMPLETED;
      await this.ticketRepository.save(nextTicket);
      await this.visitorRepository.save(nextTicket.visitor);

      this.logger.log(
        `Завершена обработка талона: ${nextTicket.visitor.ticketNumber} для посетителя: ${nextTicket.visitor.name} по услуге: ${nextTicket.service.name}.`,
      );

      this.handleNextTicket();
    } catch (error) {
      this.activeHandlers--;
      this.logger.error(
        `Ошибка при обработке талона: ${nextTicket.visitor.ticketNumber} для посетителя: ${nextTicket.visitor.name}. Ошибка: ${error.message}`,
      );

      this.handleNextTicket();
    }
  }

  private validateServiceId(serviceId: string): void {
    if (!serviceId) {
      throw new BadRequestException('Service ID не может быть пустым.');
    }

    if (!isUUID(serviceId)) {
      throw new BadRequestException('Service ID должен быть в формате UUID.');
    }
  }

  private validateVisitorName(visitorName: string): void {
    if (!visitorName) {
      throw new BadRequestException('Имя посетителя не может быть пустым.');
    }
  }

  private async waitProcessingTime(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.processingTime));
  }

  protected async getNextTicket(): Promise<Ticket | null> {
    const nextTickets =
      (await this.ticketRepository.find({
        where: { status: Status.QUEUED },
        order: { issueDate: 'ASC' },
        take: 1,
      })) || [];

    return nextTickets.length > 0 ? nextTickets[0] : null;
  }

  async resetQueue(): Promise<void> {
    await this.ticketRepository.query('TRUNCATE TABLE "tickets" CASCADE');
    await this.visitorRepository.query('TRUNCATE TABLE "visitors" CASCADE');
    this.logger.log('Очередь была сброшена');
  }
}
