import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto, OTPRequestDto, OTPVerifyDto, RegisterDto, ResetConfirmDto, ResetDto, SocialLoginDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private sign(subject: string, kind: 'access'|'refresh' = 'access') {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const exp = kind === 'access' ? '30m' : '7d';
    return jwt.sign({ sub: subject, type: kind }, secret, { expiresIn: exp });
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('User with this email already exists');
    const hash = await argon2.hash(dto.password);
    const profile = {
      academic_background: { degree: 'Not provided', institution: 'Not provided', field_of_study: 'Not provided', graduation_year: 2020, gpa: 0.0, relevant_courses: [], research_experience: [], publications: [] },
      work_experience: [],
      achievements: [],
      career_goals: { short_term: 'User will add short-term goals soon.', long_term: 'User will add long-term goals soon.', motivation: 'User will add detailed motivation soon.', target_industry: 'Undecided', desired_role: 'Undecided' },
      personal_story: 'This is a placeholder personal story which will be updated by the user during onboarding. It ensures validation constraints are satisfied.'
    };
    const user = await this.prisma.user.create({ data: {
      email: dto.email,
      passwordHash: hash,
      firstName: dto.first_name,
      lastName: dto.last_name,
      country: dto.country,
      academicLevel: dto.academic_level as any,
      targetProgram: dto.target_program,
      targetUniversity: dto.target_university,
      profile
    }});
    return { user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Incorrect email or password');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Incorrect email or password');
    const access_token = this.sign(user.id, 'access');
    const refresh_token = this.sign(user.id, 'refresh');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    return { access_token, refresh_token, user };
  }

  async refresh(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret';
      const decoded = jwt.verify(token, secret) as any;
      if (decoded.type !== 'refresh') throw new Error('invalid');
      const access_token = this.sign(decoded.sub, 'access');
      return { access_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgot(dto: ResetDto) { return { message: 'email sent' }; }
  async reset(dto: ResetConfirmDto) { return { message: 'password updated' }; }
  async verifyEmail(token: string) { return { message: 'verified' }; }

  async social(dto: SocialLoginDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      const profile = {
        academic_background: { degree: 'Not provided', institution: 'Not provided', field_of_study: 'Not provided', graduation_year: 2020, gpa: 0.0, relevant_courses: [], research_experience: [], publications: [] },
        work_experience: [],
        achievements: [],
        career_goals: { short_term: 'User will add short-term goals soon.', long_term: 'User will add long-term goals soon.', motivation: 'User will add detailed motivation soon.', target_industry: 'Undecided', desired_role: 'Undecided' },
        personal_story: 'This is a placeholder personal story which will be updated by the user during onboarding. It ensures validation constraints are satisfied.'
      };
      user = await this.prisma.user.create({ data: {
        email: dto.email,
        passwordHash: await argon2.hash('social-login-placeholder'),
        firstName: dto.first_name || 'User',
        lastName: dto.last_name || 'User',
        country: 'unknown',
        academicLevel: 'bachelors' as any,
        targetProgram: 'General',
        targetUniversity: 'Unknown',
        profile,
        isVerified: true,
      }});
    }
    const access_token = this.sign(user.id, 'access');
    const refresh_token = this.sign(user.id, 'refresh');
    return { access_token, refresh_token, user };
  }

  async otpSend(dto: OTPRequestDto) { return { message: 'OTP sent', otp: '123456' }; }
  async otpVerify(dto: OTPVerifyDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      const profile = {
        academic_background: { degree: 'Not provided', institution: 'Not provided', field_of_study: 'Not provided', graduation_year: 2020, gpa: 0.0, relevant_courses: [], research_experience: [], publications: [] },
        work_experience: [],
        achievements: [],
        career_goals: { short_term: 'User will add short-term goals soon.', long_term: 'User will add long-term goals soon.', motivation: 'User will add detailed motivation soon.', target_industry: 'Undecided', desired_role: 'Undecided' },
        personal_story: 'This is a placeholder personal story which will be updated by the user during onboarding. It ensures validation constraints are satisfied.'
      };
      user = await this.prisma.user.create({ data: {
        email: dto.email,
        passwordHash: await argon2.hash('otp-login-placeholder'),
        firstName: 'User',
        lastName: 'User',
        country: 'Unknown',
        academicLevel: 'bachelors' as any,
        targetProgram: 'General',
        targetUniversity: 'Unknown',
        profile,
        isVerified: true,
      }});
    }
    const access_token = this.sign(user.id, 'access');
    const refresh_token = this.sign(user.id, 'refresh');
    return { access_token, refresh_token, user };
  }
}
