import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me() { return this.users.me(); }
  @Patch('me') update(@Body() body: any) { return this.users.update(body); }
}

