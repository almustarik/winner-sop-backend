import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) {}

  async sendEmail(htmlContent: string, mailAddress: string, subject: string) {
    let response = await this.mailerService.sendMail({
      to: mailAddress, // list of receivers
      from: `"WinnerSOP" <${this.configService.get('DEFAULT_MAIL_SENDER')}>`, // sender address
      subject,
      // text: email, // plaintext body
      html: `${htmlContent}`, // HTML body content
      template: '../../templates/confirmation',
      context: {
        name: 'John Doe',
        url: 'https://www.google.com',
      },
    });
    if (response.response.includes('250 2.0.0 OK')) return true;
    else return false;
  }
}
