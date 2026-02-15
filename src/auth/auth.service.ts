import { Injectable, Logger } from '@nestjs/common';
import { AuthBody } from 'src/types/auth.types.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  logIn(authBody: AuthBody) {
    try {
      this.logger.log(
        `Procesando inicio de secion, usuario: ${authBody.email}`,
      );
      return true;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la solicitud ${error.message}`,
      );
      throw error;
    }
  }
}
