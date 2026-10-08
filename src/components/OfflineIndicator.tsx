import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-18 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#FF9600] px-4 py-2.5 text-xs font-black text-white shadow-xl border-2 border-white animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Cached lessons and Sagelo dictionary available!</span>
    </div>
  );
};
