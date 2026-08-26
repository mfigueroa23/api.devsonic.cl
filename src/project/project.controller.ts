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
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  private readonly logger = new Logger(ProjectController.name);

  @Get()
  findAll() {
    this.logger.log('GET /project');
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /project/${id}`);
    return this.projectService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProjectDto) {
    this.logger.log(`POST /project — title: "${dto.title}"`);
    return this.projectService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    this.logger.log(`PATCH /project/${id}`);
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /project/${id}`);
    return this.projectService.remove(id);
  }
}
