'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // ==========================================
    // JALUR PINTAS (BYPASS) KHUSUS DEMO PROTOTIPE
    // ==========================================
    setTimeout(() => {
      const fakeName = email.split('@')[0] || 'User';
      localStorage.setItem('allocai_user', fakeName);

      // Deteksi tujuan otomatis dari email
      let redirectTo = '/Features/casual-staff_dashboard'; // Default
      const emailLower = email.toLowerCase();
      
      if (emailLower.includes('platform')) {
        redirectTo = '/Features/platform-admin_dashboard';
      } else if (emailLower.includes('companyadmin') || emailLower.includes('company') || emailLower.includes('cadmin')) {
        redirectTo = '/Features/company-admin_dashboard';
      } else if (emailLower.includes('manager')) {
        redirectTo = '/Features/manager_dashboard';
      } else if (emailLower.includes('fulltime') || emailLower.includes('full_time') || emailLower.includes('dept') || emailLower.includes('department')) {
        redirectTo = '/Features/department_dashboard';
      } else if (emailLower.includes('parttime') || emailLower.includes('part_time') || emailLower.includes('casual') || emailLower.includes('partime')) {
        redirectTo = '/Features/casual-staff_dashboard';
      }

      localStorage.setItem('allocai_route', redirectTo);
      router.push(redirectTo);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-semibold">Log in</h1>
            <p className="text-sm text-slate-500">Access your workspace</p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 flex justify-center items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition-all disabled:opacity-80 disabled:cursor-wait hover:bg-slate-800 active:scale-95"
            >
              {isLoading ? 'Processing...' : 'Log in'}
            </button>
          </form>
          
          <div className="flex items-center justify-between text-sm text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-950 transition group-hover:border-slate-400" />
              Remember
            </label>
            <Link href="/Features/forgot-password" className="font-medium text-slate-950/70 transition hover:text-slate-950">
              Forgot?
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500">
            New here? <Link href="/Features/register" className="font-medium text-slate-950 transition hover:text-slate-950">Register</Link>
          </p>
        </div>
      </div>
    </main>
  );
}