import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Service } from '../entities/service.entity';
import { Visitor } from '../entities/visitor.entity';
import { Status } from '../entities/status.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
  ) {}

  async getAllTickets(): Promise<Ticket[]> {
    return await this.ticketRepository.find();
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Талон с ID '${id}' не найден.`);
    }
    return ticket;
  }

  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { serviceId, visitorId } = createTicketDto;

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Услуга с ID '${serviceId}' не найдена.`);
    }

    const visitor = await this.visitorRepository.findOne({
      where: { id: visitorId },
    });
    if (!visitor) {
      throw new NotFoundException(`Посетитель с ID '${visitorId}' не найден.`);
    }

    const ticket = this.ticketRepository.create({
      service,
      visitor,
      issueDate: new Date(),
      status: Status.QUEUED,
    });

    return await this.ticketRepository.save(ticket);
  }
}
