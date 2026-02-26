import { Controller, Get, Logger, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { property } from 'generated/prisma/client.js';
import express from 'express';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}
  private readonly logger = new Logger(AppController.name);
  @Get()
  async getServiceStatus(@Res() res: express.Response): Promise<void> {
    try {
      this.logger.log('Requesting service status');
      const serviceName = await this.appService.getProperty('SERVICE_NAME');
      const serviceStatus = await this.appService.getProperty('SERVICE_STATUS');
      const properties: property[] = [serviceName, serviceStatus];
      this.logger.log('responding status of the service');
      res.status(200).json({
        serviceName: properties[0].value,
        serviceStatus: properties[1].value,
      });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while retrieving the service status. ${error.message}`,
      );
      res.status(500).json({
        serviceName: 'unknown',
        serviceStatus: 'unknown',
        error: `${err}`,
      });
    }
  }
}
