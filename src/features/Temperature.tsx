/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { TemperatureEntry } from '../types';
import { Thermometer, Save, AlertCircle } from 'lucide-react';

export default function Temperature() {
  const [type, setType] = useState<'FRIDGE' | 'FREEZER'>('FRIDGE');
  const [value, setValue] = useState('');
  const [logs, setLogs] = useState<TemperatureEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLogs(storageService.getTemperatureLogs());
  }, []);

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError('Enter a valid number');
      return;
    }

    // Validation
    if (type === 'FRIDGE' && (numValue < 0 || numValue > 5)) {
      setError('Fridge must be 0°C to 5°C');
      return;
    }
    if (type === 'FREEZER' && numValue > -18) {
      setError('Freezer must be ≤ -18°C');
      return;
    }

    const entry: TemperatureEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      value: numValue
    };

    storageService.saveTemperatureEntry(entry);
    setLogs(storageService.getTemperatureLogs());
    setValue('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-slate-900 pb-2">
        Temperature Log
      </h2>

      {/* Input Section */}
      <div className="bg-slate-50 border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex border-2 border-slate-900 mb-6">
          <button
            onClick={() => setType('FRIDGE')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-sm ${type === 'FRIDGE' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
          >
            Fridge
          </button>
          <button
            onClick={() => setType('FREEZER')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-sm ${type === 'FREEZER' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
          >
            Freezer
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.0"
              step="0.1"
              className="w-full text-6xl font-black p-4 border-2 border-slate-900 bg-white text-center focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
            <span className="absolute right-4 bottom-4 text-2xl font-black text-slate-400">°C</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 p-3 border border-red-200">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-emerald-600 text-white py-5 font-black uppercase tracking-widest text-xl flex items-center justify-center gap-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            <Save size={24} />
            Save Entry
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <Thermometer size={20} />
          Recent Logs
        </h3>
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-4 border-2 border-slate-900 bg-white">
              <div>
                <span className="font-black text-xl">{log.value}°C</span>
                <span className="ml-2 text-xs font-bold uppercase text-slate-500">{log.type}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center py-8 text-slate-400 font-bold uppercase italic">No logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
