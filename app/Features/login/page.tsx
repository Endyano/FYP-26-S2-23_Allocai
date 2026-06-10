'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  
  // The details the user types into the boxes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('casual_staff'); 
  const [error, setError] = useState('');
  
  // Checks if the dropdown menu is open or closed
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  
  // Checks if the app is currently busy verifying the password
  const [isLoading, setIsLoading] = useState(false);

  // Friendly names to show on the screen instead of code names
  const roleLabels: Record<string, string> = {
    'manager': 'Manager / Administrator',
    'casual_staff': 'Casual Staff',
    'department': 'Department Staff'
  };

  // This runs when the user clicks the Log In button
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from reloading
    setError('');
    
    // Start the spinning loading animation
    setIsLoading(true);

    try {
      // Send the login details to the Python backend
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
          role: role
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // If successful, save the user's name and send them to the dashboard
        localStorage.setItem('allocai_user', email.split('@')[0]);
        localStorage.setItem('allocai_route', data.redirect_to);
        router.push(data.redirect_to);
      } else {
        // If the password is wrong, show an error and stop the loading spinner
        setError(data.message || 'Wrong email, password, or role.');
        setIsLoading(false); 
      }
    } catch (err) {
      // If the Python server is turned off, show this error
      setError('Cannot connect to the server. Is it running?');
      console.error('Connection error:', err);
      setIsLoading(false);
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

          {/* Show the red error box if something goes wrong */}
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
              disabled={isLoading} // Lock this box while loading
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading} // Lock this box while loading
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />

            {/* Role Selection Menu */}
            <div className="grid gap-2 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Workspace Role</label>
              
              {/* The clickable box that opens the menu */}
              <div 
                onClick={() => !isLoading && setIsRoleOpen(!isRoleOpen)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-3xl border px-5 py-4 transition-all duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isRoleOpen 
                    ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-100' 
                    : 'border-slate-200 bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-slate-950">{roleLabels[role]}</span>
                
                {/* The arrow icon that flips when clicked */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                  className={`text-slate-500 transition-transform duration-300 ${isRoleOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* The list of roles that drops down */}
              <div className={`absolute left-0 right-0 top-[85px] z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 transition-all duration-200 origin-top ${
                isRoleOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'
              }`}>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setRole(key);
                      setIsRoleOpen(false); // Close the menu after clicking
                    }}
                    className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      role === key ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* The Log In button that shows a spinning circle when loading */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 flex justify-center items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition-all disabled:opacity-80 disabled:cursor-wait hover:bg-slate-800 active:scale-95"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>
          
          {/* Bottom links */}
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