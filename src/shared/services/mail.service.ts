import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
// The MailService class is responsible for sending emails, 
// It uses the nodemailer library to create a transporter
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

//this method sends a verification email to the specified recipient with the provided OTP.
  async sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });

    this.logger.log(`Email "${subject}" sent to ${to}`);
  }
}