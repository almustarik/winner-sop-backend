import { SetMetadata } from '@nestjs/common';
import { SUBSCRIPTIONPLAN } from '@prisma/client';
import { REQUIRED_PLAN_KEY } from '../guards/subscription.guard';

export const RequiredPlan = (...plans: SUBSCRIPTIONPLAN[]) =>
  SetMetadata(REQUIRED_PLAN_KEY, plans);