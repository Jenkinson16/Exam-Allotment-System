import { IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateAllotmentDto {
  @IsNotEmpty()
  @IsNumber()
  examId: number;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  roomIds: number[];

  // Optional mapping: roomId -> [staffId, ...]
  @IsOptional()
  staffAssignments?: Record<number, number[]>;
}

