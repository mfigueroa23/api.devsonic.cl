import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoUtil {
  private readonly logger = new Logger(CryptoUtil.name);
  private ALGORITHM = 'aes-256-gcm';
  private IV_LENGTH = 16;
  private KEY_LENGTH = 32;
  private deriveKey(secret: string, salt: string): Buffer {
    this.logger.log('Estableciendo la llave de encriptacion');
    return crypto.scryptSync(secret, salt, this.KEY_LENGTH);
  }
  encrypt(text: string, secret: string, salt: string): string {
    this.logger.log('Iniciando proceso de encriptacion');
    if (!text) throw new Error('Text to encrypt cannot be empty');
    if (!secret) throw new Error('Secret key cannot be empty');
    try {
      const key = this.deriveKey(secret, salt);
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv(
        this.ALGORITHM,
        key,
        iv,
      ) as crypto.CipherGCM;
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      this.logger.log('Encriptacion completada');
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al realziar el proceso ${error.message}`,
      );
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  decrypt(encryptedData: string, secret: string, salt: string): string {
    this.logger.log('Iniciando proceso de desencriptacion');
    if (!encryptedData) throw new Error('Encrypted data cannot be empty');
    if (!secret) throw new Error('Secret key cannot be empty');
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      const [ivHex, authTagHex, encrypted] = parts;
      const key = this.deriveKey(secret, salt);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(
        this.ALGORITHM,
        key,
        iv,
      ) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      this.logger.log('Desencriptacion completada');
      return decrypted;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al realziar el proceso ${error.message}`,
      );
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}
