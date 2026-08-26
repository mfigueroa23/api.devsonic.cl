import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateTestimonialDto } from './dto/create-testimonial.dto.js';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto.js';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(TestimonialsService.name);

  async findAll() {
    try {
      await this.prisma.$connect();
      return await this.prisma.testimonials.findMany({ orderBy: { id: 'desc' } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      await this.prisma.$connect();
      const record = await this.prisma.testimonials.findUnique({ where: { id } });
      if (!record) throw new NotFoundException(`Testimonial #${id} not found`);
      return record;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(dto: CreateTestimonialDto) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Creating testimonial from: ${dto.author}`);
      return await this.prisma.testimonials.create({ data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, dto: UpdateTestimonialDto) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Updating testimonial #${id}`);
      return await this.prisma.testimonials.update({ where: { id }, data: dto });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.$connect();
      await this.findOneInternal(id);
      this.logger.log(`Deleting testimonial #${id}`);
      await this.prisma.testimonials.delete({ where: { id } });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async findOneInternal(id: number) {
    const record = await this.prisma.testimonials.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Testimonial #${id} not found`);
    return record;
  }
}
