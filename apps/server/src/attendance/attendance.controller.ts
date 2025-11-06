import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  markAttendance(@Body(ValidationPipe) markAttendanceDto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(markAttendanceDto);
  }

  @Get('exam/:examId')
  getAttendanceByExam(@Param('examId', ParseIntPipe) examId: number) {
    return this.attendanceService.getAttendanceByExam(examId);
  }
}
