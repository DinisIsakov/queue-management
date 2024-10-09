import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Service } from './service.entity';
import { Visitor } from './visitor.entity';
import { Status } from './status.enum';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  issueDate: Date;

  @Column({ type: 'enum', enum: Status, default: Status.QUEUED })
  status: Status;

  @ManyToOne(() => Service, { eager: true, onDelete: 'CASCADE' })
  service: Service;

  @ManyToOne(() => Visitor, { eager: true, onDelete: 'CASCADE' })
  visitor: Visitor;
}
