import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
// import { LoginDto, RegisterDto, OTPRequestDto, OTPVerifyDto, ResetConfirmDto, ResetDto, SocialLoginDto } from './dto/dto';
import { CompleteRegistrationDto, CompleteRegistrationResponseDto } from './dto/complete-registration.dto';
import { SendOtpDto, SendOtpResponseDto } from './dto/send-otp.dto';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, ConflictResponseDto } from './dto/error-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send OTP to email',
    description: 'Sends a 6-digit OTP code to the provided email address. Creates a new user if the email does not exist.',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Bad request - Invalid email address',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Rate limit exceeded',
    type: BadRequestResponseDto,
  })
  async sendOTP(@Body() sendOtpDto: SendOtpDto) {
    return this.auth.sendOTP(sendOtpDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify OTP code',
    description: 'Verifies the OTP code and returns access and refresh tokens if valid.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired OTP',
    type: UnauthorizedResponseDto,
  })
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.auth.verifyOTP(verifyOtpDto);
  }

  @Post('complete-registration')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Complete user registration',
    description: 'Completes the registration process for new users. Requires JWT authentication.',
  })
  @ApiBody({ type: CompleteRegistrationDto })
  @ApiResponse({
    status: 200,
    description: 'Registration completed successfully',
    type: CompleteRegistrationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Registration already completed',
    type: ConflictResponseDto,
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieves the authenticated user profile information. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: UnauthorizedResponseDto,
  })
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

  // @Post('social')
  // async social(@Body() dto: SocialLoginDto) { return this.auth.social(dto); }

  // @Post('otp/send')
  // async otpSend(@Body() dto: OTPRequestDto) { return this.auth.otpSend(dto); }

  // @Post('otp/verify')
  // async otpVerify(@Body() dto: OTPVerifyDto) { return this.auth.otpVerify(dto); }
}

