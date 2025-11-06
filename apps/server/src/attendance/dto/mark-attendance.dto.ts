import { IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class MarkAttendanceDto {
  @IsNotEmpty()
  @IsNumber()
  allotmentId: number;

  @IsNotEmpty()
  @IsIn(['Present', 'Absent'])
  status: 'Present' | 'Absent';
}

