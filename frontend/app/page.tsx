'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { StateCode, IssueType } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<StateCode | ''>('');
  const [issue, setIssue] = useState<IssueType | ''>('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !issue || !description.trim()) return;

    setIsLoading(true);

    // Save selected state, issue, and description to localStorage
    localStorage.setItem('rentershield_state', state);
    localStorage.setItem('rentershield_issue', issue);
    localStorage.setItem('rentershield_description', description.trim());

    // Navigate to /dashboard after a short timeout to simulate processing/loading feel
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  const isFormValid = state && issue && description.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] py-8 px-4 sm:px-6">
      <div className="w-full max-w-[480px] bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4FD8]/10 text-[#1B4FD8] mb-2 shadow-sm">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Know Your Rights as a Renter
          </h1>
          <p className="text-sm text-slate-600">
            Free, private legal guidance — no lawyer required
          </p>
        </div>

        {/* Privacy Badge */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-2 text-white text-xs font-semibold shadow-sm animate-pulse-subtle">
          <Lock className="h-3.5 w-3.5" />
          <span>Your data never leaves your device</span>
        </div>

        {/* Issue Selector Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* State Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="state" className="text-xs font-semibold text-slate-700">
              What state are you in?
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value as StateCode)}
              required
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8] transition-all cursor-pointer"
            >
              <option value="" disabled>Select your state</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="WA">Washington</option>
            </select>
          </div>

          {/* Issue Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="issue" className="text-xs font-semibold text-slate-700">
              What is the issue?
            </label>
            <select
              id="issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value as IssueType)}
              required
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8] transition-all cursor-pointer"
            >
              <option value="" disabled>Select the issue type</option>
              <option value="heating">Heating</option>
              <option value="mold">Mold</option>
              <option value="eviction">Eviction Notice</option>
              <option value="entry_notice">Landlord Entry</option>
              <option value="deposit">Security Deposit</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700">
              Describe your situation
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. My landlord hasn't fixed the heating for 3 weeks despite written requests"
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8] resize-none transition-all"
            />
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full rounded-xl bg-[#1B4FD8] hover:bg-[#1B4FD8]/95 disabled:opacity-50 text-white font-bold text-sm py-3 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Navigating to Dashboard...</span>
              </>
            ) : (
              <span>Get My Rights →</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] pt-4 text-center">
          <p className="text-[11px] leading-normal text-slate-400">
            This is legal information, not legal advice. Consult a licensed attorney for your specific situation.
          </p>
        </div>

      </div>
    </div>
  );
}
