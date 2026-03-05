import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PrismaService } from './prisma.service.js';
import { Logger } from '@nestjs/common';

const logger = new Logger('InstanceLoader');
const prisma = new PrismaService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  logger.log('Connecting to the database');
  await prisma.$connect();
  logger.log('Getting CORS domains from the database');
  const domains = await prisma.cors_domains.findMany({
    select: { domain: true },
    where: { habilitated: true },
  });
  if (domains.length != 0) {
    domains.forEach((domains) => {
      logger.log(`Found domain: ${domains.domain}`);
    });
    app.enableCors({
      origin: domains,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    logger.log('Disconnecting from the database');
    await prisma.$disconnect();
    await app.listen(process.env.PORT ?? 3000);
  } else {
    logger.warn('No domains found in the database');
    app.enableCors({
      origin: [''],
      methods: '',
    });
    logger.log('Disconnecting from the database');
    await prisma.$disconnect();
    await app.listen(process.env.PORT ?? 3000);
  }
}
bootstrap().catch((err) => {
  const error = new Error(err as string);
  logger.error(`Error during application bootstrap: ${error.message}`);
  process.exit(1);
});
