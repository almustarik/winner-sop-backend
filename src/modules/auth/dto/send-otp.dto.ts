import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Indicates if this is a new user',
    example: true,
  })
  isNewUser!: boolean;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;
}

export class SendOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
} 