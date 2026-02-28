/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../storage/storageService';
import { WasteEntry, WasteReason } from '../types';
import { Plus, Trash2, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const REASONS: WasteReason[] = ['SPOILAGE', 'OVER-PREP', 'CUSTOMER RETURN', 'DAMAGED', 'EXPIRED'];

const REASON_COLORS: Record<WasteReason, string> = {
  'SPOILAGE': 'bg-red-100 text-red-700 border-red-200',
  'OVER-PREP': 'bg-amber-100 text-amber-700 border-amber-200',
  'CUSTOMER RETURN': 'bg-blue-100 text-blue-700 border-blue-200',
  'DAMAGED': 'bg-orange-100 text-orange-700 border-orange-200',
  'EXPIRED': 'bg-red-100 text-red-700 border-red-200'
};

export default function Waste() {
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form state
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<WasteReason>('SPOILAGE');
  const [notes, setNotes] = useState('');

  // Swipe state
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    setEntries(storageService.getWasteEntries());
  }, []);

  const handleSave = () => {
    if (!item || !quantity) {
      alert('Item and Quantity are required');
      return;
    }

    const newEntry: WasteEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      item,
      quantity,
      reason,
      notes
    };

    storageService.saveWasteEntry(newEntry);
    setEntries(storageService.getWasteEntries());
    
    // Reset form
    setItem('');
    setQuantity('');
    setReason('SPOILAGE');
    setNotes('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    storageService.deleteWasteEntry(id);
    setEntries(storageService.getWasteEntries());
    setSwipedId(null);
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (touchStart.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    if (diff > 80) {
      setSwipedId(id);
    } else if (diff < -40) {
      setSwipedId(null);
    }
    touchStart.current = null;
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups: Record<string, WasteEntry[]>, entry) => {
    const date = entry.timestamp.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Waste Log</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`p-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors ${showAdd ? 'bg-red-500 text-white' : 'bg-violet-600 text-white'}`}
        >
          {showAdd ? <Plus className="rotate-45" size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-50 border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Item Name</label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g. Cooked Rice"
                className="w-full p-3 border-2 border-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500g or 2 portions"
                className="w-full p-3 border-2 border-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Reason</label>
              <div className="flex flex-wrap gap-2">
                {REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`px-3 py-2 text-[10px] font-black border-2 border-slate-900 transition-all ${
                      reason === r ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border-2 border-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/20"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-slate-900 text-white py-4 font-black uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              Log Waste
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {entries.length === 0 && !showAdd && (
          <div className="text-center py-12 border-2 border-dashed border-slate-300">
            <AlertCircle className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-400 font-bold uppercase italic">No waste logged today</p>
          </div>
        )}

        {sortedDates.map(date => (
          <div key={date} className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ChevronRight size={16} />
              {date === today ? 'Today' : date}
            </h3>
            <div className="space-y-3">
              {groupedEntries[date].map(entry => (
                <div 
                  key={entry.id}
                  onTouchStart={(e) => handleTouchStart(e, entry.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, entry.id)}
                  className="relative overflow-hidden"
                >
                  <div 
                    className={`border-2 border-slate-900 p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 ${
                      swipedId === entry.id ? '-translate-x-24' : 'translate-x-0'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-black uppercase leading-tight">{entry.item}</h4>
                        <p className="text-sm font-bold text-slate-500">{entry.quantity}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 border-2 border-slate-900 uppercase tracking-widest ${REASON_COLORS[entry.reason]}`}>
                        {entry.reason}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs italic text-slate-600 border-l-2 border-slate-200 pl-2 mt-2">{entry.notes}</p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Clock size={12} />
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {/* Delete Button (revealed on swipe) */}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-0 right-0 bottom-0 w-20 bg-red-600 text-white flex flex-col items-center justify-center gap-1 border-y-2 border-r-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Trash2 size={20} />
                    <span className="text-[10px] font-black uppercase">Delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
