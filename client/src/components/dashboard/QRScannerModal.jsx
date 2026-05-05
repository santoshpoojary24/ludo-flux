import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode;
    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Success
            if (html5QrCode) {
              html5QrCode.stop().then(() => {
                html5QrCode.clear();
                onScanSuccess(decodedText);
              }).catch(err => console.error("Failed to stop scanner", err));
            }
          },
          (errorMessage) => {
            // Ignore parse errors as they happen constantly until a code is found
          }
        );
      } catch (err) {
        console.error("Error starting scanner", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, width: '90%', maxWidth: 400, boxShadow: 'var(--shadow-out)', position: 'relative' }}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface2)', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: 20, cursor: 'pointer', color: 'var(--text)', zIndex: 10 }}
        >
          &times;
        </button>
        <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', fontSize: 18, fontWeight: 900 }}>Scan Room QR Code</h3>
        <div id="reader" ref={scannerRef} style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}></div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Point your camera at a friend's screen
        </p>
      </motion.div>
    </div>
  );
};

export default QRScannerModal;
