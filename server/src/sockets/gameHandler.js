/**
 * @fileoverview Server-side Socket.io game handler.
 * Handles all real-time game events: room join/leave, dice roll, token move,
 * bot AI, chat, emotes, voice signalling, rematch, and ping.
 * FIXED: Solo vs Bot – human can roll and move.
 */

const crypto = require('crypto');
const redis = require('../config/redis');
const { getDb } = require('../config/db');
const { isValidMove, isCapture, checkWinCondition } = require('../../../shared/constants/rules');
const { SOCKET_EVENTS } = require('../../../shared/constants/socketEvents');
const { setPresence } = require('./presenceHandler');
const { recordActivity } = require('../utils/activity');

const reconnectMap = new Map(); // uid -> { roomCode, socketId, expiry }
const botTurnTimers = new Map(); // roomCode -> timeout

const BOT_OPTIMAL_CHANCE = { easy: 0.4, medium: 0.75, hard: 1.0 };
const BOT_DELAY_MS = { easy: 1200, medium: 1000, hard: 800 };
const TURN_ORDER = ['red', 'green', 'yellow', 'blue'];
const PASS_DELAY_MS = 1500;

const createEmptyDiceRolls = () => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0
});

const createEmptyTokens = () => ({
  red: [{ position: -1 }, { position: -1 }, { position: -1 }, { position: -1 }],
  green: [{ position: -1 }, { position: -1 }, { position: -1 }, { position: -1 }],
  yellow: [{ position: -1 }, { position: -1 }, { position: -1 }, { position: -1 }],
  blue: [{ position: -1 }, { position: -1 }, { position: -1 }, { position: -1 }]
});

const inferGameMode = (roomCode) => {
  if (roomCode.startsWith('BOT-')) return 'Bot Game';
  if (roomCode.startsWith('LOCAL-')) return 'Pass & Play';
  if (roomCode.startsWith('GLOBAL')) return 'Global Match';
  if (roomCode.startsWith('PRIV-') || roomCode.startsWith('CHALL-')) return 'Private Match';
  return 'Classic';
};

const getActiveTurnOrder = (state) =>
  TURN_ORDER.filter((color) =>
    state.players.some((player) => player.color === color && (player.isBot || !player.disconnected))
  );

const getNextTurnColor = (state, currentColor) => {
  const activeOrder = getActiveTurnOrder(state);
  if (!activeOrder.length) return currentColor || TURN_ORDER[0];
  const currentIndex = activeOrder.indexOf(currentColor);
  if (currentIndex === -1) return activeOrder[0];
  return activeOrder[(currentIndex + 1) % activeOrder.length];
};

const ensureTurnBelongsToActivePlayer = (state) => {
  const activeOrder = getActiveTurnOrder(state);
  if (!activeOrder.length) return null;
  if (!activeOrder.includes(state.turn)) state.turn = activeOrder[0];
  return state.turn;
};

const hasMinimumPlayersToStart = (state) => getActiveTurnOrder(state).length >= 2;

const clearScheduledBotTurn = (roomCode) => {
  const timeoutId = botTurnTimers.get(roomCode);
  if (timeoutId) {
    clearTimeout(timeoutId);
    botTurnTimers.delete(roomCode);
  }
};

const scheduleBotTurn = (io, roomCode, difficulty = 'medium', delay = BOT_DELAY_MS[difficulty] || BOT_DELAY_MS.medium) => {
  clearScheduledBotTurn(roomCode);
  const timeoutId = setTimeout(async () => {
    botTurnTimers.delete(roomCode);
    try {
      await executeBotTurn(io, roomCode, difficulty);
    } catch (error) {
      console.error('[Bot] Turn execution failed:', error);
    }
  }, delay);
  botTurnTimers.set(roomCode, timeoutId);
};

