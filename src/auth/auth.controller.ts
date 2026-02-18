import { Body, Controller, Headers, Logger, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Response, Request } from 'express';
import type { AuthBody } from '../types/auth.types.js';
import { JwtUtility } from '../utils/jwt.util.js';
import { UsersService } from '../users/users.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtUtility: JwtUtility,
    private userService: UsersService,
  ) {}
  private readonly logger = new Logger(AuthController.name);
  @Post('logIn')
  async userLogIn(@Body() authBody: AuthBody, @Res() res: Response) {
    try {
      this.logger.log(
        `Inciando solicitud de inicio de sesion, usuario ${authBody.email}`,
      );
      const logIn = await this.authService.logIn(authBody);
      this.logger.log(`Solicitando datos del usuario ${authBody.email}`);
      const user = await this.userService.getUserByEmail(authBody.email);
      if (!user.email || !user.role) {
        throw new Error('error al obtener datos del usuario');
      }
      this.logger.log(
        `Solicitando token de sesion para ${user.email}, perfil ${user.role}`,
      );
      const token = await this.jwtUtility.getSessionToken({
        email: user.email,
        profile: user.role,
      });
      res.status(200).json({
        status: logIn,
        token,
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
  @Post('verify')
  async authVerify(
    @Headers('X-API-TOKEN') token: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Solicitando verificar token');
      if (!token) {
        res.status(400).json({
          message: 'Debe proporcionar un token',
        });
      }
      const status = await this.jwtUtility.verifyToken(token);
      res.status(200).json({ status });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error en la solicitud ${error.message}`,
      );
      res.status(500).json({
        message: 'Ha ocurrido un error al procesar la solicitud',
      });
    }
  }
}
