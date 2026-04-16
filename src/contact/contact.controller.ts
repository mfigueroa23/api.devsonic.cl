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
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}
  private readonly logger = new Logger(ContactController.name);

  @Get()
  findAll() {
    this.logger.log('GET /contact');
    return this.contactService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /contact/${id}`);
    return this.contactService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContactDto) {
    this.logger.log(`POST /contact — label: "${dto.label}"`);
    return this.contactService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactDto) {
    this.logger.log(`PATCH /contact/${id}`);
    return this.contactService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /contact/${id}`);
    return this.contactService.remove(id);
  }
}
