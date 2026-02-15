import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';
import type { AuthBody } from '../types/auth.types.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);
  @Post('logIn')
  async userLogIn(@Body() authBody: AuthBody, @Res() res: Response) {
    try {
      this.logger.log(
        `Inciando solicitud de inicio de sesion, usuario ${authBody.email}`,
      );
      const logIn = await this.authService.logIn(authBody);
      res.status(200).json({
        status: logIn,
      });
    } catch (err) {
      this.logger.error(`Ha ocurrido un error al procesar la solicitud ${err}`);
      const error = new Error(err as string);
      if (error.message.includes('no existe')) {
        this.logger.warn('El usuario no existe');
        res.status(400).json({
          status: false,
        });
      } else if (error.message.includes('invalidas')) {
        this.logger.warn(error.message);
        res.status(400).json({
          status: false,
        });
      } else {
        res.status(500).json({
          message: 'Ha ocurrido un error al procesar la solicitud',
        });
      }
    }
  }
}
