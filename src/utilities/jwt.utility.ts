import { Injectable, Logger } from '@nestjs/common';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppService } from '../app.service.js';
import { UserService } from '../users/user.service.js';

@Injectable()
export class JwtUtility {
  constructor(
    private appService: AppService,
    private userService: UserService,
  ) {}
  private readonly logger = new Logger(JwtUtility.name);
  async generateSessionToken(email: string): Promise<string> {
    try {
      this.logger.log(`Generating session token for ${email}`);
      const secret = await this.appService.getProperty('JWT_SECRET');
      const expireTime = await this.appService.getProperty('JWT_EXPIRE_TIME');
      const token = jwt.sign({ email: email }, secret.value, {
        expiresIn: `${Number.parseInt(expireTime.value)}h`,
      });
      this.logger.log(
        `Token generated for ${email}, expires in ${expireTime.value} hour`,
      );
      return token;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occured during the genreation. ${error.message}`,
      );
      throw err;
    }
  }
  async verify(token: string): Promise<string> {
    try {
      this.logger.log('Verifying token');
      const secret = await this.appService.getProperty('JWT_SECRET');
      return new Promise((resolve) => {
        jwt.verify(token, secret.value, (err, decode) => {
          if (err) {
            this.logger.warn(`An error verifying token. ${err.message}`);
            throw err;
          } else {
            const email = (decode as JwtPayload).email as string;
            this.logger.log(`Token verified successfuly. Email: ${email}`);
            if (!(decode as JwtPayload).email) {
              throw new Error('email not found in token');
            }
            resolve(email);
          }
        });
      });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occured during the verification. ${error.message}`,
      );
      throw err;
    }
  }
}
