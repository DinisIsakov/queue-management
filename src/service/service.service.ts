import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    const existingService = await this.findServiceByName(createServiceDto.name);
    if (existingService) {
      throw new ConflictException(
        `Услуга с названием '${createServiceDto.name}' уже существует.`,
      );
    }

    const service = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(service);
  }

  async getAllServices(): Promise<Service[]> {
    return await this.serviceRepository.find();
  }

  async getServiceById(id: string): Promise<Service> {
    return await this.serviceRepository.findOne({ where: { id } });
  }

  async findServiceByName(name: string): Promise<Service | undefined> {
    return await this.serviceRepository.findOne({ where: { name } });
  }
}
