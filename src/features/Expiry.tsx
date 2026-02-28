/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getExpiryEntries, saveExpiryEntry, deleteExpiryEntry } from '../storage/storageService';
import { ExpiryItem, ExpiryStatus } from '../types';
import { Plus, Trash2, Calendar, Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Expiry({ forceAddTrigger }: { forceAddTrigger?: number }) {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState('');
  const [prepDate, setPrepDate] = useState(new Date().toISOString().split('T')[0]);
  const [shelfLife, setShelfLife] = useState('3');
  const nameRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (forceAddTrigger && forceAddTrigger > 0) {
      setShowAdd(true);
      // Need a small timeout to wait for the form to render before focusing
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    }
  }, [forceAddTrigger]);

  const loadItems = () => {
    const savedItems = getExpiryEntries();
    // Re-calculate status on load to ensure it's up to date with current date
    const updatedItems = savedItems.map(item => ({
      ...item,
      status: calculateStatus(item.expDate)
    }));
    setItems(updatedItems);
  };

  const calculateStatus = (expDate: string): ExpiryStatus => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 1) return 'EXPIRES SOON';
    return 'ACTIVE';
  };

  const handleAdd = () => {
    if (!itemName) return;
    
    const prep = new Date(prepDate);
    const expiry = new Date(prep);
    expiry.setDate(prep.getDate() + parseInt(shelfLife));
    const expDate = expiry.toISOString().split('T')[0];

    const newItem: ExpiryItem = {
      id: Date.now().toString(),
      itemName,
      prepDate,
      expDate,
      status: calculateStatus(expDate)
    };

    saveExpiryEntry(newItem);
    loadItems();
    setItemName('');
    setPrepDate(new Date().toISOString().split('T')[0]);
    setShelfLife('3');
    setShowAdd(false);
  };

  const setPreset = (days: number) => {
    setShelfLife(days.toString());
  };

  const getExpiryLabel = (expDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().getTime() + 86400000).toISOString().split('T')[0];
    
    if (expDate === today) return <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 border border-slate-900 dark:border-white/20">EXPIRES TODAY</span>;
    if (expDate === tomorrow) return <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 border border-slate-900 dark:border-white/20">EXPIRES TOMORROW</span>;
    return null;
  };

  const handleDelete = (id: string) => {
    deleteExpiryEntry(id);
    loadItems();
  };

  const groupedItems = {
    EXPIRED: items.filter(i => i.status === 'EXPIRED'),
    'EXPIRES SOON': items.filter(i => i.status === 'EXPIRES SOON'),
    ACTIVE: items.filter(i => i.status === 'ACTIVE'),
  };

  const getStatusIcon = (status: ExpiryStatus) => {
    switch (status) {
      case 'EXPIRED': return <AlertCircle size={18} className="text-red-600 dark:text-red-400" />;
      case 'EXPIRES SOON': return <AlertTriangle size={18} className="text-amber-600 dark:text-yellow-400" />;
      case 'ACTIVE': return <CheckCircle size={18} className="text-emerald-600 dark:text-green-400" />;
    }
  };

  const getStatusBg = (status: ExpiryStatus) => {
    switch (status) {
      case 'EXPIRED': return 'bg-red-50 border-red-200 dark:bg-red-900/40 dark:border-red-800';
      case 'EXPIRES SOON': return 'bg-amber-50 border-amber-200 dark:bg-yellow-900/30 dark:border-yellow-800';
      case 'ACTIVE': return 'bg-emerald-50 border-emerald-200 dark:bg-green-900/30 dark:border-green-800';
    }
  };

  const getItemTextClasses = (status: ExpiryStatus) => {
    switch (status) {
      case 'EXPIRED': return {
        title: 'text-slate-900 dark:text-red-200',
        meta: 'text-slate-500 dark:text-red-300'
      };
      case 'EXPIRES SOON': return {
        title: 'text-slate-900 dark:text-yellow-100',
        meta: 'text-slate-500 dark:text-yellow-300'
      };
      case 'ACTIVE': return {
        title: 'text-slate-900 dark:text-green-100',
        meta: 'text-slate-500 dark:text-green-300'
      };
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Expiry Tracker</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`p-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors ${showAdd ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
        >
          {showAdd ? <Plus className="rotate-45" size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Item Name</label>
              <input
                ref={nameRef}
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Tomato Sauce"
                className="w-full p-3 border-2 border-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Prep Date</label>
                <input
                  type="date"
                  value={prepDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPrepDate(e.target.value)}
                  className="w-full p-3 border-2 border-slate-900 font-bold focus:outline-none"
                />
              </div>
              <div>
                <div className="mb-3 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">HACCP Quick Shelf-Life Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Cooked (no blast)', days: 2 },
                      { label: 'Cooked (blast)', days: 3 },
                      { label: 'Vacuum Packed', days: 4 },
                      { label: 'Defrosted', days: 2 },
                      { label: 'Prepared today', days: 2 },
                      { label: 'Frozen (premises)', days: 90 }
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={() => setPreset(p.days)}
                        className="px-2 py-1 bg-slate-100 border-2 border-slate-900 text-[10px] font-black uppercase tracking-tight hover:bg-slate-200 active:translate-y-0.5"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Shelf Life (Days)</label>
                <input
                  type="number"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  className="w-full p-3 border-2 border-slate-900 font-bold focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-slate-900 text-white py-4 font-black uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              Add to List
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {(Object.keys(groupedItems) as ExpiryStatus[]).map(status => {
          const statusItems = groupedItems[status];
          if (statusItems.length === 0) return null;

            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-1">
                  {getStatusIcon(status)}
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{status} ({statusItems.length})</h3>
                </div>
                <div className="space-y-3">
                  {statusItems.map(item => {
                    const textClasses = getItemTextClasses(item.status);
                    return (
                      <div 
                        key={item.id} 
                        className={`border-2 border-slate-900 dark:border-slate-700 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)] flex justify-between items-center ${getStatusBg(item.status)}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-lg font-black uppercase leading-tight ${textClasses.title}`}>{item.itemName}</h4>
                            {getExpiryLabel(item.expDate)}
                          </div>
                          <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-70 ${textClasses.meta}`}>
                            <span className="flex items-center gap-1"><Clock size={12} /> Prep: {item.prepDate}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> Exp: {item.expDate}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-900 dark:text-white/70 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
        })}

        {items.length === 0 && !showAdd && (
          <div className="text-center py-12 border-2 border-dashed border-slate-300">
            <Calendar className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-400 font-bold uppercase italic">No items tracked</p>
          </div>
        )}
      </div>
    </div>
  );
}
