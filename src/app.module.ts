import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { NotificationsModule } from './notifications/notifications.module.js';
@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
  imports: [NotificationsModule],
})
export class AppModule {}
