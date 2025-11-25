import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import {
//   LoginDto,
//   OTPRequestDto,
//   OTPVerifyDto,
//   RegisterDto,
//   ResetConfirmDto,
//   ResetDto,
//   SocialLoginDto,
// } from './dto/dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { CommonService } from '../common/common.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtService } from '@nestjs/jwt';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { SocialLoginDto } from './dto/dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ACADEMICLEVEL } from '@prisma/client';
import { isValidEmail } from 'src/utils/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly commonService: CommonService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_ATTEMPTS = 5;
  private readonly OTP_RESEND_COOLDOWN_SECONDS = 60;

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate tokens with configurable expiration
  private generateAccessToken(userId: string, email: string): string {
    const payload = { sub: userId, email, type: 'access' };
    const expiresIn = this.config.get('JWT_ACCESS_EXPIRATION') || '1h';
    
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn,
    });
  }

  private generateRefreshToken(userId: string, email: string): string {
    const payload = { sub: userId, email, type: 'refresh' };
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRATION') || '30d';
    
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn,
    });
  }

  // Send OTP for login or registration
  async sendOTP(sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;

    // Validate email address
    if (!isValidEmail(email)) {
      throw new BadRequestException({
        statusCode: 401,
        message: 'Invalid email address',
        error: 'Bad Request',
        errorCode: 'INVALID_EMAIL_FORMAT',
      });
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Check rate limiting - look for recent OTPs
    const recentOTP = await this.prisma.oTP.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - this.OTP_RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentOTP) {
      const secondsSinceLastSent = (Date.now() - recentOTP.createdAt.getTime()) / 1000;
      throw new BadRequestException(
        `Please wait ${Math.ceil(this.OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSent)} seconds before requesting a new OTP`,
      );
    }

    // Create user if doesn't exist
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: await argon2.hash('temp-password-placeholder'),
          isVerified: false,
          firstName: 'User',
          lastName: 'User',
          country: 'Unknown',
          academicLevel: ACADEMICLEVEL.BACHELORS,
          targetProgram: 'General',
          targetUniversity: 'Unknown',
        },
      });
    }

    // Invalidate all previous OTPs for this user
    await this.prisma.oTP.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Generate OTP
    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create new OTP record
    await this.prisma.oTP.create({
      data: {
        userId: user.id,
        email: user.email,
        code: otpCode,
        expiresAt: otpExpiresAt,
      },
    });

    // Send OTP email
    try {
      const subject = user.firstName ? 'Your Login OTP Code' : 'Welcome! Your Verification Code';
      const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
              <h2>${`Hello ${user.firstName}. Welcome to WinnerSOP!`}</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p>This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `;
      await this.commonService.sendEmail(htmlContent, email, subject);
    } catch (error) {
      throw new BadRequestException('Failed to send OTP email');
    }

    return {
      message: 'OTP sent successfully',
      isNewUser: !user.firstName || user.firstName === 'User',
      email: user.email,
    };
  }

  // Verify OTP
  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // Find the most recent unused OTP for this user
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        email,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('No valid OTP found. Please request a new one.');
    }

    // Check OTP attempts
    if (otpRecord.attempts >= this.MAX_OTP_ATTEMPTS) {
      // Mark as used to prevent further attempts
      await this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new UnauthorizedException('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      // Mark as used
      await this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      // Increment attempts
      await this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: {
          attempts: otpRecord.attempts + 1,
        },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP is valid - mark as used and update user
    await this.prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        lastLogin: new Date(),
      },
    });

     // Generate both tokens
     const accessToken = this.generateAccessToken(updatedUser.id, updatedUser.email);
     const refreshToken = this.generateRefreshToken(updatedUser.id, updatedUser.email);

    return {
      message: 'OTP verified successfully',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isNewUser: !updatedUser.firstName || updatedUser.firstName === 'User',
      },
    };
  }

  // Complete registration (for new users)
  async completeRegistration(userId: string, completeRegistrationDto: CompleteRegistrationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.firstName && user.firstName !== 'User') {
      throw new ConflictException('User registration already completed');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...completeRegistrationDto,
      },
    });

    return {
      message: 'Registration completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    };
  }

  // Get current user profile
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        academicLevel: true,
        targetProgram: true,
        targetUniversity: true,
        authProvider: true,
        plan: true,
        subscriptionStatus: true,
        quota: true,
        usedQuota: true,
        createdAt: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Optional: Clean up expired OTPs (run this periodically with a cron job)
  async cleanupExpiredOTPs() {
    const deleted = await this.prisma.oTP.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            isUsed: true,
            createdAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
            },
          },
        ],
      },
    });

    return {
      message: 'Expired OTPs cleaned up',
      deletedCount: deleted.count,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleOTPCleanup() {
    try {
      await this.cleanupExpiredOTPs();
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  // Social login: create or find user and issue tokens
async social(dto: SocialLoginDto) {
  const email = dto.email;

  let user = await this.prisma.user.findUnique({ 
    where: { email },
  });

  if (!user) {
    // Create user without personal info fields
    user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash('social-login-placeholder'),
        isVerified: true,
        lastLogin: new Date(),
        authProvider: dto.provider,
        firstName: dto.first_name || 'User',
        lastName: dto.last_name || 'User',
        country: 'Unknown',
        academicLevel: ACADEMICLEVEL.BACHELORS,
        targetProgram: 'General',
        targetUniversity: 'Unknown',
      },
    });

    // Refetch user with personal info
    user = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
  } else {
    // Update last login and mark verified if needed
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        isVerified: true,
        authProvider: dto.provider ?? user.authProvider,
      },
    });

    // Refetch user with personal info
    user = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
  }

  const access_token = this.generateAccessToken(user!.id, user!.email);
  const refresh_token = this.generateRefreshToken(user!.id, user!.email);

  return {
    access_token,
    refresh_token,
    user: {
      id: user!.id,
      email: user!.email,
      firstName: user!.firstName,
      lastName: user!.lastName,
      authProvider: user!.authProvider,
      isNewUser: !user!.firstName || user!.firstName === 'User',
    },
  };
}

  // private sign(subject: string, kind: 'access'|'refresh' = 'access') {
  //   const secret = this.config.get<string>('JWT_SECRET') || 'dev-secret';
  //   const exp = kind === 'access' ? '30m' : '7d';
  //   return jwt.sign({ sub: subject, type: kind }, secret, { expiresIn: exp });
  // }

  // async register(dto: RegisterDto) {
  //   const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
  //   if (exists) throw new BadRequestException('User with this email already exists');
  //   const hash = await argon2.hash(dto.password);
  //   const profile = {
  //     academic_background: { degree: 'Not provided', institution: 'Not provided', field_of_study: 'Not provided', graduation_year: 2020, gpa: 0.0, relevant_courses: [], research_experience: [], publications: [] },
  //     work_experience: [],
  //     achievements: [],
  //     career_goals: { short_term: 'User will add short-term goals soon.', long_term: 'User will add long-term goals soon.', motivation: 'User will add detailed motivation soon.', target_industry: 'Undecided', desired_role: 'Undecided' },
  //     personal_story: 'This is a placeholder personal story which will be updated by the user during onboarding. It ensures validation constraints are satisfied.'
  //   };
  //   const user = await this.prisma.user.create({ data: {
  //     email: dto.email,
  //     passwordHash: hash,
  //     firstName: dto.first_name,
  //     lastName: dto.last_name,
  //     country: dto.country,
  //     academicLevel: dto.academic_level as any,
  //     targetProgram: dto.target_program,
  //     targetUniversity: dto.target_university,
  //     profile
  //   }});
  //   return { user };
  // }

  // async login(dto: LoginDto) {
  //   const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  //   if (!user) throw new UnauthorizedException('Incorrect email or password');
  //   const ok = await argon2.verify(user.passwordHash, dto.password);
  //   if (!ok) throw new UnauthorizedException('Incorrect email or password');
  //   const access_token = this.sign(user.id, 'access');
  //   const refresh_token = this.sign(user.id, 'refresh');
  //   await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  //   return { access_token, refresh_token, user };
  // }

  // async refresh(token: string) {
  //   try {
  //     const secret = process.env.JWT_SECRET || 'dev-secret';
  //     const decoded = jwt.verify(token, secret) as any;
  //     if (decoded.type !== 'refresh') throw new Error('invalid');
  //     const access_token = this.sign(decoded.sub, 'access');
  //     return { access_token };
  //   } catch {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }

  // async forgot(dto: ResetDto) { return { message: 'email sent' }; }
  // async reset(dto: ResetConfirmDto) { return { message: 'password updated' }; }
  // async verifyEmail(token: string) { return { message: 'verified' }; }

  // async social(dto: SocialLoginDto) {
  //   let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  //   if (!user) {
  //     const profile = {
  //       academic_background: { degree: 'Not provided', institution: 'Not provided', field_of_study: 'Not provided', graduation_year: 2020, gpa: 0.0, relevant_courses: [], research_experience: [], publications: [] },
  //       work_experience: [],
  //       achievements: [],
  //       career_goals: { short_term: 'User will add short-term goals soon.', long_term: 'User will add long-term goals soon.', motivation: 'User will add detailed motivation soon.', target_industry: 'Undecided', desired_role: 'Undecided' },
  //       personal_story: 'This is a placeholder personal story which will be updated by the user during onboarding. It ensures validation constraints are satisfied.'
  //     };
  //     user = await this.prisma.user.create({ data: {
  //       email: dto.email,
  //       passwordHash: await argon2.hash('social-login-placeholder'),
  //       firstName: dto.first_name || 'User',
  //       lastName: dto.last_name || 'User',
  //       country: 'unknown',
  //       academicLevel: 'bachelors' as any,
  //       targetProgram: 'General',
  //       targetUniversity: 'Unknown',
  //       profile,
  //       isVerified: true,
  //     }});
  //   }
  //   const access_token = this.sign(user.id, 'access');
  //   const refresh_token = this.sign(user.id, 'refresh');
  //   return { access_token, refresh_token, user };
  // }

  // async otpSend(dto: OTPRequestDto) { return { message: 'OTP sent', otp: '123456' }; }
  // async otpVerify(dto: OTPVerifyDto) {
  //   let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  //   if (!user) {
  //     const profile = {
  //       academic_background: { degree: 'Not provided', institution: 'Not provided', field_of_study: 'Not provided', graduation_year: 2020, gpa: 0.0, relevant_courses: [], research_experience: [], publications: [] },
  //       work_experience: [],
  //       achievements: [],
  //       career_goals: { short_term: 'User will add short-term goals soon.', long_term: 'User will add long-term goals soon.', motivation: 'User will add detailed motivation soon.', target_industry: 'Undecided', desired_role: 'Undecided' },
  //       personal_story: 'This is a placeholder personal story which will be updated by the user during onboarding. It ensures validation constraints are satisfied.'
  //     };
  //     user = await this.prisma.user.create({ data: {
  //       email: dto.email,
  //       passwordHash: await argon2.hash('otp-login-placeholder'),
  //       firstName: 'User',
  //       lastName: 'User',
  //       country: 'Unknown',
  //       academicLevel: 'bachelors' as any,
  //       targetProgram: 'General',
  //       targetUniversity: 'Unknown',
  //       profile,
  //       isVerified: true,
  //     }});
  //   }
  //   const access_token = this.sign(user.id, 'access');
  //   const refresh_token = this.sign(user.id, 'refresh');
  //   return { access_token, refresh_token, user };
  // }
}
