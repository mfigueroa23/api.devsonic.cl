import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtUtility } from '../../utils/jwt.util.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtUtility: JwtUtility) {}
  private readonly logger = new Logger(AuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('Verificando cabecera de autenticación');
    const request: Request = context.switchToHttp().getRequest();
    const token = request.header('X-API-TOKEN');
    if (!token) {
      throw new UnauthorizedException(
        'Debe proporcionar un token de autenticación',
      );
    }
    this.logger.log('Token de autenticación encontrado');
    const verify = await this.jwtUtility.verifyToken(token);
    if (!verify) {
      throw new UnauthorizedException('Token de autenticación inválido');
    } else {
      return true;
    }
  }
}
