import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { NotificationsModule } from './notifications/notification.module.js';
import { UserModule } from './users/user.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
  imports: [NotificationsModule, UserModule, AuthModule],
})
export class AppModule {}
