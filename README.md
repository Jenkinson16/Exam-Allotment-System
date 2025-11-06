# Examination Logistics Management System (ELMS)

A full-stack TypeScript system for managing exam logistics: master data (departments, rooms, staff, subjects, students), exam scheduling and registration, seating allotment under constraints, downloadable PDF reports, and attendance tracking.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (TypeScript, Tailwind CSS, React Query, Zustand)
- **Backend**: NestJS (TypeScript, TypeORM, PostgreSQL)
- **Authentication**: JWT with Passport (bcrypt password hashing)
- **CSV Import (Server-side)**: fast-csv streaming parser with preview/finalize flow
- **PDF Reporting**: Puppeteer to render HTML templates to A4 PDFs

## 📁 Project Structure

```
Exam Allocation System/
├── apps/
│   ├── client/          # Next.js frontend application
│   │   ├── app/         # Next.js 14 app directory
│   │   ├── components/  # React components
│   │   └── lib/         # API clients, stores, types
│   └── server/          # NestJS backend application
│       ├── src/
│       │   ├── entities/    # TypeORM entities
│       │   ├── auth/        # Authentication module
│       │   ├── student/     # Student management
│       │   ├── exam/        # Exam management
│       │   ├── allotment/   # Seating allotment logic
│       │   ├── reporting/   # PDF report generation
│       │   ├── attendance/  # Attendance marking and queries
│       │   └── ...
│       └── test/
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Database Setup

1. Install PostgreSQL and create a new database:

```sql
CREATE DATABASE elms;
```

2. Create a `.env` file in `apps/server/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=elms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d

# Registration Token (required for user registration)
# Generate a secure token: openssl rand -hex 32
# For demo/showcase: demo-token-for-testing-12345
REGISTRATION_TOKEN=demo-token-for-testing-12345

# Application
PORT=3001
NODE_ENV=development
```

### Installation

1) Install dependencies for both client and server:

```bash
cd apps/server && npm install
cd ../client && npm install
```

### Running the Application

#### Option 1: Run both client and server (from root directory)

```bash
# Terminal 1 - Server
cd apps/server
npm run start:dev

# Terminal 2 - Client
cd apps/client
npm run dev
```

#### Option 2: Using the root scripts (from project root)

```bash
npm run dev:server   # starts backend on http://localhost:3001
npm run dev:client   # starts frontend on http://localhost:3000
```

### First-Time Setup

1. **Start the backend** - It will automatically create database tables using TypeORM synchronization

2. **Create demo users** - Use the seed script (recommended):

```bash
cd apps/server
node seed-demo-users.js
```

The script will automatically read `REGISTRATION_TOKEN` from your `.env` file.

Or create users manually via API:

```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "demo123",
  "role": "Admin",
  "registrationToken": "demo-token-for-testing-12345"
}
```

3. **Access the application** at `http://localhost:3000`

4. **Login** with demo credentials (see below)

## 🔐 Demo Credentials

For showcase/testing purposes, use these pre-created accounts:

- **Admin Account:**
  - Username: `admin`
  - Password: `demo123`

- **Staff Account:**
  - Username: `staff`
  - Password: `demo123`

### Creating Additional Users

To create additional users, you need a valid registration token. Use the demo token for testing:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "yourusername",
    "password": "yourpassword",
    "role": "Staff",
    "registrationToken": "demo-token-for-testing-12345"
  }'
```

**Note**: In production, use a secure registration token and never commit it to version control.

## 📊 Database Schema (Core Entities)

The system uses the following entities and relationships:

- **Users**: Admin and Staff users with JWT authentication
- **Departments**: Academic departments
- **Students**: Student records with department associations
- **Subjects**: Course/subject information
- **Rooms**: Examination rooms with capacity
- **Staff**: Staff members for invigilation
- **Exams**: Scheduled examinations
- **Exam_Registrations**: Student registrations for exams
- **Allotments**: Seating assignments (student + exam + room + seat)
- **Attendance**: Attendance tracking for each allotment

## 🎯 Implemented Features

- **Authentication**: Register, login, profile; JWT guard on protected endpoints.
- **Master Data**: CRUD for Departments, Subjects, Rooms, Staff.
- **Students**:
  - CSV import v2: upload → preview → map unmatched departments → finalize (server-side streaming).
  - CRUD and paginated listing.
- **Exams**: Create/update/delete; list; register students to exams.
- **Seating Allotment**:
  - Generate per exam across selected rooms.
  - Heuristic to avoid adjacent same-department seating with bounded swaps.
  - Optional per-room invigilator assignment.
- **Reporting**: Download A4 PDF seating reports grouped by room with invigilators.
- **Attendance**: Mark Present/Absent by allotment; query by exam.

## 📡 API Endpoints (selected)

### Authentication
- `POST /api/auth/register` - Register new user (requires `registrationToken`)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)

### Students
- `GET /api/students?page&limit` - List students (paginated)
- `POST /api/students` - Create student
- `POST /api/students/import` - Bulk import (JSON array or `{ students: [...] }`)
- `POST /api/students/import-csv` - Upload CSV, returns preview + unmatched departments
- `POST /api/students/import-finalize` - Finalize import with mapped departmentIds
- `GET /api/students/template` - Download minimal CSV template
- `PUT /api/students/:id` - Update
- `DELETE /api/students/:id` - Delete

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Subjects, Rooms, Staff
- Similar CRUD endpoints for each entity

### Exams
- `POST /api/exams` - Create exam
- `GET /api/exams` - List exams
- `PUT /api/exams/:id` - Update exam timing/session
- `DELETE /api/exams/:id` - Delete exam
- `POST /api/exams/:id/register` - Register students
- `GET /api/exams/:id/students` - Get registered students

### Allotments
- `POST /api/allotments` - Generate seating allotment
- `GET /api/allotments/:examId` - View allotment details (grouped by room)

### Reporting
- `GET /api/reports/allotment/:examId` - Download PDF report

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/exam/:examId` - View attendance

