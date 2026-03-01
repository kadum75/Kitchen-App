/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// KLOGS v1.5 - Cache-busting update to force fresh build and verify settings button.
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardCheck, Thermometer, CalendarClock, Recycle, Settings, X, Moon, Sun, LogOut, Flame, Home, User, ShieldCheck, CreditCard, Clock, ChefHat, Loader2, MessageSquare, CheckCircle } from 'lucide-react';
import { storageService } from './storage/storageService';
import { supabase, supabaseAnonKey } from './lib/supabase';
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
      className={`flex flex-col items-center justify-center border-0 cursor-pointer transition-all flex-1 ${active ? activeClass : inactiveClass}`}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        {badge !== undefined && badge > 0 && (
          <span style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', borderRadius: '9999px', minWidth: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', padding: '0 3px', border: '1.5px solid white' }}>{badge}</span>
        )}
      </div>
      <span className="text-[9px] font-black uppercase tracking-tighter mt-1 truncate w-full px-1 text-center">{label}</span>
    </button>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [trialStart, setTrialStart] = useState<string | null>(localStorage.getItem('klogs_trial_start'));
  const [isPaid, setIsPaid] = useState<boolean>(localStorage.getItem('klogs_is_paid') === 'true');
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
  const [isInputActive, setIsInputActive] = useState(false);
  const [expiryForceAdd, setExpiryForceAdd] = useState(0);
  const [tempForceAdd, setTempForceAdd] = useState(0);
  const [cookForceAdd, setCookForceAdd] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [feedbackQ1, setFeedbackQ1] = useState('');
  const [feedbackQ2, setFeedbackQ2] = useState('');
  const [feedbackQ3, setFeedbackQ3] = useState('');
  const [isFeedbackSending, setIsFeedbackSending] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const mainRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn && window.location.hash) {
      // Clear hash from URL after successful login
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [isLoggedIn]);

  const TRIAL_DAYS = 14;
  let daysRemaining = 0;
  if (trialStart) {
    const start = new Date(trialStart);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    daysRemaining = TRIAL_DAYS - Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          setIsLoggedIn(true);
          setIsDemoMode(false);
          localStorage.setItem('klogsUserEmail', session.user.email || '');
          await fetchProfile(session.user);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        setIsDemoMode(false);
        localStorage.setItem('klogsUserEmail', session.user.email || '');
        await fetchProfile(session.user);
      } else {
        if (!isDemoMode) {
          setIsLoggedIn(false);
          localStorage.removeItem('klogsUserEmail');
          localStorage.removeItem('klogs_trial_start');
          localStorage.removeItem('klogs_is_paid');
          setTrialStart(null);
          setIsPaid(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  const fetchProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const now = new Date().toISOString();
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email, trial_start: now }])
          .select()
          .single();
        
        if (newProfile) {
          updateLocalProfile(newProfile);
        }
      } else if (data) {
        updateLocalProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const updateLocalProfile = (profile: any) => {
    localStorage.setItem('klogs_trial_start', profile.trial_start);
    localStorage.setItem('klogs_is_paid', profile.is_paid.toString());
    setTrialStart(profile.trial_start);
    setIsPaid(profile.is_paid);
  };

  const handleSendFeedback = async () => {
    if (!feedbackQ1 && !feedbackQ2 && !feedbackQ3) return;
    
    setIsFeedbackSending(true);
    try {
      const userEmail = isDemoMode ? 'demo@user.com' : (session?.user?.email || 'unknown@user.com');
      const response = await fetch('https://bssbnvbvrquuvtzfifwn.supabase.co/functions/v1/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          user_email: userEmail,
          q1_confusing: feedbackQ1,
          q2_missing: feedbackQ2,
          q3_vs_paper: feedbackQ3
        })
      });

      if (response.ok) {
        setFeedbackSuccess(true);
        setFeedbackQ1('');
        setFeedbackQ2('');
        setFeedbackQ3('');
        setTimeout(() => setFeedbackSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error sending feedback:', err);
    } finally {
      setIsFeedbackSending(false);
    }
  };

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
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setIsInputActive(true);
      }
    };
    const handleBlur = () => {
      // Small delay to allow focus to move to another element
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && activeElement.tagName !== 'SELECT')) {
          setIsInputActive(false);
        }
      }, 50);
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
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

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-[#0f1f3d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ChefHat size={48} className="text-white animate-bounce" />
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="text-emerald-500 animate-spin" />
            <span className="text-white font-black uppercase tracking-widest text-xs">Loading KLOGS...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onDemo={() => {
          setIsDemoMode(true);
          setIsLoggedIn(true);
          setStaffName('Demo User');
        }}
      />
    );
  }

  if (!isDemoMode && !isPaid && trialStart && daysRemaining <= 0) {
    return (
      <div className="fixed inset-0 bg-[#0f1f3d] flex flex-col items-center justify-center p-6 z-[300]">
        <div className="w-full max-w-sm bg-white p-8 border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center space-y-6">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <CalendarClock size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Trial Expired</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            Your 14-day free trial has ended. Please upgrade to Pro to continue using KLOGS for your business.
          </p>
          <button className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
            Upgrade to Pro
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              setIsLoggedIn(false);
            }}
            className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600"
          >
            Sign Out
          </button>
        </div>
      </div>
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
      {!isDemoMode && !isPaid && daysRemaining > 0 && daysRemaining <= 3 && (
        <div className="bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center border-b border-black">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in your trial - Upgrade to Pro
        </div>
      )}
      <div id="app-header" style={{background:'#1e3a5f',color:'white',padding:'12px',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',boxSizing:'border-box', gap: '8px'}}>
        <span className="sm:text-base text-sm font-bold truncate min-w-0 flex-1">
          KLOGS
        </span>
        
        <button 
          onClick={() => handleTabChange('dashboard')}
          className="flex flex-col items-center justify-center bg-transparent border-0 text-white cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Home size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Home</span>
        </button>

        <button id="settings-btn" onClick={()=>setShowSettings(true)} style={{background:'orange',color:'black',padding:'8px',fontSize:'14px',fontWeight:'bold',cursor:'pointer',border:'2px solid white',minWidth:'80px'}} className="flex-shrink-0">⚙ Settings</button>
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
        .settings-scroll {
          scrollbar-width: thin;
          scrollbar-color: #334155 transparent;
          scroll-behavior: smooth;
        }
        .settings-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .settings-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .settings-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .settings-scroll::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className={`w-full max-w-xs max-h-[90vh] overflow-y-auto settings-scroll border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}
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
              {/* User Info Section */}
              {!isDemoMode && session && (
                <div className="bg-slate-50 border-2 border-slate-900 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-full text-white">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</p>
                      <p className="text-xs font-bold truncate text-slate-900">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <>
                          <ShieldCheck size={14} className="text-emerald-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Pro Plan</span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} className="text-amber-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{daysRemaining} Days Trial</span>
                        </>
                      )}
                    </div>
                    {!isPaid && (
                      <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline flex items-center gap-1">
                        <CreditCard size={12} /> Upgrade
                      </button>
                    )}
                  </div>
                </div>
              )}

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

              {/* Tester Feedback Section */}
              <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-900/10">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-500" />
                  <label className="font-black uppercase tracking-widest text-[10px] text-slate-500">Tester Feedback</label>
                </div>
                
                {feedbackSuccess ? (
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-4 flex flex-col items-center gap-2 animate-in zoom-in-95">
                    <CheckCircle size={24} className="text-emerald-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Thank you for your feedback!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">1. Did anything confuse you or not work?</p>
                      <textarea 
                        value={feedbackQ1}
                        onChange={(e) => setFeedbackQ1(e.target.value)}
                        className="w-full p-2 text-xs border-2 border-slate-900 bg-white min-h-[60px] focus:border-emerald-500 outline-none"
                        placeholder="Type here..."
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">2. Is there anything missing that you need daily?</p>
                      <textarea 
                        value={feedbackQ2}
                        onChange={(e) => setFeedbackQ2(e.target.value)}
                        className="w-full p-2 text-xs border-2 border-slate-900 bg-white min-h-[60px] focus:border-emerald-500 outline-none"
                        placeholder="Type here..."
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">3. Would you use this instead of paper? Why/why not?</p>
                      <textarea 
                        value={feedbackQ3}
                        onChange={(e) => setFeedbackQ3(e.target.value)}
                        className="w-full p-2 text-xs border-2 border-slate-900 bg-white min-h-[60px] focus:border-emerald-500 outline-none"
                        placeholder="Type here..."
                      />
                    </div>
                    <button 
                      onClick={handleSendFeedback}
                      disabled={isFeedbackSending || (!feedbackQ1 && !feedbackQ2 && !feedbackQ3)}
                      className="w-full py-3 bg-emerald-500 text-white border-2 border-slate-900 font-black uppercase tracking-widest text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isFeedbackSending ? <Loader2 size={14} className="animate-spin" /> : null}
                      Send Feedback
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-900/10">
                <label className="font-black uppercase tracking-widest text-[10px] text-slate-500">About & Legal</label>
                <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-2 settings-scroll">
                  <div className="space-y-4">
                    <div>
                      <h4 className="uppercase font-semibold text-gray-300 text-[10px] tracking-wider mb-1">App Info</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">KLOGS v1.0 (Beta) - Built by RC Computers, Woking UK. 2026 RC Computers. All rights reserved.</p>
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

              <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-900/10">
                <label className="font-black uppercase tracking-widest text-[10px] text-slate-500">Security</label>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all PINs? This will log you out and require a new setup.')) {
                      localStorage.removeItem('klogs_manager_pin');
                      localStorage.removeItem('klogs_staff_pin');
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-900 border-2 border-slate-900 font-black uppercase tracking-widest text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                >
                  Reset PINs
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={async () => {
                    if (isDemoMode) {
                      setIsLoggedIn(false);
                      setIsDemoMode(false);
                      setShowSettings(false);
                    } else {
                      await supabase.auth.signOut();
                      setIsLoggedIn(false);
                      setShowSettings(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-500 text-white border-2 border-slate-900 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
              
              <div className="pt-6 border-t-2 border-slate-900/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-center">KLOGS v1.3</p>
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
                    : '📲 Install KLOGS on your home screen'}
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
        <div className={`fixed right-6 bottom-32 z-[70] flex flex-col items-end gap-3 transition-all duration-300 ${isSpeedDialOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'} ${isInputActive ? 'hidden' : ''}`}>
          {[
            { id: 'cooking', label: '🍳 Cooking', icon: <Flame size={20} />, color: 'bg-orange-500', tab: 'cooking' },
            { id: 'cleaning', label: '✅ Cleaning', icon: <ClipboardCheck size={20} />, color: 'bg-blue-500', tab: 'cleaning' },
            { id: 'expiry', label: '📦 Expiry', icon: <CalendarClock size={20} />, color: 'bg-amber-500', tab: 'expiry' },
            { id: 'temperature', label: '🌡 Temperature', icon: <Thermometer size={20} />, color: 'bg-emerald-500', tab: 'temperature' },
            { id: 'waste', label: '♻ Waste', icon: <Recycle size={20} />, color: 'bg-violet-600', tab: 'waste' },
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
          className={`fixed right-6 bottom-24 w-14 h-14 rounded-full bg-[#16a34a] text-white flex items-center justify-center z-[80] border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:scale-95 transition-all duration-200 ${isInputActive ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${showSettings ? 'pointer-events-none' : ''}`}
          aria-label="Quick Actions"
        >
          <div className={`transition-transform duration-200 ${isSpeedDialOpen ? 'rotate-45' : 'rotate-0'}`}>
            <X size={32} className={isSpeedDialOpen ? 'block' : 'hidden'} />
            <span className={`text-4xl font-light leading-none ${isSpeedDialOpen ? 'hidden' : 'block'}`}>+</span>
          </div>
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav style={{ display: 'flex', width: '100%', overflow: 'hidden', height: 'auto', minHeight: '64px', position: 'sticky', bottom: 0, borderTop: '2px solid black', zIndex: 50, flexShrink: 0, padding: 0, paddingBottom: 'env(safe-area-inset-bottom)' }} className={theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-900'}>
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => handleTabChange('dashboard')}
          icon={<LayoutDashboard />}
          label="HOME"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'cleaning'} 
          onClick={() => handleTabChange('cleaning')}
          icon={<ClipboardCheck />}
          label="CLEANING"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'temperature'} 
          onClick={() => handleTabChange('temperature')}
          icon={<Thermometer />}
          label="TEMP"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'cooking'} 
          onClick={() => handleTabChange('cooking')}
          icon={<Flame />}
          label="COOK"
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'expiry'} 
          onClick={() => handleTabChange('expiry')}
          icon={<CalendarClock />}
          label="EXPIRY"
          badge={expiredCount}
          theme={theme}
        />
        <NavButton 
          active={activeTab === 'waste'} 
          onClick={() => handleTabChange('waste')}
          icon={<Recycle />}
          label="WASTE"
          theme={theme}
        />
      </nav>
    </div>
  );
}
