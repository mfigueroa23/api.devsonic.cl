import { Injectable, Logger } from '@nestjs/common';
import { NotificationPortfolio } from '../types/notifications.types.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  sendPortfolioNotification(message: NotificationPortfolio) {
    this.logger.log('Procesando notificación de portafolio');
    return {
      name: message.name,
      email: message.email,
      message: message.message,
    };
  }
}
