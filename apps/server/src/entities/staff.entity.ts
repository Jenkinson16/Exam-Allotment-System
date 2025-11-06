import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Department } from './department.entity';
import { Allotment } from './allotment.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn({ name: 'staff_id' })
  staffId: number;

  @Column({ name: 'staff_name', nullable: false })
  staffName: string;

  @Column({ name: 'department_id', nullable: false })
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.staff, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Allotment, (allotment) => allotment.assignedStaff)
  allotments: Allotment[];
}

