import { Injectable, Logger } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AppService } from '../app.service.js';
import type { SessionToken } from '../types/jwt.types.js';

@Injectable()
export class JwtUtility {
  constructor(private appService: AppService) {}
  private readonly logger = new Logger(JwtUtility.name);
  async getSessionToken(payload: SessionToken): Promise<string> {
    try {
      this.logger.log(`Generando token de sesion para ${payload.email}`);
      const secret = await this.appService.getProperty('JWT_SECRET');
      const expiresIn = await this.appService.getProperty('JWT_EXPIRE_TIME');
      const token = jwt.sign(payload, secret.value, {
        expiresIn: `${Number.parseInt(expiresIn.value)}h`,
      });
      this.logger.log(
        `Token generado con exito para el usaurio ${payload.email}, perfil ${payload.profile}`,
        `Token del usuario ${payload.email} expira en ${expiresIn.value}h`,
      );
      return token;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al generar el token ${error.message}`,
      );
      throw err;
    }
  }
}
