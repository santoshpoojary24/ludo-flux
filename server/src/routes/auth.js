const express = require('express');
const argon2 = require('argon2');
const { getDb } = require('../config/db');
const {
  authMiddleware,
  createAuthenticatedResponse,
  createGuestUser,
  generateUid,
  serializeUser
} = require('../utils/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const db = await getDb();

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingUsername = await db.get(
      'SELECT uid FROM users WHERE LOWER(username) = LOWER(?)',
      [username]
    );
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hash = await argon2.hash(password);
    const uid = generateUid();

    const result = await db.run(
      `INSERT INTO users (uid, email, password_hash, username, account_type)
       VALUES (?, ?, ?, ?, 'registered')`,
      [uid, email, hash, username]
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    const response = await createAuthenticatedResponse(user, req);

    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.deactivated_at) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const response = await createAuthenticatedResponse(user, req);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/guest', async (req, res) => {
  try {
    const user = await createGuestUser();
    const response = await createAuthenticatedResponse(user, req);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create guest account' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
    if (!user || user.deactivated_at) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }
    res.json({ user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/coins', authMiddleware, async (req, res) => {
  try {
    const { coins, reward } = req.body;
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.run('UPDATE users SET coins = ? WHERE uid = ?', [coins, req.user.uid]);
    await db.run(
      'INSERT INTO coin_transactions (user_uid, amount, reason) VALUES (?, ?, ?)',
      [req.user.uid, Number(coins) - Number(user.coins || 0), reward ? 'daily_spin' : 'manual_update']
    );

    if (reward) {
      const { recordActivity } = require('../utils/activity');
      const io = req.app.get('io');
      if (io) {
        await recordActivity(io, req.user.uid, 'spin', { coins: reward });
      }
    }

    res.json({ success: true, coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update coins' });
  }
});

module.exports = router;
