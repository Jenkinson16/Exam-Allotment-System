import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exam } from './exam.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn({ name: 'subject_id' })
  subjectId: number;

  @Column({ name: 'subject_code', unique: true, nullable: false })
  subjectCode: string;

  @Column({ name: 'subject_name', nullable: false })
  subjectName: string;

  @OneToMany(() => Exam, (exam) => exam.subject)
  exams: Exam[];
}

