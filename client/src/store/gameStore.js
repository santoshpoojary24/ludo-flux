// client/src/store/gameStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // User & Auth
      user: null,
      token: null,
      sessionId: null,

      // Game state
      roomCode: null,
      gameState: null,

      // Settings
      settings: {
        masterVolume: 80,
        bgMusicEnabled: false,
        sfxEnabled: true,
        autoRollDice: false,
        confirmMove: false,
        showEmotes: true,
        showChatInGame: true,
        showValidMoves: true,
        turnVibration: true,
        turnTimer: 30,
        botDifficulty: 'medium',
        voiceVolume: 80,
        theme: 'premium'
      },
      theme: 'premium',
      isSettingsOpen: false,

      // Local game (Pass & Play)
      localPlayers: null,

      // Cosmetics — persisted skin selections
      cosmetics: {
        diceSkin:  'classic',
        boardSkin: 'walnut',
        tokenSkin: 'jewel',
      },

      // Toasts (global notifications)
      toasts: [],


      // Actions
      setUser: (user, token, sessionId) => {
        localStorage.setItem('token', token);
        set({ user, token, sessionId });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null, token: null, sessionId: null, roomCode: null, gameState: null, localPlayers: null,
          cosmetics: { diceSkin: 'classic', boardSkin: 'walnut', tokenSkin: 'jewel' }
        });
      },

      updateUserCoins: (coins) => {
        set((state) => ({
          user: state.user ? { ...state.user, coins } : null
        }));
      },

      updateUserProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },

      setRoomCode: (code) => set({ roomCode: code, gameState: null }),

      setGameState: (state) => set({ gameState: state }),

      // Update roomCode AND gameState together (used when server resolves GLOBAL → GLOBAL-N)
      setRoomAndState: (state) => set({ roomCode: state.roomCode, gameState: state }),

      setLocalPlayers: (players) => set({ localPlayers: players }),

      // Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
        // Apply theme if changed
        if (newSettings.theme) {
          document.documentElement.setAttribute('data-theme', newSettings.theme);
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const themes = ['premium', 'clay', 'neon', 'minimal', 'forest', 'retro'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        set({ theme: nextTheme });
        document.documentElement.setAttribute('data-theme', nextTheme);
        get().updateSettings({ theme: nextTheme });
      },

      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      closeSettings: () => set({ isSettingsOpen: false }),

      // Cosmetics
      setCosmetic: (category, skinId) => {
        set((state) => ({
          cosmetics: { ...state.cosmetics, [category]: skinId }
        }));
      },



      // Reset game store (for cleanup / leaving game)
      resetGame: () => {
        set({ roomCode: null, gameState: null, localPlayers: null });
      },


      // Toasts
      addToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type, duration }]
        }));
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
          }));
        }, duration);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      },

      // Reset game store (for cleanup)
      resetGame: () => {
        set({ roomCode: null, gameState: null, localPlayers: null });
      }
    }),
    {
      name: 'ludo_flux_store',
      partialize: (state) => ({
      user: state.user ? {
          uid: state.user.uid,
          username: state.user.username,
          coins: state.user.coins,
          elo: state.user.elo,
          avatarConfig: state.user.avatarConfig || null
        } : null,
        token: state.token,
        sessionId: state.sessionId,
        settings: state.settings,
        theme: state.theme,
        cosmetics: state.cosmetics,
      })

    }
  )
);