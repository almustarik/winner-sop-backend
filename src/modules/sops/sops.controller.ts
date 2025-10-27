import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SopsService } from './sops.service';
import { CreateSopDto, UpdateSopDto, AIGenerationRequest } from './dto';

@ApiTags('sops')
@Controller('sops')
export class SopsController {
  constructor(private readonly sops: SopsService) {}

  @Post()
  async create(@Body() dto: CreateSopDto) { return this.sops.create(dto); }

  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 10) { return this.sops.list(+page, +limit); }

  @Get(':id')
  async get(@Param('id') id: string) { return this.sops.get(id); }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSopDto) { return this.sops.update(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) { return this.sops.remove(id); }

  @Post('generate')
  async generate(@Body() dto: AIGenerationRequest) { return this.sops.generate(dto); }

  @Post(':id/feedback')
  async feedback(@Param('id') id: string) { return this.sops.feedback(id); }

  @Post(':id/plagiarism-check')
  async plagiarism(@Param('id') id: string) { return this.sops.plagiarism(id); }

  @Post(':id/improve')
  async improve(@Param('id') id: string) { return this.sops.improve(id); }

  @Post(':id/export')
  async export(@Param('id') id: string, @Query('format') format = 'pdf') { return this.sops.export(id, format); }

  @Get(':id/versions')
  async versions(@Param('id') id: string) { return this.sops.versions(id); }

  @Post(':id/versions/:version/restore')
  async restore(@Param('id') id: string, @Param('version') version: string) { return this.sops.restore(id, +version); }
}

