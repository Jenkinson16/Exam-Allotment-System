import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Department } from '../entities/department.entity';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { CreateStudentDto } from './dto/create-student.dto';
import { ImportStudentsDto } from './dto/import-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Student[]; total: number }> {
    const [data, total] = await this.studentRepository.findAndCount({
      relations: ['department'],
      order: { studentId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { studentId: id },
      relations: ['department'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async importStudents(
    importStudentsDto: ImportStudentsDto | any,
  ): Promise<{ message: string; imported: number; failed: number }> {
    const students: any[] = Array.isArray(importStudentsDto)
      ? importStudentsDto
      : Array.isArray(importStudentsDto?.students)
      ? importStudentsDto.students
      : [];
    let imported = 0;
    let failed = 0;

    for (const studentDto of students) {
      try {
        // Normalize incoming payload keys defensively
        const raw: any = studentDto as any;
        const normalizedStudentId: string =
          raw.studentId ?? raw.student_id ?? raw['Student ID'] ?? raw['STUDENT_ID'];
        const normalizedStudentName: string =
          raw.studentName ?? raw.student_name ?? raw['Student Name'] ?? raw['STUDENT_NAME'];
        // Accept department name too, mapping to an id if present on payload
        let normalizedDepartmentId: number = Number(
          raw.departmentId ?? raw.department_id ?? raw['Department Id'] ?? raw['DEPARTMENT_ID'],
        );
        if (!normalizedDepartmentId) {
          const deptNameCandidate: string | undefined =
            raw.departmentName || raw.department_name || raw['Department'] || raw['DEPARTMENT_NAME'];
          if (deptNameCandidate) {
            const deptName = String(deptNameCandidate).trim();
            const found = await this.departmentRepository
              .createQueryBuilder('d')
              .where('LOWER(d.departmentName) = LOWER(:name)', { name: deptName })
              .getOne();
            if (found) normalizedDepartmentId = found.departmentId;
          }
        }

        if (!normalizedStudentId || !normalizedStudentName || !normalizedDepartmentId) {
          throw new Error('Missing studentId/studentName/departmentId');
        }

        // Check if student already exists
        const existingStudent = await this.studentRepository.findOne({
          where: { studentId: normalizedStudentId },
        });

        if (existingStudent) {
          // Update existing student
          existingStudent.studentName = normalizedStudentName;
          existingStudent.departmentId = normalizedDepartmentId;
          await this.studentRepository.save(existingStudent);
        } else {
          // Create new student
          const newStudent = this.studentRepository.create({
            studentId: normalizedStudentId,
            studentName: normalizedStudentName,
            departmentId: normalizedDepartmentId,
          });
          await this.studentRepository.save(newStudent);
        }
        imported++;
      } catch (error) {
        failed++;
        console.error(`Failed to import student ${(studentDto as any)?.studentId ?? (studentDto as any)?.student_id}:`, error);
      }
    }

    return {
      message: 'Import completed',
      imported,
      failed,
    };
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  async parseCsvStream(file?: any): Promise<{
    previewRows: Array<{ studentId: string; studentName: string; departmentName: string }>;
    unmatchedDepartments: string[];
    totalRows: number;
  }> {
    if (!file || !file.buffer) {
      throw new Error('CSV file is required');
    }

    const rows: Array<{ studentId: string; studentName: string; departmentName: string }> = [];
    const unmatchedSet = new Set<string>();
    const deptNameToId: Record<string, number> = {};
    (await this.departmentRepository.find()).forEach((d) => {
      deptNameToId[d.departmentName.toLowerCase().trim()] = d.departmentId;
    });

    const stream = csv.parse({ headers: true, ignoreEmpty: true, trim: true });
    const bufferStream = new (require('stream').Readable)();
    bufferStream._read = () => {};
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    await new Promise<void>((resolve, reject) => {
      bufferStream
        .pipe(stream)
        .on('error', reject)
        .on('data', (row: any) => {
          const id = (row.student_id || row.studentId || row['Student ID'] || '').toString().trim();
          const name = (row.student_name || row.studentName || row['Student Name'] || '').toString().trim();
          const deptName = (row.department_name || row.departmentName || row['Department'] || '').toString().trim();
          if (!id || !name || !deptName) return;
          if (!deptNameToId[deptName.toLowerCase()]) unmatchedSet.add(deptName);
          rows.push({ studentId: id, studentName: name, departmentName: deptName });
        })
        .on('end', () => resolve());
    });

    return {
      previewRows: rows.slice(0, 100),
      unmatchedDepartments: Array.from(unmatchedSet),
      totalRows: rows.length,
    };
  }

  async finalizeImport(
    rows: Array<{ studentId: string; studentName: string; departmentId: number }>,
    upsert = true,
  ): Promise<{ imported: number; updated: number; failed: number }> {
    let imported = 0;
    let updated = 0;
    let failed = 0;

    if (!rows.length) return { imported, updated, failed };

    // Determine which rows exist already
    const ids = rows.map((r) => r.studentId);
    const existing = await this.studentRepository
      .createQueryBuilder('s')
      .select(['s.studentId'])
      .where('s.studentId IN (:...ids)', { ids })
      .getMany();
    const existingSet = new Set(existing.map((e) => e.studentId));

    const newRows = rows.filter((r) => r.studentId && r.studentName && r.departmentId && !existingSet.has(r.studentId));
    const updateRows = rows.filter((r) => r.studentId && r.studentName && r.departmentId && existingSet.has(r.studentId));

    // Bulk insert new rows in chunks
    const chunkSize = 500;
    for (let i = 0; i < newRows.length; i += chunkSize) {
      const chunk = newRows.slice(i, i + chunkSize);
      if (!chunk.length) continue;
      try {
        await this.studentRepository
          .createQueryBuilder()
          .insert()
          .into(Student)
          .values(chunk)
          .execute();
        imported += chunk.length;
      } catch {
        failed += chunk.length;
      }
    }

    if (upsert && updateRows.length) {
      // Simple per-row update (reliable across TypeORM versions)
      for (const r of updateRows) {
        try {
          await this.studentRepository
            .createQueryBuilder()
            .update(Student)
            .set({ studentName: r.studentName, departmentId: r.departmentId })
            .where('student_id = :id', { id: r.studentId })
            .execute();
          updated++;
        } catch {
          failed++;
        }
      }
    }

    return { imported, updated, failed };
  }
}
