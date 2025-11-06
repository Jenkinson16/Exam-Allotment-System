import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  staffName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  departmentId?: number;
}

