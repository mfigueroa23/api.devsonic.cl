import { Injectable, Logger } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { AppService } from '../app.service.js';

@Injectable()
export class EncryptionUtility {
  constructor(private appService: AppService) {}
  private readonly logger = new Logger(EncryptionUtility.name);
  private async getEncryptionKey(): Promise<Buffer> {
    this.logger.log('Configuring encryption key');
    const secret = await this.appService.getProperty('CRYPTO_SECRET');
    const salt = await this.appService.getProperty('CRYPTO_SALT');
    return scryptSync(secret.value, salt.value, 32);
  }
  async encrypt(text: string): Promise<string> {
    try {
      this.logger.log('Encrypting value');
      const key = await this.getEncryptionKey();
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', key, iv);
      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
      ]);
      this.logger.log('Encryption successful');
      return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (err) {
      this.logger.error(`Encryption failed: ${(err as Error).message}`);
      throw err;
    }
  }
  async decrypt(encryptedText: string): Promise<string> {
    try {
      this.logger.log('Decrypting value');
      const key = await this.getEncryptionKey();
      const [ivHex, dataHex] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(dataHex, 'hex');
      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      this.logger.log('Decryption successful');
      return decrypted.toString('utf8');
    } catch (err) {
      this.logger.error(`Decryption failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