const scheduleAutoPass = (io, roomCode, expectedRoll, delay = PASS_DELAY_MS) => {
  setTimeout(async () => {
    const stateStr = await redis.get(`room:${roomCode}`);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    if (state.winner || state.diceValue !== expectedRoll) return;
    state.turn = getNextTurnColor(state, state.turn);
    state.diceValue = null;
    state.consecutiveSixes = 0;
    ensureTurnBelongsToActivePlayer(state);
    await redis.set(`room:${roomCode}`, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
    const nextPlayer = state.players.find((player) => player.color === state.turn);
    if (nextPlayer?.isBot) scheduleBotTurn(io, roomCode, state.botDifficulty || 'medium');
  }, delay);
};

const convertPlayerToBot = (state, uid) => {
  const playerIndex = state.players.findIndex((player) => player.uid === uid && !player.isBot);
  if (playerIndex === -1) return null;
  const humanPlayer = state.players[playerIndex];
  const botPlayer = {
    uid: `bot-${humanPlayer.color}`,
    username: `Bot ${humanPlayer.color.charAt(0).toUpperCase() + humanPlayer.color.slice(1)}`,
    color: humanPlayer.color,
    isBot: true,
    isMuted: true
  };
  state.players[playerIndex] = botPlayer;
  ensurePlayerStatsEntry(state, botPlayer);
  return { humanPlayer, botPlayer };
};

const removePlayerFromWaitingRoom = (state, uid) => {
  const playerIndex = state.players.findIndex((player) => player.uid === uid && !player.isBot);
  if (playerIndex === -1) return null;
  const [removedPlayer] = state.players.splice(playerIndex, 1);
  if (state.host === uid) {
    state.host = state.players.find((player) => !player.isBot)?.uid || state.players[0]?.uid || null;
  }
  ensureTurnBelongsToActivePlayer(state);
  return removedPlayer;
};

const maybeAutoStartGlobalRoom = (state) => {
  if (state.gameMode === 'Global Match' && state.status === 'waiting' && hasMinimumPlayersToStart(state)) {
    state.status = 'playing';
    ensureTurnBelongsToActivePlayer(state);
  }
};

const findAvailableGlobalRoom = async () => {
  for (let index = 1; index <= 100; index += 1) {
    const roomCode = `GLOBAL-${index}`;
    const stateStr = await redis.get(`room:${roomCode}`);
    if (!stateStr) return roomCode;
    const state = JSON.parse(stateStr);
    if (state.status === 'waiting' && state.players.length < 4) return roomCode;
  }
  return `GLOBAL-${Date.now()}`;
};

const ensurePlayerStatsEntry = (state, player) => {
  if (!player) return null;
  state.playerStats = state.playerStats || {};
  const key = player.uid || player.color;
  if (!state.playerStats[key]) {
    state.playerStats[key] = {
      uid: player.uid,
      username: player.username,
      color: player.color,
      tokensHome: 0,
      capturesMade: 0,
      timesCaptured: 0,
      diceRolls: createEmptyDiceRolls(),
      isBot: Boolean(player.isBot)
    };
  }
  state.playerStats[key].diceRolls = {
    ...createEmptyDiceRolls(),
    ...(state.playerStats[key].diceRolls || {})
  };
  return state.playerStats[key];
};

const incrementDiceRoll = (state, player, roll) => {
  const entry = ensurePlayerStatsEntry(state, player);
  if (!entry) return;
  entry.diceRolls[roll] = Number(entry.diceRolls[roll] || 0) + 1;
  state.diceHistory = state.diceHistory || [];
  state.diceHistory.push({ uid: player.uid, color: player.color, roll, at: Date.now() });
};

const recordCapture = (state, movingPlayer, capturedPlayer) => {
  const attacker = ensurePlayerStatsEntry(state, movingPlayer);
  const victim = ensurePlayerStatsEntry(state, capturedPlayer);
  if (attacker) attacker.capturesMade += 1;
  if (victim) victim.timesCaptured += 1;
  state.captureLog = state.captureLog || [];
  state.captureLog.push({
    fromUid: movingPlayer?.uid || null,
    fromColor: movingPlayer?.color || null,
    toUid: capturedPlayer?.uid || null,
    toColor: capturedPlayer?.color || null,
    at: Date.now()
  });
};

const recordTokenHome = (state, player) => {
  const entry = ensurePlayerStatsEntry(state, player);
  if (entry) entry.tokensHome += 1;
};

const emitChatWithBlockFilter = async (io, roomCode, senderUid, payload) => {
  try {
    const stateStr = await redis.get(`room:${roomCode}`);
    const state = stateStr ? JSON.parse(stateStr) : null;
    const sockets = await io.in(roomCode).fetchSockets();
    const db = await getDb();
    for (const roomSocket of sockets) {
      const roomPlayer = state?.players?.find((player) => player.socketId === roomSocket.id);
      const recipientUid = roomPlayer?.uid;
      if (senderUid && recipientUid && senderUid !== recipientUid) {
        try {
          const blocked = await db.get(
            `SELECT 1 FROM blocked_users
             WHERE (blocker_uid = ? AND blocked_uid = ?)
                OR (blocker_uid = ? AND blocked_uid = ?)
             LIMIT 1`,
            [senderUid, recipientUid, recipientUid, senderUid]
          );
          if (blocked) continue;
        } catch (error) { console.error('[Chat] Block check failed:', error); }
      }
      roomSocket.emit(SOCKET_EVENTS.CHAT_MESSAGE, payload);
    }
  } catch (error) {
    console.error('[Chat] Broadcast failed:', error);
    io.to(roomCode).emit(SOCKET_EVENTS.CHAT_MESSAGE, payload);
  }
};

function scoreBotMove(color, tokenIndex, roll, state) {
  const token = state.tokens[color][tokenIndex];
  let score = 0;
  const nextPosition = token.position === -1 ? 0 : token.position + roll;
  const capture = isCapture(color, nextPosition, state.tokens);
  if (capture) score += 1000;
  if (nextPosition === 56) score += 800;
  if (token.position === -1 && roll === 6) score += 400;
  if (token.position > 0) score += token.position * 3;
  const { SAFE_ZONES, START_OFFSETS } = require('../../../shared/constants/rules');
  const absolutePosition = (START_OFFSETS[color] + nextPosition) % 52;
  if (SAFE_ZONES.includes(absolutePosition)) score += 150;
  const ENEMY_COLORS = TURN_ORDER.filter(c => c !== color);
  ENEMY_COLORS.forEach(enemyColor => {
    state.tokens[enemyColor].forEach(enemyToken => {
      if (enemyToken.position === -1) return;
      const enemyAbsPos = (START_OFFSETS[enemyColor] + enemyToken.position) % 52;
      const dist = (absolutePosition - enemyAbsPos + 52) % 52;
      if (dist >= 1 && dist <= 6 && !SAFE_ZONES.includes(absolutePosition)) score -= 100;
    });
  });
  if (nextPosition > 50) score += 300;
  return score;
}

const executeBotTurn = async (io, roomCode, difficulty = 'medium') => {
  const stateStr = await redis.get(`room:${roomCode}`);
  if (!stateStr) return;
  const state = JSON.parse(stateStr);
  if (state.status !== 'playing' || state.winner || state.diceValue !== null) return;
  ensureTurnBelongsToActivePlayer(state);
  const color = state.turn;
  const currentPlayer = state.players.find((player) => player.color === color);
  if (!currentPlayer?.isBot) return;

  const roll = crypto.randomInt(1, 7);
  incrementDiceRoll(state, currentPlayer, roll);

  state.consecutiveSixes = state.consecutiveSixes || 0;
  if (roll === 6) {
    state.consecutiveSixes += 1;
    if (state.consecutiveSixes >= 3) {
      state.consecutiveSixes = 0;
      state.diceValue = null;
      state.turn = getNextTurnColor(state, color);
      ensureTurnBelongsToActivePlayer(state);
      await redis.set(`room:${roomCode}`, JSON.stringify(state));
      io.to(roomCode).emit(SOCKET_EVENTS.GAME_DICE_ROLLED, state);
      const nextPlayer = state.players.find((player) => player.color === state.turn);
      if (nextPlayer?.isBot) scheduleBotTurn(io, roomCode, difficulty);
      return;
    }
  } else {
    state.consecutiveSixes = 0;
  }

  const currentTokens = state.tokens[color];
  const hasValidMoves = currentTokens.some((token) => {
    if (token.position === -1) return roll === 6;
    return token.position + roll <= 56;
  });

  state.diceValue = roll;
  await redis.set(`room:${roomCode}`, JSON.stringify(state));
  io.to(roomCode).emit(SOCKET_EVENTS.GAME_DICE_ROLLED, state);

  if (!hasValidMoves) {
    scheduleAutoPass(io, roomCode, roll);
    return;
  }

  setTimeout(async () => {
    const freshStateStr = await redis.get(`room:${roomCode}`);
    if (!freshStateStr) return;
    const freshState = JSON.parse(freshStateStr);
    if (freshState.winner || freshState.diceValue !== roll || freshState.turn !== color) return;

    const validTokens = [];
    freshState.tokens[color].forEach((token, index) => {
      if (isValidMove(token, roll)) validTokens.push(index);
    });
    if (!validTokens.length) { scheduleAutoPass(io, roomCode, roll, 0); return; }

    const optimalChance = BOT_OPTIMAL_CHANCE[difficulty] || BOT_OPTIMAL_CHANCE.medium;
    const chosenIndex = Math.random() < optimalChance
      ? validTokens.reduce((best, idx) => scoreBotMove(color, idx, roll, freshState) > scoreBotMove(color, best, roll, freshState) ? idx : best, validTokens[0])
      : validTokens[Math.floor(Math.random() * validTokens.length)];

    const token = freshState.tokens[color][chosenIndex];
    const movingPlayer = freshState.players.find((player) => player.color === color);

    if (token.position === -1) token.position = 0;
    else token.position += roll;

    let getsExtraTurn = roll === 6;
    const capture = isCapture(color, token.position, freshState.tokens);
    if (capture) {
      freshState.tokens[capture.color][capture.index].position = -1;
      getsExtraTurn = true;
      const capturedPlayer = freshState.players.find((player) => player.color === capture.color);
      recordCapture(freshState, movingPlayer, capturedPlayer);
      io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_JOINED, { type: 'capture', msg: `${color.charAt(0).toUpperCase() + color.slice(1)} captured ${capture.color}'s token!` });
    }

    if (token.position === 56) { getsExtraTurn = true; recordTokenHome(freshState, movingPlayer); }
    if (checkWinCondition(freshState.tokens[color])) freshState.winner = color;

    if (!getsExtraTurn && !freshState.winner) {
      freshState.turn = getNextTurnColor(freshState, color);
      freshState.consecutiveSixes = 0;
    } else if (getsExtraTurn && roll !== 6) freshState.consecutiveSixes = 0;

    freshState.diceValue = null;
    ensureTurnBelongsToActivePlayer(freshState);
    await redis.set(`room:${roomCode}`, JSON.stringify(freshState));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, freshState);

    const nextPlayer = freshState.players.find((player) => player.color === freshState.turn);
    if (!freshState.winner && nextPlayer?.isBot) scheduleBotTurn(io, roomCode, freshState.botDifficulty || difficulty);
  }, BOT_DELAY_MS[difficulty] || BOT_DELAY_MS.medium);
};

