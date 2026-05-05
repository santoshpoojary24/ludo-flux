const express = require('express');
const { getDb } = require('../config/db');
const { authMiddleware } = require('../utils/auth');

const router = express.Router();

const deriveResult = (player, winner) => {
  if (player.result) return player.result;
  if (winner && (winner === player.color || winner === player.uid)) return 'win';
  if (!winner) return 'draw';
  return 'loss';
};

const calculateEloDelta = (player, players, eloByUid, winner) => {
  if (player.isBot) return 0;

  const result = deriveResult(player, winner);
  const opponents = players.filter((entry) => entry.uid !== player.uid && !entry.isBot);
  if (!opponents.length) return result === 'win' ? 20 : result === 'loss' ? -15 : 0;

  const currentElo = eloByUid[player.uid] ?? 600;
  const higherRankOpponent = opponents.some((entry) => (eloByUid[entry.uid] ?? 600) > currentElo);

  if (result === 'win') {
    return higherRankOpponent ? 35 : 20;
  }
  if (result === 'loss') {
    return higherRankOpponent ? -5 : -15;
  }
  return 0;
};

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const {
      roomCode,
      winner,
      players = [],
      duration,
      gameMode = 'Classic',
      captures = [],
      diceRolls = {},
      tokenStats = {}
    } = req.body;

    const db = await getDb();
    const winnerPlayer = players.find((player) => winner && (player.color === winner || player.uid === winner));
    const winnerUid = winnerPlayer?.uid || null;

    const recentExisting = await db.get(
      `SELECT id
       FROM match_history
       WHERE room_code = ?
         AND COALESCE(winner, winner_uid) = COALESCE(?, ?)
         AND COALESCE(played_at, created_at) >= NOW() - INTERVAL '10 seconds'
       LIMIT 1`,
      [roomCode, winner || null, winnerUid]
    );

    if (recentExisting) {
      return res.json({ ok: true, deduped: true });
    }

    const humanPlayers = players.filter((player) => !player.isBot);
    const eloRows =
      humanPlayers.length > 0
        ? await db.all(
          `SELECT uid, elo
             FROM users
             WHERE uid IN (${humanPlayers.map(() => '?').join(',')})`,
          humanPlayers.map((player) => player.uid)
        )
        : [];
    const eloByUid = Object.fromEntries(eloRows.map((row) => [row.uid, row.elo || 600]));

    const normalizedPlayers = players.map((player) => {
      const eloDelta = calculateEloDelta(player, players, eloByUid, winner);
      return {
        ...player,
        result: deriveResult(player, winner),
        eloDelta,
        playTimeSeconds: Number(player.playTimeSeconds || duration || 0),
        tokensHome: Number(player.tokensHome || 0),
        capturesMade: Number(player.capturesMade || 0),
        timesCaptured: Number(player.timesCaptured || 0),
        diceRolls: player.diceRolls || diceRolls[player.uid] || {}
      };
    });

    for (const player of normalizedPlayers) {
      if (player.isBot) continue;
      const current = eloByUid[player.uid] ?? 600;
      await db.run(
        'UPDATE users SET elo = ? WHERE uid = ?',
        [Math.max(0, current + Number(player.eloDelta || 0)), player.uid]
      );
    }

    const tokenStatsPayload = tokenStats && Object.keys(tokenStats).length
      ? tokenStats
      : Object.fromEntries(
        normalizedPlayers.map((player) => [
          player.uid || player.color,
          {
            tokensHome: player.tokensHome,
            capturesMade: player.capturesMade,
            timesCaptured: player.timesCaptured
          }
        ])
      );

    await db.run(
      `INSERT INTO match_history (
        room_code,
        winner_uid,
        winner,
        duration_seconds,
        players_json,
        game_mode,
        token_stats_json,
        captures_json,
        dice_rolls_json,
        result_json,
        elo_delta,
        played_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        roomCode,
        winnerUid,
        winner || null,
        duration || 0,
        JSON.stringify(normalizedPlayers),
        gameMode,
        JSON.stringify(tokenStatsPayload),
        JSON.stringify(captures),
        JSON.stringify(diceRolls),
        JSON.stringify({
          winner,
          winnerUid,
          players: normalizedPlayers.map((player) => ({
            uid: player.uid,
            result: player.result,
            eloDelta: player.eloDelta
          }))
        }),
        Number(winnerPlayer?.eloDelta || 0)
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save match' });
  }
});

// ── Match History list ────────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const myUid = req.user.uid;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const db = await getDb();

    const rows = await db.all(
      `SELECT id, room_code, winner, winner_uid, duration_seconds,
              players_json, game_mode, played_at, elo_delta
       FROM match_history
       WHERE players_json LIKE ?
       ORDER BY COALESCE(played_at, created_at) DESC
       LIMIT ?`,
      [`%${myUid}%`, limit]
    );

    const result = rows.map(row => {
      let players = [];
      try { players = JSON.parse(row.players_json || '[]'); } catch {}
      const me = players.find(p => p && p.uid === myUid);
      return {
        id: row.id,
        roomCode: row.room_code,
        winner: row.winner,
        winnerUid: row.winner_uid,
        duration_seconds: row.duration_seconds || 0,
        gameMode: row.game_mode || 'Classic',
        played_at: row.played_at,
        result: me ? (row.winner && (row.winner === me.color || row.winner_uid === myUid) ? 'win' : 'loss') : 'unknown',
        myColor: me?.color || null,
        eloDelta: me?.eloDelta ?? row.elo_delta ?? 0,
        players: players.map(p => p ? (p.isBot ? `Bot(${p.color})` : p.username || p.color) : '?')
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load match history' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const myUid = req.user.uid;
    const days = parseInt(req.query.days, 10) || 7;
    const db = await getDb();

    const matches = await db.all(
      `SELECT winner, winner_uid, players_json, DATE(COALESCE(played_at, created_at)) AS day
       FROM match_history
       WHERE players_json LIKE ?
         AND COALESCE(played_at, created_at) >= NOW() - ($2 || ' days')::INTERVAL
       ORDER BY day ASC`,
      [`%${myUid}%`, String(days)]
    );

    const statsByDay = {};
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      statsByDay[date.toISOString().split('T')[0]] = { wins: 0, losses: 0 };
    }

    matches.forEach((match) => {
      const players = JSON.parse(match.players_json || '[]');
      const me = players.find((player) => player && player.uid === myUid);
      if (!me) return;

      const result = deriveResult(me, match.winner || match.winner_uid);
      if (result === 'win') {
        statsByDay[match.day].wins += 1;
      } else if (result === 'loss') {
        statsByDay[match.day].losses += 1;
      }
    });

    res.json(Object.entries(statsByDay).map(([day, stats]) => ({ day, ...stats })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;