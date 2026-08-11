'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const NAV = [
  {
    href: '/Features/company-admin_dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    ),
    exact: true,
  },
  {
    href: '/Features/company-admin_dashboard/profile',
    label: 'Company Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
  },
  {
    href: '/Features/company-admin_dashboard/users',
    label: 'User Management',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    href: '/Features/company-admin_dashboard/departments',
    label: 'Departments',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="2" y="2" rx="1"/><rect width="8" height="8" x="14" y="2" rx="1"/><rect width="8" height="8" x="2" y="14" rx="1"/><rect width="8" height="8" x="14" y="14" rx="1"/></svg>
    ),
  },
  {
    href: '/Features/company-admin_dashboard/roles',
    label: 'Roles',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
  },
  {
    href: '/Features/company-admin_dashboard/skillsets',
    label: 'Skillsets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
    ),
  },
  {
    href: '/Features/company-admin_dashboard/hour-limits',
    label: 'Hour Limit Approvals',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.41 6.41 2.83 2.83"/><path d="M2 12h4"/><path d="m6.41 17.59 2.83-2.83"/><path d="M12 18v4"/><path d="m17.59 17.59-2.83-2.83"/><path d="M22 12h-4"/><path d="m17.59 6.41-2.83 2.83"/></svg>
    ),
  },
  {
    href: '/Features/company-admin_dashboard/audit',
    label: 'Audit Log',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    ),
  },
];

export default function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Welcome back');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const result = await apiFetch<{ full_name?: string; role?: string }>('/api/auth/session');

      if (!result.success || result.role !== 'company_admin') {
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
  }, [router]);

  const confirmLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/');
  };

  if (!userName) return null;

  const isActive = (item: typeof NAV[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <style>{`
        @keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-20deg); } 75% { transform: rotate(20deg); } }
        @keyframes slideRight { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-wave { animation: wave 2.5s ease-in-out infinite; transform-origin: 70% 70%; }
        .animate-slide { animation: slideRight 0.5s ease-out forwards; opacity: 0; animation-delay: 0.15s; }
      `}</style>

      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">

        {/* SIDEBAR */}
        <aside className="flex w-72 flex-col justify-between bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="py-8">
            <div className="px-8 mb-10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Allocai</span>
            </div>

            <nav className="flex flex-col px-4 space-y-1">
              {NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(item)
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="px-4 py-2 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-bold text-slate-700 capitalize mt-0.5 truncate">{userName}</p>
              <p className="text-xs text-slate-400">Company Admin</p>
            </div>
            <Link
              href="/Features/submit-review"
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Leave a Review
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex items-end justify-between border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Company Admin</h1>
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

        {/* LOGOUT MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
