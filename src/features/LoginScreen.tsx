/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChefHat, Delete, X, Eye } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (pin: string) => void;
  onDemo: () => void;
}

export default function LoginScreen({ onLogin, onDemo }: LoginScreenProps) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleLogin = () => {
    if (pin.length === 4) {
      if (pin === '1234' || pin === '0000') {
        onLogin(pin);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        if (newAttempts >= 3) {
          setError('Incorrect PIN - please try again');
        } else {
          setError(`Incorrect PIN (${3 - newAttempts} attempts remaining)`);
        }
      }
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      // Auto-login attempt or wait for button? User asked for a button but also keypad logic.
      // Let's keep the button for explicit action as requested.
    }
  }, [pin]);

  return (
    <div className="fixed inset-0 bg-[#0f1f3d] flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
      <div className="w-full max-w-xs flex flex-col items-center space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-white/10 p-4 rounded-full">
            <ChefHat size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Kitchen Logs</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Food Safety Manager</p>
        </div>

        {/* PIN Display */}
        <div className="flex space-x-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-white transition-all duration-200 ${
                pin.length > i ? 'bg-white scale-125' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 font-black text-xs uppercase tracking-widest animate-bounce">
            {error}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="aspect-square bg-white/5 hover:bg-white/10 text-white text-2xl font-black rounded-full border-2 border-white/20 transition-all active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="aspect-square bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-full border-2 border-white/20 transition-all active:scale-95 flex items-center justify-center uppercase"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="aspect-square bg-white/5 hover:bg-white/10 text-white text-2xl font-black rounded-full border-2 border-white/20 transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="aspect-square bg-white/5 hover:bg-white/10 text-white text-2xl font-black rounded-full border-2 border-white/20 transition-all active:scale-95 flex items-center justify-center"
          >
            <Delete size={24} />
          </button>
        </div>

        <div className="w-full space-y-4 pt-4">
          <button
            onClick={handleLogin}
            disabled={pin.length !== 4}
            className={`w-full py-4 font-black uppercase tracking-widest text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${
              pin.length === 4 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Login as Staff
          </button>

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
            View Demo
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Demo mode uses sample data only</p>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Demo PINs: 1234 or 0000</p>
        </div>
      </div>
    </div>
  );
}