module.exports = (io, socket) => {
  socket.on(SOCKET_EVENTS.ROOM_JOIN, async ({ roomCode: requestedRoomCode, user }) => {
    if (!requestedRoomCode || !user?.uid) return;

    let roomCode = requestedRoomCode;
    if (roomCode === 'GLOBAL') roomCode = await findAvailableGlobalRoom();

    const stateKey = `room:${roomCode}`;
    const exists = await redis.exists(stateKey);
    socket.join(roomCode);

    if (!exists) {
      const initialState = {
        roomCode,
        status: (roomCode.startsWith('BOT-') || roomCode.startsWith('LOCAL-')) ? 'playing' : 'waiting',
        host: user.uid,
        roomType: roomCode.startsWith('PRIV-') || roomCode.startsWith('CHALL-') ? 'private' : 'public',
        gameMode: inferGameMode(roomCode),
        players: [{
          ...user,
          color: TURN_ORDER[0],
          socketId: socket.id,
          disconnected: false,
          isMuted: user.isMuted ?? true,
          isBot: false
        }],
        turn: TURN_ORDER[0],
        diceValue: null,
        winner: null,
        consecutiveSixes: 0,
        captureCounts: {},
        captureLog: [],
        diceHistory: [],
        playerStats: {},
        tokens: createEmptyTokens()
      };
      ensurePlayerStatsEntry(initialState, initialState.players[0]);

      if (roomCode.startsWith('BOT-') || roomCode.startsWith('LOCAL-')) {
        const isBotGame = roomCode.startsWith('BOT-');
        TURN_ORDER.filter((color) => color !== initialState.players[0].color).forEach((color) => {
          const player = {
            uid: isBotGame ? `bot-${color}` : `local-${color}`,
            username: isBotGame ? `Bot ${color.charAt(0).toUpperCase() + color.slice(1)}` : `Player ${color.charAt(0).toUpperCase() + color.slice(1)}`,
            color,
            isBot: isBotGame,
            isLocal: !isBotGame,
            isMuted: true
          };
          initialState.players.push(player);
          ensurePlayerStatsEntry(initialState, player);
        });
      }

      ensureTurnBelongsToActivePlayer(initialState);
      await redis.set(stateKey, JSON.stringify(initialState));
    } else {
      const state = JSON.parse(await redis.get(stateKey));
      const existingPlayer = state.players.find((player) => player.uid === user.uid && !player.isBot);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.username = user.username;
        existingPlayer.disconnected = false;
        existingPlayer.isMuted = existingPlayer.isMuted ?? true;
      } else if (state.players.length < 4) {
        const takenColors = state.players.map((player) => player.color);
        const assignedColor = TURN_ORDER.find((color) => !takenColors.includes(color)) || TURN_ORDER[0];
        state.players.push({ ...user, color: assignedColor, socketId: socket.id, disconnected: false, isMuted: false, isBot: false });
      } else if (roomCode.startsWith('BOT-')) {
        // BOT room is full of bots – replace the first bot (red) with the human
        console.log('[DEBUG] Replacing bot with human for room:', roomCode, 'User:', user);
        const redBotIndex = state.players.findIndex((player) => player.color === TURN_ORDER[0] && player.isBot);
        console.log('[DEBUG] redBotIndex:', redBotIndex);
        const targetIndex = redBotIndex !== -1 ? redBotIndex : 0;
        state.players[targetIndex] = {
          ...user,
          color: state.players[targetIndex].color,
          socketId: socket.id,
          disconnected: false,
          isMuted: false,
          isBot: false
        };
        console.log('[DEBUG] After replacement player at targetIndex is:', state.players[targetIndex]);
      } else {
        console.log('[DEBUG] ROOM_JOIN fell through all branches! state.players.length:', state.players.length, 'roomCode:', roomCode);
      }

      state.captureCounts = state.captureCounts || {};
      state.captureLog = state.captureLog || [];
      state.diceHistory = state.diceHistory || [];
      state.playerStats = state.playerStats || {};
      state.players.forEach((player) => ensurePlayerStatsEntry(state, player));
      maybeAutoStartGlobalRoom(state);
      ensureTurnBelongsToActivePlayer(state);
      await redis.set(stateKey, JSON.stringify(state));
    }

    reconnectMap.set(user.uid, { roomCode, socketId: socket.id, expiry: Date.now() + 30000 });
    const currentState = JSON.parse(await redis.get(stateKey));

    // Send the resolved room state ONLY to the joining socket (includes roomCode for GLOBAL resolution)
    console.log(`[ROOM_JOINED] Emitting to ${user.uid} in ${roomCode}. Players:`, currentState.players.map(p => ({ color: p.color, uid: p.uid, isBot: p.isBot, username: p.username })));
    socket.emit(SOCKET_EVENTS.ROOM_JOINED, currentState);
    // Broadcast to OTHER sockets in the room (not the joiner – they got ROOM_JOINED already)
    socket.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, currentState);
    socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_JOINED, { type: 'joined', msg: `${user.username} joined the room!` });
    await setPresence(io, user.uid, `ingame:${roomCode}`);

    const currentTurnPlayer = currentState.players.find((player) => player.color === currentState.turn);
    // Delay bot turn so client has time to render the state first
    if (currentState.status === 'playing' && !currentState.winner && currentTurnPlayer?.isBot && currentState.diceValue === null) {
      scheduleBotTurn(io, roomCode, currentState.botDifficulty || 'medium', 2000);
    }
  });

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, async ({ roomCode, uid }) => {
    if (!roomCode || !uid) return;
    socket.leave(roomCode);
    reconnectMap.delete(uid);
    clearScheduledBotTurn(roomCode);
    await setPresence(io, uid, 'online');

    const stateStr = await redis.get(`room:${roomCode}`);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    const player = state.players.find((entry) => entry.uid === uid && !entry.isBot);
    if (!player) return;

    let leftMessage = `${player.username} left the room.`;

    if (state.status === 'playing') {
      const takeover = convertPlayerToBot(state, uid);
      if (!takeover) return;

      const humanPlayers = state.players.filter(p => !p.isBot);
      
      // If it's a multiplayer game and only 1 human is left, they win
      if (humanPlayers.length === 1 && !state.roomCode.startsWith('BOT-') && !state.roomCode.startsWith('LOCAL-')) {
        state.winner = humanPlayers[0].color;
        leftMessage = `${player.username} left. ${humanPlayers[0].username} wins by default!`;
      } else {
        if (state.turn === takeover.humanPlayer.color && state.diceValue !== null) {
          state.diceValue = null;
          state.consecutiveSixes = 0;
          state.turn = getNextTurnColor(state, takeover.humanPlayer.color);
        }
        ensureTurnBelongsToActivePlayer(state);
        leftMessage = `${player.username} left the room. ${takeover.botPlayer.username} took over.`;
      }

      await redis.set(`room:${roomCode}`, JSON.stringify(state));
      io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { type: 'left', msg: leftMessage });
      io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
      const nextPlayer = state.players.find((entry) => entry.color === state.turn);
      if (!state.winner && nextPlayer?.isBot && state.diceValue === null) scheduleBotTurn(io, roomCode, state.botDifficulty || 'medium');
      return;
    }

    const removedPlayer = removePlayerFromWaitingRoom(state, uid);
    if (!removedPlayer) return;
    if (!state.players.length) {
      await redis.del(`room:${roomCode}`);
      io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { type: 'left', msg: leftMessage });
      return;
    }
    await redis.set(`room:${roomCode}`, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { type: 'left', msg: leftMessage });
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
  });

  socket.on(SOCKET_EVENTS.GAME_START, async ({ roomCode, uid }) => {
    if (!roomCode || !uid) return;
    const stateKey = `room:${roomCode}`;
    const stateStr = await redis.get(stateKey);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    if (state.host !== uid || state.status === 'playing' || !hasMinimumPlayersToStart(state)) return;
    state.status = 'playing';
    ensureTurnBelongsToActivePlayer(state);
    await redis.set(stateKey, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
    const currentTurnPlayer = state.players.find((player) => player.color === state.turn);
    if (currentTurnPlayer?.isBot) scheduleBotTurn(io, roomCode, state.botDifficulty || 'medium', 1500);
  });

  socket.on(SOCKET_EVENTS.GAME_FILL_BOTS, async ({ roomCode, uid, difficulty }) => {
    if (!roomCode || !uid) return;
    const stateKey = `room:${roomCode}`;
    const stateStr = await redis.get(stateKey);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    if (state.host !== uid) return;
    const takenColors = state.players.map((player) => player.color);
    TURN_ORDER.filter((color) => !takenColors.includes(color)).forEach((color) => {
      const botPlayer = {
        uid: `bot-${color}`,
        username: `Bot ${color.charAt(0).toUpperCase() + color.slice(1)}`,
        color,
        isBot: true,
        isMuted: true
      };
      state.players.push(botPlayer);
      ensurePlayerStatsEntry(state, botPlayer);
    });
    state.status = 'playing';
    state.botDifficulty = difficulty || 'medium';
    ensureTurnBelongsToActivePlayer(state);
    await redis.set(stateKey, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
    const currentTurnPlayer = state.players.find((player) => player.color === state.turn);
    if (currentTurnPlayer?.isBot) scheduleBotTurn(io, roomCode, state.botDifficulty, 1500);
  });

  socket.on(SOCKET_EVENTS.GAME_ROLL_DICE, async ({ roomCode, uid }) => {
    if (!roomCode || !uid) return;
    const stateKey = `room:${roomCode}`;
    const stateStr = await redis.get(stateKey);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    if (state.status !== 'playing' || state.winner || state.diceValue !== null) return;
    ensureTurnBelongsToActivePlayer(state);
    const currentPlayer = state.players.find((player) => player.color === state.turn);
    const isAllowed = currentPlayer && (currentPlayer.uid === uid || (currentPlayer.isLocal && state.host === uid));
    if (!isAllowed) return;

    const roll = crypto.randomInt(1, 7);
    incrementDiceRoll(state, currentPlayer, roll);

    state.consecutiveSixes = state.consecutiveSixes || 0;
    if (roll === 6) {
      state.consecutiveSixes += 1;
      if (state.consecutiveSixes >= 3) {
        state.consecutiveSixes = 0;
        state.diceValue = null;
        state.turn = getNextTurnColor(state, state.turn);
        ensureTurnBelongsToActivePlayer(state);
        await redis.set(stateKey, JSON.stringify(state));
        io.to(roomCode).emit(SOCKET_EVENTS.GAME_DICE_ROLLED, state);
        const nextPlayer = state.players.find((player) => player.color === state.turn);
        if (nextPlayer?.isBot) scheduleBotTurn(io, roomCode, state.botDifficulty || 'medium');
        return;
      }
    } else {
      state.consecutiveSixes = 0;
    }

    const currentTokens = state.tokens[state.turn];
    const hasValidMoves = currentTokens.some((token) => {
      if (token.position === -1) return roll === 6;
      return token.position + roll <= 56;
    });

    state.diceValue = roll;
    await redis.set(stateKey, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_DICE_ROLLED, state);
    if (!hasValidMoves) scheduleAutoPass(io, roomCode, roll);
  });

  socket.on(SOCKET_EVENTS.GAME_MOVE_TOKEN, async ({ roomCode, color, tokenIndex, uid }) => {
    if (!roomCode || !color || uid === undefined) return;
    const stateKey = `room:${roomCode}`;
    const stateStr = await redis.get(stateKey);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    if (state.status !== 'playing' || state.winner) return;
    ensureTurnBelongsToActivePlayer(state);
    if (state.turn !== color) return;
    const movingPlayer = state.players.find((player) => player.color === color);
    const isAllowed = movingPlayer && (movingPlayer.uid === uid || (movingPlayer.isLocal && state.host === uid));
    if (!isAllowed) return;

    const token = state.tokens[color][tokenIndex];
    const diceRoll = state.diceValue;
    if (!token || !diceRoll || !isValidMove(token, diceRoll)) return;

    if (token.position === -1) token.position = 0;
    else token.position += diceRoll;

    let getsExtraTurn = diceRoll === 6;
    const capture = isCapture(color, token.position, state.tokens);
    if (capture) {
      state.tokens[capture.color][capture.index].position = -1;
      getsExtraTurn = true;
      const capturedPlayer = state.players.find((player) => player.color === capture.color);
      recordCapture(state, movingPlayer, capturedPlayer);
      io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_JOINED, { type: 'capture', msg: `${color.charAt(0).toUpperCase() + color.slice(1)} captured ${capture.color}'s token!` });
      if (!movingPlayer.isBot) {
        state.captureCounts = state.captureCounts || {};
        state.captureCounts[movingPlayer.uid] = (state.captureCounts[movingPlayer.uid] || 0) + 1;
      }
    }

    if (token.position === 56) { getsExtraTurn = true; recordTokenHome(state, movingPlayer); }
    if (checkWinCondition(state.tokens[color])) {
      state.winner = color;
      if (!movingPlayer.isBot) recordActivity(io, movingPlayer.uid, 'win', { players: state.players.length });
      if (state.captureCounts) {
        state.players.filter((p) => !p.isBot && state.captureCounts[p.uid] > 0).forEach((p) => {
          recordActivity(io, p.uid, 'capture', { count: state.captureCounts[p.uid] });
        });
      }
    }

    if (!getsExtraTurn && !state.winner) {
      state.turn = getNextTurnColor(state, state.turn);
      state.consecutiveSixes = 0;
    } else if (getsExtraTurn && diceRoll !== 6) state.consecutiveSixes = 0;

    state.diceValue = null;
    ensureTurnBelongsToActivePlayer(state);
    await redis.set(stateKey, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
    const nextPlayer = state.players.find((player) => player.color === state.turn);
    if (!state.winner && nextPlayer?.isBot) scheduleBotTurn(io, roomCode, state.botDifficulty || 'medium');
  });

  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, async ({ roomCode, message, user }) => {
    if (!roomCode || !message || !user) return;
    await emitChatWithBlockFilter(io, roomCode, user.uid, {
      id: crypto.randomUUID(),
      uid: user.uid,
      sender: user.username || 'Player',
      color: user.color || 'gray',
      text: message,
      timestamp: Date.now(),
      eventName: SOCKET_EVENTS.CHAT_MESSAGE
    });
  });

  socket.on(SOCKET_EVENTS.GAME_REMATCH, async ({ roomCode }) => {
    if (!roomCode) return;
    const stateKey = `room:${roomCode}`;
    const stateStr = await redis.get(stateKey);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    state.winner = null;
    state.diceValue = null;
    state.consecutiveSixes = 0;
    state.status = 'playing';
    state.captureCounts = {};
    state.captureLog = [];
    state.diceHistory = [];
    state.playerStats = {};
    state.tokens = createEmptyTokens();
    state.players.forEach((player) => ensurePlayerStatsEntry(state, player));
    const firstHuman = state.players.find((player) => !player.isBot && !player.disconnected);
    state.turn = firstHuman ? firstHuman.color : getActiveTurnOrder(state)[0] || TURN_ORDER[0];
    ensureTurnBelongsToActivePlayer(state);
    await redis.set(stateKey, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
    const currentTurnPlayer = state.players.find((player) => player.color === state.turn);
    if (currentTurnPlayer?.isBot) scheduleBotTurn(io, roomCode, state.botDifficulty || 'medium', 1500);
  });

  socket.on(SOCKET_EVENTS.EMOTE_SEND, ({ roomCode, emoji, uid }) => {
    io.to(roomCode).emit(SOCKET_EVENTS.EMOTE_RECEIVED, { emoji, uid });
  });

  socket.on(SOCKET_EVENTS.GAME_TOGGLE_MIC, async ({ roomCode, uid, isMuted }) => {
    if (!roomCode || !uid) return;
    const stateKey = `room:${roomCode}`;
    const stateStr = await redis.get(stateKey);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    const player = state.players.find((entry) => entry.uid === uid);
    if (!player) return;
    player.isMuted = isMuted;
    await redis.set(stateKey, JSON.stringify(state));
    io.to(roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
  });

  socket.on(SOCKET_EVENTS.VOICE_JOIN, ({ roomCode, uid }) => {
    socket.to(roomCode).emit(SOCKET_EVENTS.VOICE_USER_JOINED, { uid });
  });

  socket.on(SOCKET_EVENTS.VOICE_SIGNAL, ({ roomCode, to, from, signal }) => {
    socket.to(roomCode).emit(SOCKET_EVENTS.VOICE_SIGNAL, { to, from, signal });
  });

  socket.on(SOCKET_EVENTS.GAME_PING, ({ uid, ts }) => {
    socket.emit(SOCKET_EVENTS.GAME_PONG, { uid, ts });
  });

  socket.on('disconnect', async () => {
    for (const [uid, info] of reconnectMap.entries()) {
      if (info.socketId !== socket.id) continue;

      clearScheduledBotTurn(info.roomCode);
      const stateStr = await redis.get(`room:${info.roomCode}`);
      if (!stateStr) { reconnectMap.delete(uid); break; }
      const state = JSON.parse(stateStr);
      const player = state.players.find((entry) => entry.uid === uid && !entry.isBot);
      if (!player) { reconnectMap.delete(uid); break; }

      if (state.status === 'waiting') {
        removePlayerFromWaitingRoom(state, uid);
        reconnectMap.delete(uid);
        if (!state.players.length) await redis.del(`room:${info.roomCode}`);
        else {
          await redis.set(`room:${info.roomCode}`, JSON.stringify(state));
          io.to(info.roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { type: 'left', msg: `${player.username} disconnected.` });
          io.to(info.roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
        }
        break;
      }

      player.disconnected = true;
      if (state.host === uid) state.host = state.players.find((entry) => !entry.isBot && !entry.disconnected)?.uid || state.host;
      if (state.turn === player.color) {
        state.diceValue = null;
        state.consecutiveSixes = 0;
        state.turn = getNextTurnColor(state, player.color);
      }
      ensureTurnBelongsToActivePlayer(state);
      await redis.set(`room:${info.roomCode}`, JSON.stringify(state));
      io.to(info.roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { type: 'left', msg: `${player.username} disconnected.` });
      io.to(info.roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, state);
      const nextPlayer = state.players.find((entry) => entry.color === state.turn);
      if (!state.winner && nextPlayer?.isBot && state.diceValue === null) scheduleBotTurn(io, info.roomCode, state.botDifficulty || 'medium');

      info.expiry = Date.now() + 30000;
      setTimeout(async () => {
        const reconnectEntry = reconnectMap.get(uid);
        if (!reconnectEntry || reconnectEntry.socketId !== socket.id) return;
        reconnectMap.delete(uid);
        const freshStateStr = await redis.get(`room:${info.roomCode}`);
        if (!freshStateStr) return;
        const freshState = JSON.parse(freshStateStr);
        const disconnectedPlayer = freshState.players.find((entry) => entry.uid === uid && !entry.isBot);
        if (!disconnectedPlayer) return;
        if (freshState.status === 'playing') {
          const takeover = convertPlayerToBot(freshState, uid);
          if (takeover) {
            if (freshState.turn === takeover.humanPlayer.color && freshState.diceValue !== null) {
              freshState.diceValue = null;
              freshState.consecutiveSixes = 0;
              freshState.turn = getNextTurnColor(freshState, takeover.humanPlayer.color);
            }
            ensureTurnBelongsToActivePlayer(freshState);
            await redis.set(`room:${info.roomCode}`, JSON.stringify(freshState));
            io.to(info.roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { type: 'left', msg: `${takeover.humanPlayer.username} did not return. ${takeover.botPlayer.username} took over.` });
            io.to(info.roomCode).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, freshState);
            const nextPlayerAfter = freshState.players.find((entry) => entry.color === freshState.turn);
            if (!freshState.winner && nextPlayerAfter?.isBot && freshState.diceValue === null) scheduleBotTurn(io, info.roomCode, freshState.botDifficulty || 'medium');
          }
        }
      }, 30000);
      break;
    }
  });
};