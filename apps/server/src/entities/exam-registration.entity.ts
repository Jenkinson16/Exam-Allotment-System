import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Student } from './student.entity';
import { Exam } from './exam.entity';

@Entity('exam_registrations')
@Unique(['studentId', 'examId'])
export class ExamRegistration {
  @PrimaryGeneratedColumn({ name: 'registration_id' })
  registrationId: number;

  @Column({ name: 'student_id', nullable: false })
  studentId: string;

  @Column({ name: 'exam_id', nullable: false })
  examId: number;

  @ManyToOne(() => Student, (student) => student.examRegistrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Exam, (exam) => exam.examRegistrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;
}

