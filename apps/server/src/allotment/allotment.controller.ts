import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AllotmentService } from './allotment.service';
import { CreateAllotmentDto } from './dto/create-allotment.dto';

@Controller('api/allotments')
export class AllotmentController {
  constructor(private readonly allotmentService: AllotmentService) {}

  @Post()
  generate(@Body(ValidationPipe) createAllotmentDto: CreateAllotmentDto) {
    return this.allotmentService.generate(createAllotmentDto);
  }

  @Get(':examId')
  findByExam(@Param('examId', ParseIntPipe) examId: number) {
    return this.allotmentService.findByExam(examId);
  }
}
