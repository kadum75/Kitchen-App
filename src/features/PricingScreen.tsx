/* Home button added */
import React, { useState } from 'react';
import { CheckCircle2, Loader2, ArrowLeft, Heart } from 'lucide-react';

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

  const handleStripeSubscribe = async () => {
    setIsLoading(true);
    setError('');
    try {
      const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/8x28wP81h1g75hucgG28806';
      window.open(stripeLink, '_blank');
    } catch (err: any) {
      console.error(err);
      setError('Failed to start checkout. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a1628] flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
      <button 
        onClick={onBack}
        className="fixed top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-black/70 transition-colors backdrop-blur-sm shadow-lg border border-white/10"
      >
        <ArrowLeft size={16} /> Home
      </button>

      <div className="w-full max-w-md flex flex-col items-center space-y-8 py-8 mt-12">
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

          <div className="w-full space-y-3">
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
            <button
              onClick={handleStripeSubscribe}
              disabled={isLoading}
              className="w-full py-4 bg-[#635BFF] text-white font-black uppercase tracking-widest text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Starting...
                </>
              ) : (
                'Start with Stripe'
              )}
            </button>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-1">
              Cheaper than a pack of printer paper
            </p>
          </div>

          <div className="w-full pt-6 mt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              <h3 className="text-sm font-black uppercase tracking-widest">Support Us</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.open(import.meta.env.VITE_STRIPE_DONATE_URL || 'https://buy.stripe.com/eVqfZh2GX9MD6lyeo028807', '_blank')}
                className="w-full py-3 bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
              >
                💳 Donate via Card
              </button>
              <button
                onClick={() => window.open(import.meta.env.VITE_GOCARDLESS_DONATE_URL || 'https://pay.gocardless.com/donate', '_blank')}
                className="w-full py-3 bg-blue-500 text-white font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
              >
                🏦 Donate via Direct Debit
              </button>
            </div>
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
