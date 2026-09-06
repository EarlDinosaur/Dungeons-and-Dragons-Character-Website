'use client';

import React, { useState } from 'react';
import {
  Database,
  Cloud,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  Radio,
  Server,
  Sparkles,
} from 'lucide-react';
import { useCharacter } from '@/app/providers';

export default function SyncStatusBadge() {
  const { syncStatus, dbInfo, lastSyncedAt, forceSync } = useCharacter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    await forceSync();
    setTimeout(() => setIsSyncingManual(false), 600);
  };

  const copyEnvSnippet = () => {
    const text = `# Turso 100% Free Cloud SQLite (.env.local)\nDATABASE_URL="libsql://your-db-name-[user].turso.io"\nDATABASE_AUTH_TOKEN="your-secret-auth-token"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLastSynced = () => {
    if (!lastSyncedAt) return 'Just now';
    const seconds = Math.floor((Date.now() - lastSyncedAt) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const isCloud = dbInfo?.isCloud;

  return (
    <>
      {/* Sleek Trigger Badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        type="button"
        title="Click to view database connection status and sync settings"
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 backdrop-blur-md cursor-pointer select-none bg-zinc-950/70 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 shadow-sm hover:shadow-md"
      >
        {/* Status Indicator Dot */}
        <span className="relative flex h-2 w-2">
          {syncStatus === 'syncing' || isSyncingManual ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          ) : syncStatus === 'offline' ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          )}
        </span>

        {/* Icon & Label */}
        {isCloud ? (
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
        ) : (
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
        )}

        <span className="text-zinc-300 font-mono tracking-tight hidden sm:inline">
          {syncStatus === 'syncing' || isSyncingManual
            ? 'Syncing...'
            : syncStatus === 'offline'
            ? 'Offline (Cached)'
            : isCloud
            ? 'Turso Cloud'
            : 'SQLite Live'}
        </span>

        {/* Subtle Refresh Indicator */}
        <RefreshCw
          className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors ${
            syncStatus === 'syncing' || isSyncingManual ? 'animate-spin text-amber-400' : ''
          }`}
        />
      </button>

      {/* Database & Sync Center Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex min-h-screen items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl my-auto max-h-[92vh] flex flex-col bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-wide text-zinc-100 flex items-center gap-2">
                    Database & Multi-User Sync
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    All character & party mutations reflect live across everyone&apos;s screens
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Card */}
            <div className="mt-5 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-400 font-medium">Driver:</span>
                  <span className="text-xs font-semibold text-zinc-200 font-mono">
                    {dbInfo?.driver || 'Local SQLite'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Synced {formatLastSynced()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                <span className="text-zinc-400">Target Location:</span>
                <span className="font-mono text-zinc-300 truncate max-w-[280px]">
                  {dbInfo?.url || 'file:dnd.db'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-zinc-400">Synced Characters & State:</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {dbInfo?.characterCount ?? 3} heroes / {(dbInfo?.campaignStateCount ?? 2)} campaign slices
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleManualSync}
                disabled={isSyncingManual}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingManual ? 'animate-spin' : ''}`} />
                {isSyncingManual ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            {/* Free Database Upgrade Section */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-sky-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-semibold text-sky-200">
                  How to host 100% Free on Turso Cloud
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                Want your party to connect from their phones or across the city without port forwarding?
                Turso offers <strong>9 GB free storage</strong> and 1 billion reads/month with zero maintenance.
              </p>

              <ol className="text-[11px] text-zinc-300 space-y-1.5 list-decimal list-inside mb-3">
                <li>
                  Sign up free at{' '}
                  <a
                    href="https://turso.tech"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    turso.tech <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>Create a database: <code className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-[10px] text-sky-300">turso db create dnd</code></li>
                <li>Paste the URL and auth token into your <code className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-[10px] text-amber-300">.env.local</code>:</li>
              </ol>

              {/* Code Snippet Box */}
              <div className="relative p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-300 leading-relaxed">
                <button
                  onClick={copyEnvSnippet}
                  className="absolute top-2 right-2 p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Copy snippet"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <div className="text-zinc-500"># .env.local</div>
                <div className="text-sky-300">DATABASE_URL=&quot;libsql://your-db-[user].turso.io&quot;</div>
                <div className="text-amber-300">DATABASE_AUTH_TOKEN=&quot;your_token_here&quot;</div>
              </div>
            </div>

            {/* Footer Close */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
