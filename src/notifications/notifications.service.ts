import { Injectable, Logger } from '@nestjs/common';
import { NotificationPortfolio } from '../types/notifications.types.js';
import { AppService } from '../app.service.js';
import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
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
      this.logger.error(`Error al obtener plantilla: ${name}`, error.message);
      throw error;
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
      const brevoClient: TransactionalEmailsApi = new TransactionalEmailsApi();
      brevoClient.setApiKey(
        TransactionalEmailsApiApiKeys.apiKey,
        brevoApiKey.value,
      );
      this.logger.log('Configurando correo electrónico');
      const email = new SendSmtpEmail();
      email.sender = { name: 'DevSonic', email: 'no-reply@devsonic.cl' };
      email.to = [{ email: 'mfigueroa@devsonic.cl' }];
      email.subject = 'Contacto desde Portafolio';
      email.htmlContent = plantilla;
      this.logger.log('Enviando correo electrónico');
      await brevoClient
        .sendTransacEmail(email)
        .then((res) => {
          this.logger.log(JSON.stringify(res.body));
        })
        .catch((error) => {
          this.logger.error(error);
          throw error;
        });
      this.logger.log('Correo electrónico enviado exitosamente');
      return true;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        'Error al procesar notificación de portafolio',
        error.message,
      );
      throw error;
    }
  }
}
