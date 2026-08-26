import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { NotificationsService } from './notification.service.js';
import type { NotificationPortfolio } from '../types/notification.type.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}
  private readonly logger = new Logger(NotificationsController.name);
  @Post('portfolio')
  async sendPortfolioNotification(
    @Body() req: NotificationPortfolio,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Sending portfolio notification');
      const message: NotificationPortfolio = {
        name: req.name,
        email: req.email,
        message: req.message,
      };
      if (
        message.name === undefined ||
        message.email === undefined ||
        message.message === undefined
      ) {
        this.logger.warn('Missing name, email or message in the request');
        return res.status(400).json({
          message:
            'Missing data in the notification request {name, email, message}',
        });
      }
      const sendNorification =
        await this.notificationsService.sendPortfolioNotification(message);
      this.logger.log('Sending response from notification request');
      return res.status(200).json({
        message: 'Notification sent successfuly',
        estado: sendNorification,
      });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while sending the notification ${error.message}`,
      );
      return res.status(500).json({
        message: 'An error has occurred while sending the notification',
      });
    }
  }
}
