import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { MailerService, type EmailJobData } from './mailer.service';

export const EMAIL_QUEUE = 'email';

/** Generic email-sending worker — any module can enqueue a job here rather
 *  than sending mail inline in a request/webhook handler, so a slow SMTP
 *  call never blocks the response that triggered it. */
@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  constructor(private readonly mailer: MailerService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    await this.mailer.send(job.data);
  }
}
