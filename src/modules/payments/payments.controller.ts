import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  @Post('checkout/session')
  createSession() { return { checkout_url: 'https://example/checkout/session_stub' }; }

  @Post('webhook')
  webhook(@Body() body: any) { return { received: true }; }
}

