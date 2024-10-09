import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Название услуги' })
  @IsString()
  @IsNotEmpty({ message: 'Название услуги не может быть пустым.' })
  name: string;
}
