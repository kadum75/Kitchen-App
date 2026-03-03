import React, { useState } from 'react';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

interface PricingScreenProps {
  onDemo: () => void;
  onBack: () => void;
  message?: string;
}

export default function PricingScreen({ onDemo, onBack, message }: PricingScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');
    try {
      window.open('https://pay.gocardless.com/BRT0004M3FDSNEA', '_blank');
    } catch (err: any) {
      console.error(err);
      setError('Failed to start checkout. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a1628] flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center space-y-8 py-8">
        <div className="w-full flex justify-start">
          <button 
            onClick={onBack}
            className="text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">Simple, Honest Pricing</h1>
        </div>

        {message && (
          <div className="w-full bg-amber-500/10 border-2 border-amber-500 p-4 text-center">
            <p className="text-amber-500 font-black uppercase tracking-widest text-xs">{message}</p>
          </div>
        )}

        <div className="w-full bg-white/5 border-2 border-white/10 p-8 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#22c55e]" />
          
          <div className="text-center space-y-1">
            <h2 className="text-5xl font-black text-white tracking-tighter">£5<span className="text-xl text-slate-400 font-bold">/mo</span></h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">per premises</p>
          </div>

          <p className="text-center text-sm font-medium text-slate-300">
            Cancel anytime. No contracts. No hidden fees.
          </p>

          <div className="w-full space-y-4 py-4 border-y border-white/10">
            {[
              'Unlimited temperature logs',
              'Cleaning & waste records',
              'Expiry date tracking',
              'Food safety compliance ready'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#22c55e] flex-shrink-0" />
                <span className="text-slate-200 text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-400 font-black text-[10px] uppercase tracking-widest text-center animate-pulse">
              {error}
            </p>
          )}

          <div className="w-full space-y-2">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-4 bg-[#22c55e] text-white font-black uppercase tracking-widest text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Starting...
                </>
              ) : (
                'Start with Direct Debit'
              )}
            </button>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Cheaper than a pack of printer paper
            </p>
          </div>
        </div>

        <button
          onClick={onDemo}
          className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          Try Free for 14 Days — No Card Needed
        </button>
      </div>
    </div>
  );
}
