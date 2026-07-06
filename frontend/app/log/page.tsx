'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ClipboardList, Info, ShieldAlert } from 'lucide-react';
import { getIncidentLog, getRenterId } from '@/lib/storage';
import { IncidentLog as IncidentLogType, IncidentEntry } from '@/lib/types';
import IncidentLogComponent from '@/components/IncidentLog';

export default function LogPage() {
  const [log, setLog] = useState<IncidentLogType | null>(null);

  useEffect(() => {
    const data = getIncidentLog();
    setLog(data);
  }, []);

  const entries = log?.entries || [];

  // Exporter to match the requested plain text format
  const handleExportText = () => {
    if (entries.length === 0) return;

    const renterId = getRenterId() || 'unknown';
    const dateStr = new Date().toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    let output = `RenterShield Incident Log\n`;
    output += `Generated: ${dateStr}\n`;
    output += `Renter ID: ${renterId}\n`;
    output += `─────────────────────────────\n`;

    // Sort entries chronologically for export
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedEntries.forEach((entry) => {
      const timestampIso = new Date(entry.timestamp).toISOString();
      output += `[${timestampIso}] - ${entry.description}\n`;
    });

    output += `─────────────────────────────\n`;
    output += `Total incidents: ${entries.length}\n`;
    output += `This is legal information, not legal advice.\n`;

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = `rentershield-letter-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Date formatter helpers
  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate earliest and latest timestamps
  let firstIncidentDate = '';
  let latestIncidentDate = '';
  if (entries.length > 0) {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    firstIncidentDate = formatShortDate(sorted[0].timestamp);
    latestIncidentDate = formatShortDate(sorted[sorted.length - 1].timestamp);
  }

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full py-4">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Your Incident Log
            </h1>
            <p className="text-xs text-slate-500">
              A timestamped record of your dispute
            </p>
          </div>
        </div>

        {entries.length > 0 && (
          <button
            onClick={handleExportText}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4FD8] hover:bg-[#1B4FD8]/95 px-3 py-2 text-xs font-bold text-white transition-colors shadow-sm cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Log (.txt)</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-[#E2E8F0] bg-white rounded-xl shadow-sm min-h-[350px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 mb-4">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            No incidents logged yet
          </h3>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
            Your paper trail will appear here as you log events in the chat
          </p>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4FD8] hover:bg-[#1B4FD8]/95 px-4 py-2.5 text-xs font-bold text-white transition-colors shadow-sm cursor-pointer">
              Go to Chat →
            </button>
          </Link>
        </div>
      ) : (
        /* Log Content */
        <div className="flex flex-col gap-6">
          
          {/* Summary Bar */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Logged
                </span>
                <span className="text-base font-extrabold text-[#1B4FD8] mt-0.5 block">
                  {entries.length} {entries.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  First Record
                </span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {firstIncidentDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Latest Record
                </span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {latestIncidentDate}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg">
              <Info className="h-4 w-4 text-[#1B4FD8] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This log can be used as evidence in legal proceedings. It preserves a chronological history of your landlord-tenant communications.
              </p>
            </div>
          </div>

          {/* Timeline List */}
          <IncidentLogComponent entries={entries} />

          {/* Bottom disclaimer footer */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-400">
              This is legal information, not legal advice. Consult a licensed attorney for your specific situation.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
