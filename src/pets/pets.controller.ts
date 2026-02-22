import { Controller, Get, Logger, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PetsService } from './pets.service.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';
import { AdminGuard } from '../guards/permissions/admin.guard.js';

@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}
  private readonly logger = new Logger(PetsController.name);
  @Get('getAll')
  @UseGuards(AuthGuard, AdminGuard)
  async getAllPets(@Res() res: Response) {
    try {
      this.logger.log('Solicitud para listado de mascotas');
      const pets = await this.petsService.getAllPets();
      this.logger.log('Listado de mascotas obtenido exitosamente');
      if (pets.length === 0) {
        this.logger.warn('No se encontraron mascotas en la base de datos');
        return res.status(404).json({
          message: 'No se encontraron mascotas',
        });
      } else {
        res.status(200).json(pets);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud: ${error.message}`,
      );
      res.status(500).json({
        message: 'Error interno del servidor',
      });
    }
  }
}
