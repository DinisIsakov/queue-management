import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Ticket } from '../entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@ApiTags('Талон')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все талоны.' })
  @ApiResponse({
    status: 200,
    description: 'Список всех талонов.',
    type: [Ticket],
  })
  async getAllTickets(): Promise<Ticket[]> {
    return this.ticketService.getAllTickets();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить талон по идентификатору.' })
  @ApiResponse({ status: 200, description: 'Детали талона.', type: Ticket })
  async getTicketById(@Param('id') id: string): Promise<Ticket> {
    const ticket = await this.ticketService.getTicketById(id);
    if (!ticket) {
      throw new NotFoundException(`Талон с ID '${id}' не найден.`);
    }
    return ticket;
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый талон.' })
  @ApiResponse({
    status: 201,
    description: 'Талон успешно создан.',
    type: Ticket,
  })
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
  ): Promise<Ticket> {
    return this.ticketService.createTicket(createTicketDto);
  }
}
