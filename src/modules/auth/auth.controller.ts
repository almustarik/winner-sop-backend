import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, OTPRequestDto, OTPVerifyDto, ResetConfirmDto, ResetDto, SocialLoginDto } from './dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') token: string) {
    return this.auth.refresh(token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() { return { message: 'ok' }; }

  @Post('forgot-password')
  async forgot(@Body() dto: ResetDto) { return this.auth.forgot(dto); }

  @Post('reset-password')
  async reset(@Body() dto: ResetConfirmDto) { return this.auth.reset(dto); }

  @Post('verify-email')
  async verify(@Body('token') token: string) { return this.auth.verifyEmail(token); }

  @Post('social')
  async social(@Body() dto: SocialLoginDto) { return this.auth.social(dto); }

  @Post('otp/send')
  async otpSend(@Body() dto: OTPRequestDto) { return this.auth.otpSend(dto); }

  @Post('otp/verify')
  async otpVerify(@Body() dto: OTPVerifyDto) { return this.auth.otpVerify(dto); }
}

