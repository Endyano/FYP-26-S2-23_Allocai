'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
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
      setUserName(savedUser.replace(/[._]/g, ' '));
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
        @keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-20deg); } 75% { transform: rotate(20deg); } }
        @keyframes slideRight { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-wave { animation: wave 2.5s ease-in-out infinite; transform-origin: 70% 70%; }
        .animate-slide { animation: slideRight 0.5s ease-out forwards; opacity: 0; animation-delay: 0.15s; }
      `}</style>

      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
        
        {/* SIDEBAR */}
        <aside className="flex w-72 flex-col justify-between bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="py-8">
            <div className="px-8 mb-10 flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
               </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Allocai</span>
            </div>

            <nav className="flex flex-col px-4 space-y-2">
              <Link href="/Features/department_dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/Features/department_dashboard' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Manage Tasks
              </Link>
              
              <Link href="/Features/department_dashboard/assign" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.includes('/assign') ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Assign Staff
              </Link>

              <Link href="/Features/department_dashboard/approvals" className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname.includes('/approvals') ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 22h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-5"/><polyline points="11 16 15 12 11 8"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Cancellations
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
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Department Workspace</h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-indigo-200/50 mt-1.5">
                    Department Staff
                  </span>
                </div>
                
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
            <div className="bg-white px-10 py-10 rounded-3xl shadow-xl w-full max-w-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
                <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Ready to leave?</h3>
              <p className="text-center text-sm text-slate-500 mb-8">You will need to log in again to access the dashboard.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors">Yes, log out</button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}