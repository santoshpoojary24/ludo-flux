const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { getDb } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ludoflux_super_secret';

const serializeUser = (user) => ({
  uid: user.uid,
  username: user.username,
  email: user.account_type === 'guest' ? '' : user.email,
  coins: user.coins || 0,
  elo: user.elo || 600,
  accountType: user.account_type || 'registered',
  bannerId: user.banner_id || 'clay-sunrise',
  bannerTint: user.banner_tint || 'sky',
  tokenSkin: user.token_skin || 'clay',
  statusMessage: user.status_message || '',
  avatarConfig: user.avatar_config || null
});

const generateUid = () => `FLUX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const getClientIp = (req) =>
  (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1')
    .toString()
    .split(',')[0]
    .trim();

const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || 'Unknown device';
  return userAgent.slice(0, 180);
};

const createSession = async (db, userUid, req) => {
  const sessionId = crypto.randomUUID();
  await db.run(
    `INSERT INTO user_sessions (id, user_uid, device_info, ip_address, last_seen)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [sessionId, userUid, getDeviceInfo(req), getClientIp(req)]
  );
  return sessionId;
};

const issueToken = (user, sessionId) =>
  jwt.sign(
    {
      id: user.id,
      uid: user.uid,
      username: user.username,
      sessionId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

const createAuthenticatedResponse = async (user, req) => {
  const db = await getDb();
  const sessionId = await createSession(db, user.uid, req);
  const token = issueToken(user, sessionId);
  return { token, user: serializeUser(user), sessionId };
};

const verifySessionIfNeeded = async (decoded) => {
  if (!decoded?.sessionId) {
    return true;
  }

  const db = await getDb();
  const session = await db.get(
    'SELECT id FROM user_sessions WHERE id = ? AND user_uid = ?',
    [decoded.sessionId, decoded.uid]
  );

  if (!session) {
    return false;
  }

  await db.run(
    'UPDATE user_sessions SET last_seen = CURRENT_TIMESTAMP WHERE id = ?',
    [decoded.sessionId]
  );

  return true;
};

const parseToken = async (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const validSession = await verifySessionIfNeeded(decoded);

  if (!validSession) {
    throw new Error('SESSION_EXPIRED');
  }

  return decoded;
};

const authMiddleware = async (req, res, next) => {
  try {
    const decoded = await parseToken(req.headers.authorization);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    const message = error.message === 'SESSION_EXPIRED' ? 'Session expired' : 'Invalid token';
    res.status(401).json({ error: message });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    req.user = await parseToken(req.headers.authorization);
  } catch (error) {
    req.user = null;
  }

  next();
};

const createGuestUser = async () => {
  const db = await getDb();
  const uid = generateUid();
  const username = `Guest_${uid.split('-')[1]}`;
  const placeholderHash = await argon2.hash(crypto.randomUUID());

  const result = await db.run(
    `INSERT INTO users (uid, email, password_hash, username, account_type)
     VALUES (?, ?, ?, ?, 'guest')`,
    [uid, `${uid.toLowerCase()}@guest.local`, placeholderHash, username]
  );

  return db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
};

module.exports = {
  JWT_SECRET,
  authMiddleware,
  optionalAuthMiddleware,
  createAuthenticatedResponse,
  createGuestUser,
  generateUid,
  issueToken,
  serializeUser
};
