import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { CryptoUtil } from '../utils/crypto.util.js';
import { AppService } from '../app.service.js';
import { PrismaService } from '../prisma.service.js';
import { JwtUtility } from '../utils/jwt.util.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    CryptoUtil,
    AppService,
    PrismaService,
    JwtUtility,
  ],
})
export class AuthModule {}
