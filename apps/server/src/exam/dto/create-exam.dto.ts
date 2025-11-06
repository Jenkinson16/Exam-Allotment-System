import { IsNotEmpty, IsNumber, IsDateString, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateExamDto {
  @IsNotEmpty()
  @IsNumber()
  subjectId: number;

  @IsNotEmpty()
  @IsDateString()
  examDate: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsIn(['Morning', 'Afternoon'])
  session?: 'Morning' | 'Afternoon';
}

