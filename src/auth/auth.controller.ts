import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';
import type { AuthBody } from '../types/auth.types.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);
  @Post('logIn')
  userLogIn(@Body() authBody: AuthBody, @Res() res: Response) {
    try {
      this.logger.log(
        `Inciando solicitud de inicio de sesion, usuario ${authBody.email}`,
      );
      const logIn = this.authService.logIn(authBody);
      res.status(200).json({
        message: logIn,
      });
    } catch (error) {
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error}`,
      );
      res.status(500).json({
        message: 'Ha ocurrido un error al procesar la solicitud ${error}',
      });
    }
  }
}
