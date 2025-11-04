import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
