/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardCheck, Thermometer, CalendarClock } from 'lucide-react';
import Dashboard from './features/Dashboard';
import Cleaning from './features/Cleaning';
import Temperature from './features/Temperature';
import Expiry from './features/Expiry';

type Tab = 'dashboard' | 'cleaning' | 'temperature' | 'expiry';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'cleaning': return <Cleaning />;
      case 'temperature': return <Temperature />;
      case 'expiry': return <Expiry />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold tracking-tight uppercase">Kitchen Logs</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="max-w-md mx-auto p-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-20 px-2 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<LayoutDashboard size={24} />}
          label="Home"
        />
        <NavButton 
          active={activeTab === 'cleaning'} 
          onClick={() => setActiveTab('cleaning')}
          icon={<ClipboardCheck size={24} />}
          label="Cleaning"
        />
        <NavButton 
          active={activeTab === 'temperature'} 
          onClick={() => setActiveTab('temperature')}
          icon={<Thermometer size={24} />}
          label="Temp"
        />
        <NavButton 
          active={activeTab === 'expiry'} 
          onClick={() => setActiveTab('expiry')}
          icon={<CalendarClock size={24} />}
          label="Expiry"
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
    >
      <div className={`p-1 rounded-lg ${active ? 'bg-emerald-50' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">{label}</span>
    </button>
  );
}
