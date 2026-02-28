/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { TemperatureEntry, CorrectiveAction } from '../types';
import { Thermometer, Save, AlertCircle, CheckCircle, XCircle, ClipboardList, User, MessageSquare, X } from 'lucide-react';

export default function Temperature({ staffName, forceAddTrigger }: { staffName: string; forceAddTrigger?: number }) {
  const [type, setType] = useState<'FRIDGE' | 'FREEZER' | 'HOT_HOLD'>('FRIDGE');
  const [value, setValue] = useState<string>('');
  const [equipmentNumber, setEquipmentNumber] = useState<string>('');
  const [logs, setLogs] = useState<TemperatureEntry[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [haccpStatus, setHaccpStatus] = useState<{ safe: boolean; message: string; type: string; value: number } | null>(null);
  const [showCorrectiveModal, setShowCorrectiveModal] = useState(false);
  const equipmentRef = React.useRef<HTMLInputElement>(null);
  
  // Corrective Action Form
  const [caAction, setCaAction] = useState('Discarded food');
  const [caNotes, setCaNotes] = useState('');
  const [caStaff, setCaStaff] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (forceAddTrigger && forceAddTrigger > 0) {
      equipmentRef.current?.focus();
    }
  }, [forceAddTrigger]);

  const loadData = () => {
    setLogs(storageService.getTemperatureLogs());
    const today = new Date().toISOString().split('T')[0];
    const allActions = storageService.getCorrectiveActions();
    setCorrectiveActions(allActions.filter(a => a.timestamp.startsWith(today)));
  };

  const checkHaccp = (t: 'FRIDGE' | 'FREEZER' | 'HOT_HOLD', v: number) => {
    if (t === 'FRIDGE') {
      if (v > 8) return { safe: false, message: '⚠️ CCP BREACH: Fridge temperature exceeds 8°C limit. Corrective action: Adjust fridge immediately. Discard any high-risk food held above 8°C for more than 4 hours. Log corrective action.' };
      return { safe: true, message: '✓ SAFE: Temperature within HACCP limits' };
    }
    if (t === 'FREEZER') {
      if (v > -18) return { safe: false, message: '⚠️ CCP BREACH: Freezer above -18°C. Corrective action: Adjust freezer. Discard soft/thawed food.' };
      return { safe: true, message: '✓ SAFE: Temperature within HACCP limits' };
    }
    if (t === 'HOT_HOLD') {
      if (v < 63) return { safe: false, message: '⚠️ CCP BREACH: Hot hold below 63°C. Corrective action: Reheat to 70°C for 2 minutes or discard food held below 63°C for more than 2 hours.' };
      return { safe: true, message: '✓ SAFE: Temperature within HACCP limits' };
    }
    return null;
  };

  const isCompliant = (t: string, v: number) => {
    if (t === 'FRIDGE') return v <= 8;
    if (t === 'FREEZER') return v <= -18;
    if (t === 'HOT_HOLD') return v >= 63;
    return true;
  };

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError('Enter a valid number');
      return;
    }

    if (!equipmentNumber.trim()) {
      setError('Equipment number is required');
      return;
    }

    const status = checkHaccp(type, numValue);
    setHaccpStatus(status ? { ...status, type, value: numValue } : null);

    const entry: TemperatureEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      value: numValue,
      equipmentNumber: equipmentNumber.trim()
    };

    storageService.saveTemperatureEntry(entry);
    loadData();
    setValue('');
    setEquipmentNumber('');
    setError(null);
  };

  const handleSaveCorrectiveAction = () => {
    if (!caStaff) {
      alert('Staff name is required');
      return;
    }
    if (!haccpStatus) return;

    const action: CorrectiveAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ccpType: haccpStatus.type as any,
      temperature: haccpStatus.value,
      action: caAction,
      notes: caNotes,
      staffName: caStaff
    };

    storageService.saveCorrectiveAction(action);
    loadData();
    setShowCorrectiveModal(false);
    setHaccpStatus(null);
    setCaNotes('');
    setCaStaff('');
  };

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-slate-900 pb-2">
        Temperature Log
      </h2>

      {/* HACCP Alert Banner */}
      {haccpStatus && (
        <div className={`p-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top duration-300 ${haccpStatus.safe ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <div className="flex items-start gap-3">
            {haccpStatus.safe ? <CheckCircle className="text-emerald-600 shrink-0" size={24} /> : <AlertCircle className="text-red-600 shrink-0" size={24} />}
            <div className="space-y-3">
              <p className={`font-bold text-sm leading-tight ${haccpStatus.safe ? 'text-emerald-800' : 'text-red-800'}`}>
                {haccpStatus.message}
              </p>
              {!haccpStatus.safe && (
                <button 
                  onClick={() => setShowCorrectiveModal(true)}
                  className="bg-red-600 text-white px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                >
                  Log Corrective Action
                </button>
              )}
              {haccpStatus.safe && (
                <button 
                  onClick={() => setHaccpStatus(null)}
                  className="text-emerald-800 text-[10px] font-black uppercase underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-slate-50 border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex border-2 border-slate-900 mb-6">
          <button
            onClick={() => setType('FRIDGE')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-xs ${type === 'FRIDGE' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
          >
            Fridge
          </button>
          <button
            onClick={() => setType('FREEZER')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-xs border-x-2 border-slate-900 ${type === 'FREEZER' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
          >
            Freezer
          </button>
          <button
            onClick={() => setType('HOT_HOLD')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-xs ${type === 'HOT_HOLD' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
          >
            Hot Hold
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Equipment Number</label>
            <input
              ref={equipmentRef}
              type="text"
              value={equipmentNumber}
              onChange={(e) => setEquipmentNumber(e.target.value)}
              placeholder="e.g. FRIDGE-01"
              className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </div>

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

      {/* Corrective Actions Section */}
      {correctiveActions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-red-600">
            <ClipboardList size={20} />
            Today's Corrective Actions
          </h3>
          <div className="space-y-3">
            {correctiveActions.map(ca => (
              <div key={ca.id} className="bg-red-50 border-2 border-red-200 p-4 shadow-[3px_3px_0px_0px_rgba(220,38,38,0.1)]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 border border-slate-900">
                    {ca.ccpType} @ {ca.temperature}°C
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(ca.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="font-black text-sm uppercase mb-1">{ca.action}</p>
                {ca.notes && <p className="text-xs text-slate-600 italic mb-2">"{ca.notes}"</p>}
                {ca.rootCause && (
                  <p className="text-[10px] font-bold text-red-800 uppercase mb-1">
                    <span className="opacity-50">Root Cause:</span> {ca.rootCause}
                  </p>
                )}
                {ca.prevention && (
                  <p className="text-[10px] font-bold text-emerald-800 uppercase mb-2">
                    <span className="opacity-50">Prevention:</span> {ca.prevention}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                  <User size={12} />
                  Logged by: {ca.staffName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <Thermometer size={20} />
          Recent Logs
        </h3>
        <div className="space-y-2">
          {logs.map(log => {
            const compliant = isCompliant(log.type, log.value);
            return (
              <div key={log.id} className="flex items-center justify-between p-4 border-2 border-slate-900 bg-white">
                <div className="flex items-center gap-3">
                  {compliant ? <CheckCircle className="text-emerald-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                  <div>
                    <span className="font-black text-xl">{log.value}°C</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase bg-slate-100 px-1.5 py-0.5 border border-slate-300 text-slate-600">
                        {log.equipmentNumber}
                      </span>
                      {log.location && (
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          @ {log.location}
                        </span>
                      )}
                      {log.item && (
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          - {log.item}
                        </span>
                      )}
                    </div>
                    {log.action && (
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">
                        Action: {log.action}
                      </p>
                    )}
                    {log.staffName && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase mt-1">
                        <User size={10} /> {log.staffName}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <p className="text-center py-8 text-slate-400 font-bold uppercase italic">No logs yet</p>
          )}
        </div>
      </div>

      {/* Corrective Action Modal */}
      {showCorrectiveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border-4 border-slate-900 p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => {
                setShowCorrectiveModal(false);
                setCaNotes('');
                setCaStaff('');
                setCaAction('Discarded food');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 border-b-4 border-slate-900 pb-2">
              Log Corrective Action
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Action Taken</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Discarded food', 'Adjusted equipment', 'Moved food to another unit', 'Reheated to 70°C', 'Other'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setCaAction(opt)}
                      className={`text-left p-3 text-xs font-bold border-2 border-slate-900 transition-all ${caAction === opt ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Additional Notes</label>
                <textarea
                  value={caNotes}
                  onChange={(e) => setCaNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 border-2 border-slate-900 font-bold text-sm focus:outline-none"
                  placeholder="e.g. Fridge door was left ajar..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Staff Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={caStaff}
                    onChange={(e) => setCaStaff(e.target.value)}
                    className="w-full p-3 pl-10 border-2 border-slate-900 font-bold text-sm focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCorrectiveModal(false);
                    setCaNotes('');
                    setCaStaff('');
                    setCaAction('Discarded food');
                  }}
                  className="flex-1 py-3 font-black uppercase tracking-widest text-xs border-2 border-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCorrectiveAction}
                  className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  Save Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
