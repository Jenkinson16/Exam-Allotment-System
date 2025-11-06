import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allotment } from '../entities/allotment.entity';
import { Exam } from '../entities/exam.entity';
import { Room } from '../entities/room.entity';
import { ExamRegistration } from '../entities/exam-registration.entity';
import { Staff } from '../entities/staff.entity';
import { CreateAllotmentDto } from './dto/create-allotment.dto';
import { RoomInvigilator } from '../entities/room-invigilator.entity';

@Injectable()
export class AllotmentService {
  constructor(
    @InjectRepository(Allotment)
    private allotmentRepository: Repository<Allotment>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(ExamRegistration)
    private examRegistrationRepository: Repository<ExamRegistration>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(RoomInvigilator)
    private roomInvigilatorRepository: Repository<RoomInvigilator>,
  ) {}

  async generate(createAllotmentDto: CreateAllotmentDto): Promise<{ message: string; allotments: number }> {
    const { examId, roomIds } = createAllotmentDto;

    // Fetch exam
    const exam = await this.examRepository.findOne({
      where: { examId },
    });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    // Fetch rooms
    const rooms = await this.roomRepository.find({
      where: roomIds.map((id) => ({ roomId: id })),
    });
    if (rooms.length === 0) {
      throw new BadRequestException('No valid rooms found');
    }

    // Calculate total capacity
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);

    // Fetch registered students with department info
    const registrations = await this.examRegistrationRepository.find({
      where: { examId },
      relations: ['student', 'student.department'],
    });

    if (registrations.length === 0) {
      throw new BadRequestException('No students registered for this exam');
    }

    if (registrations.length > totalCapacity) {
      throw new BadRequestException('Insufficient room capacity for all students');
    }

    // Shuffle students randomly
    const shuffledStudents = this.shuffleArray([...registrations]);

    // Fetch all staff for random assignment
    const allStaff = await this.staffRepository.find();
    if (allStaff.length === 0) {
      throw new BadRequestException('No staff available for invigilation');
    }

    // Clear existing allotments for this exam
    await this.allotmentRepository.delete({ examId });
    // Clear any previous invigilator assignments for this exam
    await this.roomInvigilatorRepository.delete({ examId });

    // Assign students to seats
    let studentIndex = 0;
    const allotments: Allotment[] = [];

    // Helper map for quick id->staff
    const staffById = new Map(allStaff.map((s) => [s.staffId, s] as const));

    for (const room of rooms) {
      // Use user-provided staff assignments if provided; else pick two random
      let invigilators: Staff[] = [];
      const provided = createAllotmentDto.staffAssignments?.[room.roomId];
      if (provided && provided.length) {
        const uniqueIds = Array.from(new Set(provided));
        invigilators = uniqueIds.map((id) => staffById.get(id)).filter(Boolean) as Staff[];
      } else {
        // No explicit staff assignment requested; do not assign randomly
        invigilators = [];
      }

      for (let seatNum = 1; seatNum <= room.capacity && studentIndex < shuffledStudents.length; seatNum++) {
        const registration = shuffledStudents[studentIndex];
        
        // Check if adjacent seat has student from same department (simple constraint)
        let canAssign = true;
        if (seatNum > 1 && allotments.length > 0) {
          const prevAllotment = allotments[allotments.length - 1];
          if (
            prevAllotment.roomId === room.roomId &&
            prevAllotment.student &&
            prevAllotment.student.departmentId === registration.student.departmentId
          ) {
            // Try to find another student from a different department
            let swapIndex = studentIndex + 1;
            while (swapIndex < shuffledStudents.length && swapIndex < studentIndex + 10) {
              if (shuffledStudents[swapIndex].student.departmentId !== registration.student.departmentId) {
                // Swap
                [shuffledStudents[studentIndex], shuffledStudents[swapIndex]] = [shuffledStudents[swapIndex], shuffledStudents[studentIndex]];
                break;
              }
              swapIndex++;
            }
          }
        }

        const allotment = this.allotmentRepository.create({
          examId,
          studentId: shuffledStudents[studentIndex].studentId,
          roomId: room.roomId,
          seatNumber: `${seatNum}`,
          assignedStaffId: invigilators[0]?.staffId,
        });

        allotments.push(allotment);
        studentIndex++;
      }

      // Save invigilator mapping for this room
      for (const inv of invigilators) {
        if (!inv) continue;
        await this.roomInvigilatorRepository.save(
          this.roomInvigilatorRepository.create({ examId, roomId: room.roomId, staffId: inv.staffId }),
        );
      }
    }

    // Save all allotments
    await this.allotmentRepository.save(allotments);

    return {
      message: 'Allotment generated successfully',
      allotments: allotments.length,
    };
  }

  async findByExam(examId: number) {
    const allotments = await this.allotmentRepository.find({
      where: { examId },
      relations: ['student', 'student.department', 'room', 'assignedStaff', 'exam', 'exam.subject'],
      order: {
        roomId: 'ASC',
        seatNumber: 'ASC',
      },
    });

    if (allotments.length === 0) {
      throw new NotFoundException(`No allotments found for exam ID ${examId}`);
    }

    // Group by room
    const groupedByRoom = allotments.reduce((acc, allotment) => {
      const roomId = allotment.roomId;
      if (!acc[roomId]) {
        acc[roomId] = [];
      }
      acc[roomId].push(allotment);
      return acc;
    }, {} as Record<number, Allotment[]>);

    return {
      exam: allotments[0].exam,
      rooms: Object.entries(groupedByRoom).map(([roomId, allots]) => ({
        room: allots[0].room,
        assignedStaff: allots[0].assignedStaff,
        allotments: allots,
      })),
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
