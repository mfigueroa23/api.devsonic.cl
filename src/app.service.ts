import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { property } from '../generated/prisma/client.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(AppService.name);
  async getProperty(key: string): Promise<property> {
    this.logger.log(`Obteniendo propiedad para la clave: ${key}`);
    const property = await this.prisma.property.findUnique({
      where: { key },
    });
    if (!property) {
      this.logger.warn(`Propiedad no encontrada para la clave: ${key}`);
      throw new Error(`Propiedad no encontrada para la clave: ${key}`);
    }
    return property;
  }
}
