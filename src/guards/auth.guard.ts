import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtUtility } from '../utilities/jwt.utility.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtUtility: JwtUtility) {}
  private readonly logger = new Logger(AuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.logger.log('Verifying authorization header');
      const request: Request = context.switchToHttp().getRequest();
      const header = request.header('Authorization');
      if (!header) {
        throw new UnauthorizedException('Must provide an authorization token');
      }
      const token = header.split(' ')[1];
      this.logger.log('Authorization token found');
      const verify = await this.jwtUtility.verify(token);
      if (!verify) {
        throw new UnauthorizedException('Invalid token');
      } else {
        return true;
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occured while validating the athorization header ${error.message}`,
      );
      throw new UnauthorizedException(
        `System can't validete the token ${error.message}`,
      );
    }
  }
}
