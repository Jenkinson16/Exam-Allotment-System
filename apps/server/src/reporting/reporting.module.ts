import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { Allotment } from '../entities/allotment.entity';
import { RoomInvigilator } from '../entities/room-invigilator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allotment, RoomInvigilator])],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
