import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/user.service.js';
import type { Request } from 'express';
import { JwtUtility } from '../utilities/jwt.utility.js';
import { User } from '../types/user.type.js';

@Injectable()
export class ProfileAdminGuard implements CanActivate {
  constructor(
    private jwtUtility: JwtUtility,
    private userService: UserService,
  ) {}
  private readonly logger = new Logger(ProfileAdminGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.logger.log('Verifying profile of the user');
      const request: Request = context.switchToHttp().getRequest();
      const header = request.header('Authorization');
      if (!header) {
        this.logger.warn('No header found');
        throw new UnauthorizedException('Must provide an autorization header');
      }
      const token = header.split(' ')[1];
      const email = await this.jwtUtility.verify(token);
      const user: User = await this.userService.findByEmail(email);
      if (user.roles?.length == 0) {
        throw new UnauthorizedException('No roles found for the user');
      }
      return new Promise((resolve) => {
        user.roles?.forEach((role) => {
          if (role == 'admin') {
            this.logger.log('Authorizes profile matched');
            resolve(true);
          }
        });
        throw new UnauthorizedException('Profile is no autorized');
      });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occured while validating the profile. ${error.message}`,
      );
      throw new UnauthorizedException(
        `System can't validete the token ${error.message}`,
      );
    }
  }
}
