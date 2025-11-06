import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Allotment } from '../entities/allotment.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Allotment)
    private allotmentRepository: Repository<Allotment>,
  ) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto): Promise<Attendance> {
    const { allotmentId, status } = markAttendanceDto;

    // Verify allotment exists
    const allotment = await this.allotmentRepository.findOne({
      where: { allotmentId },
    });
    if (!allotment) {
      throw new NotFoundException(`Allotment with ID ${allotmentId} not found`);
    }

    // Check if attendance already exists
    let attendance = await this.attendanceRepository.findOne({
      where: { allotmentId },
    });

    if (attendance) {
      // Update existing attendance
      attendance.status = status;
      attendance.markedAt = new Date();
    } else {
      // Create new attendance record
      attendance = this.attendanceRepository.create({
        allotmentId,
        status,
      });
    }

    return await this.attendanceRepository.save(attendance);
  }

  async getAttendanceByExam(examId: number): Promise<Attendance[]> {
    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.allotment', 'allotment')
      .leftJoinAndSelect('allotment.student', 'student')
      .leftJoinAndSelect('allotment.room', 'room')
      .where('allotment.examId = :examId', { examId })
      .getMany();

    return attendances;
  }
}
