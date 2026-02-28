/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Kitchen Logs v1.5 - Cache-busting update to force fresh build and verify settings button.
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardCheck, Thermometer, CalendarClock, Recycle, Settings, X, Moon, Sun, LogOut, Flame, Home } from 'lucide-react';
import { storageService } from './storage/storageService';
import Dashboard from './features/Dashboard';
import Cleaning from './features/Cleaning';
import Temperature from './features/Temperature';
import Cooking from './features/Cooking';
import Expiry from './features/Expiry';
import Waste from './features/Waste';
import LoginScreen from './features/LoginScreen';

type Tab = 'dashboard' | 'cleaning' | 'temperature' | 'cooking' | 'expiry' | 'waste';

function NavButton({ active, onClick, icon, label, badge, theme }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number; theme: 'dark' | 'light' }) {
  const activeClass = theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700';
  const inactiveClass = theme === 'dark' ? 'bg-transparent text-slate-400 hover:bg-slate-800' : 'bg-transparent text-gray-500 hover:bg-gray-50';
  
  return (
    <button
      onClick={onClick}
      title={label}
      style={{ flex: 1, minWidth: 0, padding: '4px 0', height: '100%' }}
      className={`flex flex-col items-center justify-center border-0 cursor-pointer transition-all ${active ? activeClass : inactiveClass}`}
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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [staffName, setStaffName] = useState('Staff');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [dashboardKey, setDashboardKey] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [expiryForceAdd, setExpiryForceAdd] = useState(0);
  const [tempForceAdd, setTempForceAdd] = useState(0);
  const [cookForceAdd, setCookForceAdd] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const mainRef = React.useRef<HTMLDivElement>(null);

  console.log('App rendering, theme:', theme, 'showSettings:', showSettings);

  useEffect(() => {
    // PWA Install Logic
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = localStorage.getItem('install_dismissed') === 'true';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we show the banner if not standalone and not dismissed
    if (ios && !isStandalone && !isDismissed) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    storageService.seedTestData();
    setDashboardKey(prev => prev + 1);
    
    // Update expired count immediately after seeding
    const today = new Date().toISOString().split('T')[0];
    const items = storageService.getExpiryItems();
    const count = items.filter(item => item.expDate < today).length;
    setExpiredCount(count);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const items = storageService.getExpiryItems();
    const count = items.filter(item => item.expDate < today).length;
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
      case 'dashboard': return <Dashboard key={dashboardKey} onNavigate={handleTabChange} />;
      case 'cleaning': return <Cleaning />;
      case 'temperature': return <Temperature staffName={staffName} forceAddTrigger={tempForceAdd} />;
      case 'cooking': return <Cooking forceAddTrigger={cookForceAdd} />;
      case 'expiry': return <Expiry forceAddTrigger={expiryForceAdd} />;
      case 'waste': return <Waste />;
      default: return <Dashboard key={dashboardKey} onNavigate={handleTabChange} />;
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('install_dismissed', 'true');
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLogin={(pin) => {
          if (pin === '1234') {
            setStaffName('Manager');
            setIsLoggedIn(true);
          } else if (pin === '0000') {
            setStaffName('Staff');
            setIsLoggedIn(true);
          }
        }}
        onDemo={() => {
          setIsDemoMode(true);
          setIsLoggedIn(true);
          setStaffName('Demo User');
        }}
      />
    );
  }

  return (
    <div 
      className={`w-full max-w-full mx-auto flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark-theme bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
      style={{ overflowX: 'hidden', maxWidth: '100vw', minWidth: 0 }}
    >
      {isDemoMode && (
        <div className="bg-orange-500 text-black text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center border-b border-black">
          Demo Mode Active - Sample Data Only
        </div>
      )}
      <div id="app-header" style={{background:'#1e3a5f',color:'white',padding:'12px',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',boxSizing:'border-box'}}>
        <span style={{fontSize:'16px',fontWeight:'bold'}}>KITCHEN LOGS</span>
        
        <button 
          onClick={() => handleTabChange('dashboard')}
          className="flex flex-col items-center justify-center bg-transparent border-0 text-white cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Home size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Home</span>
        </button>

        <button id="settings-btn" onClick={()=>setShowSettings(true)} style={{background:'orange',color:'black',padding:'8px',fontSize:'14px',fontWeight:'bold',cursor:'pointer',border:'2px solid white',minWidth:'80px'}}>⚙ Settings</button>
      </div>

      <style>{`
        .dark-theme .bg-slate-50, 
        .dark-theme .bg-white,
        .dark-theme .bg-slate-100 { 
          background-color: #0f172a !important; 
          color: #f8fafc !important; 
        }
        .dark-theme .border-slate-900,
        .dark-theme .border-black { 
          border-color: #334155 !important; 
        }
        .dark-theme .text-slate-900,
        .dark-theme .text-black { 
          color: #f8fafc !important; 
        }
        .dark-theme .text-slate-500,
        .dark-theme .text-slate-400 { 
          color: #94a3b8 !important; 
        }
        .dark-theme .shadow-[4px_4px_0px_0px_rgba(0,0,0,1)],
        .dark-theme .shadow-[8px_8px_0px_0px_rgba(0,0,0,1)],
        .dark-theme .shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] {
          box-shadow: 4px 4px 0px 0px rgba(255,255,255,0.1) !important;
        }
        .dark-theme input, 
        .dark-theme select, 
        .dark-theme textarea {
          background-color: #1e293b !important;
          color: white !important;
          border-color: #334155 !important;
        }
      `}</style>
      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className={`w-full max-w-xs border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 border-b-4 border-slate-900 pb-3">
              <h2 className="text-2xl font-black uppercase tracking-tight">Settings</h2>
              <button 
                onClick={() => setShowSettings(false)} 
                className="hover:rotate-90 transition-transform p-1"
                aria-label="Close settings"
              >
                <X size={28} />
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <label className="font-black uppercase tracking-widest text-xs text-slate-500">Display Theme</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-900 font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-amber-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent opacity-50'}`}
                  >
                    <Sun size={18} /> Light
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-900 font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent opacity-50'}`}
                  >
                    <Moon size={18} /> Dark
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-900/10">
                <label className="font-black uppercase tracking-widest text-[10px] text-slate-500">About & Legal</label>
                <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">App Info</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">Kitchen Logs v1.0 (Beta) - Built by RC Computers, Woking UK. 2026 RC Computers. All rights reserved.</p>
                    </div>
                    <div className="border-t border-slate-700/30 pt-4">
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">Legal Notice</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">This app is a digital record-keeping aid only. It does not guarantee food safety compliance. Always follow the Food Safety Act 1990 and Food Hygiene (England) Regulations 2006. Consult your local Environmental Health Officer (EHO) for compliance advice.</p>
                    </div>
                    <div className="border-t border-slate-700/30 pt-4">
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">Temperature Limits</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">Temperature limits are based on UK Food Standards Agency (FSA) guidelines. Limits may differ from your HACCP plan. Verify with your food safety advisor.</p>
                    </div>
                    <div className="border-t border-slate-700/30 pt-4">
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">Data & Privacy</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">All data is stored locally on this device only. No data is sent to external servers. Staff names entered into logs are stored on-device only.</p>
                    </div>
                    <div className="border-t border-slate-700/30 pt-4">
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">Disclaimer</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">RC Computers accepts no liability for data loss, food safety incidents, regulatory penalties, or any other loss arising from use of this app. Provided as-is without warranty.</p>
                    </div>
                    <div className="border-t border-slate-700/30 pt-4">
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">Beta Version</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">This is a beta release. Features may change and data may be reset between updates. Not recommended as sole record-keeping method during beta.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsDemoMode(false);
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-500 text-white border-2 border-slate-900 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
              
              <div className="pt-6 border-t-2 border-slate-900/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-center">Kitchen Logs v1.3</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto relative">
        <div className="p-4">
          {renderContent()}
        </div>

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="fixed bottom-20 left-4 right-4 z-[90] bg-[#1e3a5f] text-white p-4 border-2 border-white/20 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold leading-tight">
                  {isIOS 
                    ? '📲 To install: tap the Share button then "Add to Home Screen"' 
                    : '📲 Install Kitchen Logs on your home screen'}
                </p>
                {isIOS && (
                  <button onClick={dismissInstallBanner} className="text-white/60 hover:text-white">
                    <X size={20} />
                  </button>
                )}
              </div>
              
              {!isIOS && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleInstallClick}
                    className="flex-1 bg-emerald-600 text-white py-2 text-xs font-black uppercase tracking-widest border-2 border-white/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none"
                  >
                    INSTALL
                  </button>
                  <button 
                    onClick={dismissInstallBanner}
                    className="flex-1 bg-slate-600 text-white py-2 text-xs font-black uppercase tracking-widest border-2 border-white/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none"
                  >
                    Not now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAB Overlay */}
        {isSpeedDialOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[60] transition-all duration-200"
            onClick={() => setIsSpeedDialOpen(false)}
          />
        )}

        {/* Speed Dial Menu */}
        <div className={`fixed right-6 bottom-24 z-[70] flex flex-col items-end gap-3 transition-all duration-200 ${isSpeedDialOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {[
            { id: 'cooking', label: '🍳 Cooking', icon: <Flame size={20} />, color: 'bg-orange-500', tab: 'cooking' },
            { id: 'cleaning', label: '✅ Cleaning', icon: <ClipboardCheck size={20} />, color: 'bg-blue-500', tab: 'cleaning' },
            { id: 'expiry', label: '📦 Expiry', icon: <CalendarClock size={20} />, color: 'bg-amber-500', tab: 'expiry' },
            { id: 'temperature', label: '🌡 Temperature', icon: <Thermometer size={20} />, color: 'bg-emerald-500', tab: 'temperature' },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-3 group">
              <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white/20 shadow-lg">
                {item.label}
              </span>
              <button
                onClick={() => {
                  handleTabChange(item.tab as Tab);
                  if (item.id === 'expiry') setExpiryForceAdd(prev => prev + 1);
                  if (item.id === 'temperature') setTempForceAdd(prev => prev + 1);
                  if (item.id === 'cooking') setCookForceAdd(prev => prev + 1);
                  setIsSpeedDialOpen(false);
                  // Scroll main content to top
                  if (mainRef.current) {
                    mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center border-2 border-white shadow-xl active:scale-90 transition-transform`}
              >
                {item.icon}
              </button>
            </div>
          ))}
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          className={`fixed right-6 bottom-20 w-14 h-14 rounded-full bg-[#16a34a] text-white flex items-center justify-center z-[80] border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:scale-95 transition-all duration-200`}
          aria-label="Quick Actions"
        >
          <div className={`transition-transform duration-200 ${isSpeedDialOpen ? 'rotate-45' : 'rotate-0'}`}>
            <X size={32} className={isSpeedDialOpen ? 'block' : 'hidden'} />
            <span className={`text-4xl font-light leading-none ${isSpeedDialOpen ? 'hidden' : 'block'}`}>+</span>
          </div>
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav style={{ display: 'flex', width: '100%', overflow: 'hidden', height: '64px', position: 'sticky', bottom: 0, borderTop: '2px solid black', zIndex: 50, flexShrink: 0, padding: 0 }} className={theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-900'}>
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => handleTabChange('dashboard')}
          icon={<LayoutDashboard size={22} />}
          label="HOME"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'cleaning'} 
          onClick={() => handleTabChange('cleaning')}
          icon={<ClipboardCheck size={22} />}
          label="CLEANING"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'temperature'} 
          onClick={() => handleTabChange('temperature')}
          icon={<Thermometer size={22} />}
          label="TEMP"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'cooking'} 
          onClick={() => handleTabChange('cooking')}
          icon={<Flame size={22} />}
          label="COOK"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'expiry'} 
          onClick={() => handleTabChange('expiry')}
          icon={<CalendarClock size={22} />}
          label="EXPIRY"
          badge={expiredCount}
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'waste'} 
          onClick={() => handleTabChange('waste')}
          icon={<Recycle size={22} />}
          label="WASTE"
          theme={theme}
        />
      </nav>
    </div>
  );
}
