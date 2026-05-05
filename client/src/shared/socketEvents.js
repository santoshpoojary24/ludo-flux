// client/src/shared/socketEvents.js
// ESM re-export wrapper so client (Vite) can import SOCKET_EVENTS
// while the server uses the CJS version at shared/constants/socketEvents.js

const SOCKET_EVENTS = {
  // Room handling
  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',
  ROOM_LEAVE: 'room:leave',

  // Game flow
  GAME_START: 'game:start',
  GAME_DICE_ROLLED: 'game:dice_rolled',
  GAME_STATE_UPDATED: 'game:state_updated',
  GAME_FILL_BOTS: 'game:fill_bots',
  GAME_MOVE_TOKEN: 'game:move_token',
  GAME_ROLL_DICE: 'game:roll_dice',
  GAME_REMATCH: 'game:rematch',
  GAME_TOGGLE_MIC: 'game:toggle_mic',
  GAME_PING: 'game:ping',
  GAME_PONG: 'game:pong',

  // Player join/leave notifications
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',

  // Chat & emotes
  CHAT_MESSAGE: 'chat:message',
  EMOTE_SEND: 'emote:send',
  EMOTE_RECEIVED: 'emote:received',

  // Voice chat (WebRTC signaling)
  VOICE_JOIN: 'voice:join',
  VOICE_USER_JOINED: 'voice:user_joined',
  VOICE_SIGNAL: 'voice:signal',

  // Authentication & profile
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  PROFILE_AVATAR_UPDATED: 'profile:avatar_updated',
  PROFILE_STATUS_UPDATED: 'profile:status_updated',

  // Presence & friends
  PRESENCE_IDENTIFY: 'presence:identify',
  FRIEND_STATUS_CHANGE: 'friend:status_change',

  // Challenge
  CHALLENGE_SEND: 'challenge:send',
  CHALLENGE_INCOMING: 'challenge:incoming',
  CHALLENGE_ACCEPT: 'challenge:accept',
  CHALLENGE_ACCEPTED: 'challenge:accepted',
  CHALLENGE_DECLINE: 'challenge:decline',
  CHALLENGE_DECLINED: 'challenge:declined',
  CHALLENGE_EXPIRED: 'challenge:expired',
  CHALLENGE_SENT: 'challenge:sent'
};

export { SOCKET_EVENTS };
