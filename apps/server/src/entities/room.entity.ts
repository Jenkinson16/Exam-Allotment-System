import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Allotment } from './allotment.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'room_number', unique: true, nullable: false })
  roomNumber: string;

  @Column({ nullable: false })
  capacity: number;

  @Column({ name: 'room_type', nullable: false, default: 'Classroom' })
  roomType: string;

  @OneToMany(() => Allotment, (allotment) => allotment.room)
  allotments: Allotment[];
}

