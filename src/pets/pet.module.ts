import { Module } from '@nestjs/common';
import { PetController } from './pet.controller.js';
import { PetService } from './pet.service.js';
import { JwtUtility } from '../utilities/jwt.utility.js';
import { UserService } from '../users/user.service.js';
import { AppService } from '../app.service.js';
import { PrismaService } from '../prisma.service.js';
import { EncryptionUtility } from '../utilities/encryption.utility.js';

@Module({
  controllers: [PetController],
  providers: [
    PetService,
    JwtUtility,
    UserService,
    AppService,
    PrismaService,
    EncryptionUtility,
  ],
})
export class PetModule {}
