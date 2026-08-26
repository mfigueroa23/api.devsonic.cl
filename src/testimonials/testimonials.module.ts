import { Module } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller.js';
import { TestimonialsService } from './testimonials.service.js';
import { PrismaService } from '../prisma.service.js';
import { AppService } from '../app.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Module({
  controllers: [TestimonialsController],
  providers: [TestimonialsService, PrismaService, AppService, JwtGuard],
})
export class TestimonialsModule {}
