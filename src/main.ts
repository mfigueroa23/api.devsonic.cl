import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PrismaService } from './prisma.service.js';
import { Logger } from '@nestjs/common';

const logger = new Logger('APP_INITIALIZER');
const prisma = new PrismaService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  logger.log('Conectando a la base de datos');
  await prisma.$connect();
  logger.log('Obteniendo dominio para habilitar en cors');
  const domains = await prisma.cors_domains.findMany({
    select: { domain: true },
    where: { habilitated: true },
  });
  if (domains.length != 0) {
    domains.forEach((domains) => {
      logger.log(`Dominio encontrado: ${domains.domain}`);
    });
    app.enableCors({
      origin: domains,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    logger.log('Desconentando de la base de datos');
    await prisma.$disconnect();
    await app.listen(process.env.PORT ?? 3000);
  } else {
    logger.warn('No se han encontrado dominios para habiliar');
    app.enableCors({
      origin: ['https://devsonic.cl'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    logger.log('Desconentando de la base de datos');
    await prisma.$disconnect();
    await app.listen(process.env.PORT ?? 3000);
  }
}
bootstrap();
