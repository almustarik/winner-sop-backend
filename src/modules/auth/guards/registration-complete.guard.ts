import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from '../../../prisma/prisma.service';
  
  @Injectable()
  export class RegistrationCompleteGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const userId = request.user?.sub || request.user?.userId;
  
      if (!userId) {
        throw new ForbiddenException('User not authenticated');
      }
  
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { personalInfo: true },
      });
      
      if (!user?.personalInfo?.firstName || !user?.personalInfo?.lastName) {
        throw new ForbiddenException(
          'Please complete your registration to access this resource',
        );
      }
  
      return true;
    }
  }