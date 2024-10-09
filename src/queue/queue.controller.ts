import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QueueService } from './queue.service';
import { Ticket } from '../entities/ticket.entity';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visitor } from '../entities/visitor.entity';

@ApiTags('Очередь')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post(':serviceId')
  @ApiOperation({ summary: 'Регистрация нового посещения.' })
  @ApiResponse({
    status: 201,
    description: 'Посещение успешно зарегистрировано.',
    type: Ticket,
  })
  async registerVisit(
    @Param('serviceId') serviceId: string,
    @Body() createVisitDto: CreateVisitDto,
  ): Promise<Ticket> {
    return this.queueService.createTicket(serviceId, createVisitDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить всех посетителей, находящихся в очереди.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список всех посетителей, находящихся в очереди.',
    type: [Visitor],
  })
  async getAllVisitorsInQueue(): Promise<Visitor[]> {
    return this.queueService.getAllVisitorsInQueue();
  }
}
