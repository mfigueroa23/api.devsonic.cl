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

  private async getLayout(name: string) {
    try {
      await this.prisma.$connect();
      this.logger.log(`Obteniendo plantilla: ${name}`);
      const layout = await this.prisma.layouts.findUnique({
        select: { content: true, description: true },
        where: { name },
      });
      if (!layout) {
        this.logger.warn(`Plantilla no encontrada: ${name}`);
        throw new Error(`Plantilla no encontrada: ${name}`);
      } else {
        this.logger.log(
          `Plantilla obtenida: ${name}; Descripcion: ${layout.description}`,
        );
        return atob(layout.content);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Error al obtener plantilla: ${name}. ${error.message}`,
      );
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async sendPortfolioNotification(message: NotificationPortfolio) {
    try {
      this.logger.log('Procesando notificación de portafolio');
      let plantilla = await this.getLayout('Contact Devsonic Portfolio');
      plantilla = plantilla.replace('{{name}}', message.name);
      plantilla = plantilla.replace('{{email}}', message.email);
      plantilla = plantilla.replace('{{message}}', message.message);
      this.logger.log('Configurando cliente de Brevo');
      const brevoApiKey = await this.appService.getProperty('BREVO_APIKEY');
      const brevo = new BrevoClient({ apiKey: brevoApiKey.value });
      this.logger.log('Configurando correo electrónico');
      const sentEmail = await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: 'DevSonic', email: 'no-reply@devsonic.cl' },
        to: [{ email: 'mfigueroa@devsonic.cl' }],
        subject: 'Contacto desde Portafolio',
        htmlContent: plantilla,
      });
      this.logger.log(
        `Enviando correo electrónico, ID: ${sentEmail.messageId}`,
      );
      return true;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Error al procesar notificación de portafolio ${error.message}`,
      );
      throw err;
    }
  }
}
