import { ApiProperty } from '@nestjs/swagger';

export class BadRequestResponseDto {
  @ApiProperty({
    description: 'Error status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Please wait 45 seconds before requesting a new OTP',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error!: string;

  @ApiProperty({
    description: 'Specific error code for client handling',
    example: 'INVALID_EMAIL_FORMAT',
    required: false,
  })
  errorCode?: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({
    description: 'Error status code',
    example: 401,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid or expired OTP',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Unauthorized',
  })
  error!: string;
}

export class ConflictResponseDto {
  @ApiProperty({
    description: 'Error status code',
    example: 409,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'User registration already completed',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Conflict',
  })
  error!: string;
}

