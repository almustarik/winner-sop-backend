import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(htmlContent: string, mailAddress: string, subject: string): Promise<boolean> {
    try {
      const response = await this.mailerService.sendMail({
        to: mailAddress,
        from: `"WinnerSOP" <${this.configService.get('DEFAULT_MAIL_SENDER')}>`, // sender address
        subject,
        html: htmlContent,
      });
      return response.response.includes('250 2.0.0 OK');
    } catch (error) {
      return false;
    }
  }

  // Asynchronous version (fire and forget)
  sendEmailAsync(htmlContent: string, mailAddress: string, subject: string): void {
    this.mailerService
      .sendMail({
        to: mailAddress,
        from: `"WinnerSOP" <${this.configService.get('DEFAULT_MAIL_SENDER')}>`,
        subject,
        html: htmlContent,
      })
      .then((response) => {
        if (!response.response.includes('250 2.0.0 OK')) {
          throw new Error('Failed to send email');
        }
      })
      .catch((err) => {
        // log it or handle it, but don’t throw unless you want the process to crash
        console.error('Email send failed:', err);
      });
  }
};
