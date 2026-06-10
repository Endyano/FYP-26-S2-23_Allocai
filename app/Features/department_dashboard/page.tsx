'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DepartmentDashboard() {
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
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex justify-between items-center rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-900/5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Workspace</h1>
            <p className="text-zinc-500 mt-1">Manage your department's requests, {userName}.</p>
          </div>
          <button onClick={handleLogout} className="rounded-full bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
            Log out
          </button>
        </header>

        {/* Number Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-900/5 border-t-4 border-amber-400">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Staffing Requests</h3>
            <p className="text-4xl font-black text-zinc-900 mt-4">5 <span className="text-lg text-zinc-400 font-medium tracking-normal">Pending</span></p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-900/5 border-t-4 border-emerald-400">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Allocated Staff</h3>
            <p className="text-4xl font-black text-zinc-900 mt-4">12 <span className="text-lg text-zinc-400 font-medium tracking-normal">Active Today</span></p>
          </div>
        </div>

        {/* Empty area where real data will go later */}
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-900/5">
          <h2 className="text-xl font-bold mb-4">Department Tasks</h2>
          <div className="p-12 border-2 border-dashed border-zinc-200 rounded-2xl text-center text-zinc-500">
            Task data will be loaded here from the database.
          </div>
        </div>

      </div>
    </main>
  );
}