import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { Service } from '../entities/service.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceService } from './service.service';

@ApiTags('Услуги')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую услугу' })
  @ApiResponse({
    status: 201,
    description: 'Услуга успешно создана.',
    type: Service,
  })
  async createService(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    return this.serviceService.createService(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все услуги' })
  @ApiResponse({
    status: 200,
    description: 'Список всех услуг',
    type: [Service],
  })
  async getAllServices(): Promise<Service[]> {
    return this.serviceService.getAllServices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить услугу по идентификатору' })
  @ApiResponse({ status: 200, description: 'Детали услуги', type: Service })
  async getServiceById(@Param('id') id: string): Promise<Service> {
    const service = await this.serviceService.getServiceById(id);
    if (!service) {
      throw new NotFoundException(`Услуга с ID '${id}' не найдена.`);
    }
    return service;
  }
}
