'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Welcome back');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const result = await apiFetch<{ full_name?: string; role?: string }>('/api/auth/session');

      if (!result.success || result.role !== 'manager') {
        router.push('/Features/login');
        return;
      }

      setUserName(result.full_name || 'User');
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    }

    checkSession();

    // A browser back/forward navigation can restore this page from
    // bfcache without re-running the mount effect, which would leave a
    // logged-out or suspended session showing a stale dashboard.
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) checkSession();
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [router]);

  const confirmLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout failed", e);
    }
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

      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-100">
        
        {/* SIDEBAR */}
        <aside className="flex w-72 flex-col justify-between bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="py-8">
            <div className="px-8 mb-10 flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
               </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Allocai
              </span>
            </div>

            <nav className="flex flex-col px-4 space-y-1">
              <Link href="/Features/manager_dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/Features/manager_dashboard' ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Dashboard
              </Link>

              <Link href="/Features/manager_dashboard/users" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/users') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Staff
              </Link>

              <Link href="/Features/manager_dashboard/tasks" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/tasks') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Task Management
              </Link>

              <Link href="/Features/manager_dashboard/skillsets" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/skillsets') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                Skillsets
              </Link>

              <Link href="/Features/manager_dashboard/hours" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/hours') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Hours Dashboard
              </Link>

              <Link href="/Features/manager_dashboard/cancellations" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/cancellations') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Cancellations
              </Link>

              <Link href="/Features/manager_dashboard/disputes" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/disputes') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Disputes
              </Link>

              <Link href="/Features/manager_dashboard/ai-suggestions" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/Features/manager_dashboard/ai-suggestions') ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M22 12h-4"/><circle cx="18" cy="6" r="3"/></svg>
                AI Suggestions
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="px-4 py-2 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-bold text-slate-700 capitalize mt-0.5 truncate">{userName}</p>
              <p className="text-xs text-slate-400">Manager</p>
            </div>
            <Link href="/Features/submit-review" className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Leave a Review
            </Link>
            <button onClick={() => setShowLogoutModal(true)} className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Log out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">

            <header className="flex items-end justify-between border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manager Workspace</h1>
                <div className="flex items-center gap-2 mt-2 animate-slide">
                  <span className="text-2xl animate-wave inline-block">👋</span>
                  <p className="text-slate-500 text-lg">
                    {greeting}, <span className="capitalize text-slate-900 font-bold">{userName}</span>!
                  </p>
                </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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