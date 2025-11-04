import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ACADEMICLEVEL } from '@prisma/client';

export class CompleteRegistrationDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsEnum(ACADEMICLEVEL)
  @IsNotEmpty()
  academicLevel!: ACADEMICLEVEL;

  @IsString()
  @IsOptional()
  targetProgram?: string;

  @IsString()
  @IsOptional()
  targetUniversity?: string;
}