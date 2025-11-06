import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Department } from './department.entity';
import { ExamRegistration } from './exam-registration.entity';
import { Allotment } from './allotment.entity';

@Entity('students')
export class Student {
  @PrimaryColumn({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'student_name', nullable: false })
  studentName: string;

  @Column({ name: 'department_id', nullable: false })
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.students, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => ExamRegistration, (registration) => registration.student)
  examRegistrations: ExamRegistration[];

  @OneToMany(() => Allotment, (allotment) => allotment.student)
  allotments: Allotment[];
}

