import { CreateVisitorDto } from './dto/create-visitor.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { VisitorService } from './visitor.service';
import { Visitor } from 'src/entities/visitor.entity';

@ApiTags('Посетитель')
@Controller('visitor')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового посетителя.' })
  @ApiResponse({
    status: 201,
    description: 'Посетитель успешно создан.',
    type: Visitor,
  })
  async createVisitor(
    @Body() createVisitorDto: CreateVisitorDto,
  ): Promise<Visitor> {
    return this.visitorService.createVisitor(createVisitorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех посетителей.' })
  @ApiResponse({
    status: 200,
    description: 'Список всех посетителей.',
    type: [Visitor],
  })
  async getAllVisitors(): Promise<Visitor[]> {
    return this.visitorService.getAllVisitors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить посетителя по идентификатору.' })
  @ApiResponse({
    status: 200,
    description: 'Детали посетителя.',
    type: Visitor,
  })
  async getVisitorById(@Param('id') id: string): Promise<Visitor> {
    const visitor = await this.visitorService.getVisitorById(id);
    if (!visitor) {
      throw new NotFoundException(`Посетитель с ID '${id}' не найден.`);
    }
    return visitor;
  }
}
