import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { property } from '../generated/prisma/client.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(AppService.name);
  async getProperty(key: string): Promise<property> {
    try {
      await this.prisma.$connect();
      this.logger.log(`Obteniendo propiedad para la clave: ${key}`);
      const property = await this.prisma.property.findUnique({
        where: { key },
      });
      if (!property) {
        await this.prisma.$disconnect();
        this.logger.warn(`Propiedad no encontrada para la clave: ${key}`);
        throw new Error(`Propiedad no encontrada para la clave: ${key}`);
      }
      return property;
    } catch (err) {
      await this.prisma.$disconnect();
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al obtener la propiedad ${error.message}`,
      );
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
