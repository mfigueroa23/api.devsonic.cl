import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { PrismaService } from '../prisma.service.js';
import { UsersService } from './users.service.js';
import { CryptoUtil } from '../utils/crypto.util.js';
import { AppService } from '../app.service.js';
import { JwtUtility } from '../utils/jwt.util.js';

@Module({
  controllers: [UsersController],
  providers: [PrismaService, UsersService, CryptoUtil, AppService, JwtUtility],
})
export class UsersModule {}
