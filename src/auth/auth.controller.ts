import { Body, Controller, Logger, Post, Res, Headers } from '@nestjs/common';
import type { LogIn } from '../types/auth.type.js';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { JwtUtility } from '../utilities/jwt.utility.js';
import { UserService } from '../users/user.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtUtility: JwtUtility,
    private userService: UserService,
  ) {}
  private readonly logger = new Logger(AuthController.name);
  @Post('logIn')
  async logIg(@Body() authData: LogIn, @Res() res: Response) {
    try {
      this.logger.log(`Request to login the user ${authData.email}`);
      const verifyAccess = await this.authService.logIn(authData);
      if (verifyAccess) {
        this.logger.log('LogIn successful');
        const sessionToken = await this.jwtUtility.generateSessionToken(
          authData.email,
        );
        res.status(200).json({
          message: 'LogIn successful',
          token: sessionToken,
          status: verifyAccess,
        });
      } else {
        this.logger.warn('LogIn failed');
        res.status(200).json({
          message: 'LogIn failed',
          status: verifyAccess,
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while login the user. ${error.message}`,
      );
      if (error.message.includes('not found')) {
        res.status(404).json({
          message: 'User not found',
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while login the user',
        });
      }
    }
  }
  @Post('verify')
  async verifyToken(
    @Headers('Authorization') authorization: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Request verifying token');
      if (!authorization) {
        this.logger.warn('No token provided');
        res.status(400).json({
          message: 'Must provide a valid token',
        });
      } else {
        const token = authorization.split(' ')[1];
        const email = await this.jwtUtility.verify(token);
        const user = await this.userService.findByEmail(email);
        res.status(200).json({ ...user });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred during the verification. ${error.message}`,
      );
      if (error.message.includes('jwt expired')) {
        res.status(400).json({
          message: 'Token expired',
        });
      } else if (error.message.includes('invalid signature')) {
        res.status(400).json({
          message: 'Token invalid',
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while verifying the token',
        });
      }
    }
  }
}
