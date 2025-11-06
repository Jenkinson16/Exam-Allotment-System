# Quick Start Guide

This guide will get you up and running with ELMS in under 10 minutes.

## 📋 Prerequisites Check

Make sure you have these installed:
- ✅ Node.js 18+ (`node --version`)
- ✅ PostgreSQL 14+ (`psql --version`)
- ✅ npm (`npm --version`)

## 🚀 Step-by-Step Setup

### Step 1: Database Setup (2 minutes)

```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE elms;

# Exit psql
\q
```

### Step 2: Backend Configuration (1 minute)

Create `apps/server/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=elms
JWT_SECRET=my-super-secret-key-12345
JWT_EXPIRES_IN=1d
REGISTRATION_TOKEN=demo-token-for-testing-12345
PORT=3001
NODE_ENV=development
```

### Step 3: Install Dependencies (3 minutes)

```bash
# Install server dependencies
cd apps/server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 4: Start the Application (1 minute)

```bash
# Terminal 1 - Start Backend
cd apps/server
npm run start:dev

# Terminal 2 - Start Frontend (in new terminal)
cd apps/client
npm run dev
```

### Step 5: Create Demo Users

Once the backend is running, use the seed script (recommended):

```bash
cd apps/server
node seed-demo-users.js
```

The script will automatically read `REGISTRATION_TOKEN` from your `.env` file.

Or create users manually via API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "demo123",
    "role": "Admin",
    "registrationToken": "demo-token-for-testing-12345"
  }'
```

Or create via API tool:
- URL: `POST http://localhost:3001/api/auth/register`
- Body: 
  ```json
  {
    "username": "admin",
    "password": "demo123",
    "role": "Admin",
    "registrationToken": "demo-token-for-testing-12345"
  }
  ```

### Step 6: Access the Application

1. Open browser: `http://localhost:3000`
2. Login with demo credentials:
   - **Admin**: Username: `admin`, Password: `demo123`
   - **Staff**: Username: `staff`, Password: `demo123`

## 📊 Quick Test Flow

### 1. Add Departments

Navigate to **Departments** and add:
- Computer Science
- Electrical Engineering
- Mechanical Engineering

### 2. Import Students

1. Go to **Students** page
2. Click **Import from CSV**
3. Use the sample file at `apps/client/public/sample-students.csv`
4. Review the preview and click **Import**

### 3. Add Rooms

Navigate to **Rooms** and add some rooms:
- Room: C-101, Capacity: 30, Type: Classroom
- Room: C-102, Capacity: 40, Type: Classroom
- Room: LAB-1, Capacity: 25, Type: Lab

### 4. Add Subjects

Navigate to **Subjects** and add:
- Code: CS101, Name: Data Structures
- Code: EE201, Name: Circuit Theory

### 5. Add Staff

Navigate to **Staff** and add some staff members:
- Name: Dr. Smith, Department: Computer Science
- Name: Prof. Johnson, Department: Electrical Engineering

### 6. Create an Exam

Navigate to **Exams** and create an exam:
- Subject: Data Structures
- Date: (Choose a date)
- Start Time: 09:00
- End Time: 12:00
- Session: Morning

### 7. Register Students

After creating the exam:
1. View the exam details
2. Register students (select student IDs)

### 8. Generate Allotment

Navigate to **Allotments**:
1. Select the exam
2. Select rooms
3. Click **Generate Allotment**

### 9. Download PDF Report

After generating allotment:
1. View the allotment details
2. Click **Download PDF Report**

## 🎉 You're All Set!

The system is now fully operational. You can:
- Manage students, departments, rooms, subjects, and staff
- Create and schedule exams
- Generate intelligent seating arrangements
- Track attendance
- Generate PDF reports

## 🔧 Troubleshooting

### Backend won't start

**Error: Connection refused**
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify database credentials in `.env`

**Error: Port 3001 already in use**
- Kill existing process: `lsof -ti:3001 | xargs kill`
- Or change PORT in `.env`

### Frontend won't start

**Error: Port 3000 already in use**
```bash
# Kill existing process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill existing process (Mac/Linux)
lsof -ti:3000 | xargs kill
```

### Database connection errors

1. Verify PostgreSQL is running
2. Check database name is created: `psql -U postgres -l`
3. Test connection: `psql -U postgres -d elms`

### CSV import not working

1. Check CSV format matches: `student_id,student_name,department_name`
2. Ensure departments exist before importing students
3. Check browser console for Web Worker errors

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the API endpoints
- Customize the UI and branding
- Set up production deployment

## 🆘 Need Help?

Check the logs:
- Backend logs: In the terminal running `npm run start:dev`
- Frontend logs: Browser console (F12)
- Database logs: PostgreSQL logs

For common issues, see the main README.md troubleshooting section.

