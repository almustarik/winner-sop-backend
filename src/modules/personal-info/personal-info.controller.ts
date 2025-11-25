import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PersonalInfoService } from './personal-info.service';
import { CreatePersonalInfoDto, UpdatePersonalInfoDto } from './dto/personal-info.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Personal Info')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal-info')
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create personal information',
    description: 'Create personal information for the authenticated user',
  })
  @ApiBody({ type: CreatePersonalInfoDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personal information created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Personal information already exists for this user',
  })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createPersonalInfoDto: CreatePersonalInfoDto,
  ) {
    const personalInfo = await this.personalInfoService.create(userId, createPersonalInfoDto);
    return {
      message: 'Personal information created successfully',
      statusCode: HttpStatus.CREATED,
      data: personalInfo,
    };
  }

  @Get('get')
  @ApiOperation({
    summary: 'Get personal information',
    description: 'Retrieve personal information for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personal information retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Personal information not found',
  })
  async getPersonalInfo(@CurrentUser('sub') userId: string) {
    const personalInfo = await this.personalInfoService.findByUserId(userId);

    if (!personalInfo) {
      throw new NotFoundException('Personal information not found');
    }

    return {
      message: 'Personal information retrieved successfully',
      statusCode: HttpStatus.OK,
      data: personalInfo,
    };
  }

  @Put('update')
  @ApiOperation({
    summary: 'Update personal information',
    description:
      'Update personal information for the authenticated user. Creates new record if none exists.',
  })
  @ApiBody({ type: UpdatePersonalInfoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personal information updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personal information created successfully (if none existed)',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async update(
    @CurrentUser('sub') userId: string,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    const personalInfo = await this.personalInfoService.update(userId, updatePersonalInfoDto);
    return {
      message: 'Personal information updated successfully',
      statusCode: HttpStatus.OK,
      data: personalInfo,
    };
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete personal information',
    description: 'Delete personal information for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personal information deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Personal information not found',
  })
  async delete(@CurrentUser('sub') userId: string) {
    try {
      await this.personalInfoService.delete(userId);
      return {
        message: 'Personal information deleted successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new NotFoundException('Personal information not found');
    }
  }

  @Get('check-exists')
  @ApiOperation({
    summary: 'Check if personal information exists',
    description: 'Check whether the authenticated user has personal information on file',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check completed successfully',
  })
  async checkExists(@CurrentUser('sub') userId: string) {
    const personalInfo = await this.personalInfoService.findByUserId(userId);

    const exists = !!personalInfo;
    const isComplete =
      exists && !!personalInfo.firstName && !!personalInfo.lastName && !!personalInfo.country;

    return {
      message: 'User personal information check completed successfully',
      statusCode: HttpStatus.OK,
      data: {
        exists,
        isComplete,
      },
    };
  }
}
