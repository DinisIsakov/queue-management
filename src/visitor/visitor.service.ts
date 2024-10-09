import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Visitor } from 'src/entities/visitor.entity';
import { Repository } from 'typeorm';
import { CreateVisitorDto } from './dto/create-visitor.dto';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
  ) {}

  async createVisitor(createVisitorDto: CreateVisitorDto): Promise<Visitor> {
    const { visitorName } = createVisitorDto;
    const existingVisitor = await this.visitorRepository.findOne({
      where: { name: visitorName },
    });
    if (existingVisitor) {
      throw new ConflictException(
        `Посетитель с именем '${visitorName}' уже существует.`,
      );
    }

    const visitor = new Visitor();
    visitor.name = visitorName;
    return await this.visitorRepository.save(visitor);
  }

  async getAllVisitors(): Promise<Visitor[]> {
    return await this.visitorRepository.find();
  }

  async getVisitorById(id: string): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Посетитель с ID '${id}' не найден.`);
    }
    return visitor;
  }
}
