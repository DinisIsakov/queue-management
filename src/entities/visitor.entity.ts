import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Status } from './status.enum';

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  ticketNumber: number;

  @Column({ type: 'enum', enum: Status, default: Status.QUEUED })
  status: Status;
}
