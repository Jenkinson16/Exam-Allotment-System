import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExamDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subjectId?: number;

  @IsOptional()
  @IsDateString()
  examDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsIn(['Morning', 'Afternoon'])
  session?: 'Morning' | 'Afternoon';
}
