import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

function sessionsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function validateSession(body, excludeId = null) {
  const { title, speaker, start_time, end_time } = body;

  if (!title?.trim()) return 'Title is required.';
  if (!speaker?.trim()) return 'Speaker is required.';
  if (!start_time) return 'Start time is required.';
  if (!end_time) return 'End time is required.';
  if (new Date(end_time) <= new Date(start_time)) {
    return 'End time must be after start time.';
  }

  const others = excludeId
    ? db.prepare('SELECT * FROM sessions WHERE id != ?').all(excludeId)
    : db.prepare('SELECT * FROM sessions').all();

  for (const other of others) {
    if (
      sessionsOverlap(
        new Date(start_time).getTime(),
        new Date(end_time).getTime(),
        new Date(other.start_time).getTime(),
        new Date(other.end_time).getTime()
      )
    ) {
      return `Session overlaps with "${other.title}".`;
    }
  }

  return null;
}

router.get('/', (req, res) => {
  const sessions = db
    .prepare('SELECT * FROM sessions ORDER BY start_time ASC')
    .all();
  res.json({ sessions });
});

router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const error = validateSession(req.body);
  if (error) return res.status(400).json({ error });

  const { title, description, speaker, start_time, end_time, location } = req.body;

  const result = db.prepare(
    `INSERT INTO sessions (title, description, speaker, start_time, end_time, location, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    title.trim(),
    description?.trim() || null,
    speaker.trim(),
    start_time,
    end_time,
    location?.trim() || null
  );

  const session = db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ session });
});

router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Session not found.' });

  const error = validateSession(req.body, id);
  if (error) return res.status(400).json({ error });

  const { title, description, speaker, start_time, end_time, location } = req.body;

  db.prepare(
    `UPDATE sessions
     SET title = ?, description = ?, speaker = ?, start_time = ?, end_time = ?, location = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    title.trim(),
    description?.trim() || null,
    speaker.trim(),
    start_time,
    end_time,
    location?.trim() || null,
    id
  );

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  res.json({ session });
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Session not found.' });

  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  res.json({ message: 'Session deleted.' });
});

router.post('/:id/toggle-open', authenticate, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Session not found.' });

  const nextState = existing.is_open ? 0 : 1;
  db.prepare("UPDATE sessions SET is_open = ?, updated_at = datetime('now') WHERE id = ?").run(nextState, id);

  const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  res.json({ session: updated });
});

export default router;
