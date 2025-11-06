import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ACADEMICLEVEL } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class UserDto {
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
}

export class CompleteRegistrationResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Registration completed successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'User information',
    type: UserDto,
  })
  user!: UserDto;
}



export class CompleteRegistrationDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: 'User country',
    example: 'United States',
  })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({
    description: 'Academic level',
    enum: ACADEMICLEVEL,
    example: ACADEMICLEVEL.BACHELORS,
  })
  @IsEnum(ACADEMICLEVEL)
  @IsNotEmpty()
  academicLevel!: ACADEMICLEVEL;

  @ApiProperty({
    description: 'Target program of study',
    example: 'Computer Science',
    required: false,
  })
  @IsString()
  @IsOptional()
  targetProgram?: string;

  @ApiProperty({
    description: 'Target university',
    example: 'MIT',
    required: false,
  })
  @IsString()
  @IsOptional()
  targetUniversity?: string;
}