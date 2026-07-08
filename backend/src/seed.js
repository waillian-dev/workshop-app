import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from './db.js';

const SEED_SESSIONS = [
  {
    title: 'Opening and Welcome',
    description: 'Welcome remarks and workshop overview.',
    speaker: 'Workshop Admin',
    start_time: '2026-07-08T09:00:00.000Z',
    end_time: '2026-07-08T09:30:00.000Z',
    location: 'Main Hall',
  },
  {
    title: 'Main Workshop Session',
    description: 'Core workshop content and presentations.',
    speaker: 'Guest Speaker',
    start_time: '2026-07-08T09:30:00.000Z',
    end_time: '2026-07-08T11:00:00.000Z',
    location: 'Main Hall',
  },
  {
    title: 'Break',
    description: 'Coffee and networking break.',
    speaker: 'N/A',
    start_time: '2026-07-08T11:00:00.000Z',
    end_time: '2026-07-08T11:30:00.000Z',
    location: 'Lobby',
  },
  {
    title: 'Hands-on Practice',
    description: 'Interactive hands-on exercises.',
    speaker: 'Workshop Facilitator',
    start_time: '2026-07-08T11:30:00.000Z',
    end_time: '2026-07-08T13:00:00.000Z',
    location: 'Lab Room',
  },
  {
    title: 'Q&A and Closing',
    description: 'Open Q&A and closing remarks.',
    speaker: 'Workshop Admin',
    start_time: '2026-07-08T13:00:00.000Z',
    end_time: '2026-07-08T14:00:00.000Z',
    location: 'Main Hall',
  },
];

export async function seedDatabase() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminExists = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(adminEmail);

  if (!adminExists) {
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10
    );
    db.prepare(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')`
    ).run(
      process.env.ADMIN_NAME || 'Workshop Admin',
      adminEmail,
      passwordHash
    );
    console.log('Seeded admin user:', adminEmail);
  }

  const sessionCount = db
    .prepare('SELECT COUNT(*) as count FROM sessions')
    .get().count;

  if (sessionCount === 0) {
    const insertSession = db.prepare(
      `INSERT INTO sessions (title, description, speaker, start_time, end_time, location)
       VALUES (@title, @description, @speaker, @start_time, @end_time, @location)`
    );
    for (const session of SEED_SESSIONS) {
      insertSession.run(session);
    }
    console.log('Seeded sessions:', SEED_SESSIONS.length);
  }

  const activeToken = db
    .prepare('SELECT id FROM attendance_tokens WHERE active = 1 LIMIT 1')
    .get();

  if (!activeToken) {
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare(
      `INSERT INTO attendance_tokens (token, active) VALUES (?, 1)`
    ).run(token);
    console.log('Seeded attendance token');
  }
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}
