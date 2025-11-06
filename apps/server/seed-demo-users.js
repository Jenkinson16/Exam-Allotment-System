/**
 * Seed script to create demo users
 * Usage: node seed-demo-users.js
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    });
  }
}

loadEnvFile();

const API_URL = process.env.API_URL || 'http://localhost:3001';
const REGISTRATION_TOKEN = process.env.REGISTRATION_TOKEN || 'demo-token-for-testing-12345';

const demoUsers = [
  { username: 'admin', password: 'demo123', role: 'Admin' },
  { username: 'staff', password: 'demo123', role: 'Staff' },
];

async function seedDemoUsers() {
  console.log('Seeding demo users...\n');

  for (const user of demoUsers) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, registrationToken: REGISTRATION_TOKEN }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Created user: ${user.username} (${user.role})`);
      } else if (response.status === 409) {
        console.log(`User ${user.username} already exists`);
      } else {
        console.error(`Failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  console.log('\nDemo users:');
  console.log('  Admin: admin / demo123');
  console.log('  Staff: staff / demo123');
}

seedDemoUsers().catch(console.error);
