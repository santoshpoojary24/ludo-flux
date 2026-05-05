import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Music, Zap, MessageCircle, Bot, Clock, Mic, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const SettingsPanel = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useGameStore();

  const update = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="panel-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="panel-sheet bg-surface rounded-t-3xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-surface2"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              {/* Master Volume */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Volume2 size={18} /> Master Volume</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => update('masterVolume', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              {/* Background Music */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Music size={18} /> Background Music</div>
                <button
                  onClick={() => update('bgMusicEnabled', !settings.bgMusicEnabled)}
                  className={`px-4 py-1 rounded-full ${settings.bgMusicEnabled ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.bgMusicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Sound Effects */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Zap size={18} /> Sound Effects</div>
                <button
                  onClick={() => update('sfxEnabled', !settings.sfxEnabled)}
                  className={`px-4 py-1 rounded-full ${settings.sfxEnabled ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.sfxEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Bot Difficulty */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Bot size={18} /> Bot Difficulty</div>
                <select
                  value={settings.botDifficulty}
                  onChange={(e) => update('botDifficulty', e.target.value)}
                  className="px-3 py-1 rounded-xl bg-surface2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Auto-roll Dice */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><MessageCircle size={18} /> Auto-roll Dice</div>
                <button
                  onClick={() => update('autoRollDice', !settings.autoRollDice)}
                  className={`px-4 py-1 rounded-full ${settings.autoRollDice ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.autoRollDice ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Confirm Move */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Eye size={18} /> Confirm Move</div>
                <button
                  onClick={() => update('confirmMove', !settings.confirmMove)}
                  className={`px-4 py-1 rounded-full ${settings.confirmMove ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.confirmMove ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Show Valid Moves */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Eye size={18} /> Highlight Valid Moves</div>
                <button
                  onClick={() => update('showValidMoves', !settings.showValidMoves)}
                  className={`px-4 py-1 rounded-full ${settings.showValidMoves ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.showValidMoves ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Show Emotes */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Zap size={18} /> Show Emotes</div>
                <button
                  onClick={() => update('showEmotes', !settings.showEmotes)}
                  className={`px-4 py-1 rounded-full ${settings.showEmotes ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.showEmotes ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Show Chat In Game */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><MessageCircle size={18} /> In‑game Chat</div>
                <button
                  onClick={() => update('showChatInGame', !settings.showChatInGame)}
                  className={`px-4 py-1 rounded-full ${settings.showChatInGame ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.showChatInGame ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Turn Vibration */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Mic size={18} /> Turn Vibration</div>
                <button
                  onClick={() => update('turnVibration', !settings.turnVibration)}
                  className={`px-4 py-1 rounded-full ${settings.turnVibration ? 'bg-token-green' : 'bg-surface2'}`}
                >
                  {settings.turnVibration ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Voice Volume */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Mic size={18} /> Voice Volume</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.voiceVolume}
                  onChange={(e) => update('voiceVolume', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              {/* Turn Timer */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Clock size={18} /> Turn Timer (sec)</div>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.turnTimer}
                  onChange={(e) => update('turnTimer', parseInt(e.target.value))}
                  className="w-20 p-2 rounded-xl bg-surface2 text-center"
                />
              </div>
              
              <div className="pt-4 mt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    useGameStore.getState().logout();
                    onClose();
                  }}
                  className="w-full py-3 bg-token-red text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <X size={18} /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;