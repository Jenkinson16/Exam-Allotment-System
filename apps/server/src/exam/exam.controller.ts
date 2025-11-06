import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { RegisterStudentsDto } from './dto/register-students.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Controller('api/exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  create(@Body(ValidationPipe) createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.examService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examService.findOne(id);
  }

  @Post(':id/register')
  registerStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) registerStudentsDto: RegisterStudentsDto,
  ) {
    return this.examService.registerStudents(id, registerStudentsDto);
  }

  @Get(':id/students')
  getRegisteredStudents(@Param('id', ParseIntPipe) id: number) {
    return this.examService.getRegisteredStudents(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateExamDto,
  ) {
    return this.examService.update(id, dto);
  }
}
