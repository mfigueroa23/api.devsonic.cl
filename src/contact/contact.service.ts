import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ContactService.name);

  async findAll() {
    try {
      await this.prisma.$connect();
      return await this.prisma.contact.findMany();
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      await this.prisma.$connect();
      const record = await this.prisma.contact.findUnique({ where: { id } });
      if (!record) throw new NotFoundException(`Contact item #${id} not found`);
      return record;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(dto: CreateContactDto) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Creating contact item: ${dto.label}`);
      return await this.prisma.contact.create({ data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, dto: UpdateContactDto) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Updating contact item #${id}`);
      return await this.prisma.contact.update({ where: { id }, data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Deleting contact item #${id}`);
      await this.prisma.contact.delete({ where: { id } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async findOneInternal(id: number) {
    const record = await this.prisma.contact.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Contact item #${id} not found`);
    return record;
  }
}
