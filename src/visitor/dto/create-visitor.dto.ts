import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisitorDto {
  @ApiProperty({ description: 'Имя посетителя' })
  @IsString()
  @Length(1, 100)
  visitorName: string;
}
