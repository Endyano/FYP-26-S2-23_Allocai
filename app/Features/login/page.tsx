'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  
  // 1. Create state variables to hold what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Create the function that runs when they click "Log in"
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Stops the page from doing a hard refresh
    
    // Extract a friendly name from the email (e.g., "alex@email.com" -> "Alex")
    // If you want it to always say "Endy" for your prototype, you can just use const name = "Endy";
    const name = email.split('@')[0] || "User"; 
    
    // Save it to the browser memory so the Home Page knows we logged in
    localStorage.setItem('allocai_user', name);

    // Bounce the user back to the home page
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-semibold">Log in</h1>
            <p className="text-sm text-slate-500">Access your workspace</p>
          </div>

          {/* 3. Add onSubmit to the form */}
          <form onSubmit={handleLogin} className="grid gap-5">
            <input
              type="email"
              placeholder="Email"
              value={email} // Bind the input to our state
              onChange={(e) => setEmail(e.target.value)} // Update state as they type
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="password"
              placeholder="Password"
              value={password} // Bind the input to our state
              onChange={(e) => setPassword(e.target.value)} // Update state as they type
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <button 
              type="submit" 
              className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Log in
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-950" />
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