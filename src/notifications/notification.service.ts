import { Injectable, Logger } from '@nestjs/common';
import { NotificationPortfolio } from '../types/notification.type.js';
import { AppService } from '../app.service.js';
import { BrevoClient } from '@getbrevo/brevo';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(
    private appService: AppService,
    private prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(NotificationsService.name);

  private async getLayout(name: string): Promise<string> {
    try {
      await this.prisma.$connect();
      this.logger.log(`Getting layout: ${name}`);
      const layout = await this.prisma.layouts.findUnique({
        select: { content: true, description: true },
        where: { name },
      });
      if (!layout) {
        this.logger.warn(`Layout not found: ${name}`);
        throw new Error(`Layout not found: ${name}`);
      } else {
        this.logger.log(`Layout: ${name}; Description: ${layout.description}`);
        return atob(layout.content);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while getting the layout ${name}. ${error.message}`,
      );
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async sendPortfolioNotification(message: NotificationPortfolio) {
    try {
      this.logger.log('Processing notification from portfolio');
      let plantilla = await this.getLayout('Contact Devsonic Portfolio');
      plantilla = plantilla.replace('{{name}}', message.name);
      plantilla = plantilla.replace('{{email}}', message.email);
      plantilla = plantilla.replace('{{message}}', message.message);
      this.logger.log('Setting up brevo client');
      const brevoApiKey = await this.appService.getProperty('BREVO_APIKEY');
      const brevo = new BrevoClient({ apiKey: brevoApiKey.value });
      this.logger.log('Setting up email');
      const sentEmail = await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: 'DevSonic', email: 'no-reply@devsonic.cl' },
        to: [{ email: 'mfigueroa@devsonic.cl' }],
        subject: 'Contact from devsonic.cl',
        htmlContent: plantilla,
      });
      this.logger.log(
        `Notification sent successfuly, ID: ${sentEmail.messageId}`,
      );
      return true;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurreed while sending the notification. ${error.message}`,
      );
      throw err;
    }
  }
}
