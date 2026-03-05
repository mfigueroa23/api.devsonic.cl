import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { PrismaService } from '../prisma.service.js';
import { EncryptionUtility } from '../utilities/encryption.utility.js';
import { AppService } from '../app.service.js';
import { JwtUtility } from '../utilities/jwt.utility.js';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    EncryptionUtility,
    UserService,
    AppService,
    JwtUtility,
  ],
})
export class UserModule {}
