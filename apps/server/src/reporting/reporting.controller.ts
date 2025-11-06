import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportingService } from './reporting.service';

@Controller('api/reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('allotment/:examId')
  async generateAllotmentPdf(
    @Param('examId', ParseIntPipe) examId: number,
    @Res() res: Response,
  ) {
    const pdf = await this.reportingService.generateAllotmentPdf(examId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=exam-${examId}-allotment.pdf`,
      'Content-Length': pdf.length,
    });

    res.send(pdf);
  }
}
