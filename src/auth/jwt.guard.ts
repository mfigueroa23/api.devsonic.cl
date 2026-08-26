import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AppService } from '../app.service.js';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(JwtGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.substring(7);

    try {
      const prop = await this.appService.getProperty('JWT_SECRET');
      jwt.verify(token, prop.value);
      this.logger.log('JWT verified successfully');
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`JWT verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
