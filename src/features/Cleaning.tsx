/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { CleaningLog } from '../types';
import { CheckSquare, Square, History } from 'lucide-react';

const TASKS = [
  'Food prep surfaces sanitized',
  'Floors cleaned',
  'Waste removed',
  'Fridges cleaned',
  'Equipment cleaned',
  'Hand wash stations stocked',
  'Thermometers checked'
];

export default function Cleaning() {
  const [showHistory, setShowHistory] = useState(false);
  const [currentLog, setCurrentLog] = useState<CleaningLog>({
    date: new Date().toISOString().split('T')[0],
    tasks: {}
  });
  const [history, setHistory] = useState<CleaningLog[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentLog(storageService.getCleaningLog(today));
    setHistory(storageService.getAllCleaningLogs());
  }, []);

  const toggleTask = (task: string) => {
    const newTasks = { ...currentLog.tasks, [task]: !currentLog.tasks[task] };
    const newLog = { ...currentLog, tasks: newTasks };
    setCurrentLog(newLog);
    storageService.saveCleaningLog(newLog);
    setHistory(storageService.getAllCleaningLogs());
  };

  if (showHistory) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">History</h2>
          <button 
            onClick={() => setShowHistory(false)}
            className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1"
          >
            Back
          </button>
        </div>
        <div className="space-y-4">
          {history.map(log => (
            <div key={log.date} className="border-2 border-slate-900 p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-lg">{log.date}</span>
                <span className="text-xs font-bold uppercase bg-slate-200 px-2 py-1">
                  {Object.values(log.tasks).filter(Boolean).length} / {TASKS.length}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {TASKS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 border border-slate-900 ${log.tasks[TASKS[i]] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Daily Cleaning</h2>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 bg-slate-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <History size={20} />
        </button>
      </div>

      <div className="bg-slate-900 text-white p-4 mb-4">
        <p className="text-xs font-black uppercase tracking-widest opacity-70">Today's Date</p>
        <p className="text-xl font-black">{currentLog.date}</p>
      </div>

      <div className="space-y-3">
        {TASKS.map(task => (
          <button
            key={task}
            onClick={() => toggleTask(task)}
            className={`w-full flex items-center gap-4 p-4 border-2 border-slate-900 text-left transition-all active:translate-y-1 active:shadow-none ${
              currentLog.tasks[task] 
                ? 'bg-emerald-50 border-emerald-600 shadow-none' 
                : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {currentLog.tasks[task] ? (
              <CheckSquare className="text-emerald-600 shrink-0" size={28} />
            ) : (
              <Square className="text-slate-300 shrink-0" size={28} />
            )}
            <span className={`font-bold text-lg leading-tight ${currentLog.tasks[task] ? 'text-emerald-900' : 'text-slate-900'}`}>
              {task}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
