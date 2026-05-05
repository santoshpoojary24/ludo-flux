const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// const migrateDB = require('./db/migrations');
const gameHandler = require('./sockets/gameHandler');
const { presenceHandler } = require('./sockets/presenceHandler');

const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const friendsRoutes = require('./routes/friends');
const feedRoutes = require('./routes/feed');
const leaderboardRoutes = require('./routes/leaderboard');
const { profileRouter, accountRouter, authProfileRouter } = require('./routes/profile');
const shopRoutes = require('./routes/shop');
const rewardsRoutes = require('./routes/rewards');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production, set CLIENT_URL env var to your Vercel domain:
//   e.g. CLIENT_URL=https://ludo-flux.vercel.app
// Multiple origins: CLIENT_URL=https://ludo-flux.vercel.app,https://www.ludo-flux.vercel.app
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ── Health check (Railway / Render ping) ─────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/auth', authProfileRouter);
app.use('/api/matches', matchRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRouter);
app.use('/api/account', accountRouter);
app.use('/api/shop', shopRoutes);
app.use('/api/rewards', rewardsRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  presenceHandler(io, socket);
  gameHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});