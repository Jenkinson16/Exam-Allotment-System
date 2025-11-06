import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  staffName: string;

  @IsNotEmpty()
  @IsNumber()
  departmentId: number;
}

