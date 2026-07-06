'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import VoucherInput from '@/components/VoucherInput';
import { getIncidentLog, getRenterId } from '@/lib/storage';
import { StateCode, IssueType, IncidentEntry } from '@/lib/types';
import { ShieldAlert, BookOpen, FileText, ClipboardList, Ticket, Info } from 'lucide-react';

export default function DashboardPage() {
  const [stateCode, setStateCode] = useState<StateCode | null>(null);
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [onboardingMessage, setOnboardingMessage] = useState<string | undefined>(undefined);
  const [triggerMessage, setTriggerMessage] = useState<{ text: string; timestamp: number } | null>(null);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [lastIncidents, setLastIncidents] = useState<IncidentEntry[]>([]);
  const [renterId, setRenterId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load user onboarding choices
      const savedState = localStorage.getItem('rentershield_state') as StateCode;
      const savedIssue = localStorage.getItem('rentershield_issue') as IssueType;
      const savedDesc = localStorage.getItem('rentershield_description');

      if (savedState) setStateCode(savedState);
      if (savedIssue) setIssueType(savedIssue);
      if (savedDesc) {
        setDescription(savedDesc);
        // Feed into initialMessage trigger
        setOnboardingMessage(savedDesc);
        // Clear onboarding description so it doesn't trigger on every page refresh
        localStorage.removeItem('rentershield_description');
      }

      // Load renter ID
      setRenterId(getRenterId());

      // Helper function to fetch preview of last 3 incident entries
      const loadLogPreview = () => {
        const log = getIncidentLog();
        if (log && log.entries) {
          const sorted = [...log.entries].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLastIncidents(sorted.slice(0, 3));
        } else {
          setLastIncidents([]);
        }
      };

      // Load initial preview
      loadLogPreview();

      // Listen for updates from other parts of the app
      window.addEventListener('storage', loadLogPreview);
      window.addEventListener('incident_logged', loadLogPreview);

      return () => {
        window.removeEventListener('storage', loadLogPreview);
        window.removeEventListener('incident_logged', loadLogPreview);
      };
    }
  }, []);

  // Map state code to readable string with flag emoji
  const getStateName = (code: StateCode | null) => {
    switch (code) {
      case 'CA':
        return '🇺🇸 California';
      case 'NY':
        return '🇺🇸 New York';
      case 'TX':
        return '🇺🇸 Texas';
      case 'FL':
        return '🇺🇸 Florida';
      case 'WA':
        return '🇺🇸 Washington';
      default:
        return '🇺🇸 Unknown';
    }
  };

  // Map issue type to badge style and title
  const getIssueBadge = (issue: IssueType | null) => {
    switch (issue) {
      case 'heating':
        return { label: 'Heating', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'mold':
        return { label: 'Mold', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'eviction':
        return { label: 'Eviction Notice', style: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'entry_notice':
        return { label: 'Landlord Entry', style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'deposit':
        return { label: 'Security Deposit', style: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'General', style: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Trigger quick messages to the chat assistant
  const handleQuickAction = (actionType: 'rights' | 'letter' | 'log') => {
    if (!stateCode || !issueType) return;
    
    let text = '';
    const badge = getIssueBadge(issueType);

    switch (actionType) {
      case 'rights':
        text = `What are my rights for ${badge.label.toLowerCase()} in ${getStateName(stateCode).replace('🇺🇸 ', '')}?`;
        break;
      case 'letter':
        text = `Draft a formal letter about my ${badge.label.toLowerCase()}`;
        break;
      case 'log':
        text = `Log this incident for my renter ID`;
        break;
    }

    setTriggerMessage({ text, timestamp: Date.now() });
  };

  const handleVoucherRedeem = (code: string) => {
    const text = `I have a voucher code ${code} for renter ID ${renterId}`;
    setTriggerMessage({ text, timestamp: Date.now() });
  };

  const issueBadge = getIssueBadge(issueType);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[500px]">
      
      {/* Left Column: ChatInterface (60% width equivalent) */}
      <div className="md:col-span-3 h-[500px] md:h-[calc(100vh-10rem)] min-w-0">
        <ChatInterface
          initialMessage={onboardingMessage}
          triggerMessage={triggerMessage}
        />
      </div>

      {/* Right Column: Summaries & Widgets (40% width equivalent) */}
      <div className="md:col-span-2 flex flex-col gap-6 overflow-y-auto md:h-[calc(100vh-10rem)] pr-1">
        
        {/* SECTION 1: Your Issue Summary Card */}
        {stateCode && issueType && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Your Issue Summary</h3>
              <Link href="/" className="text-xs font-semibold text-[#1B4FD8] hover:underline">
                Edit
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                {getStateName(stateCode)}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${issueBadge.style}`}>
                {issueBadge.label}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {description || 'No description provided.'}
            </p>
          </div>
        )}

        {/* SECTION 2: Quick Actions Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            
            {/* Check My Rights */}
            <button
              onClick={() => handleQuickAction('rights')}
              className="flex flex-col items-center justify-center text-center p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/50 hover:bg-[#1B4FD8]/5 hover:border-[#1B4FD8]/25 transition-all group cursor-pointer"
            >
              <BookOpen className="h-5 w-5 text-slate-500 group-hover:text-[#1B4FD8] mb-1.5 transition-colors" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1B4FD8] transition-colors">
                Check My Rights
              </span>
            </button>

            {/* Draft a Letter */}
            <button
              onClick={() => handleQuickAction('letter')}
              className="flex flex-col items-center justify-center text-center p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/50 hover:bg-[#1B4FD8]/5 hover:border-[#1B4FD8]/25 transition-all group cursor-pointer"
            >
              <FileText className="h-5 w-5 text-slate-500 group-hover:text-[#1B4FD8] mb-1.5 transition-colors" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1B4FD8] transition-colors">
                Draft a Letter
              </span>
            </button>

            {/* Log an Incident */}
            <button
              onClick={() => handleQuickAction('log')}
              className="flex flex-col items-center justify-center text-center p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/50 hover:bg-[#1B4FD8]/5 hover:border-[#1B4FD8]/25 transition-all group cursor-pointer"
            >
              <ClipboardList className="h-5 w-5 text-slate-500 group-hover:text-[#1B4FD8] mb-1.5 transition-colors" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1B4FD8] transition-colors">
                Log an Incident
              </span>
            </button>

            {/* Use Voucher */}
            <button
              onClick={() => setShowVoucherInput(!showVoucherInput)}
              className={`flex flex-col items-center justify-center text-center p-3 rounded-xl border transition-all group cursor-pointer ${
                showVoucherInput 
                  ? 'border-[#1B4FD8] bg-[#1B4FD8]/5' 
                  : 'border-[#E2E8F0] bg-slate-50/50 hover:bg-[#1B4FD8]/5 hover:border-[#1B4FD8]/25'
              }`}
            >
              <Ticket className={`h-5 w-5 mb-1.5 transition-colors ${
                showVoucherInput ? 'text-[#1B4FD8]' : 'text-slate-500 group-hover:text-[#1B4FD8]'
              }`} />
              <span className={`text-xs font-bold transition-colors ${
                showVoucherInput ? 'text-[#1B4FD8]' : 'text-slate-800 group-hover:text-[#1B4FD8]'
              }`}>
                Use Voucher
              </span>
            </button>

          </div>
        </div>

        {/* SECTION 4: Conditional VoucherInput component */}
        {showVoucherInput && (
          <VoucherInput onRedeem={handleVoucherRedeem} />
        )}

        {/* SECTION 3: Incident Log Preview Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Incident Log Preview</h3>
            {lastIncidents.length > 0 && (
              <Link href="/log" className="text-xs font-semibold text-[#1B4FD8] hover:underline">
                View Full Log →
              </Link>
            )}
          </div>

          {lastIncidents.length === 0 ? (
            <div className="flex flex-col items-center text-center py-4 px-2">
              <ClipboardList className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-700 mb-0.5">No incidents yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                Ask the agent to log your first incident to start building your record timeline evidence.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lastIncidents.map((inc, i) => (
                <div key={i} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#1B4FD8] shrink-0 mt-1.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      {new Date(inc.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <p className="text-slate-700 leading-relaxed truncate">
                      {inc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
