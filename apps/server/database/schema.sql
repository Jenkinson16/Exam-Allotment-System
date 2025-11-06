-- ELMS Database Schema
-- This file documents the complete database schema for the Examination Logistics Management System
-- TypeORM will auto-generate these tables, but this serves as documentation

-- Users table for authentication
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Staff'))
);

-- Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) UNIQUE NOT NULL
);

-- Students table
CREATE TABLE students (
    student_id VARCHAR(50) PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL
);

-- Rooms table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    room_type VARCHAR(50) NOT NULL DEFAULT 'Classroom'
);

-- Staff table
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    staff_name VARCHAR(255) NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- Exams table
CREATE TABLE exams (
    exam_id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session VARCHAR(50) CHECK (session IN ('Morning', 'Afternoon')),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- Exam Registrations junction table
CREATE TABLE exam_registrations (
    registration_id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    exam_id INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    UNIQUE (student_id, exam_id)
);

-- Allotments table (core seating assignment)
CREATE TABLE allotments (
    allotment_id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    room_id INTEGER NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    assigned_staff_id INTEGER NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    UNIQUE (exam_id, student_id)
);

-- Attendance table
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    allotment_id INTEGER UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Absent')),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allotment_id) REFERENCES allotments(allotment_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exam_registrations_exam ON exam_registrations(exam_id);
CREATE INDEX idx_exam_registrations_student ON exam_registrations(student_id);
CREATE INDEX idx_allotments_exam ON allotments(exam_id);
CREATE INDEX idx_allotments_room ON allotments(room_id);
CREATE INDEX idx_attendance_allotment ON attendance(allotment_id);

-- Sample seed data (optional)
-- Insert a default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'Admin');

-- Insert sample departments
INSERT INTO departments (department_name) VALUES
('Computer Science'),
('Electrical Engineering'),
('Mechanical Engineering'),
('Civil Engineering'),
('Information Technology');

