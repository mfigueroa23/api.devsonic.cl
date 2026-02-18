import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
  imports: [NotificationsModule, UsersModule, AuthModule],
})
export class AppModule {}
