export interface User {
  userId: number;
  username: string;
  role: 'Admin' | 'Staff';
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface Subject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
}

export interface Room {
  roomId: number;
  roomNumber: string;
  capacity: number;
  roomType: string;
}

export interface Staff {
  staffId: number;
  staffName: string;
  departmentId: number;
  department?: Department;
}

export interface Student {
  studentId: string;
  studentName: string;
  departmentId: number;
  department?: Department;
}

export interface Exam {
  examId: number;
  subjectId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  session?: 'Morning' | 'Afternoon';
  subject?: Subject;
}

export interface Allotment {
  allotmentId: number;
  examId: number;
  studentId: string;
  roomId: number;
  seatNumber: string;
  assignedStaffId: number;
  student?: Student;
  room?: Room;
  assignedStaff?: Staff;
  exam?: Exam;
}

export interface Attendance {
  attendanceId: number;
  allotmentId: number;
  status: 'Present' | 'Absent';
  markedAt: Date;
}

