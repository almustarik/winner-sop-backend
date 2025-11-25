// src/modules/personal-info/personal-info.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonalInfoDto, UpdatePersonalInfoDto } from './dto/personal-info.dto'; 

@Injectable()
export class PersonalInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createPersonalInfoDto: CreatePersonalInfoDto) {
    // Check if personal info already exists for this user
    const existingInfo = await this.prisma.personalInfo.findUnique({
      where: { userId },
    });

    if (existingInfo) {
      throw new ConflictException('Personal information already exists for this user');
    }
    const createdPersonalInfo = await this.prisma.personalInfo.create({
        data: {
          userId,
          ...createPersonalInfoDto,
        },
      });

    if (!createdPersonalInfo) {
      throw new NotFoundException('Personal information not found');
    }
    return createdPersonalInfo;
  }

  async findByUserId(userId: string) {
    const personalInfo = await this.prisma.personalInfo.findUnique({
      where: { userId },
    });

    if (!personalInfo) {
      throw new NotFoundException('Personal information not found');
    }

    return personalInfo;
  }

  async update(userId: string, updatePersonalInfoDto: UpdatePersonalInfoDto) {
    const existingInfo = await this.findByUserId(userId);
    
    if (!existingInfo) {
      // Create if doesn't exist
      return this.create(userId, updatePersonalInfoDto as CreatePersonalInfoDto);
    }
    
    const updatedPersonalInfo = await this.prisma.personalInfo.update({
      where: { userId },
      data: updatePersonalInfoDto,
    });

    if (!updatedPersonalInfo) {
      throw new NotFoundException('Personal information not found');
    }

    return updatedPersonalInfo;
  }

  async delete(userId: string) {
    const deletedPersonalInfo = await this.prisma.personalInfo.delete({
      where: { userId },
    });

    if (!deletedPersonalInfo) {
      throw new NotFoundException('Personal information not found');
    }

    return deletedPersonalInfo;
  }
}