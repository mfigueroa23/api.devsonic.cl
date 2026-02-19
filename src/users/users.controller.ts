import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service.js';
import type { User } from '../types/users.type.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  private readonly logger = new Logger(UsersController.name);
  @Get('getAll')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @Patch('update')
  @UseGuards(AuthGuard)
  async updateUser(
    @Body() user: User,
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Solicitando actualizancion de Usuario');
      if (user.rut || user.email) {
        this.logger.warn('No es posible actualizar rut o email');
        res.status(400).json({
          message: 'No es posible actualizar rut o email',
        });
      }
      if (email && rut) {
        this.logger.warn(
          'No es posible actualizar con ambos criterior de busqueda',
        );
        res.status(400).json({
          message: 'No es posible actualizar con ambos criterior de busqueda',
        });
      } else if (email) {
        const update = await this.userService.updateUserByEmail(email, user);
        res.status(200).json(update);
      } else if (rut) {
        const update = await this.userService.updateUserByRut(rut, user);
        res.status(200).json(update);
      } else {
        this.logger.warn('No se han especificado criterio de actualizacion');
        res.status(400).json({
          message: 'No se han especificado criterio de actualizacion',
        });
      }
    } catch (error) {
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error}`,
      );
      res.status(500).json({
        message: 'No es posible procesar la solicitud',
      });
    }
  }
  @Patch('active')
  @UseGuards(AuthGuard)
  async updateStatusUser(
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Solicitando actualizar estado del usuario');
      if (email && rut) {
        this.logger.warn(
          'No es posible actualizar con ambos criterior de busqueda',
        );
        res.status(400).json({
          message: 'No es posible actualizar con ambos criterior de busqueda',
        });
      } else if (email) {
        if (status.includes('true')) {
          const userStatus = await this.userService.updateUserByEmail(email, {
            active: true,
          });
          res.status(200).json({
            message: 'Actualziacion realizada con exito',
            userStatus,
          });
        } else {
          const userStatus = await this.userService.updateUserByEmail(email, {
            active: false,
          });
          res.status(200).json({
            message: 'Actualizacion realizada con exito',
            userStatus,
          });
        }
      } else if (rut) {
        const userStatus = await this.userService.updateUserByRut(rut, {
          active: status.includes('true') ? true : false,
        });
        res.status(200).json({
          message: 'Actualizacion realizada con exito',
          userStatus,
        });
      } else {
        this.logger.warn('No se han especificado criterio de actualizacion');
        res.status(400).json({
          message: 'No se han especificado criterio de actualizacion',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      if (!error.message.includes('desactivado')) {
        this.logger.error(
          `Ha ocurrido un error al procesar la solicitud ${error}`,
        );
        res.status(500).json({
          message: 'No es posible procesar la solicitud',
        });
      } else {
        this.logger.log('El usuario ha sido desactivado');
        res.status(200).json({
          message: 'Usuario desactivado',
        });
      }
    }
  }
}
