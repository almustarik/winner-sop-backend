import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'User country',
    example: 'United States',
  })
  country!: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-01',
    nullable: true,
    required: false,
  })
  dateOfBirth?: string | null;

  @ApiProperty({
    description: 'Target program of study',
    example: 'Computer Science',
    nullable: true,
    required: false,
  })
  targetProgram?: string | null;

  @ApiProperty({
    description: 'Target university',
    example: 'MIT',
    nullable: true,
    required: false,
  })
  targetUniversity?: string | null;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'free',
    nullable: true,
    required: false,
  })
  plan?: string | null;

  @ApiProperty({
    description: 'Subscription status',
    example: 'active',
    nullable: true,
    required: false,
  })
  subscriptionStatus?: string | null;

  @ApiProperty({
    description: 'Total quota available',
    example: 10,
    nullable: true,
    required: false,
  })
  quota?: number | null;

  @ApiProperty({
    description: 'Quota used',
    example: 3,
    nullable: true,
    required: false,
  })
  usedQuota?: number | null;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  isVerified!: boolean;
}

