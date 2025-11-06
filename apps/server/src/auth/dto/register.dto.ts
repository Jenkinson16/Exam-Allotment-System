import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsIn(['Admin', 'Staff'])
  role: 'Admin' | 'Staff';

  @IsNotEmpty()
  @IsString()
  registrationToken: string;
}

