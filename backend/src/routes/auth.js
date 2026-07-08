import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, authenticate } from '../middleware/auth.js';
import { sanitizeUser } from '../seed.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password, organization, phone } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      `INSERT INTO users (name, email, password_hash, role, organization, phone)
       VALUES (?, ?, ?, 'attendee', ?, ?)`
    ).run(
      name.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      organization?.trim() || null,
      phone?.trim() || null
    );

    const user = sanitizeUser(
      db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
    );

    res.status(201).json({ user, token: signToken(user) });
  } catch {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const safeUser = sanitizeUser(user);
  res.json({ user: safeUser, token: signToken(safeUser) });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
