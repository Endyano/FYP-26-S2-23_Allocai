'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simpan nama agar Homepage bisa mendeteksi user
    localStorage.setItem('allocai_user', fullName);
    // Redirect ke home
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-semibold">Create account</h1>
            <p className="text-sm text-slate-500">Start using Allocai in seconds.</p>
          </div>

          {/* Form to create a new user */}
          <form onSubmit={handleSubmit} className="grid gap-5">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <button type="submit" className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              Register
            </button>
          </form>

          {/* Link back to the login page */}
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link href="/Features/login" className="font-semibold text-slate-950">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}