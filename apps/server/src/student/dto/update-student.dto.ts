import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  studentName?: string;

  @IsOptional()
  @IsNumber()
  departmentId?: number;
}


