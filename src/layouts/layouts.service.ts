import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateLayoutDto } from './dto/create-layout.dto.js';
import { UpdateLayoutDto } from './dto/update-layout.dto.js';

@Injectable()
export class LayoutsService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(LayoutsService.name);

  async findAll() {
    try {
      await this.prisma.$connect();
      return await this.prisma.layouts.findMany({ orderBy: { id: 'desc' } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      await this.prisma.$connect();
      const record = await this.prisma.layouts.findUnique({ where: { id } });
      if (!record) throw new NotFoundException(`Layout #${id} not found`);
      return record;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(dto: CreateLayoutDto) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Creating layout: ${dto.name}`);
      return await this.prisma.layouts.create({ data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, dto: UpdateLayoutDto) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Updating layout #${id}`);
      return await this.prisma.layouts.update({ where: { id }, data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Deleting layout #${id}`);
      await this.prisma.layouts.delete({ where: { id } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async findOneInternal(id: number) {
    const record = await this.prisma.layouts.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Layout #${id} not found`);
    return record;
  }
}
