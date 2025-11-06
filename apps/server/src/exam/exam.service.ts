import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../entities/exam.entity';
import { ExamRegistration } from '../entities/exam-registration.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { RegisterStudentsDto } from './dto/register-students.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(ExamRegistration)
    private examRegistrationRepository: Repository<ExamRegistration>,
  ) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const exam = this.examRepository.create(createExamDto);
    return await this.examRepository.save(exam);
  }

  async findAll(): Promise<Exam[]> {
    return await this.examRepository.find({ relations: ['subject'] });
  }

  async findOne(id: number): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { examId: id },
      relations: ['subject', 'examRegistrations'],
    });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  async registerStudents(
    examId: number,
    registerStudentsDto: RegisterStudentsDto,
  ): Promise<{ message: string; registered: number }> {
    const exam = await this.findOne(examId);
    let registered = 0;

    for (const studentId of registerStudentsDto.studentIds) {
      try {
        // Check if already registered
        const existing = await this.examRegistrationRepository.findOne({
          where: { examId, studentId },
        });

        if (!existing) {
          const registration = this.examRegistrationRepository.create({
            examId,
            studentId,
          });
          await this.examRegistrationRepository.save(registration);
          registered++;
        }
      } catch (error) {
        console.error(`Failed to register student ${studentId}:`, error);
      }
    }

    return {
      message: 'Students registered successfully',
      registered,
    };
  }

  async getRegisteredStudents(examId: number): Promise<ExamRegistration[]> {
    return await this.examRegistrationRepository.find({
      where: { examId },
      relations: ['student', 'student.department'],
    });
  }

  async remove(id: number): Promise<void> {
    const exam = await this.findOne(id);
    await this.examRepository.remove(exam);
  }

  async update(id: number, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.findOne(id);
    Object.assign(exam, dto);
    return await this.examRepository.save(exam);
  }
}
