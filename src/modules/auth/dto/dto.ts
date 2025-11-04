import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(6) password!: string;
  @ApiProperty() @IsString() first_name!: string;
  @ApiProperty() @IsString() last_name!: string;
  @ApiProperty() @IsString() country!: string;
  @ApiProperty() @IsString() academic_level!: string;
  @ApiProperty() @IsString() target_program!: string;
  @ApiProperty() @IsString() target_university!: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(6) password!: string;
}

export class OTPRequestDto {
  @ApiProperty() @IsEmail() email!: string;
}

export class OTPVerifyDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(4) otp!: string;
}

export class SocialLoginDto {
  @ApiProperty() @IsString() provider!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() first_name!: string;
  @ApiProperty() @IsString() last_name!: string;
}

export class ResetDto {
  @ApiProperty() @IsEmail() email!: string;
}

export class ResetConfirmDto {
  @ApiProperty() @IsString() token!: string;
  @ApiProperty() @IsString() @MinLength(6) new_password!: string;
}

