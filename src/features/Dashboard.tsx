/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { CleaningLog, TemperatureEntry, ExpiryItem, TASKS, WasteEntry, CorrectiveAction } from '../types';
import { AlertTriangle, CheckCircle2, Thermometer, Calendar, Trash2, ChevronRight, Clock, FileText, Printer, X } from 'lucide-react';

export default function Dashboard(props: { onNavigate: (tab: any) => void, key?: any }) {
  const { onNavigate } = props;
  const [cleaningStatus, setCleaningStatus] = useState(0);
  const [lastTemp, setLastTemp] = useState<TemperatureEntry | null>(null);
  const [expiredCount, setExpiredCount] = useState(0);
  const [wasteCount, setWasteCount] = useState(0);
  const [tempChecks, setTempChecks] = useState<{ morning: string; afternoon: string }>({ morning: 'Pending', afternoon: 'Pending' });
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const log = storageService.getCleaningLog(today);
    const completed = TASKS.filter(t => log.tasks[t]).length;
    setCleaningStatus(Math.round((completed / TASKS.length) * 100));

    const temps = storageService.getTemperatureLogs();
    const todayTemps = temps.filter(t => new Date(t.timestamp).toISOString().split('T')[0] === today);
    setLastTemp(temps.length > 0 ? temps[0] : null);

    // Check slots
    const now = new Date();
    const currentHour = now.getHours();
    
    const hasMorning = todayTemps.some(t => {
      const h = new Date(t.timestamp).getHours();
      return h < 12;
    });
    const hasAfternoon = todayTemps.some(t => {
      const h = new Date(t.timestamp).getHours();
      return h >= 12;
    });

    setTempChecks({
      morning: hasMorning ? 'Completed' : (currentHour >= 10 ? 'Overdue' : 'Pending'),
      afternoon: hasAfternoon ? 'Completed' : (currentHour >= 15 ? 'Overdue' : 'Pending')
    });

    const items = storageService.getExpiryItems();
    const expired = items.filter(i => new Date(i.expDate) < now).length;
    setExpiredCount(expired);

    const waste = storageService.getWasteEntries();
    const todayWaste = waste.filter(w => w.timestamp.startsWith(today)).length;
    setWasteCount(todayWaste);
  }, []);

  const generateReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const temps = storageService.getTemperatureLogs().filter(t => new Date(t.timestamp).toISOString().split('T')[0] === today);
    const cooking = storageService.getCookingLogs().filter(c => c.timestamp.startsWith(today));
    const actions = storageService.getCorrectiveActions().filter(a => a.timestamp.startsWith(today));
    const cleaning = storageService.getCleaningLog(today);
    const items = storageService.getExpiryItems();
    const waste = storageService.getWasteEntries().filter(w => w.timestamp.startsWith(today));
    
    const isCompliant = (t: string, v: number) => {
      if (t === 'FRIDGE') return v <= 8;
      if (t === 'FREEZER') return v <= -18;
      if (t === 'HOT_HOLD') return v >= 63;
      return true;
    };

    const report = `
KITCHEN LOGS - DAILY HACCP COMPLIANCE REPORT
Date: ${today}
Generated: ${new Date().toLocaleTimeString()}

TEMPERATURE CHECKS:
${temps.map(t => `- ${new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${t.type} (${t.equipmentNumber}) @ ${t.value}°C [${isCompliant(t.type, t.value) ? 'PASS' : 'FAIL'}]`).join('\n') || 'No readings logged today.'}

COOKING LOGS:
${cooking.map(c => `- ${new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${c.item} (${c.batch}) - Actual: ${c.actualTemp}°C (Target: ${c.targetTemp}°C) - ${c.status}`).join('\n') || 'No cooking logs today.'}

CCP BREACHES TODAY: ${temps.filter(t => !isCompliant(t.type, t.value)).length}
${actions.map(a => `- BREACH: ${a.ccpType} @ ${a.temperature ? a.temperature + '°C' : 'N/A'}. ACTION: ${a.action}. STAFF: ${a.staffName}${a.rootCause ? '\n  ROOT CAUSE: ' + a.rootCause : ''}${a.prevention ? '\n  PREVENTION: ' + a.prevention : ''}`).join('\n') || 'No breaches recorded.'}

CLEANING TASKS:
Completed: ${TASKS.filter(t => cleaning.tasks[t]).length} / ${TASKS.length}
Pending: ${TASKS.filter(t => !cleaning.tasks[t]).length}

EXPIRY ALERTS:
Expired: ${items.filter(i => new Date(i.expDate) < new Date()).length}
Expiring Today: ${items.filter(i => i.expDate === today).length}

WASTE LOG:
${waste.map(w => `- ${w.item}: ${w.quantity} (${w.reason})`).join('\n') || 'No waste logged today.'}

Compliance Status: ${temps.some(t => !isCompliant(t.type, t.value)) && actions.length < temps.filter(t => !isCompliant(t.type, t.value)).length ? 'ATTENTION REQUIRED' : 'COMPLIANT'}
---
    `;
    return report;
  };

  const cardBaseClass = "relative bg-slate-50 border-2 border-slate-900 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group";

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-slate-900 pb-2">
        Daily Overview
      </h2>

      {/* Temperature Check Reminders */}
      <div className="bg-slate-900 text-white p-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Clock size={14} className="text-emerald-400" />
          Temperature Checks Due
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 border-2 ${tempChecks.morning === 'Completed' ? 'border-emerald-500 bg-emerald-900/20' : tempChecks.morning === 'Overdue' ? 'border-red-500 bg-red-900/20' : 'border-slate-700 bg-slate-800'}`}>
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Morning (10:00)</p>
            <p className={`text-sm font-black uppercase ${tempChecks.morning === 'Completed' ? 'text-emerald-400' : tempChecks.morning === 'Overdue' ? 'text-red-400' : 'text-slate-400'}`}>
              {tempChecks.morning === 'Completed' ? '✓ Completed' : tempChecks.morning === 'Overdue' ? '⚠ Overdue' : 'Pending'}
            </p>
          </div>
          <div className={`p-3 border-2 ${tempChecks.afternoon === 'Completed' ? 'border-emerald-500 bg-emerald-900/20' : tempChecks.afternoon === 'Overdue' ? 'border-red-500 bg-red-900/20' : 'border-slate-700 bg-slate-800'}`}>
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Afternoon (15:00)</p>
            <p className={`text-sm font-black uppercase ${tempChecks.afternoon === 'Completed' ? 'text-emerald-400' : tempChecks.afternoon === 'Overdue' ? 'text-red-400' : 'text-slate-400'}`}>
              {tempChecks.afternoon === 'Completed' ? '✓ Completed' : tempChecks.afternoon === 'Overdue' ? '⚠ Overdue' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Cleaning Card */}
        <div 
          onClick={() => onNavigate('cleaning')}
          className={cardBaseClass}
          aria-label="View cleaning progress"
        >
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
          <ChevronRight className="absolute bottom-4 right-4 text-slate-300 group-hover:text-slate-900 transition-colors" size={20} />
        </div>

        {/* Temperature Card */}
        <div 
          onClick={() => onNavigate('temperature')}
          className={cardBaseClass}
          aria-label="View temperature logs"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Last Reading</span>
            <Thermometer className="text-slate-900" size={24} />
          </div>
          {lastTemp ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{lastTemp.value}°C</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-500 uppercase">{lastTemp.type}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400">{lastTemp.equipmentNumber}</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">
                Recorded {new Date(lastTemp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-slate-400 uppercase italic">No readings today</p>
          )}
          <ChevronRight className="absolute bottom-4 right-4 text-slate-300 group-hover:text-slate-900 transition-colors" size={20} />
        </div>

        {/* Expiry Card */}
        <div 
          onClick={() => onNavigate('expiry')}
          className={`${cardBaseClass} ${expiredCount > 0 ? 'bg-red-50' : 'bg-slate-50'}`}
          aria-label="View expiry alerts"
        >
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
          <ChevronRight className="absolute bottom-4 right-4 text-slate-300 group-hover:text-slate-900 transition-colors" size={20} />
        </div>

        {/* Waste Card */}
        <div 
          onClick={() => onNavigate('waste')}
          className="relative bg-violet-50 border-2 border-violet-800 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(76,29,149,1)] cursor-pointer transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgba(76,29,149,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(76,29,149,1)] group"
          aria-label="View waste logs"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-violet-600">Waste Logs</span>
            <span className="text-violet-800"><Trash2 size={24} /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-violet-900">{wasteCount}</span>
            <span className="text-sm font-bold text-violet-700 uppercase">Entries Today</span>
          </div>
          <ChevronRight className="absolute bottom-4 right-4 text-violet-300 group-hover:text-violet-800 transition-colors" size={20} />
        </div>
      </div>

      {/* Export Report Button */}
      <button
        onClick={() => setShowReport(true)}
        className="w-full bg-slate-900 text-white py-5 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
      >
        <FileText size={20} />
        Export Daily Report
      </button>

      <p className="text-[10px] text-slate-500 text-center mt-4 leading-tight">
        This app assists with kitchen record keeping. Always follow local food safety regulations. Do not claim compliance certification.
      </p>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-4 border-slate-900 flex justify-between items-center bg-slate-50">
              <h3 className="font-black uppercase tracking-tight">HACCP Daily Report</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-2 border-2 border-slate-900 bg-white hover:bg-slate-100">
                  <Printer size={20} />
                </button>
                <button onClick={() => setShowReport(false)} className="p-2 border-2 border-slate-900 bg-red-500 text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-xs whitespace-pre-wrap bg-white">
              {generateReport()}
            </div>
            <div className="p-4 border-t-4 border-slate-900 bg-slate-50">
              <button
                onClick={() => setShowReport(false)}
                className="w-full py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
