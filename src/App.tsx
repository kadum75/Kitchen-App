/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Kitchen Logs v1.1 - Kitchen compliance app with Cleaning, Temperature, Expiry and Waste logging.

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardCheck, Thermometer, CalendarClock, Trash2 } from 'lucide-react';
import { storageService } from './storage/storageService';
import Dashboard from './features/Dashboard';
import Cleaning from './features/Cleaning';
import Temperature from './features/Temperature';
import Expiry from './features/Expiry';
import Waste from './features/Waste';

type Tab = 'dashboard' | 'cleaning' | 'temperature' | 'expiry' | 'waste';

function NavButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{ flex: 1, minWidth: 0, padding: '4px 0', height: '100%' }}
      className={`flex flex-col items-center justify-center border-0 cursor-pointer transition-all ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', borderRadius: '9999px', minWidth: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', padding: '0 3px', border: '1.5px solid white' }}>{badge}</span>
        )}
      </div>
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [dashboardKey, setDashboardKey] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const items = storageService.getExpiryItems();
    const count = items.filter(item => item.expiryDate < today).length;
    setExpiredCount(count);
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    if (tab === 'dashboard') {
      setDashboardKey(prev => prev + 1);
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard key={dashboardKey} />;
      case 'cleaning': return <Cleaning />;
      case 'temperature': return <Temperature />;
      case 'expiry': return <Expiry />;
      case 'waste': return <Waste />;
      default: return <Dashboard key={dashboardKey} />;
    }
  };

  return (
    <div className="w-full max-w-screen-sm mx-auto flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold tracking-tight uppercase">Kitchen Logs</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav style={{ display: 'flex', width: '100%', overflow: 'hidden', height: '64px', position: 'sticky', bottom: 0, background: 'white', borderTop: '2px solid black', zIndex: 50, flexShrink: 0, padding: 0 }}>
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => handleTabChange('dashboard')}
          icon={<LayoutDashboard size={22} />}
          label="HOME"
        />
        <NavButton 
          active={activeTab === 'cleaning'} 
          onClick={() => handleTabChange('cleaning')}
          icon={<ClipboardCheck size={22} />}
          label="CLEANING"
        />
        <NavButton 
          active={activeTab === 'temperature'} 
          onClick={() => handleTabChange('temperature')}
          icon={<Thermometer size={22} />}
          label="TEMP"
        />
        <NavButton 
          active={activeTab === 'expiry'} 
          onClick={() => handleTabChange('expiry')}
          icon={<CalendarClock size={22} />}
          label="EXPIRY"
          badge={expiredCount}
        />
        <NavButton 
          active={activeTab === 'waste'} 
          onClick={() => handleTabChange('waste')}
          icon={<Trash2 size={22} />}
          label="WASTE"
        />
      </nav>
    </div>
  );
}
