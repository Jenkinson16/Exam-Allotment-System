import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllotmentController } from './allotment.controller';
import { AllotmentService } from './allotment.service';
import { Allotment } from '../entities/allotment.entity';
import { Exam } from '../entities/exam.entity';
import { Room } from '../entities/room.entity';
import { ExamRegistration } from '../entities/exam-registration.entity';
import { Staff } from '../entities/staff.entity';
import { RoomInvigilator } from '../entities/room-invigilator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Allotment,
      Exam,
      Room,
      ExamRegistration,
      Staff,
      RoomInvigilator,
    ]),
  ],
  controllers: [AllotmentController],
  providers: [AllotmentService],
  exports: [AllotmentService],
})
export class AllotmentModule {}
