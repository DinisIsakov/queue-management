import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './database/data-source';
import { QueueModule } from './queue/queue.module';
import { VisitorModule } from './visitor/visitor.module';
import { TicketModule } from './ticket/ticket.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    QueueModule,
    VisitorModule,
    TicketModule,
    ServiceModule,
  ],
})
export class AppModule {}
