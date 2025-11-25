import { Module } from '@nestjs/common';
import { PersonalInfoService } from './personal-info.service';
import { PersonalInfoController } from './personal-info.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PersonalInfoService],
  controllers: [PersonalInfoController],
  exports: [PersonalInfoService],
})
export class PersonalInfoModule {}
