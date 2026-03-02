import {
  Controller,
  Get,
  Logger,
  Post,
  Res,
  UseGuards,
  Headers,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { PetService } from './pet.service.js';
import type { Response } from 'express';
import { AuthGuard } from '../guards/auth.guard.js';
import { ProfileAdminGuard } from '../guards/profile.admin.guard.js';
import { ProfileUserGuard } from '../guards/profile.user.guard.js';
import { JwtPayload } from 'jsonwebtoken';
import type { PetCreation, PetUpdate } from '../types/pet.type.js';

@Controller('pets')
export class PetController {
  constructor(private petService: PetService) {}
  private readonly logger = new Logger(PetController.name);
  @Get()
  @UseGuards(AuthGuard, ProfileAdminGuard)
  async getAll(@Res() res: Response) {
    try {
      this.logger.log('Requesting all the pets');
      const pets = await this.petService.allPets();
      res.status(200).json(pets);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while fetching the pets. ${error.message}`,
      );
      res.status(500).json({
        message: 'An error occurred while fetching the pets',
      });
    }
  }
  @Post()
  @UseGuards(AuthGuard, ProfileUserGuard)
  async createPet(
    @Headers('Authorization') authorization: string,
    @Body() pet: PetCreation,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Request to create a pet');
      const { email } = JSON.parse(
        atob(authorization.split(' ')[1].split('.')[1]),
      ) as JwtPayload;
      const create = await this.petService.createPet(pet, email as string);
      res.status(201).json(create);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while creating the pet. ${error.message}`,
      );
      res.status(500).json({
        message: 'An error has occurred while creating the pet',
      });
    }
  }
  @Patch()
  @UseGuards(AuthGuard, ProfileUserGuard)
  async updatePet(
    @Headers('Authorization') authorization: string,
    @Query('pet') petName: string,
    @Body() pet: PetUpdate,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Requesting update for the pet ${petName}`);
      if (!petName) {
        this.logger.warn('Pet name not provided');
        res.status(400).json({
          message: 'Must provide a pet name',
        });
      } else {
        const token: string = authorization.split(' ')[1].split('.')[1];
        const { email }: JwtPayload = JSON.parse(atob(token)) as JwtPayload;
        const updatePet = await this.petService.updatePet(
          petName,
          pet,
          String(email),
        );
        res.status(200).json(updatePet);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while updating the pet. ${error.message}`,
      );
      res.status(500).json({
        message: 'An error occurred while updating the pet',
      });
    }
  }
}
