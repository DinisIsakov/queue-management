import { IsUUID, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisitDto {
  @ApiProperty({ description: 'Идентификатор услуги для визита' })
  @IsUUID('4', {
    message: 'Некорректный формат UUID для идентификатора услуги.',
  })
  serviceId: string;

  @ApiProperty({ description: 'Имя посетителя' })
  @IsString({ message: 'Имя посетителя должно быть строкой.' })
  @Length(1, 100, {
    message: 'Имя посетителя должно содержать от 1 до 100 символов.',
  })
  visitorName: string;
}
