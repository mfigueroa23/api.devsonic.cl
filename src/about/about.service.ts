import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateAboutDto } from './dto/create-about.dto.js';
import { UpdateAboutDto } from './dto/update-about.dto.js';

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(AboutService.name);

  async findAll() {
    try {
      await this.prisma.$connect();
      return await this.prisma.about.findMany();
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      await this.prisma.$connect();
      const record = await this.prisma.about.findUnique({ where: { id } });
      if (!record) throw new NotFoundException(`About item #${id} not found`);
      return record;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(dto: CreateAboutDto) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Creating about item: ${dto.title}`);
      return await this.prisma.about.create({ data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, dto: UpdateAboutDto) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Updating about item #${id}`);
      return await this.prisma.about.update({ where: { id }, data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Deleting about item #${id}`);
      await this.prisma.about.delete({ where: { id } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async findOneInternal(id: number) {
    const record = await this.prisma.about.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`About item #${id} not found`);
    return record;
  }
}
