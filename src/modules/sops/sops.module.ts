import { Module } from '@nestjs/common';
import { SopsController } from './sops.controller';
import { SopsService } from './sops.service';

@Module({
  controllers: [SopsController],
  providers: [SopsService],
})
export class SopsModule {}

