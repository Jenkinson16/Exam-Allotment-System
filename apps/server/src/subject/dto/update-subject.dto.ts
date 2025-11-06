import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  subjectCode?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  subjectName?: string;
}

