import { Module } from '@nestjs/common';
import { AboutController } from './about.controller.js';
import { AboutService } from './about.service.js';
import { PrismaService } from '../prisma.service.js';
import { AppService } from '../app.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Module({
  controllers: [AboutController],
  providers: [AboutService, PrismaService, AppService, JwtGuard],
})
export class AboutModule {}
