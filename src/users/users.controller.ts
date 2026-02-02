import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service.js';
import type { User } from '../types/users.type.js';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  private readonly logger = new Logger(UsersController.name);
  @Get('getAll')
  async getAllUsers(@Res() res: Response) {
    try {
      this.logger.log('Solicitando lista de todos los usuarios');
      const users: User[] = await this.userService.getAllUsers();
      if (users.length != 0) {
        this.logger.log('Lista de usuarios obtenida');
        res.status(200).json(users);
      } else {
        this.logger.warn('No hay usuarios disponibles');
        res.status(200).json({ message: 'No hay usuarios disponibles' });
      }
    } catch (error) {
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error}`,
      );
      res.status(500).json({ message: 'No es posible procesar la solicitud' });
    }
  }
  @Get('getUser')
  async getUser(@Query('email') email: string, @Res() res: Response) {
    try {
      if (email) {
        this.logger.log(`Solicitando usuarios con el email ${email}`);
        const user = await this.userService.getUserByEmail(email);
        res.status(200).json(user);
      } else {
        this.logger.warn('No se ha especificado un criterio de busqueda');
        res.status(500).json({
          message: 'No se ha especificado un criterio de busqueda',
        });
      }
    } catch (error) {
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error}`,
      );
      if (String(error).includes('no existe')) {
        res.status(200).json({
          message: 'El usuario no existe',
        });
      } else {
        res.status(500).json({
          message: 'No es posible procesar la solicitud',
        });
      }
    }
  }
}
