import { Module } from '@nestjs/common';
import { LayoutsController } from './layouts.controller.js';
import { LayoutsService } from './layouts.service.js';
import { PrismaService } from '../prisma.service.js';
import { AppService } from '../app.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Module({
  controllers: [LayoutsController],
  providers: [LayoutsService, PrismaService, AppService, JwtGuard],
})
export class LayoutsModule {}
