/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { CleaningLog, TASKS } from '../types';
import { CheckSquare, Square, History } from 'lucide-react';

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
    
    const allLogs = storageService.getAllCleaningLogs();
    const historyWithoutToday = allLogs.filter(log => log.date !== today);
    const todayLog = allLogs.find(log => log.date === today) || { date: today, tasks: {} };
    
    setHistory([todayLog, ...historyWithoutToday]);
  }, []);

  const toggleTask = (task: string) => {
    const newTasks = { ...currentLog.tasks, [task]: !currentLog.tasks[task] };
    const newLog = { ...currentLog, tasks: newTasks };
    setCurrentLog(newLog);
    storageService.saveCleaningLog(newLog);
    
    const today = new Date().toISOString().split('T')[0];
    const allLogs = storageService.getAllCleaningLogs();
    const historyWithoutToday = allLogs.filter(log => log.date !== today);
    setHistory([newLog, ...historyWithoutToday]);
  };

  if (showHistory) {
    const today = new Date().toISOString().split('T')[0];
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
            <div key={log.date} className="border-2 border-slate-900 p-5 bg-slate-50 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight">{log.date}</span>
                  {log.date === today && (
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-1 rounded-md tracking-widest">TODAY</span>
                  )}
                </div>
                <span className="text-xs font-black uppercase bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
                  {Object.values(log.tasks).filter(Boolean).length} / {TASKS.length}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {TASKS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2.5 border border-slate-900 rounded-sm ${log.tasks[TASKS[i]] ? 'bg-emerald-500' : 'bg-slate-200'}`}
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
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Daily Cleaning</h2>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 bg-slate-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <History size={20} />
        </button>
      </div>

      <div className="bg-slate-900 text-white p-6 mb-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-black uppercase tracking-widest opacity-70">Today's Date</p>
        <p className="text-2xl font-black tracking-tight">{currentLog.date}</p>
      </div>

      <div className="space-y-4">
        {TASKS.map(task => (
          <button
            key={task}
            onClick={() => toggleTask(task)}
            className={`w-full flex items-center gap-4 p-5 border-2 border-slate-900 rounded-2xl text-left transition-all active:translate-y-1 active:shadow-none min-h-[72px] ${
              currentLog.tasks[task] 
                ? 'bg-emerald-50 border-emerald-600 shadow-none' 
                : 'bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {currentLog.tasks[task] ? (
              <CheckSquare className="text-emerald-600 shrink-0" size={32} />
            ) : (
              <Square className="text-slate-300 shrink-0" size={32} />
            )}
            <span className={`font-black text-lg leading-tight uppercase tracking-tight ${currentLog.tasks[task] ? 'text-emerald-900' : 'text-slate-900'}`}>
              {task}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
