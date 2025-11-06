import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Subject } from './subject.entity';
import { ExamRegistration } from './exam-registration.entity';
import { Allotment } from './allotment.entity';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn({ name: 'exam_id' })
  examId: number;

  @Column({ name: 'subject_id', nullable: false })
  subjectId: number;

  @Column({ name: 'exam_date', type: 'date', nullable: false })
  examDate: Date;

  @Column({ name: 'start_time', type: 'time', nullable: false })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: false })
  endTime: string;

  @Column({ nullable: true })
  session: 'Morning' | 'Afternoon';

  @ManyToOne(() => Subject, (subject) => subject.exams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToMany(() => ExamRegistration, (registration) => registration.exam)
  examRegistrations: ExamRegistration[];

  @OneToMany(() => Allotment, (allotment) => allotment.exam)
  allotments: Allotment[];
}

