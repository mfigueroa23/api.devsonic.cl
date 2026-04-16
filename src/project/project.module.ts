import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller.js';
import { ProjectService } from './project.service.js';
import { PrismaService } from '../prisma.service.js';
import { AppService } from '../app.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, AppService, JwtGuard],
})
export class ProjectModule {}
