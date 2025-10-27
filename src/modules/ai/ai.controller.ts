import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  @Get('status')
  status() { return { ok: true }; }
}

