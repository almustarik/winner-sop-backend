import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { PrismaService } from '../../../prisma/prisma.service';
  import { SUBSCRIPTIONPLAN } from '@prisma/client';
  
  export const REQUIRED_PLAN_KEY = 'requiredPlan';
  
  @Injectable()
  export class SubscriptionGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private prisma: PrismaService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredPlans = this.reflector.getAllAndOverride<SUBSCRIPTIONPLAN[]>(
        REQUIRED_PLAN_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredPlans) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const userId = request.user?.sub || request.user?.userId;
  
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          plan: true, 
          subscriptionStatus: true,
          subscriptionExpiryDate: true 
        },
      });
  
      if (!user) {
        throw new ForbiddenException('User not found');
      }
  
      // Check if subscription is active
      if (user.subscriptionStatus !== 'ACTIVE') {
        throw new ForbiddenException('Your subscription is not active');
      }
  
      // Check if subscription expired
      if (user.subscriptionExpiryDate && new Date() > user.subscriptionExpiryDate) {
        throw new ForbiddenException('Your subscription has expired');
      }
  
      // Check if user has required plan
      if (!requiredPlans.includes(user.plan)) {
        throw new ForbiddenException(
          `This feature requires a ${requiredPlans.join(' or ')} subscription`,
        );
      }
  
      return true;
    }
  }