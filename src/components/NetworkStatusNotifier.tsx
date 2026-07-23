import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatusNotifier() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-4 ${
        isOnline
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          : 'bg-amber-950/90 border-amber-500/40 text-amber-200'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={14} className="text-emerald-400" />
          <span>Connection Restored (Online)</span>
        </>
      ) : (
        <>
          <WifiOff size={14} className="text-amber-400 animate-pulse" />
          <span>Offline Mode • Audio Simulator Ready</span>
        </>
      )}
    </div>
  );
}
