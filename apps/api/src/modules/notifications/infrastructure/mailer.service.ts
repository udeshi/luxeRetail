import { Injectable } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { TypedConfigService } from '../../../config/config.module';

export interface EmailJobData {
  to: string;
  subject: string;
  text: string;
}

/** SMTP transport pointed at Mailhog locally (see infra/docker-compose.yml,
 *  UI at http://localhost:8025) — swap for SES/Postmark/etc in prod by
 *  changing only this adapter. */
@Injectable()
export class MailerService {
  private readonly transport: Transporter;
  private readonly from: string;

  constructor(config: TypedConfigService) {
    this.transport = createTransport({ host: config.get('SMTP_HOST'), port: config.get('SMTP_PORT') });
    this.from = config.get('MAIL_FROM');
  }

  async send(email: EmailJobData): Promise<void> {
    await this.transport.sendMail({ from: this.from, ...email });
  }
}
