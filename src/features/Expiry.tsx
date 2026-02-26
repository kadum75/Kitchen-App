/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { ExpiryItem } from '../types';
import { Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function Expiry() {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [prepDate, setPrepDate] = useState(new Date().toISOString().split('T')[0]);
  const [shelfLife, setShelfLife] = useState('3');

  useEffect(() => {
    setItems(storageService.getExpiryItems().sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
  }, []);

  const handleAdd = () => {
    if (!name) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prepDateObj = new Date(prepDate);
    prepDateObj.setHours(0, 0, 0, 0);
    if (prepDateObj > today) {
      alert('Prep date cannot be in the future.');
      return;
    }

    const prep = new Date(prepDate);
    const expiry = new Date(prep);
    expiry.setDate(prep.getDate() + parseInt(shelfLife));

    const newItem: ExpiryItem = {
      id: Date.now().toString(),
      name,
      prepDate,
      expiryDate: expiry.toISOString().split('T')[0],
      shelfLife: parseInt(shelfLife)
    };

    storageService.saveExpiryItem(newItem);
    setItems(storageService.getExpiryItems().sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
    setName('');
    setPrepDate(new Date().toISOString().split('T')[0]);
    setShelfLife('3');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    storageService.deleteExpiryItem(id);
    setItems(storageService.getExpiryItems().sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
  };

  const getStatusColor = (expiryDate: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'bg-red-100 border-red-600 text-red-900';
    if (diffDays === 1) return 'bg-amber-100 border-amber-600 text-amber-900';
    return 'bg-emerald-50 border-emerald-600 text-emerald-900';
  };

  const getStatusLabel = (expiryDate: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'EXPIRED';
    if (diffDays === 0) return 'EXPIRES TODAY';
    if (diffDays === 1) return 'EXPIRES TOMORROW';
    return `IN ${diffDays} DAYS`;
  };

  return (
    <div className="space-y-6">
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
        <div className="bg-slate-50 border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

      <div className="space-y-4">
        {items.length === 0 && !showAdd && (
          <div className="text-center py-12 border-2 border-dashed border-slate-300">
            <Calendar className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-400 font-bold uppercase italic">No items tracked</p>
          </div>
        )}
        
        {items.map(item => (
          <div 
            key={item.id} 
            className={`border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-start ${getStatusColor(item.expiryDate)}`}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase leading-tight">{item.name}</h3>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-70">
                <span className="flex items-center gap-1"><Clock size={12} /> Prep: {item.prepDate}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Exp: {item.expiryDate}</span>
              </div>
              <div className="mt-2 inline-block px-2 py-1 bg-white/50 border border-current text-[10px] font-black tracking-widest">
                {getStatusLabel(item.expiryDate)}
              </div>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="p-2 text-slate-900 hover:text-red-600 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
