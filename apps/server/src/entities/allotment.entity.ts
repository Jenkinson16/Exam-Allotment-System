import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, Unique } from 'typeorm';
import { Exam } from './exam.entity';
import { Student } from './student.entity';
import { Room } from './room.entity';
import { Staff } from './staff.entity';
import { Attendance } from './attendance.entity';

@Entity('allotments')
@Unique(['examId', 'studentId'])
export class Allotment {
  @PrimaryGeneratedColumn({ name: 'allotment_id' })
  allotmentId: number;

  @Column({ name: 'exam_id', nullable: false })
  examId: number;

  @Column({ name: 'student_id', nullable: false })
  studentId: string;

  @Column({ name: 'room_id', nullable: false })
  roomId: number;

  @Column({ name: 'seat_number', nullable: false })
  seatNumber: string;

  @Column({ name: 'assigned_staff_id', nullable: false })
  assignedStaffId: number;

  @ManyToOne(() => Exam, (exam) => exam.allotments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => Student, (student) => student.allotments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Room, (room) => room.allotments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Staff, (staff) => staff.allotments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff: Staff;

  @OneToOne(() => Attendance, (attendance) => attendance.allotment)
  attendance: Attendance;
}

