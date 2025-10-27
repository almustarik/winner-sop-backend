import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum SopType { masters='masters', phd='phd', mba='mba', fellowship='fellowship' }
export enum Tone { formal='formal', confident='confident', inspiring='inspiring' }

export class CreateSopDto {
  @ApiProperty() @IsString() @MinLength(5) title!: string;
  @ApiProperty({ enum: SopType }) @IsEnum(SopType) type!: SopType;
  @ApiProperty() @IsString() target_program!: string;
  @ApiProperty() @IsString() target_university!: string;
  @ApiProperty({ enum: Tone, required: false }) @IsOptional() @IsEnum(Tone) tone?: Tone = Tone.formal;
}

export class UpdateSopDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() target_program?: string;
  @IsOptional() @IsString() target_university?: string;
  @IsOptional() @IsEnum(Tone) tone?: Tone;
}

export class AIGenerationRequest {
  @ApiProperty({ enum: SopType }) @IsEnum(SopType) sop_type!: SopType;
  @ApiProperty({ enum: Tone }) @IsEnum(Tone) tone!: Tone;
  @ApiProperty() @IsString() target_program!: string;
  @ApiProperty() @IsString() target_university!: string;
}

