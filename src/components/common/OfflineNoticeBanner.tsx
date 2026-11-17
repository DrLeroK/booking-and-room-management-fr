'use client';

import { useState, useEffect } from 'react';
import { OfflineSyncManager, OfflineMutation } from '@/lib/offline-sync';
import { ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon, WifiIcon } from '@heroicons/react/24/outline';

export function OfflineNoticeBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      if (!offline) {
        setJustReconnected(true);
        triggerSync();
        setTimeout(() => setJustReconnected(false), 5000);
      }
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const unsubscribe = OfflineSyncManager.subscribe((mutations: OfflineMutation[]) => {
      setPendingCount(mutations.filter((m) => m.status === 'PENDING' || m.status === 'SYNCING').length);
      setConflictCount(mutations.filter((m) => m.status === 'CONFLICT').length);
    });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      unsubscribe();
    };
  }, []);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      await OfflineSyncManager.syncQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOffline && !justReconnected && pendingCount === 0 && conflictCount === 0) {
    return null;
  }

  // 1. OFFLINE WARNING STATE
  if (isOffline) {
    return (
      <aside aria-label="Offline Mode Alert" className="bg-amber-500 text-slate-950 px-4 py-3 shadow-lg border-b-2 border-amber-600 sticky top-0 z-50 animate-pulse-subtle">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-1.5 bg-amber-950 text-amber-300 rounded-lg shrink-0 mt-0.5">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </span>
            <div>
              <div className="font-extrabold text-sm md:text-base tracking-wide flex items-center gap-2">
                <span>OFFLINE MODE: Room inventory is unconfirmed. Only assign rooms from the Emergency Offline Pool.</span>
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-900 mt-0.5">
                ⚠️ Warning: Do not sell the last remaining room without manager verification. All changes are being saved locally in your outbox.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {pendingCount > 0 && (
              <span className="bg-amber-950 text-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                {pendingCount} action{pendingCount > 1 ? 's' : ''} queued
              </span>
            )}
            <span className="bg-amber-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
              No Internet
            </span>
          </div>
        </div>
      </aside>
    );
  }

  // 2. RECONNECTED / SYNCING STATE
  if (justReconnected || isSyncing) {
    return (
      <aside aria-label="Syncing Status" className="bg-blue-600 text-white px-4 py-2.5 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiIcon className="h-5 w-5 text-blue-200" />
            <span className="text-sm font-semibold">
              Connection restored! Synchronizing offline actions with server...
            </span>
          </div>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="text-xs bg-white text-blue-700 font-bold px-3 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </aside>
    );
  }

  // 3. CONFLICT ALERT STATE
  if (conflictCount > 0) {
    return (
      <aside aria-label="Sync Conflict Alert" className="bg-red-600 text-white px-4 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-200 shrink-0" />
            <span className="text-sm font-medium">
              ⚠️ Attention: {conflictCount} action encountered an inventory conflict while offline (e.g. room was reserved online). Please review your desk queue.
            </span>
          </div>
          <button
            onClick={triggerSync}
            className="text-xs bg-white text-red-700 font-bold px-3 py-1 rounded hover:bg-red-50"
          >
            Retry Sync
          </button>
        </div>
      </aside>
    );
  }

  return null;
}
