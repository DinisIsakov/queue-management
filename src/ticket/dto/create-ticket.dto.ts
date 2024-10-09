import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Идентификатор услуги для талона' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Идентификатор посетителя' })
  @IsUUID()
  visitorId: string;
}
