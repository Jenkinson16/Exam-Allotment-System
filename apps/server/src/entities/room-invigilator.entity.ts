import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Exam } from './exam.entity';
import { Room } from './room.entity';
import { Staff } from './staff.entity';

@Entity('room_invigilators')
@Unique(['examId', 'roomId', 'staffId'])
export class RoomInvigilator {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'exam_id', nullable: false })
  examId: number;

  @Column({ name: 'room_id', nullable: false })
  roomId: number;

  @Column({ name: 'staff_id', nullable: false })
  staffId: number;

  @ManyToOne(() => Exam, (exam) => exam.allotments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => Room, (room) => room.allotments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Staff, (staff) => staff.allotments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;
}


