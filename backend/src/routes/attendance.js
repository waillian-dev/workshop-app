import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

function getActiveToken() {
  return db
    .prepare('SELECT * FROM attendance_tokens WHERE active = 1 ORDER BY id DESC LIMIT 1')
    .get();
}

function isTokenValid(tokenRecord) {
  if (!tokenRecord || !tokenRecord.active) return false;
  if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
    return false;
  }
  return true;
}

router.get('/admin/attendance-token', authenticate, requireRole('admin'), (req, res) => {
  const tokenRecord = getActiveToken();
  if (!tokenRecord) {
    return res.status(404).json({ error: 'No active attendance token found.' });
  }

  res.json({
    token: tokenRecord.token,
    checkInUrl: `/attendance/check-in?token=${tokenRecord.token}`,
    active: Boolean(tokenRecord.active),
    expiresAt: tokenRecord.expires_at,
  });
});

router.post('/admin/attendance-token/regenerate', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('UPDATE attendance_tokens SET active = 0 WHERE active = 1').run();
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO attendance_tokens (token, active) VALUES (?, 1)').run(token);

  res.json({
    token,
    checkInUrl: `/attendance/check-in?token=${token}`,
    active: true,
  });
});

router.post('/attendance/check-in', authenticate, requireRole('attendee'), (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Attendance token is required.' });
  }

  const tokenRecord = db
    .prepare('SELECT * FROM attendance_tokens WHERE token = ?')
    .get(token);

  if (!isTokenValid(tokenRecord)) {
    return res.status(400).json({ error: 'Invalid or expired attendance token.' });
  }

  const existing = db
    .prepare('SELECT * FROM attendance WHERE user_id = ?')
    .get(req.user.id);

  if (existing) {
    return res.json({
      status: 'already_checked_in',
      message: 'You have already checked in.',
      checkedInAt: existing.checked_in_at,
    });
  }

  const checkedInAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO attendance (user_id, checked_in_at, method) VALUES (?, ?, 'qr')`
  ).run(req.user.id, checkedInAt);

  res.json({
    status: 'checked_in',
    message: 'Attendance recorded successfully.',
    checkedInAt,
  });
});

router.get('/attendance/me', authenticate, requireRole('attendee'), (req, res) => {
  const record = db
    .prepare('SELECT * FROM attendance WHERE user_id = ?')
    .get(req.user.id);

  res.json({
    checkedIn: Boolean(record),
    checkedInAt: record?.checked_in_at || null,
    method: record?.method || null,
  });
});

router.get('/admin/attendance', authenticate, requireRole('admin'), (req, res) => {
  const records = db.prepare(`
    SELECT a.id, a.checked_in_at, a.method, u.name, u.email
    FROM attendance a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.checked_in_at DESC
  `).all();

  res.json({ records });
});

export default router;
