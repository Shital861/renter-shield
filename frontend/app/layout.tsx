import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ShieldCheck, LayoutDashboard, History } from 'lucide-react';
import OfflineBanner from '@/components/OfflineBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'RenterShield | Tenant Advocacy Assistant',
  description: 'AI-powered tenant advocate to help you document issues and write professional letter drafts to landlords.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full bg-[#F8FAFC] font-sans antialiased', inter.variable)}>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>"
        />
      </head>
      <body className="flex min-h-full flex-col text-slate-900 bg-[#F8FAFC]">
        {/* Offline Warning Banner */}
        <OfflineBanner />

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* Logo & Private Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8] rounded-lg p-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B4FD8] text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                  Renter<span className="text-[#1B4FD8]">Shield</span>
                </span>
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                🔒 Private & Secure
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex items-center gap-1.5 sm:gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:translate-y-px outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/log"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:translate-y-px outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
              >
                <History className="h-4 w-4 text-slate-500" />
                <span>Incident Log</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[11px] leading-normal text-slate-400 max-w-xl mx-auto font-medium">
              This is legal information, not legal advice. RenterShield does not store your personal data.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
