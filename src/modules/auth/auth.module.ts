import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from '../common/common.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PersonalInfoModule } from '../personal-info/personal-info.module';

@Module({
  imports: [ConfigModule, CommonModule, PassportModule, PersonalInfoModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

