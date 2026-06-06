'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  
  // 1. Capture user inputs and backend state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager'); // 👈 Tracks your chosen role state
  const [error, setError] = useState('');

  // 2. Merged submission handler connecting to your Flask backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    setError('');

    try {
      // Build form data payload matching your Flask request.form structure
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('role', role); // 👈 Dynamically passes 'manager', 'casual_staff', or 'department'

      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Extract a friendly name from the email (Endy's logic) or use a backend fallback
        const name = email.split('@')[0] || "User"; 
        
        // Save to browser memory so your local frontend components still recognize the session
        localStorage.setItem('allocai_user', name);

        // Dynamic backend routing (Redirects to /Features/manager_dashboard, etc.)
        router.push(data.redirect_to);
      } else {
        // Update user screen with the exact database validation error message
        setError(data.message || 'Invalid username, password, or role.');
      }
    } catch (err) {
      setError('Unable to connect to the backend server.');
      console.error('Connection error:', err);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-semibold">Log in</h1>
            <p className="text-sm text-slate-500">Access your workspace</p>
          </div>

          {/* Render error banner if backend authorization fails */}
          {error && (
            <p className="text-sm font-medium text-red-500 text-center bg-red-50 p-3 rounded-2xl border border-red-100">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="grid gap-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />

            {/* 🛠️ Dynamic Workspace Role Selector Dropdown */}
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none appearance-none cursor-pointer transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="manager">Manager / Administrator</option>
                <option value="casual_staff">Casual Staff</option>
                <option value="department">Department Staff</option>
              </select>
            </div>

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