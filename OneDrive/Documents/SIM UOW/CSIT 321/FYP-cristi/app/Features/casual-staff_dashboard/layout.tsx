'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function CasualLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Welcome back');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (!savedUser) {
      router.push('/Features/login');
    } else {
      setUserName(savedUser);
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    }
  }, [router]);

  const confirmLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem('allocai_user');
    localStorage.removeItem('allocai_route');
    router.push('/');
  };

  if (!userName) return null;

  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          75% { transform: rotate(20deg); }
        }
        @keyframes slideRight {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fillRing {
          0% { stroke-dasharray: 0, 100; }
        }
        .animate-wave { animation: wave 2.5s ease-in-out infinite; transform-origin: 70% 70%; }
        .animate-slide { animation: slideRight 0.5s ease-out forwards; opacity: 0; animation-delay: 0.15s; }
        .animate-ring { animation: fillRing 1.5s ease-out forwards; }
      `}</style>

      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
        
        {/* SIDEBAR */}
        <aside className="flex w-72 flex-col justify-between bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="py-8">
            <div className="px-8 mb-10 flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
               </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Allocai
              </span>
            </div>

            <nav className="flex flex-col px-4 space-y-1">
              <Link href="/Features/casual-staff_dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/Features/casual-staff_dashboard' ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Dashboard
              </Link>

              <Link href="/Features/casual-staff_dashboard/profile" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/casual-staff_dashboard/profile') ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Profile
              </Link>

              <Link href="/Features/casual-staff_dashboard/availability" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/casual-staff_dashboard/availability') ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                My Availability
              </Link>

              <Link href="/Features/casual-staff_dashboard/tasks" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/casual-staff_dashboard/tasks') ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Allocated Tasks
              </Link>

              <Link href="/Features/casual-staff_dashboard/schedule" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/casual-staff_dashboard/schedule') ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                My Schedule
              </Link>

              <Link href="/Features/casual-staff_dashboard/history" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/casual-staff_dashboard/history') ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Timesheet History
              </Link>

              <Link href="/Features/casual-staff_dashboard/cancellation" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/casual-staff_dashboard/cancellation') ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Request Cancellation
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200">
            <button onClick={() => setShowLogoutModal(true)} className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Log out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <header className="flex items-end justify-between border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Workspace</h1>
                  {/* Badge Role Casual Employee */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-violet-200/50 shadow-sm mt-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                    </span>
                    Part Time Staff
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 animate-slide">
                  <span className="text-2xl animate-wave inline-block">👋</span>
                  <p className="text-slate-500 text-lg">
                    {greeting}, <span className="capitalize text-slate-900 font-bold">{userName}</span>!
                  </p>
                </div>

                <span className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-violet-200/50 shadow-sm mt-3">
                  Part Time Staff
                </span>
              </div>
            </header>

            {children}

          </div>
        </main>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm transform scale-100 animate-[bounce_0.2s_ease-out]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
                <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Ready to leave?</h3>
              <p className="text-center text-sm text-slate-500 mb-8">You will need to log in again to access the dashboard.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Yes, log out</button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}