import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Singleton socket instance — shared across all components
let globalSocket = null;

/**
 * Returns the singleton socket and a debounced emit helper (100 ms).
 * Prevents duplicate events on fast double-clicks.
 */
export const useSocket = () => {
  const [socket, setSocket] = useState(globalSocket);
  const emitTimers = useRef({});

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      globalSocket.on('connect', () => {
        if (import.meta.env.DEV) console.debug('[Socket] Connected:', globalSocket.id);
      });
      globalSocket.on('disconnect', (reason) => {
        if (import.meta.env.DEV) console.debug('[Socket] Disconnected:', reason);
      });
      globalSocket.on('connect_error', (err) => {
        if (import.meta.env.DEV) console.debug('[Socket] Connection error:', err.message);
      });
    }
    setSocket(globalSocket);
    // Don't disconnect on unmount — socket is a singleton
  }, []);

  /**
   * Debounced socket emit (100 ms per event key).
   * @param {string} event - Socket event name.
   * @param {*} data - Payload.
   * @param {number} [delay=100] - Debounce delay in ms.
   */
  const debouncedEmit = useCallback((event, data, delay = 100) => {
    if (!globalSocket) return;
    if (emitTimers.current[event]) clearTimeout(emitTimers.current[event]);
    emitTimers.current[event] = setTimeout(() => {
      globalSocket.emit(event, data);
      delete emitTimers.current[event];
    }, delay);
  }, []);

  return { socket, debouncedEmit };
};