## 🔒 Authentication

The system uses JWT-based authentication with registration token protection:

### Registration Token System

User registration requires a valid `registrationToken` to prevent unauthorized account creation:

- Set `REGISTRATION_TOKEN` in your `.env` file
- Include the token when registering new users
- For demo/showcase: Use `demo-token-for-testing-12345`
- For production: Generate a secure token using `openssl rand -hex 32`

### Login Flow

1. Login via `/api/auth/login` with username and password
2. Receive an `accessToken` in the response
3. Include the token in subsequent requests:
   ```
   Authorization: Bearer <accessToken>
   ```
4. The frontend automatically stores the token and includes it on requests.

## 📝 CSV Import (V2) Flow

1) Upload CSV via UI → backend parses stream and returns:
   - `previewRows` (first 100), `unmatchedDepartments`, `totalRows`.
2) Map any unmatched department names to existing department IDs.
3) Finalize import with `{ rows, upsert: true }` (bulk insert + per-row upsert of existing).

## 🎨 Frontend Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time State**: React Query for server state management
- **Client State**: Zustand for authentication and UI state
- **Protected Routes**: Automatic redirect to login if not authenticated
- **Loading States**: Proper loading and error handling throughout
- **Dashboard Layout**: Sidebar navigation with user info

## 🛠️ Development

### Backend Development

```bash
cd apps/server
npm run start:dev      # Development mode with hot reload
npm run build          # Production build
npm run start:prod     # Production mode
```

### Frontend Development

```bash
cd apps/client
npm run dev            # Development mode
npm run build          # Production build
npm run start          # Production mode
```

## 🔧 Technology Decisions

### Why TypeScript?
- End-to-end type safety
- Reduced runtime errors
- Better IDE support and developer experience

### Why NestJS?
- Highly structured and opinionated
- Excellent for AI-assisted development
- Built-in support for TypeORM, JWT, and validation

### Why Next.js?
- Modern React framework with great DX
- Built-in routing and optimization
- Server-side rendering capabilities

### Why React Query?
- Declarative data fetching
- Automatic caching and background updates
- Excellent developer experience

### Why server-side CSV parsing?
- Robust parsing with streaming and validated finalize step.
- Allows department mapping before writes.
- Handles large files without blocking the browser.

### Why Puppeteer for PDF?
- Can render complex HTML/CSS layouts
- Better than programmatic PDF libraries for templated reports
- Pixel-perfect output

## 📦 Production Deployment

### Environment Variables

Ensure all required environment variables are set for production:

**Backend:**
- Set strong `JWT_SECRET`
- Set secure `REGISTRATION_TOKEN` (generate with `openssl rand -hex 32`)
- Configure production database credentials
- Set `NODE_ENV=production`
- Set `CORS_ORIGIN` to your frontend URL
- Disable TypeORM `synchronize` in production (use migrations)

**Frontend:**
- Set `NEXT_PUBLIC_API_URL` to production backend URL

### Database Migrations

For production, use TypeORM migrations instead of `synchronize`:

```bash
cd apps/server
npm run migration:generate -- -n InitialSchema
npm run migration:run
```

## 📚 Research-Ready Notes

- Allotment algorithm: O(N) average with bounded local swaps to minimize adjacent same-department seating; capacity and registration validations included.
- Reporting uses HTML templates rendered by Puppeteer to ensure consistent, printable outputs.
- Attendance is idempotent at the allotment level and timestamped.
- Indexes on foreign keys and hot columns included in schema for performance.

## 📄 License

Educational use.

