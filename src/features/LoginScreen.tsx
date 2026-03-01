/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChefHat, Eye, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onDemo: () => void;
}

export default function LoginScreen({ onDemo }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1f3d] flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
      <div className="w-full max-w-xs flex flex-col items-center space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-white/10 p-4 rounded-full">
            <ChefHat size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">KLOGS</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Food Safety Manager</p>
        </div>

        {isSent ? (
          <div className="w-full bg-emerald-500/10 border-2 border-emerald-500 p-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Check your inbox</h2>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              We've sent a magic login link to <span className="text-white font-bold">{email}</span>. Click the link to sign in.
            </p>
            <button 
              onClick={() => setIsSent(false)}
              className="text-emerald-400 text-xs font-black uppercase tracking-widest hover:underline"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border-2 border-white/20 rounded-none py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 font-black text-[10px] uppercase tracking-widest text-center animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Magic Link
                </>
              )}
            </button>
          </form>
        )}

        <div className="w-full space-y-4 pt-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="h-px bg-white/20 flex-1" />
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">or</span>
            <div className="h-px bg-white/20 flex-1" />
          </div>

          <button
            onClick={onDemo}
            className="w-full py-4 bg-transparent text-white font-black uppercase tracking-widest text-sm border-2 border-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            Continue in Demo Mode
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Demo mode uses sample data only</p>
        </div>
      </div>
    </div>
  );
}
