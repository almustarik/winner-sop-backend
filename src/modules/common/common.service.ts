import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import config from 'src/config';

@Injectable()
export class CommonService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(email: string, mailAddress: string, subject: string) {
    let response = await this.mailerService.sendMail({
      to: mailAddress, // list of receivers
      from: `"WinnerSOP" <${config.default_mail_sender}>`, // sender address
      subject,
      // text: email, // plaintext body
      html: `${email}`, // HTML body content
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
