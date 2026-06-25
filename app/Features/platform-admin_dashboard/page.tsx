'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_STYLES: Record<string, string> = {
  Active:    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Suspended: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  Deleted:   'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  Pending:   'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
};

const DOT_STYLES: Record<string, string> = {
  Active:    'bg-emerald-500',
  Suspended: 'bg-amber-500',
  Deleted:   'bg-rose-500',
  Pending:   'bg-sky-500',
};

export default function PlatformAdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Admin');
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (savedUser) {
      // Capitalize first letter
      setUserName(savedUser.charAt(0).toUpperCase() + savedUser.slice(1));
    }
  }, []);

  // --- MOCK DATA ---
  const [companies, setCompanies] = useState([
    { id: 'TEN-01', name: 'Optimo Foods', plan: 'Professional', status: 'Active', joined: '2025-10-12' },
    { id: 'TEN-02', name: 'Nexus Retail', plan: 'Starter', status: 'Active', joined: '2026-01-05' },
    { id: 'TEN-03', name: 'BlueWave Logistics', plan: 'Professional', status: 'Suspended', joined: '2026-03-20' },
  ]);

  const [plans, setPlans] = useState([
    { id: 'PLN-1', name: 'Starter', staffCap: 10, features: 'Basic Allocation' },
    { id: 'PLN-2', name: 'Professional', staffCap: 'Unlimited', features: 'AI Scheduling, Live Sync' },
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, author: 'M. Chen (Harbour Foods Pte. Ltd.)', text: 'Very helpful in cutting down scheduling time for the operations team.', status: 'Pending' },
    { id: 2, author: 'S. Jenkins (Nexus Retail)', text: 'The real-time feature occasionally lags when the connection is unstable.', status: 'Pending' },
  ]);

  const [auditLogs] = useState([
    { id: 101, action: 'Suspended Tenant', target: 'BlueWave Logistics', actor: 'platformadmin', time: '25 Jun 2026, 10:42 AM' },
    { id: 102, action: 'Updated Plan', target: 'Professional (Feature Gates)', actor: 'platformadmin', time: '25 Jun 2026, 07:15 AM' },
    { id: 103, action: 'Approved Review', target: 'Review #892', actor: 'platformadmin', time: '24 Jun 2026, 03:20 PM' },
    { id: 104, action: 'Created Tenant', target: 'Nexus Retail (TEN-02)', actor: 'platformadmin', time: '5 Jan 2026, 09:00 AM' },
    { id: 105, action: 'Deleted Review', target: 'Review #874', actor: 'platformadmin', time: '22 Dec 2025, 11:35 AM' },
    { id: 106, action: 'Updated Plan', target: 'Starter (Staff Cap: 10)', actor: 'platformadmin', time: '15 Nov 2025, 02:10 PM' },
    { id: 107, action: 'Created Tenant', target: 'Harbour Foods Pte. Ltd. (TEN-01)', actor: 'platformadmin', time: '12 Oct 2025, 08:30 AM' },
  ]);

  // --- MODALS ---
  const [editPlanModal, setEditPlanModal] = useState<any | null>(null);
  const [deleteTenantModal, setDeleteTenantModal] = useState<any | null>(null);
  const [staffCapInput, setStaffCapInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- HANDLERS ---
  const confirmLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    localStorage.removeItem('allocai_user');
    localStorage.removeItem('allocai_route');
    router.push('/');
  };

  const toggleTenantStatus = (id: string, currentStatus: string) => {
    setCompanies(prev => prev.map(c => 
      c.id === id ? { ...c, status: currentStatus === 'Active' ? 'Suspended' : 'Active' } : c
    ));
  };

  const deleteTenant = () => {
    setProcessing(true);
    setTimeout(() => {
      setCompanies(prev => prev.filter(c => c.id !== deleteTenantModal.id));
      setDeleteTenantModal(null);
      setProcessing(false);
    }, 800);
  };

  const savePlan = () => {
    setProcessing(true);
    setTimeout(() => {
      setPlans(prev => prev.map(p => 
        p.id === editPlanModal.id ? { ...p, staffCap: staffCapInput, features: featuresInput } : p
      ));
      setEditPlanModal(null);
      setProcessing(false);
    }, 800);
  };

  const resolveReview = (id: number, action: 'Approved' | 'Deleted') => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  // --- STATS ---
  const totalCompanies = companies.length;
  const activeSubs = companies.filter(c => c.status === 'Active').length;
  const pendingReviewsCount = reviews.length;

  const compRingValue = Math.min((totalCompanies / 10) * 100, 100);
  const subsRingValue = totalCompanies > 0 ? (activeSubs / totalCompanies) * 100 : 0;
  const revRingValue = Math.min((pendingReviewsCount / 10) * 100, 100);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-slate-900 font-sans">
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col fixed h-screen z-20">
        
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Allocai</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('companies')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'companies' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Companies
          </button>
          
          <button 
            onClick={() => setActiveTab('plans')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'plans' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Plans
          </button>
          
          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'reviews' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Reviews
            </div>
            {pendingReviewsCount > 0 && (
              <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('auditlogs')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'auditlogs' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Audit Logs
          </button>
        </nav>

        {/* User Profile + Logout (Bottom Left) */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center font-semibold text-base flex-shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">Platform Admin</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] p-10 max-w-6xl">
        
        {/* Header (Greeting) */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Platform Workspace</h1>
          <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
            <span className="text-2xl">👋</span> Good afternoon, <strong className="text-slate-800">{userName}</strong>!
          </p>
        </header>

        {/* Dashboard Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Companies</h3>
                  <p className="text-4xl font-black text-slate-900 mt-3">{totalCompanies}</p>
                </div>
                <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
                  <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className="text-indigo-400" stroke="currentColor" strokeDasharray={`${compRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
              </div>

              <div className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Subs</h3>
                  <p className="text-4xl font-black text-slate-900 mt-3">{activeSubs}</p>
                </div>
                <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
                  <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className="text-emerald-400" stroke="currentColor" strokeDasharray={`${subsRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
              </div>

              <div className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</h3>
                  <p className="text-4xl font-black text-slate-900 mt-3">{pendingReviewsCount}</p>
                </div>
                <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
                  <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className="text-rose-400" stroke="currentColor" strokeDasharray={`${revRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
              </div>
            </div>

          </div>
        )}

        {/* Companies */}
        {activeTab === 'companies' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Registered Companies</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Tenant ID</th>
                      <th className="px-6 py-4 font-semibold">Company Name</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {companies.map(comp => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500">{comp.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{comp.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[comp.status]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[comp.status]}`} />
                            {comp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => toggleTenantStatus(comp.id, comp.status)} className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50">
                              {comp.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button onClick={() => setDeleteTenantModal(comp)} className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        {activeTab === 'plans' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Subscription Plans</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Plan Name</th>
                      <th className="px-6 py-4 font-semibold">Staff Cap</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {plans.map(plan => (
                      <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{plan.name}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{plan.staffCap}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setEditPlanModal(plan); setStaffCapInput(plan.staffCap.toString()); setFeaturesInput(plan.features); }} className="rounded-lg bg-slate-900 text-white px-4 py-1.5 text-xs font-semibold hover:bg-slate-800">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'auditlogs' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">System Audit Logs</h2>
                  <p className="text-sm text-slate-500 mt-0.5">A record of all administrative actions performed on this platform.</p>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{auditLogs.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Log ID</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                      <th className="px-6 py-4 font-semibold">Target</th>
                      <th className="px-6 py-4 font-semibold">Actor</th>
                      <th className="px-6 py-4 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs">#{log.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{log.action}</td>
                        <td className="px-6 py-4 text-slate-600">{log.target}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {log.actor}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs text-right">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Moderate Reviews</h2>
                <span className="text-sm font-semibold text-slate-400">{pendingReviewsCount} Pending</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Author</th>
                      <th className="px-6 py-4 font-semibold">Review Text</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {reviews.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-500">No pending reviews.</td></tr>
                    ) : reviews.map(rev => (
                      <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{rev.author}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-sm">{rev.text}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => resolveReview(rev.id, 'Approved')} className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-bold mr-2 hover:bg-emerald-100">Approve</button>
                          <button onClick={() => resolveReview(rev.id, 'Deleted')} className="rounded-lg bg-rose-50 text-rose-700 px-3 py-1.5 text-xs font-bold hover:bg-rose-100">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODALS ================= */}
      {editPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Edit {editPlanModal.name} Plan</h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Set Staff Cap</label>
                <input type="text" value={staffCapInput} onChange={(e) => setStaffCapInput(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Set Feature Gates</label>
                <textarea value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={savePlan} disabled={processing} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl">{processing ? '...' : 'Save'}</button>
              <button onClick={() => setEditPlanModal(null)} disabled={processing} className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Tenant?</h3>
            <p className="text-sm text-slate-500 mb-8">Are you sure you want to permanently delete <strong className="text-slate-800">{deleteTenantModal.name}</strong>?</p>
            <div className="flex flex-col gap-3">
              <button onClick={deleteTenant} disabled={processing} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl">{processing ? '...' : 'Yes, delete'}</button>
              <button onClick={() => setDeleteTenantModal(null)} disabled={processing} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
  );
}