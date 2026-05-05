import { useEffect, useRef, useState } from 'react';
import { SOCKET_EVENTS } from '../shared/socketEvents.js';

/**
 * Lazy WebRTC voice chat hook.
 * Only initialises getUserMedia / RTCPeerConnection when `enabled` is true.
 *
 * @param {object|null} socket   - Socket.io socket instance.
 * @param {string|null} roomCode - Current room code.
 * @param {object|null} user     - Current authenticated user { uid }.
 * @param {boolean}     isMuted  - Whether mic should be muted.
 * @param {boolean}     enabled  - Set to true to activate voice (lazy init).
 * @param {number}      volume   - Remote audio volume 0–100.
 * @returns {{ isSpeaking: boolean }}
 */
export const useVoiceChat = (socket, roomCode, user, isMuted, enabled = false, volume = 80) => {
  const localStreamRef  = useRef(null);
  const peersRef        = useRef({});
  const analyserRef     = useRef(null);
  const rafRef          = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── Initialise / teardown when enabled flips ─────────────────────────────
  useEffect(() => {
    if (!enabled || !socket || !roomCode || !user) return;

    let active = true;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
        socket.emit(SOCKET_EVENTS.VOICE_JOIN, { roomCode, uid: user.uid });

        // ── Voice activity detection via AnalyserNode ──────────────────────
        try {
          const ctx      = new (window.AudioContext || window.webkitAudioContext)();
          const source   = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const data = new Uint8Array(analyser.frequencyBinCount);
          const THRESHOLD = 20; // 0-255 — tweak if needed

          const tick = () => {
            if (!active) return;
            analyser.getByteFrequencyData(data);
            const avg = data.reduce((s, v) => s + v, 0) / data.length;
            setIsSpeaking(avg > THRESHOLD);
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        } catch { /* AudioContext not available, skip indicator */ }
        // ──────────────────────────────────────────────────────────────────
      } catch (err) {
        if (import.meta.env.DEV) console.debug('[Voice] Mic error:', err);
      }
    };

    initAudio();

    /** @param {string} remoteUid */
    const createPeer = (remoteUid) => {
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      localStreamRef.current?.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });

      peer.onicecandidate = ({ candidate }) => {
        if (candidate)
          socket.emit(SOCKET_EVENTS.VOICE_SIGNAL, { roomCode, to: remoteUid, from: user.uid, signal: { candidate } });
      };

      peer.ontrack = (event) => {
        let el = document.getElementById(`audio-${remoteUid}`);
        if (!el) {
          el = document.createElement('audio');
          el.id = `audio-${remoteUid}`;
          el.autoplay = true;
          el.style.display = 'none';
          document.body.appendChild(el);
        }
        const stream = event.streams[0] || new MediaStream([event.track]);
        if (el.srcObject !== stream) {
          el.srcObject = stream;
          el.volume = volume / 100;
          el.play().catch(() => {});
        }
      };

      return peer;
    };

    const onUserJoined = async ({ uid }) => {
      if (uid === user.uid) return;
      const peer = createPeer(uid);
      peersRef.current[uid] = peer;
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit(SOCKET_EVENTS.VOICE_SIGNAL, { roomCode, to: uid, from: user.uid, signal: { type: 'offer', sdp: offer } });
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[Voice] Offer error:', e);
      }
    };

    const onSignal = async ({ to, from, signal }) => {
      if (to !== user.uid) return;
      if (signal.type === 'offer') {
        const peer = createPeer(from);
        peersRef.current[from] = peer;
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit(SOCKET_EVENTS.VOICE_SIGNAL, { roomCode, to: from, from: user.uid, signal: { type: 'answer', sdp: answer } });
        } catch (e) {
          if (import.meta.env.DEV) console.debug('[Voice] Answer error:', e);
        }
      } else if (signal.type === 'answer') {
        const peer = peersRef.current[from];
        if (peer) await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp)).catch(() => {});
      } else if (signal.candidate) {
        const peer = peersRef.current[from];
        if (peer) await peer.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
      }
    };

    socket.on(SOCKET_EVENTS.VOICE_USER_JOINED, onUserJoined);
    socket.on(SOCKET_EVENTS.VOICE_SIGNAL, onSignal);

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      setIsSpeaking(false);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      Object.values(peersRef.current).forEach(p => p.close());
      peersRef.current = {};
      socket.off(SOCKET_EVENTS.VOICE_USER_JOINED, onUserJoined);
      socket.off(SOCKET_EVENTS.VOICE_SIGNAL, onSignal);
      document.querySelectorAll('audio[id^="audio-"]').forEach(el => el.remove());
    };
  }, [enabled, socket, roomCode, user]); // only reinit when enabled/room/user changes

  // ── Mute toggle (no re-init required) ────────────────────────────────────
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
  }, [isMuted]);

  // ── Volume change ─────────────────────────────────────────────────────────
  useEffect(() => {
    document.querySelectorAll('audio[id^="audio-"]').forEach(el => {
      el.volume = Math.max(0, Math.min(1, volume / 100));
    });
  }, [volume]);

  return { isSpeaking };
};
