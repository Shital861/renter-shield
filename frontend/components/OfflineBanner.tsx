'use client';

import React, { useState, useEffect } from 'react';
import { checkHealth } from '@/lib/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const verifyHealth = async () => {
    setIsChecking(true);
    const ok = await checkHealth();
    setIsOffline(!ok);
    setIsChecking(false);
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  if (!isOffline) return null;

  return (
    <div className="w-full bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md sticky top-0 z-50 animate-fade-in">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
        <span>Agent offline — please try again</span>
      </div>
      <button
        onClick={verifyHealth}
        disabled={isChecking}
        className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 active:translate-y-px rounded px-2.5 py-1 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        <span>Retry</span>
      </button>
    </div>
  );
}
