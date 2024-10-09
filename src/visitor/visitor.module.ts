import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { Visitor } from '../entities/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visitor])],
  providers: [VisitorService],
  controllers: [VisitorController],
})
export class VisitorModule {}
