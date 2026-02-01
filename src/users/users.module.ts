import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { PrismaService } from '../prisma.service.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [PrismaService, UsersService],
})
export class UsersModule {}
