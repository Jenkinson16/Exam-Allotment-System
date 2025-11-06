import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RegisterStudentsDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];
}

