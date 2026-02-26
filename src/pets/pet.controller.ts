import { Controller, Get, Logger, Res, UseGuards } from '@nestjs/common';
import { PetService } from './pet.service.js';
import type { Response } from 'express';
import { AuthGuard } from '../guards/auth.guard.js';
import { ProfileAdminGuard } from '../guards/profile.admin.guard.js';

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
      res.status(200).json({ ...pets });
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
}
