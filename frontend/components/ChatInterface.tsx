'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Scale, Send, RefreshCw, Trash2, ArrowUp } from 'lucide-react';
import { sendMessage } from '@/lib/api';
import { clearSession } from '@/lib/storage';

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  initialMessage?: string;  // pre-populated from onboarding
  triggerMessage?: { text: string; timestamp: number } | null;
}

export default function ChatInterface({ initialMessage, triggerMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  // Auto-scroll to bottom on each new message or loading state change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Listen for triggerMessage from dashboard
  useEffect(() => {
    if (triggerMessage?.text) {
      handleSendText(triggerMessage.text);
    }
  }, [triggerMessage]);

  // Handle sending a message
  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMsg.content);
      const agentMsg: ChatMessage = {
        role: 'agent',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error('Error in send:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    handleSendText(msg);
  };

  // Trigger initialMessage on mount
  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSendText(initialMessage);
    }
  }, [initialMessage]);

  // Clears the active chat session
  const handleNewSession = () => {
    clearSession();
    setMessages([]);
    setIsLoading(false);
    setInput('');
    initialSentRef.current = false;
  };

  // Pre-fill input from quick action pills
  const handleQuickAction = (actionText: string) => {
    setInput(actionText);
  };

  // Parser to split disclaimer and legal information if present
  const renderAgentMessage = (content: string) => {
    const lowerContent = content.toLowerCase();
    const hasLegalInfo = lowerContent.includes('legal information');

    if (!hasLegalInfo) {
      return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>;
    }

    // Attempt to split content by double newlines
    const paragraphs = content.split('\n\n');
    const lastParagraph = paragraphs[paragraphs.length - 1];
    
    // If the last paragraph contains the legal information keywords, isolate it
    if (lastParagraph.toLowerCase().includes('legal information')) {
      const mainText = paragraphs.slice(0, -1).join('\n\n');
      return (
        <div className="flex flex-col gap-2">
          {mainText && <p className="leading-relaxed whitespace-pre-wrap">{mainText}</p>}
          <hr className="border-[#E2E8F0] my-1" />
          <p className="text-xs text-slate-500 italic leading-relaxed">
            {lastParagraph}
          </p>
        </div>
      );
    }

    // Fallback: If legal information is in the middle, render entire body + append legal disclaimer warning
    return (
      <div className="flex flex-col gap-2">
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        <hr className="border-[#E2E8F0] my-1" />
        <p className="text-xs text-slate-500 italic leading-relaxed">
          Disclaimer: This summary provides legal information and is not formal legal advice.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-slate-50/50 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4FD8]/10 text-[#1B4FD8]">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">RenterShield</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-[#059669]" />
              <span className="text-[10px] font-medium text-slate-500">Agent Active</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleNewSession}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-px transition-all shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        >
          <RefreshCw className="h-3 w-3" />
          <span>New Session</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC]/30 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4FD8]/10 text-[#1B4FD8] mb-4 animate-bounce">
              <Shield className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Welcome to RenterShield</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ask me about your tenant rights, how to draft repair notices, or upload lease documents for review.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAgent = msg.role === 'agent';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] sm:max-w-[80%] ${
                  isAgent ? 'self-start' : 'self-end flex-row-reverse'
                }`}
              >
                {/* Agent Icon */}
                {isAgent && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-[#1B4FD8]/20 bg-[#1B4FD8]/10 text-[#1B4FD8]">
                    <Scale className="h-4 w-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                  isAgent
                    ? 'bg-white border-[#E2E8F0] text-slate-800'
                    : 'bg-[#1B4FD8] border-[#1B4FD8]/25 text-white'
                }`}>
                  {isAgent ? (
                    renderAgentMessage(msg.content)
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span className={`block text-[9px] mt-1.5 text-right ${
                    isAgent ? 'text-slate-400' : 'text-white/70'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 self-start max-w-[80%]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1B4FD8]/20 bg-[#1B4FD8]/10 text-[#1B4FD8]">
              <Scale className="h-4 w-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white border border-[#E2E8F0] shadow-sm flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-[#E2E8F0] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        <button
          onClick={() => handleQuickAction('Draft a formal letter')}
          className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:translate-y-px transition-all shadow-sm cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        >
          Draft a formal letter
        </button>
        <button
          onClick={() => handleQuickAction('Log this incident')}
          className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:translate-y-px transition-all shadow-sm cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        >
          Log this incident
        </button>
        <button
          onClick={() => handleQuickAction('What are my rights?')}
          className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:translate-y-px transition-all shadow-sm cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        >
          What are my rights?
        </button>
        <button
          onClick={() => handleQuickAction('I have a voucher code')}
          className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:translate-y-px transition-all shadow-sm cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        >
          I have a voucher code
        </button>
      </div>

      {/* Input Area */}
      <form onSubmit={handleFormSubmit} className="border-t border-[#E2E8F0] p-3 sm:p-4 bg-white flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-[#E2E8F0] px-4 py-2.5 min-h-[44px] text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8] bg-slate-50/50 transition-all disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="rounded-xl h-11 w-11 p-0 bg-[#1B4FD8] hover:bg-[#1B4FD8]/90 active:translate-y-px disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FD8]"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
