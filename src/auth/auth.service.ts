import { Injectable, Logger } from '@nestjs/common';
import { AuthBody } from '../types/auth.types.js';
import { UsersService } from '../users/users.service.js';
import { CryptoUtil } from '../utils/crypto.util.js';
import { AppService } from '../app.service.js';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private cryptoUtil: CryptoUtil,
    private appService: AppService,
  ) {}
  private readonly logger = new Logger(AuthService.name);
  async logIn(authBody: AuthBody): Promise<boolean> {
    try {
      this.logger.log(
        `Procesando inicio de sesion, usuario: ${authBody.email}`,
      );
      const userPassword = await this.userService.getUserPasswd(authBody.email);
      const cryptoSecret = await this.appService.getProperty('CRYPTO_SECRET');
      const cryptoSalt = await this.appService.getProperty('CRYPTO_SALT');
      const userPasswdPlainText = this.cryptoUtil.decrypt(
        userPassword,
        cryptoSecret.value,
        cryptoSalt.value,
      );
      this.logger.log('Comparando contraseñas');
      if (authBody.password === userPasswdPlainText) {
        this.logger.log('Credenciales validas');
        return true;
      } else {
        this.logger.warn('Credenciales invalidas');
        throw new Error('Credenciales invalidas');
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error.message}`,
      );
      throw err;
    }
  }
}
