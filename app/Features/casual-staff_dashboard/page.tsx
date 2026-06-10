'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CasualStaffDashboard() {
  const router = useRouter();
  
  // Save the logged-in user's name
  const [userName, setUserName] = useState<string | null>(null);

  // Check if the user is allowed to be here when the page loads
  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (!savedUser) {
      // If not logged in, send them back to the login screen
      router.push('/Features/login');
    } else {
      setUserName(savedUser);
    }
  }, [router]);

  // Sign out and go back to the login screen
  const handleLogout = () => {
    localStorage.removeItem('allocai_user');
    router.push('/Features/login');
  };

  // Wait until we have the user's name before loading the page
  if (!userName) return null;

  return (
    <main className="min-h-screen bg-[#FCFBF9] text-zinc-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex justify-between items-center rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-900/5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-zinc-500 mt-1">Hello, {userName}. Here is your schedule for today.</p>
          </div>
          <button onClick={handleLogout} className="rounded-full bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
            Log out
          </button>
        </header>

        {/* Task List Box */}
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-900/5">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold">Current Assignments</h2>
             <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 tracking-wider uppercase">Clocked In</span>
          </div>
          
          <div className="space-y-4">
            
            {/* Fake Tasks (To be replaced with real data from database later) */}
            <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-900/5 transition hover:shadow-md">
              <div>
                <h4 className="font-semibold text-zinc-900">Inventory Audit</h4>
                <p className="text-sm text-zinc-500">Warehouse A • 09:00 AM - 12:00 PM</p>
              </div>
              <button className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-300">
                Mark Complete
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-900/5 transition hover:shadow-md">
              <div>
                <h4 className="font-semibold text-zinc-900">Front Desk Relief</h4>
                <p className="text-sm text-zinc-500">Main Lobby • 01:00 PM - 05:00 PM</p>
              </div>
              <button className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-300">
                Mark Complete
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}