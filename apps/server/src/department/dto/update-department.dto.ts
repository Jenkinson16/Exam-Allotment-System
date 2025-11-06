import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  departmentName?: string;
}

