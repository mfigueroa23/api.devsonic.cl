import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ExperienceService.name);

  async findAll() {
    try {
      await this.prisma.$connect();
      return await this.prisma.experience.findMany();
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      await this.prisma.$connect();
      const record = await this.prisma.experience.findUnique({ where: { id } });
      if (!record) throw new NotFoundException(`Experience #${id} not found`);
      return record;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(dto: CreateExperienceDto) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Creating experience: ${dto.role} at ${dto.company}`);
      return await this.prisma.experience.create({ data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, dto: UpdateExperienceDto) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Updating experience #${id}`);
      return await this.prisma.experience.update({ where: { id }, data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Deleting experience #${id}`);
      await this.prisma.experience.delete({ where: { id } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async findOneInternal(id: number) {
    const record = await this.prisma.experience.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Experience #${id} not found`);
    return record;
  }
}
