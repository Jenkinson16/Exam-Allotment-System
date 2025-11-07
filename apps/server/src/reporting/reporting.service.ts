import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allotment } from '../entities/allotment.entity';
import { RoomInvigilator } from '../entities/room-invigilator.entity';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Allotment)
    private allotmentRepository: Repository<Allotment>,
    @InjectRepository(RoomInvigilator)
    private roomInvigilatorRepository: Repository<RoomInvigilator>,
  ) {}

  async generateAllotmentPdf(examId: number): Promise<Buffer> {
    // Fetch allotments with all related data
    const allotments = await this.allotmentRepository.find({
      where: { examId },
      relations: ['student', 'student.department', 'room', 'assignedStaff', 'exam', 'exam.subject'],
      order: {
        roomId: 'ASC',
        seatNumber: 'ASC',
      },
    });

    if (allotments.length === 0) {
      throw new NotFoundException(`No allotments found for exam ID ${examId}`);
    }

    // Group by room
    const groupedByRoom = allotments.reduce((acc, allotment) => {
      const roomId = allotment.roomId;
      if (!acc[roomId]) {
        acc[roomId] = [];
      }
      acc[roomId].push(allotment);
      return acc;
    }, {} as Record<number, Allotment[]>);

    const exam = allotments[0].exam;
    const subject = exam.subject;

    // Build invigilator names per room for this exam
    const invRaw = await this.roomInvigilatorRepository.query(
      'SELECT ri.room_id as "roomId", s.staff_name as name FROM room_invigilators ri JOIN staff s ON s.staff_id = ri.staff_id WHERE ri.exam_id = $1',
      [examId],
    );

    const invigilatorNamesByRoom: Record<number, string> = {};
    invRaw.forEach((r: any) => {
      const id = Number(r.roomId);
      if (!invigilatorNamesByRoom[id]) invigilatorNamesByRoom[id] = '';
      const parts = invigilatorNamesByRoom[id]
        ? invigilatorNamesByRoom[id].split(', ').filter(Boolean)
        : [];
      if (r.name && !parts.includes(r.name)) parts.push(r.name);
      invigilatorNamesByRoom[id] = parts.join(', ');
    });

    // Generate HTML
    const html = this.generateHtmlTemplate(exam, subject, groupedByRoom, invigilatorNamesByRoom);

    // Generate PDF using Puppeteer
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    
    try {
      // Use environment variable if set, otherwise let Puppeteer find Chromium
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        console.log(`Using Puppeteer executable: ${launchOptions.executablePath}`);
      } else {
        // Try to get executable path from Puppeteer
        try {
          const puppeteerCore = require('puppeteer-core');
          // This won't work, but let's try the main export
        } catch (e) {
          // Ignore
        }
        console.log('Using default Puppeteer Chromium');
      }

      console.log('Launching browser with options:', JSON.stringify(launchOptions, null, 2));
      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      await browser.close();

      return Buffer.from(pdf);
    } catch (err) {
      console.error('PDF generation error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : '';
      throw new Error(`Failed to generate PDF: ${errorMessage}. Stack: ${errorStack}`);
    }
  }

  private generateHtmlTemplate(
    exam: any,
    subject: any,
    groupedByRoom: Record<number, Allotment[]>,
    invigilatorNamesByRoom: Record<number, string>,
  ): string {
    const examDate = new Date(exam.examDate).toLocaleDateString();

    let roomsHtml = '';
    for (const [roomId, roomAllots] of Object.entries(groupedByRoom)) {
      // Sort by studentId ascending (to follow CSV import order like RA...0001, 0002, ...)
      const sortedAllots = [...roomAllots].sort((a, b) =>
        a.student.studentId.localeCompare(b.student.studentId, undefined, { numeric: true }),
      );
      const room = sortedAllots[0].room;
      const invNames = invigilatorNamesByRoom[Number(roomId)] || '';

      let tableRows = '';
      sortedAllots.forEach((allot, idx) => {
        tableRows += `
          <tr>
            <td>${idx + 1}</td>
            <td>${allot.student.studentId}</td>
            <td>${allot.student.studentName}</td>
            <td>${allot.student.department.departmentName}</td>
          </tr>
        `;
      });

      roomsHtml += `
        <div class="room-section">
          <h3>Room: ${room.roomNumber}</h3>
          <p><strong>Invigilator(s):</strong> ${invNames || '-'}</p>
          <table>
            <thead>
              <tr>
                <th>Seat No</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="page-break"></div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Exam Allotment Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          .header-info {
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .header-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          .room-section {
            margin-bottom: 30px;
          }
          h3 {
            color: #2c3e50;
            background: #ecf0f1;
            padding: 10px;
            border-left: 4px solid #3498db;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <h1>Examination Seating Allotment</h1>
        <div class="header-info">
          <p><strong>Subject:</strong> ${subject.subjectName} (${subject.subjectCode})</p>
          <p><strong>Exam Date:</strong> ${examDate}</p>
          <p><strong>Time:</strong> ${exam.startTime} - ${exam.endTime}</p>
          <p><strong>Session:</strong> ${exam.session || 'N/A'}</p>
        </div>
        ${roomsHtml}
      </body>
      </html>
    `;
  }
}
