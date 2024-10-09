import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket } from '../entities/ticket.entity';
import { Visitor } from '../entities/visitor.entity';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Visitor]), ServiceModule],
  providers: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {}
