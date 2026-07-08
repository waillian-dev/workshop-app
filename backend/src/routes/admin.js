import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/attendees', authenticate, requireRole('admin'), (req, res) => {
  const { search, attendance, certificate } = req.query;

  let query = `
    SELECT u.id, u.name, u.email, u.organization, u.phone, u.created_at,
           CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as checked_in,
           a.checked_in_at,
           c.certificate_code, c.issued_at
    FROM users u
    LEFT JOIN attendance a ON a.user_id = u.id
    LEFT JOIN certificates c ON c.user_id = u.id
    WHERE u.role = 'attendee'
  `;
  const params = [];

  if (search?.trim()) {
    query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  if (attendance === 'checked_in') {
    query += ` AND a.id IS NOT NULL`;
  } else if (attendance === 'not_checked_in') {
    query += ` AND a.id IS NULL`;
  }

  if (certificate === 'eligible') {
    query += ` AND a.id IS NOT NULL`;
  } else if (certificate === 'not_eligible') {
    query += ` AND a.id IS NULL`;
  }

  query += ` ORDER BY u.created_at DESC`;

  const attendees = db.prepare(query).all(...params).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    organization: row.organization,
    phone: row.phone,
    registeredAt: row.created_at,
    checkedIn: Boolean(row.checked_in),
    checkedInAt: row.checked_in_at,
    certificateEligible: Boolean(row.checked_in),
    certificateCode: row.certificate_code,
    certificateIssuedAt: row.issued_at,
  }));

  res.json({ attendees });
});

router.get('/dashboard', authenticate, requireRole('admin'), (req, res) => {
  const totalAttendees = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'attendee'")
    .get().count;
  const totalCheckedIn = db
    .prepare('SELECT COUNT(*) as count FROM attendance')
    .get().count;
  const totalCertificates = db
    .prepare('SELECT COUNT(*) as count FROM certificates')
    .get().count;
  const totalSessions = db
    .prepare('SELECT COUNT(*) as count FROM sessions')
    .get().count;

  res.json({
    totalAttendees,
    totalCheckedIn,
    totalCertificates,
    totalSessions,
  });
});

export default router;
