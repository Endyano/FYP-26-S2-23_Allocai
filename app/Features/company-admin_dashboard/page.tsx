'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Stats = {
  total_users: number;
  total_departments: number;
  total_skillsets: number;
  active_users: number;
  suspended_users: number;
};

function StatCard({ label, value, accent, sublabel }: { label: string; value: number | null; accent: string; sublabel?: string }) {
  const ringValue = value !== null ? Math.min((value / 100) * 100, 100) : 0;
  return (
    <div className={`relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 ${accent} overflow-hidden transition-all hover:shadow-md hover:-translate-y-1`}>
      <div className="relative z-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
        <p className="text-4xl font-black text-slate-900 mt-3">
          {value !== null ? value : <span className="text-slate-300 animate-pulse">—</span>}
        </p>
        {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
      </div>
      <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-40" viewBox="0 0 36 36">
        <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"/>
        <path className="text-current opacity-60" stroke="currentColor" strokeDasharray={`${ringValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"/>
      </svg>
    </div>
  );
}

const QUICK_LINKS = [
  { href: '/Features/company-admin_dashboard/profile', label: 'Company Profile', desc: 'View and update company info', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { href: '/Features/company-admin_dashboard/users', label: 'User Management', desc: 'Manage accounts, invite users', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { href: '/Features/company-admin_dashboard/departments', label: 'Departments', desc: 'Create and manage departments', color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { href: '/Features/company-admin_dashboard/roles', label: 'Roles', desc: 'Define roles and permissions', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { href: '/Features/company-admin_dashboard/skillsets', label: 'Skillsets', desc: 'Manage available skillsets', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { href: '/Features/company-admin_dashboard/audit', label: 'Audit Log', desc: 'View system change history', color: 'bg-rose-50 text-rose-700 border-rose-100' },
];

export default function CompanyAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const [employeesRes, departmentsRes, skillsetsRes] = await Promise.all([
        apiFetch<{ employees: { member_status: string }[] }>('/api/company-admin/employees'),
        apiFetch<{ departments: unknown[] }>('/api/company-admin/departments'),
        apiFetch<{ skillsets: unknown[] }>('/api/company-admin/skillsets'),
      ]);

      const employees = employeesRes.success ? employeesRes.employees || [] : [];

      setStats({
        total_users: employees.length,
        active_users: employees.filter(e => e.member_status === 'active').length,
        suspended_users: employees.filter(e => e.member_status === 'suspended').length,
        total_departments: departmentsRes.success ? (departmentsRes.departments || []).length : 0,
        total_skillsets: skillsetsRes.success ? (skillsetsRes.skillsets || []).length : 0,
      });
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Employees" value={stats?.total_users ?? null} accent="border-t-indigo-500" sublabel="All accounts" />
        <StatCard label="Active Employees" value={stats?.active_users ?? null} accent="border-t-emerald-500" sublabel="Not suspended" />
        <StatCard label="Departments" value={stats?.total_departments ?? null} accent="border-t-sky-500" sublabel="Across company" />
        <StatCard label="Skillsets" value={stats?.total_skillsets ?? null} accent="border-t-amber-500" sublabel="Defined skills" />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col gap-1 rounded-2xl border p-5 font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 ${link.color}`}
            >
              <span className="text-base">{link.label}</span>
              <span className="text-xs font-normal opacity-70">{link.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
