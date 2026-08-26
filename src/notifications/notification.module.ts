import { Module } from '@nestjs/common';
import { NotificationsController } from './notification.controller.js';
import { NotificationsService } from './notification.service.js';
import { AppService } from '../app.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, AppService, PrismaService],
})
export class NotificationsModule {}
