'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerProps {
  onClose?: () => void;
}

export default function Disclaimer({ onClose }: DisclaimerProps) {
  return (
    <div className="relative flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="flex-1 text-sm text-slate-600">
        <h4 className="font-semibold text-slate-900 mb-1">Disclaimer</h4>
        <p className="leading-relaxed">
          RenterShield is an AI-powered assistant designed to help tenants generate draft letters and document rental issues. 
          The information and drafts provided do not constitute legal advice. For formal legal consultation, please contact 
          a licensed legal professional or local tenant union.
        </p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
