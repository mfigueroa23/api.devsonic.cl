import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
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
  async getUser(
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Res() res: Response,
  ) {
    try {
      if (email && rut) {
        this.logger.warn('Debe especificar solo un criterio de busqueda');
        res.status(400).json({
          message: 'Debe especificar solo un criterio de busqueda',
        });
      } else if (email) {
        this.logger.log(`Solicitando usuario con el email ${email}`);
        const user = await this.userService.getUserByEmail(email);
        res.status(200).json(user);
      } else if (rut) {
        this.logger.log(`Solicitando usuario con el rut ${rut}`);
        const user = await this.userService.getUserByRut(rut);
        res.status(200).json(user);
      } else {
        this.logger.warn('No se ha especificado un criterio de busqueda');
        res.status(400).json({
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
  @Post('create')
  async createUser(@Body() user: User, @Res() res: Response) {
    try {
      this.logger.log(
        `Solicitando la creacion del usuario ${user.name} ${user.lastname} con rut ${user.rut}`,
      );
      const create = await this.userService.createUser(user);
      res.status(201).json(create);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error}`,
      );
      if (error.message.includes('Usuario ya existe')) {
        res.status(400).json({
          message: 'Usuario ya existe',
        });
      } else {
        res.status(500).json({
          message: 'No es posible procesar la solicitud',
        });
      }
    }
  }
}
