import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseIntPipe,
  Put,
  HttpCode,
} from '@nestjs/common';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ImportStudentsDto } from './dto/import-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('api/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(@Body(ValidationPipe) createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    return this.studentService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Post('import')
  @HttpCode(200)
  import(
    @Body(new ValidationPipe({ transform: true, whitelist: false }))
    importStudentsDto: ImportStudentsDto,
  ) {
    return this.studentService.importStudents(importStudentsDto);
  }

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file?: any) {
    return this.studentService.parseCsvStream(file);
  }

  @Post('import-finalize')
  async importFinalize(
    @Body(ValidationPipe)
    body: { rows: Array<{ studentId: string; studentName: string; departmentId: number }>; upsert?: boolean },
  ) {
    return this.studentService.finalizeImport(body.rows || [], Boolean(body.upsert));
  }

  @Get('template')
  async downloadTemplate() {
    const headers = ['student_id', 'student_name', 'department_name'];
    const sample = ['CS001', 'John Doe', 'M.TECH CSE'];
    const csv = `${headers.join(',')}\n${sample.join(',')}\n`;
    return csv;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }
}
