import { Injectable, Logger } from '@nestjs/common';
import jwt, { JwtPayload } from 'jsonwebtoken';
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
  async verifyToken(token: string): Promise<boolean> {
    try {
      this.logger.log('Verificando validez del token');
      const secret = await this.appService.getProperty('JWT_SECRET');
      return new Promise((resolve) => {
        jwt.verify(token, secret.value, (err, data) => {
          if (err) {
            this.logger.warn('Token invalido o expirado');
            resolve(false);
          } else if (data) {
            this.logger.log(
              `Token valido. Usuario: ${(data as JwtPayload).email}, Perfil: ${(data as JwtPayload).profile}`,
            );
            resolve(true);
          }
        });
      });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al verificar el token ${error.message}`,
      );
      throw err;
    }
  }
}
