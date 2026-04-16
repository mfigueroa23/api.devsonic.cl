import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { NotificationsModule } from './notifications/notification.module.js';
import { AboutModule } from './about/about.module.js';
import { ContactModule } from './contact/contact.module.js';
import { ExperienceModule } from './experience/experience.module.js';
import { ProjectModule } from './project/project.module.js';
import { TestimonialsModule } from './testimonials/testimonials.module.js';
import { LayoutsModule } from './layouts/layouts.module.js';

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
  imports: [
    NotificationsModule,
    AboutModule,
    ContactModule,
    ExperienceModule,
    ProjectModule,
    TestimonialsModule,
    LayoutsModule,
  ],
})
export class AppModule {}
