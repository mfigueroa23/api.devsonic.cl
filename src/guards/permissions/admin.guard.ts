import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);
  canActivate(context: ExecutionContext): boolean {
    this.logger.log('Verificando permisos de administrador');
    const request: Request = context.switchToHttp().getRequest();
    const token = request.header('X-API-TOKEN');
    if (!token) {
      this.logger.warn('No se proporcionó un token de autenticación');
      throw new UnauthorizedException(
        'No se proporcionó un token de autenticación',
      );
    }
    this.logger.log(
      'Token de autenticación encontrado',
      'Verificando payload del token',
    );
    const payload = atob(token.split('.')[1]);
    this.logger.log(payload);
    const data = JSON.parse(payload) as JwtPayload;
    if (data.profile != 'admin') {
      this.logger.warn('El usuario no tiene permisos de administrador');
      throw new UnauthorizedException('El usuario no tiene permisos');
    } else {
      this.logger.log('Permisos de administrador verificados');
      return true;
    }
  }
}
