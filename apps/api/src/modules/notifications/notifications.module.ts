import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { EMAIL_QUEUE, EmailProcessor } from './infrastructure/email.processor';
import { MailerService } from './infrastructure/mailer.service';
import { SendOrderConfirmationHandler } from './application/send-order-confirmation.handler';

@Module({
  // Depends on Auth (to read the recipient's email) and Orders (to read
  // order details) purely to *read* — it never mutates either aggregate,
  // and neither of them knows notifications exists (see the event handler).
  imports: [CqrsModule, BullModule.registerQueue({ name: EMAIL_QUEUE }), AuthModule, OrdersModule],
  providers: [MailerService, EmailProcessor, SendOrderConfirmationHandler],
})
export class NotificationsModule {}
