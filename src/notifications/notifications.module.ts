import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { AppService } from '../app.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, AppService, PrismaService],
})
export class NotificationsModule {}
