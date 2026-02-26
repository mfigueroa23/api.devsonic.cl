import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { LogIn } from '../types/auth.type.js';
import { EncryptionUtility } from '../utilities/encryption.utility.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private encryptionUtility: EncryptionUtility,
  ) {}
  private readonly logger = new Logger(AuthService.name);
  async logIn(authData: LogIn): Promise<boolean> {
    try {
      this.logger.log(`LogIn the user ${authData.email}`);
      const getUserPassword = await this.prisma.users.findUnique({
        select: { password: true },
        where: { email: authData.email },
      });
      if (!getUserPassword) throw new Error('User not found');
      const userDecryptPass = await this.encryptionUtility.decrypt(
        getUserPassword.password,
      );
      this.logger.log('Comparing passwords');
      if (authData.password === userDecryptPass) {
        this.logger.log('Password match');
        return true;
      } else {
        this.logger.warn("Password don't match");
        return false;
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occured while login the user. ${error.message}`,
      );
      throw err;
    }
  }
}
