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
import { TestimonialsService } from './testimonials.service.js';
import { CreateTestimonialDto } from './dto/create-testimonial.dto.js';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}
  private readonly logger = new Logger(TestimonialsController.name);

  @Get()
  findAll() {
    this.logger.log('GET /testimonials');
    return this.testimonialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /testimonials/${id}`);
    return this.testimonialsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTestimonialDto) {
    this.logger.log(`POST /testimonials — author: "${dto.author}"`);
    return this.testimonialsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTestimonialDto) {
    this.logger.log(`PATCH /testimonials/${id}`);
    return this.testimonialsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /testimonials/${id}`);
    return this.testimonialsService.remove(id);
  }
}
