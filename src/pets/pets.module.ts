import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller.js';
import { PetsService } from './pets.service.js';
import { PrismaService } from '../prisma.service.js';
import { JwtUtility } from '../utils/jwt.util.js';
import { AppService } from '../app.service.js';

@Module({
  controllers: [PetsController],
  providers: [PetsService, PrismaService, JwtUtility, AppService],
})
export class PetsModule {}
