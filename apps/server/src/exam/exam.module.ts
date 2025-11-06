import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Exam } from '../entities/exam.entity';
import { ExamRegistration } from '../entities/exam-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamRegistration])],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
