'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const registerResult = await apiPost('/api/public/register', {
        full_name: fullName,
        email,
        password,
        phone_number: phone,
      });

      if (!registerResult.success) {
        setError(registerResult.message || 'Registration failed.');
        return;
      }

      // The account isn't confirmed yet, so it can't log in until the
      // verification code is entered. Pass the email along for that step.
      sessionStorage.setItem('allocai_pending_email', email);
      router.push('/Features/register/verify');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />

            {error ? (
              <p className="text-center text-sm text-rose-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-80 hover:bg-slate-800"
            >
              {isLoading ? 'Creating account...' : 'Register'}
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
