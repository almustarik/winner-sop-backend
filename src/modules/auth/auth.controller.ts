import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
// import { LoginDto, RegisterDto, OTPRequestDto, OTPVerifyDto, ResetConfirmDto, ResetDto } from './dto/dto';
import { SocialLoginDto } from './dto/dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() sendOtpDto: SendOtpDto) {
    return this.auth.sendOTP(sendOtpDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.auth.verifyOTP(verifyOtpDto);
  }

  @Post('complete-registration')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completeRegistration(
    @CurrentUser('sub') userId: string,
    @Body() completeRegistrationDto: CompleteRegistrationDto,
  ) {
    return this.auth.completeRegistration(
      userId,
      completeRegistrationDto,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.auth.getProfile(userId);
  }

  // @Post('register')
  // async register(@Body() dto: RegisterDto) {
  //   return this.auth.register(dto);
  // }

  // @Post('login')
  // async login(@Body() dto: LoginDto) {
  //   return this.auth.login(dto);
  // }

  // @Post('refresh')
  // async refresh(@Body('refresh_token') token: string) {
  //   return this.auth.refresh(token);
  // }

  // @Post('logout')
  // @HttpCode(HttpStatus.OK)
  // async logout() { return { message: 'ok' }; }

  // @Post('forgot-password')
  // async forgot(@Body() dto: ResetDto) { return this.auth.forgot(dto); }

  // @Post('reset-password')
  // async reset(@Body() dto: ResetConfirmDto) { return this.auth.reset(dto); }

  // @Post('verify-email')
  // async verify(@Body('token') token: string) { return this.auth.verifyEmail(token); }

  @Post('social')
  @HttpCode(HttpStatus.OK)
  async social(@Body() dto: SocialLoginDto) {
    return this.auth.social(dto);
  }

  // @Post('otp/send')
  // async otpSend(@Body() dto: OTPRequestDto) { return this.auth.otpSend(dto); }

  // @Post('otp/verify')
  // async otpVerify(@Body() dto: OTPVerifyDto) { return this.auth.otpVerify(dto); }
}

