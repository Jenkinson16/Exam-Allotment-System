import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  roomType?: string;
}

