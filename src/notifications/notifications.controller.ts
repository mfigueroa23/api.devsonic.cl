import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { NotificationsService } from './notifications.service.js';
import type { NotificationPortfolio } from '../types/notifications.types.js';

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
      this.logger.log('Enviando solicitud de notificación de portafolio');
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
        this.logger.warn('Faltan datos en la solicitud de notificación');
        return res.status(400).json({
          message:
            'Faltan datos en la solicitud de notificación {name, email, message}',
        });
      }
      const sendNorification =
        await this.notificationsService.sendPortfolioNotification(message);
      this.logger.log(
        'Enviando respuesta de solicitud de notificación de portafolio',
      );
      return res.status(200).json({
        message: 'Notificación enviada exitosamente',
        estado: sendNorification,
      });
    } catch (error) {
      this.logger.error('Error al enviar la solicitud de notificación', error);
      return res.status(500).json({
        message: 'Error al enviar la solicitud de notificación',
      });
    }
  }
}
