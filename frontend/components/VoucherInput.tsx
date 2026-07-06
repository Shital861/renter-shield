'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateVoucherCode } from '@/lib/api';
import { getRenterId } from '@/lib/storage';

interface VoucherInputProps {
  onRedeem: (code: string) => void;
}

export default function VoucherInput({ onRedeem }: VoucherInputProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'redeemed'>('idle');
  const [discount, setDiscount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if voucher was already redeemed in localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeemed = localStorage.getItem('rentershield_redeemed_voucher');
      if (redeemed) {
        setStatus('redeemed');
        setDiscount(localStorage.getItem('rentershield_redeemed_discount') || '50%');
      }
    }
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || status === 'loading') return;

    const trimmedCode = code.trim().toUpperCase();

    // Check if already used
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('rentershield_redeemed_code');
      if (savedCode === trimmedCode) {
        setStatus('redeemed');
        return;
      }
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await validateVoucherCode(trimmedCode);
      
      if (result.success) {
        setDiscount(result.discount);
        setStatus('success');
        
        // Save to storage
        if (typeof window !== 'undefined') {
          localStorage.setItem('rentershield_redeemed_voucher', 'true');
          localStorage.setItem('rentershield_redeemed_code', trimmedCode);
          localStorage.setItem('rentershield_redeemed_discount', result.discount);
        }

        // Notify chat of redemption
        onRedeem(trimmedCode);
      } else {
        setErrorMessage(result.error || 'Invalid voucher code.');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed.');
      setStatus('error');
    }
  };

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <Ticket className="h-5 w-5 text-[#1B4FD8]" />
        <h3 className="font-bold text-slate-900 text-sm">Use Voucher Code</h3>
      </div>

      {status === 'redeemed' ? (
        <div className="flex items-center gap-2.5 text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" />
          <span>Already used ({discount} Discount Active)</span>
        </div>
      ) : (
        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. LEGALAID50"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8] bg-slate-50/50 uppercase transition-all"
          />
          <button
            type="submit"
            disabled={!code.trim() || status === 'loading' || status === 'success'}
            className="rounded-xl bg-[#1B4FD8] hover:bg-[#1B4FD8]/95 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            {status === 'loading' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Redeem</span>
            )}
          </button>
        </form>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="mt-3.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
          <span>Success! Active Discount: {discount}</span>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="mt-3.5 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl font-semibold animate-shake">
          <XCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
          <span>Error: {errorMessage}</span>
        </div>
      )}
    </div>
  );
}
