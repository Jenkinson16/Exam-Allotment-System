import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../entities/attendance.entity';
import { Allotment } from '../entities/allotment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Allotment])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
