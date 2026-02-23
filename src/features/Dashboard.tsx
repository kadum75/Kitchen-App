/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { CleaningLog, TemperatureEntry, ExpiryItem } from '../types';
import { AlertTriangle, CheckCircle2, Thermometer, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [cleaningStatus, setCleaningStatus] = useState(0);
  const [lastTemp, setLastTemp] = useState<TemperatureEntry | null>(null);
  const [expiredCount, setExpiredCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const log = storageService.getCleaningLog(today);
    const tasks = [
      'Food prep surfaces sanitized',
      'Floors cleaned',
      'Waste removed',
      'Fridges cleaned',
      'Equipment cleaned',
      'Hand wash stations stocked',
      'Thermometers checked'
    ];
    const completed = tasks.filter(t => log.tasks[t]).length;
    setCleaningStatus(Math.round((completed / tasks.length) * 100));

    const temps = storageService.getTemperatureLogs();
    setLastTemp(temps.length > 0 ? temps[0] : null);

    const items = storageService.getExpiryItems();
    const now = new Date();
    const expired = items.filter(i => new Date(i.expiryDate) < now).length;
    setExpiredCount(expired);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-slate-900 pb-2">
        Daily Overview
      </h2>

      <div className="grid gap-4">
        {/* Cleaning Card */}
        <div className="bg-slate-50 border-2 border-slate-900 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Cleaning Progress</span>
            <CheckCircle2 className={cleaningStatus === 100 ? 'text-emerald-600' : 'text-slate-400'} size={24} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{cleaningStatus}%</span>
            <span className="text-sm font-bold text-slate-500 uppercase">Complete</span>
          </div>
          <div className="mt-4 w-full bg-slate-200 h-4 border border-slate-900">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${cleaningStatus}%` }}
            />
          </div>
        </div>

        {/* Temperature Card */}
        <div className="bg-slate-50 border-2 border-slate-900 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Last Reading</span>
            <Thermometer className="text-slate-900" size={24} />
          </div>
          {lastTemp ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{lastTemp.value}°C</span>
                <span className="text-sm font-bold text-slate-500 uppercase">{lastTemp.type}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">
                Recorded {new Date(lastTemp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-slate-400 uppercase italic">No readings today</p>
          )}
        </div>

        {/* Expiry Card */}
        <div className={`border-2 border-slate-900 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${expiredCount > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Expiry Alerts</span>
            <AlertTriangle className={expiredCount > 0 ? 'text-red-600' : 'text-slate-400'} size={24} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${expiredCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{expiredCount}</span>
            <span className="text-sm font-bold text-slate-500 uppercase">Items Expired</span>
          </div>
          {expiredCount > 0 && (
            <p className="text-xs font-bold text-red-600 mt-2 uppercase animate-pulse">Action Required Immediately</p>
          )}
        </div>
      </div>
    </div>
  );
}
