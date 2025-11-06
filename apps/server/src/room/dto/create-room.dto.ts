import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsString()
  roomType?: string;
}

