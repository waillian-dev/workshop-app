import { Router } from 'express';
import PDFDocument from 'pdfkit';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const EVENT_TITLE = process.env.EVENT_TITLE || 'Workshop Event';
const EVENT_DATE = process.env.EVENT_DATE || '2026-07-08';
const ORGANIZER_NAME = process.env.ADMIN_NAME || 'Workshop Admin';

function hasAttendance(userId) {
  return Boolean(
    db.prepare('SELECT id FROM attendance WHERE user_id = ?').get(userId)
  );
}

function getOrCreateCertificate(userId) {
  let cert = db
    .prepare('SELECT * FROM certificates WHERE user_id = ?')
    .get(userId);

  if (cert) return cert;

  const count = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count;
  const certificateCode = `CERT-2026-${String(count + 1).padStart(4, '0')}`;
  const issuedAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO certificates (user_id, certificate_code, issued_at) VALUES (?, ?, ?)`
  ).run(userId, certificateCode, issuedAt);

  return db
    .prepare('SELECT * FROM certificates WHERE user_id = ?')
    .get(userId);
}

function generateCertificatePdf(user, certificate) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(28).text(EVENT_TITLE, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Certificate of Attendance', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).text(
      `This certifies that ${user.name} has successfully attended the workshop.`,
      { align: 'center' }
    );
    doc.moveDown(2);
    doc.fontSize(12).text(`Event Date: ${EVENT_DATE}`, { align: 'center' });
    doc.text(`Issue Date: ${new Date(certificate.issued_at).toLocaleDateString()}`, { align: 'center' });
    doc.text(`Certificate Code: ${certificate.certificate_code}`, { align: 'center' });
    doc.moveDown(3);
    doc.text(ORGANIZER_NAME, { align: 'center' });

    doc.end();
  });
}

router.get('/certificates/me', authenticate, requireRole('attendee'), (req, res) => {
  const eligible = hasAttendance(req.user.id);
  if (!eligible) {
    return res.json({
      eligible: false,
      message: 'Attendance is required before a certificate can be issued.',
    });
  }

  const cert = getOrCreateCertificate(req.user.id);
  res.json({
    eligible: true,
    certificateCode: cert.certificate_code,
    issuedAt: cert.issued_at,
  });
});

router.get('/certificates/me/download', authenticate, requireRole('attendee'), async (req, res) => {
  if (!hasAttendance(req.user.id)) {
    return res.status(403).json({
      error: 'Certificate not available. Attendance is required.',
    });
  }

  try {
    const cert = getOrCreateCertificate(req.user.id);
    const pdf = await generateCertificatePdf(req.user, cert);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${cert.certificate_code}.pdf"`
    );
    res.send(pdf);
  } catch {
    res.status(500).json({ error: 'Failed to generate certificate PDF.' });
  }
});

router.get('/admin/certificates', authenticate, requireRole('admin'), (req, res) => {
  const attendees = db.prepare(`
    SELECT u.id, u.name, u.email,
           CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as checked_in,
           c.certificate_code, c.issued_at
    FROM users u
    LEFT JOIN attendance a ON a.user_id = u.id
    LEFT JOIN certificates c ON c.user_id = u.id
    WHERE u.role = 'attendee'
    ORDER BY u.name ASC
  `).all();

  const results = attendees.map((row) => ({
    userId: row.id,
    name: row.name,
    email: row.email,
    checkedIn: Boolean(row.checked_in),
    eligible: Boolean(row.checked_in),
    certificateCode: row.certificate_code,
    issuedAt: row.issued_at,
  }));

  res.json({ certificates: results });
});

router.get('/admin/certificates/:userId/download', authenticate, requireRole('admin'), async (req, res) => {
  const userId = Number(req.params.userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(userId, 'attendee');

  if (!user) {
    return res.status(404).json({ error: 'Attendee not found.' });
  }

  if (!hasAttendance(userId)) {
    return res.status(403).json({
      error: 'Certificate not available. Attendee has not checked in.',
    });
  }

  try {
    const cert = getOrCreateCertificate(userId);
    const pdf = await generateCertificatePdf(user, cert);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${cert.certificate_code}.pdf"`
    );
    res.send(pdf);
  } catch {
    res.status(500).json({ error: 'Failed to generate certificate PDF.' });
  }
});

export default router;
