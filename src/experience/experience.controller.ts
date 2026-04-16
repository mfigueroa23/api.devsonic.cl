import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExperienceService } from './experience.service.js';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}
  private readonly logger = new Logger(ExperienceController.name);

  @Get()
  findAll() {
    this.logger.log('GET /experience');
    return this.experienceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /experience/${id}`);
    return this.experienceService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateExperienceDto) {
    this.logger.log(`POST /experience — role: "${dto.role}" at "${dto.company}"`);
    return this.experienceService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExperienceDto) {
    this.logger.log(`PATCH /experience/${id}`);
    return this.experienceService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /experience/${id}`);
    return this.experienceService.remove(id);
  }
}
