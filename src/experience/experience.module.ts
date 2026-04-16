import { Module } from '@nestjs/common';
import { ExperienceController } from './experience.controller.js';
import { ExperienceService } from './experience.service.js';
import { PrismaService } from '../prisma.service.js';
import { AppService } from '../app.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService, PrismaService, AppService, JwtGuard],
})
export class ExperienceModule {}
