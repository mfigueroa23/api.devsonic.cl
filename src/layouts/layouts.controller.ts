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
import { LayoutsService } from './layouts.service.js';
import { CreateLayoutDto } from './dto/create-layout.dto.js';
import { UpdateLayoutDto } from './dto/update-layout.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('layouts')
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}
  private readonly logger = new Logger(LayoutsController.name);

  @Get()
  @UseGuards(JwtGuard)
  findAll() {
    this.logger.log('GET /layouts');
    return this.layoutsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /layouts/${id}`);
    return this.layoutsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLayoutDto) {
    this.logger.log(`POST /layouts — name: "${dto.name}"`);
    return this.layoutsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLayoutDto) {
    this.logger.log(`PATCH /layouts/${id}`);
    return this.layoutsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /layouts/${id}`);
    return this.layoutsService.remove(id);
  }
}
