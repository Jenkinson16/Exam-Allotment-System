import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Allotment } from './allotment.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn({ name: 'attendance_id' })
  attendanceId: number;

  @Column({ name: 'allotment_id', unique: true, nullable: false })
  allotmentId: number;

  @Column({ nullable: false })
  status: 'Present' | 'Absent';

  @Column({ name: 'marked_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  markedAt: Date;

  @OneToOne(() => Allotment, (allotment) => allotment.attendance)
  @JoinColumn({ name: 'allotment_id' })
  allotment: Allotment;
}

