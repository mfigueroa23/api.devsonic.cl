import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ProjectService.name);

  async findAll() {
    try {
      await this.prisma.$connect();
      return await this.prisma.project.findMany();
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      await this.prisma.$connect();
      const record = await this.prisma.project.findUnique({ where: { id } });
      if (!record) throw new NotFoundException(`Project #${id} not found`);
      return record;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(dto: CreateProjectDto) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Creating project: ${dto.title}`);
      return await this.prisma.project.create({ data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, dto: UpdateProjectDto) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Updating project #${id}`);
      return await this.prisma.project.update({ where: { id }, data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Deleting project #${id}`);
      await this.prisma.project.delete({ where: { id } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async findOneInternal(id: number) {
    const record = await this.prisma.project.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Project #${id} not found`);
    return record;
  }
}
