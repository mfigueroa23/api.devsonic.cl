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
import { AboutService } from './about.service.js';
import { CreateAboutDto } from './dto/create-about.dto.js';
import { UpdateAboutDto } from './dto/update-about.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}
  private readonly logger = new Logger(AboutController.name);

  @Get()
  findAll() {
    this.logger.log('GET /about');
    return this.aboutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /about/${id}`);
    return this.aboutService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAboutDto) {
    this.logger.log(`POST /about — title: "${dto.title}"`);
    return this.aboutService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAboutDto) {
    this.logger.log(`PATCH /about/${id}`);
    return this.aboutService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /about/${id}`);
    return this.aboutService.remove(id);
  }
}
