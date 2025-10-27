import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async me() { return this.prisma.user.findFirst(); }
  async update(body: any) {
    const u = await this.prisma.user.findFirst();
    if (!u) return null;
    return this.prisma.user.update({ where: { id: u.id }, data: {
      firstName: body.first_name ?? undefined,
      lastName: body.last_name ?? undefined,
      country: body.country ?? undefined,
      targetProgram: body.target_program ?? undefined,
      targetUniversity: body.target_university ?? undefined,
    }});
  }
}
