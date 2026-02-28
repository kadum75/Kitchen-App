/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { CookingEntry } from '../types';
import { Flame, Save, CheckCircle, XCircle, Clock, User, Hash, Thermometer } from 'lucide-react';

export default function Cooking({ forceAddTrigger }: { forceAddTrigger?: number }) {
  const [logs, setLogs] = useState<CookingEntry[]>([]);
  const [item, setItem] = useState('');
  const [batch, setBatch] = useState('');
  const [targetTemp, setTargetTemp] = useState('75');
  const [actualTemp, setActualTemp] = useState('');
  const [probe, setProbe] = useState('Probe P-01');
  const [operator, setOperator] = useState('');
  const [status, setStatus] = useState('Released for service');
  const itemRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (forceAddTrigger && forceAddTrigger > 0) {
      itemRef.current?.focus();
    }
  }, [forceAddTrigger]);

  const loadLogs = () => {
    setLogs(storageService.getCookingLogs());
  };

  const handleSave = () => {
    if (!item || !batch || !actualTemp || !operator) {
      alert('Please fill in all required fields');
      return;
    }

    const entry: CookingEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      item,
      batch,
      targetTemp: parseFloat(targetTemp),
      actualTemp: parseFloat(actualTemp),
      probe,
      operator,
      status
    };

    storageService.saveCookingEntry(entry);
    loadLogs();
    
    // Reset form
    setItem('');
    setBatch('');
    setActualTemp('');
    setOperator('');
    setStatus('Released for service');
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-slate-900 pb-2">
        Cooking Logs
      </h2>

      {/* Input Form */}
      <div className="bg-slate-50 border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Food Item</label>
            <input
              ref={itemRef}
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Chicken Curry"
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Batch Number</label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="e.g. Batch CC-102"
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target Temp (°C)</label>
            <input
              type="number"
              value={targetTemp}
              onChange={(e) => setTargetTemp(e.target.value)}
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Actual Temp (°C)</label>
            <input
              type="number"
              value={actualTemp}
              onChange={(e) => setActualTemp(e.target.value)}
              placeholder="0.0"
              step="0.1"
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Probe ID</label>
            <input
              type="text"
              value={probe}
              onChange={(e) => setProbe(e.target.value)}
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Operator</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status / Action</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none bg-white"
          >
            <option>Released for service</option>
            <option>Returned to oven</option>
            <option>Discarded</option>
            <option>Blast chilled</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-orange-500 text-white py-4 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
        >
          <Save size={20} />
          Save Cooking Log
        </button>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <Flame size={20} className="text-orange-500" />
          Recent Cooking Logs
        </h3>
        <div className="space-y-3">
          {logs.map(log => {
            const isSafe = log.actualTemp >= log.targetTemp;
            return (
              <div key={log.id} className="bg-white border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black text-lg uppercase leading-tight">{log.item}</h4>
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-0.5 border border-slate-300 text-slate-600">
                      {log.batch}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-black text-xl ${isSafe ? 'text-emerald-600' : 'text-red-600'}`}>
                      {log.actualTemp}°C
                      {isSafe ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Target: {log.targetTemp}°C</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                    <Hash size={12} /> {log.probe}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                    <User size={12} /> {log.operator}
                  </div>
                </div>

                <div className={`p-2 border-2 text-[10px] font-black uppercase tracking-widest ${isSafe ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  Status: {log.status}
                </div>

                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <p className="text-center py-8 text-slate-400 font-bold uppercase italic">No cooking logs recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
