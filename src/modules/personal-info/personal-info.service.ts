// src/modules/personal-info/personal-info.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonalInfoDto, UpdatePersonalInfoDto } from './dto/personal-info.dto'; 

@Injectable()
export class PersonalInfoService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSopOwnership(userId: string, sopId: string) {
    const sop = await this.prisma.sOP.findFirst({ where: { id: sopId, userId } });
    if (!sop) throw new NotFoundException('SOP not found for this user');
  }

  async create(userId: string, dto: CreatePersonalInfoDto) {
    const { sopId, dateOfBirth, ...rest } = dto;
    await this.ensureSopOwnership(userId, sopId);

    const alreadyExists = await this.prisma.personalInfo.findUnique({ where: { sopId } });
    if (alreadyExists) throw new ConflictException('Personal info already exists for this SOP');

    return this.prisma.personalInfo.create({
      data: {
        userId,
        sopId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        ...rest,
      },
    });
  }

  async findBySopId(userId: string, sopId: string) {
    await this.ensureSopOwnership(userId, sopId);
    const personalInfo = await this.prisma.personalInfo.findUnique({ where: { sopId } });
    if (!personalInfo) throw new NotFoundException('Personal information not found');
    return personalInfo;
  }

  async update(userId: string, dto: UpdatePersonalInfoDto) {
    const { sopId, dateOfBirth, ...rest } = dto;
    await this.ensureSopOwnership(userId, sopId);

    const existing = await this.prisma.personalInfo.findUnique({ where: { sopId } });
    if (!existing) {
      return this.create(userId, dto as CreatePersonalInfoDto);
    }

    return this.prisma.personalInfo.update({
      where: { sopId },
      data: {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });
  }

  async delete(userId: string, sopId: string) {
    await this.ensureSopOwnership(userId, sopId);
    return this.prisma.personalInfo.delete({ where: { sopId } });
  }
}