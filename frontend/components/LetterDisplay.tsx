'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, Download, Mail, Scale } from 'lucide-react';

interface LetterDisplayProps {
  text?: string;
  letter?: { content: string } | null;
}

export default function LetterDisplay({ text, letter }: LetterDisplayProps) {
  const [copied, setCopied] = useState(false);

  const rawContent = text || letter?.content || '';

  if (!rawContent) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-slate-500 h-full flex flex-col justify-center items-center min-h-[300px]">
        <FileText className="h-12 w-12 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-900 mb-1">No Draft Generated Yet</p>
        <p className="text-sm max-w-xs">
          Provide issue details to the chat assistant to generate an official letter draft.
        </p>
      </div>
    );
  }

  // Detection logic: check if the text contains "Dear", "FORMAL LEGAL NOTICE", or "Date:" at the start of any line
  const lines = rawContent.split('\n');
  const isLetter = lines.some(line => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('Dear') ||
      trimmed.startsWith('FORMAL LEGAL NOTICE') ||
      trimmed.startsWith('Date:')
    );
  });

  if (!isLetter) {
    // Render as plain chat message
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex gap-3 items-start">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-[#1B4FD8]/20 bg-[#1B4FD8]/10 text-[#1B4FD8]">
          <Scale className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Agent Response</span>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{rawContent}</p>
        </div>
      </div>
    );
  }

  // Tone detection logic
  let tone: 'Friendly' | 'Formal' | 'Legal Notice' = 'Friendly';
  const lowerContent = rawContent.toLowerCase();

  if (rawContent.includes('FORMAL LEGAL NOTICE')) {
    tone = 'Legal Notice';
  } else if (lowerContent.includes('formally') || lowerContent.includes('be advised')) {
    tone = 'Formal';
  }

  // Tone badge style helper
  const getToneStyle = () => {
    switch (tone) {
      case 'Legal Notice':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Formal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Friendly':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  // Actions
  const handleCopy = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const element = document.createElement('a');
    const file = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `rentershield-letter-${dateStr}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const mailtoLink = `mailto:?subject=${encodeURIComponent(
    'RenterShield Demand Letter'
  )}&body=${encodeURIComponent(rawContent)}`;

  return (
    <div className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm h-full">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />
          <span className="font-bold text-slate-800 text-sm">Drafted Letter</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ml-2 ${getToneStyle()}`}>
            {tone}
          </span>
        </div>
      </div>

      {/* Letter Body */}
      <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto min-h-[250px]">
        <div 
          className="mx-auto max-w-2xl bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-8 text-sm sm:text-base text-slate-800 whitespace-pre-wrap leading-relaxed select-text"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
        >
          {rawContent}
        </div>
      </div>

      {/* Divider */}
      <div className="px-6">
        <hr className="border-[#E2E8F0]" />
        <p className="py-3 text-[11px] text-slate-400 italic text-center">
          Disclaimer: This is a generated letter draft for informational purposes. It is not formal legal advice. Please review carefully before sending.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-50/50 border-t border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 animate-scale-up" />
              <span className="text-emerald-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-500" />
              <span>Copy Letter</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Download as .txt</span>
        </button>

        <a
          href={mailtoLink}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          <Mail className="h-4 w-4 text-slate-500" />
          <span>Email Ready</span>
        </a>
      </div>

    </div>
  );
}
