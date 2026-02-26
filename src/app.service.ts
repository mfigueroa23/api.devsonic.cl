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
      this.logger.log(`Requesting property for key: ${key}`);
      const property = await this.prisma.property.findUnique({
        where: { key },
      });
      if (!property) {
        await this.prisma.$disconnect();
        this.logger.warn(`Property not found for key: ${key}`);
        throw new Error(`Property not found for key: ${key}`);
      }
      return property;
    } catch (err) {
      await this.prisma.$disconnect();
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while retrieving the property: ${error.message}`,
      );
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
