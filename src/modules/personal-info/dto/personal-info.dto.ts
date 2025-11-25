// src/modules/personal-info/dto/personal-info.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePersonalInfoDto {

  @ApiProperty({ description: 'SOP ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  sopId!: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ description: 'Country', example: 'United States' })
  @IsString()
  country!: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Target program', example: 'Computer Science', required: false })
  @IsOptional()
  @IsString()
  targetProgram?: string;

  @ApiProperty({ description: 'Target university', example: 'MIT', required: false })
  @IsOptional()
  @IsString()
  targetUniversity?: string;
}

export class UpdatePersonalInfoDto {
  @ApiProperty({ description: 'SOP ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  sopId!: string;

  @ApiProperty({ description: 'First name', example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Country', example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Target program', example: 'Computer Science', required: false })
  @IsOptional()
  @IsString()
  targetProgram?: string;

  @ApiProperty({ description: 'Target university', example: 'MIT', required: false })
  @IsOptional()
  @IsString()
  targetUniversity?: string;
}

export class PersonalInfoResponseDto {
    @ApiProperty({ description: 'Personal info ID', example: '507f1f77bcf86cd799439011' })
    id!: string;
  
    @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
    userId!: string;
  
    @ApiProperty({ description: 'SOP ID', example: '507f1f77bcf86cd799439011' })
    sopId!: string;

    @ApiProperty({ description: 'First name', example: 'John' })
    firstName!: string;
  
    @ApiProperty({ description: 'Last name', example: 'Doe' })
    lastName!: string;
  
    @ApiProperty({ description: 'Country', example: 'United States' })
    country!: string;
  
    @ApiProperty({ description: 'Date of birth', example: '1990-01-01T00:00:00.000Z', nullable: true })
    dateOfBirth?: Date | null;
  
    @ApiProperty({ description: 'Target program', example: 'Computer Science', nullable: true })
    targetProgram?: string | null;
  
    @ApiProperty({ description: 'Target university', example: 'MIT', nullable: true })
    targetUniversity?: string | null;
  
    @ApiProperty({ description: 'Creation date', example: '2024-01-01T00:00:00.000Z' })
    createdAt!: Date;
  
    @ApiProperty({ description: 'Last update date', example: '2024-01-01T00:00:00.000Z' })
    updatedAt!: Date;
  }
  
  export class PersonalInfoExistsResponseDto {
    @ApiProperty({ description: 'Whether personal info exists', example: true })
    exists!: boolean;
  
    @ApiProperty({ description: 'Whether personal info is complete (has required fields)', example: true })
    isComplete!: boolean;
  }
  
  export class DeletePersonalInfoResponseDto {
    @ApiProperty({ description: 'Success message', example: 'Personal information deleted successfully' })
    message!: string;
  }