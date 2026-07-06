'use client';

import React from 'react';
import { Incident, IncidentEntry } from '@/lib/types';
import { Clock, CheckCircle, Hourglass, HelpCircle, ChevronRight, Check } from 'lucide-react';

interface IncidentLogProps {
  // Option A: Dashboard sidebar mode
  incidents?: Incident[];
  activeIncidentId?: string;
  onSelectIncident?: (incident: Incident) => void;

  // Option B: Log page timeline mode
  entries?: IncidentEntry[];
}

export default function IncidentLog({
  incidents,
  activeIncidentId,
  onSelectIncident,
  entries,
}: IncidentLogProps) {
  
  // Timeline format date helper: e.g. "July 5, 2026 at 2:34 PM"
  const formatTimelineDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' at ' +
      d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  };

  // Render Option B: Timeline Mode (Log Page)
  if (entries) {
    if (entries.length === 0) {
      return null; // Empty state is handled by the page wrapper
    }

    return (
      <div className="flex flex-col">
        {entries.map((entry, index) => (
          <div key={index} className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline vertical connector line */}
            {index < entries.length - 1 && (
              <div className="absolute left-[7px] top-[18px] bottom-0 w-[2px] bg-slate-200" />
            )}
            
            {/* Timeline indicator dot */}
            <div className="absolute left-0 top-[6px] h-4 w-4 rounded-full border-4 border-white bg-[#1B4FD8] ring-1 ring-slate-200" />
            
            {/* Incident Entry Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  {formatTimelineDate(entry.timestamp)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Check className="h-3 w-3" />
                  Logged
                </span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {entry.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render Option A: Dashboard List Mode
  if (incidents) {
    const getStatusIcon = (status: Incident['status']) => {
      switch (status) {
        case 'active':
          return <Clock className="h-4 w-4 text-[#1B4FD8]" />;
        case 'resolved':
          return <CheckCircle className="h-4 w-4 text-emerald-600" />;
        case 'pending':
          return <Hourglass className="h-4 w-4 text-amber-500" />;
        default:
          return <HelpCircle className="h-4 w-4 text-slate-400" />;
      }
    };

    const getStatusClass = (status: Incident['status']) => {
      switch (status) {
        case 'active':
          return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'resolved':
          return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'pending':
          return 'bg-amber-50 text-amber-700 border-amber-100';
        default:
          return 'bg-slate-50 text-slate-700 border-slate-100';
      }
    };

    if (incidents.length === 0) {
      return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-slate-500">
          <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 mb-1">No incidents logged yet</p>
          <p className="text-sm">Start a conversation with the assistant to document an issue.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {incidents.map((incident) => {
          const isActive = incident.id === activeIncidentId;
          const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident?.(incident)}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-[#1B4FD8] bg-[#1B4FD8]/5 shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isActive ? 'bg-[#1B4FD8]/10 border-[#1B4FD8]/20 text-[#1B4FD8]' : 'bg-slate-50 border-[#E2E8F0] text-slate-500'
              }`}>
                {getStatusIcon(incident.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {formattedDate}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getStatusClass(incident.status)}`}>
                    {incident.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 truncate group-hover:text-[#1B4FD8] transition-colors">
                  {incident.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {incident.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex h-5 w-5 items-center justify-center self-center text-slate-400 group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
