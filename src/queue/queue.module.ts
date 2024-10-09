import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { Service } from '../entities/service.entity';
import { Ticket } from '../entities/ticket.entity';
import { Visitor } from '../entities/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Ticket, Visitor])],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
