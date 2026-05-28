'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  
  // 1. State variable to store the logged-in user's name
  const [userName, setUserName] = useState<string | null>(null);

  // 2. Check localStorage when the page loads
  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (savedUser) {
      setUserName(savedUser); // This triggers the UI switch!
    }
  }, []);

  // 3. A function to log out (attached to the profile badge)
  const handleLogout = () => {
    localStorage.removeItem('allocai_user');
    setUserName(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FCFBF9] text-zinc-900 font-sans selection:bg-rose-100">
      
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(231,229,228,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(231,229,228,0.6)_1px,transparent_1px)] bg-[size:24px_24px] animate-[pulse_10s_ease-in-out_infinite]" />
      
      {/* Dramatic Background Glows */}
      <div className="absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(251,113,133,0.15),transparent_50%)]" />
      <div className="absolute left-[-10%] top-[-10%] -z-10 h-[40rem] w-[40rem] rounded-full bg-rose-50/50 blur-3xl" />
      <div className="absolute right-[-10%] top-[20%] -z-10 h-[30rem] w-[30rem] rounded-full bg-sky-50/50 blur-3xl" />

      <div className="mx-auto relative max-w-6xl px-6 py-8">
        
        {/* Frosted Jewel Navbar */}
        <nav className="sticky top-4 z-50 mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/50 bg-white/80 px-6 py-3.5 shadow-sm ring-1 ring-zinc-900/5 backdrop-blur-xl">
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">
            Allocai
          </span>
          <div className="hidden items-center gap-10 md:flex text-sm font-medium text-zinc-500">
            <a href="#product" className="transition-colors hover:text-rose-500">Product</a>
            <a href="#features" className="transition-colors hover:text-rose-500">Features</a>
          </div>
          
          {/* CONDITIONAL RENDERING BLOCK */}
          <div className="flex items-center gap-6 text-sm font-medium">
            
            {userName ? (
              /* --- SHOW THIS IF LOGGED IN: User Profile Pill --- */
              <div 
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-3 rounded-full bg-white/60 pl-1.5 pr-5 py-1.5 ring-1 ring-zinc-200 backdrop-blur-md transition-all hover:bg-white hover:shadow-md"
                title="Click to log out"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-bold shadow-inner uppercase">
                  {userName.charAt(0)}
                </div>
                <span className="font-semibold text-zinc-800 capitalize">{userName}</span>
              </div>
            ) : (
              /* --- SHOW THIS IF LOGGED OUT: Original Buttons --- */
              <>
                <Link 
                  href="/Features/login" 
                  className="bg-zinc-900 text-white border border-zinc-700 border-b-[4px] font-semibold overflow-hidden relative px-6 py-2 rounded-full hover:bg-zinc-800 hover:border-t-[4px] hover:border-b active:opacity-75 outline-none duration-300 group backdrop-blur-sm"
                >
                  <span className="bg-white shadow-white absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-20 group-hover:top-[150%] duration-500 shadow-[0_0_15px_15px_rgba(255,255,255,0.2)]"></span>
                  Log in
                </Link>

                <a 
                  href="#" 
                  className="bg-zinc-900 text-white border border-zinc-700 border-b-[4px] font-semibold overflow-hidden relative px-6 py-2 rounded-full hover:bg-zinc-800 hover:border-t-[4px] hover:border-b active:opacity-75 outline-none duration-300 group backdrop-blur-sm"
                >
                  <span className="bg-white shadow-white absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-20 group-hover:top-[150%] duration-500 shadow-[0_0_15px_15px_rgba(255,255,255,0.2)]"></span>
                  Start for free
                </a>
              </>
            )}

          </div>
        </nav>

        {/* Hero Section */}
        <section className="mt-20 mb-24 text-center flex flex-col items-center">
          
          {/* HORIZONTAL LAYOUT: ROBOT (LEFT) -> SCANS -> TASK BOARD (RIGHT) */}
          <div className="relative z-10 mb-10 mt-6 flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-4xl mx-auto">
            
        
            {/* 2. EXPANDING TASK SCANNER (Right) */}
            <div className="relative z-10 w-full max-w-sm">
              <div className="smart-task-container">
                <div className="glass-block">
                  
                  {/* Default State (Closed) */}
                  <div className="main-content">
                    <h2 className="title-text flex items-center gap-3">
                      <span className="relative flex h-3 w-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
                      </span>
                      Live Sync Tasks
                    </h2>
                  </div>

                  {/* Hover State (Expanded Checklist with Glowing Scan items) */}
                  <div className="todo-grid">
                    <div className="todo-item animate-scan-1">
                      <input type="checkbox" id="task1" className="todo-checkbox" defaultChecked />
                      <label htmlFor="task1" className="todo-label">Inventory Audit (Assigned: Sarah)</label>
                    </div>
                    <div className="todo-item animate-scan-2">
                      <input type="checkbox" id="task2" className="todo-checkbox" defaultChecked />
                      <label htmlFor="task2" className="todo-label">Restock Shelves (Assigned: Mark)</label>
                    </div>
                    <div className="todo-item animate-scan-3">
                      <input type="checkbox" id="task3" className="todo-checkbox" />
                      <label htmlFor="task3" className="todo-label">Front Desk Relief (Finding match...)</label>
                    </div>
                    <div className="todo-item animate-scan-4">
                      <input type="checkbox" id="task4" className="todo-checkbox" />
                      <label htmlFor="task4" className="todo-label">Warehouse Cleanup (Pending)</label>
                    </div>
                  </div>

                  {/* Internal Scanning Laser Line */}
                  <div className="scan-effect"></div>
                </div>
              </div>
            </div>
          </div>
          {/* END HORIZONTAL LAYOUT */}

          <h1 className="mx-auto mt-8 max-w-4xl text-6xl font-extrabold tracking-tight sm:text-8xl leading-[1] text-zinc-900">
            Plan your team's day, <br />
            <span className="text-zinc-400">made simple.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-xl text-zinc-600 leading-relaxed font-medium">
            Stop managing spreadsheets. Allocai balances workloads and assigns shifts automatically, creating a peaceful and productive workplace for your crew.
          </p>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <span className="rounded-full bg-white px-6 py-3 text-rose-800 ring-1 ring-rose-100 shadow-md transition-shadow hover:shadow-lg">✨ AI Scheduling</span>
            <span className="rounded-full bg-white px-6 py-3 text-sky-800 ring-1 ring-sky-100 shadow-md transition-shadow hover:shadow-lg">📅 Live Sync</span>
            <span className="rounded-full bg-white px-6 py-3 text-teal-800 ring-1 ring-teal-100 shadow-md transition-shadow hover:shadow-lg">🎯 Workload Balance</span>
          </div>
        </section>

        {/* 3D Interactive Tilt Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-20 perspective-wrapper">
          
          <div className="group relative rounded-[2.5rem] bg-white p-9 shadow-md ring-1 ring-zinc-900/5 overflow-hidden transition-all duration-300 transform-3d hover:shadow-2xl hover:shadow-rose-100">
            <div className="absolute right-[-10%] top-[-10%] h-40 w-40 rounded-full bg-rose-50/50 blur-2xl transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex h-full flex-col justify-between space-y-12">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-8">
                  <div className="h-4 w-4 rounded-full bg-rose-300" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Instant Match</h3>
                <p className="mt-4 text-zinc-500 leading-relaxed text-sm">
                  Allocai pairs tasks to the right staff based on availability and skills, instantly.
                </p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-900/5 shadow-inner">
                <div className="flex justify-between items-center text-sm font-medium text-zinc-600">
                  <span>Processing...</span>
                  <span className="text-rose-500 font-semibold">Matched in 0.4s</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full w-full rounded-full bg-rose-400 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2.5rem] bg-white p-9 shadow-md ring-1 ring-zinc-900/5 overflow-hidden transition-all duration-300 transform-3d hover:shadow-2xl hover:shadow-sky-100">
            <div className="absolute left-[-10%] top-[-10%] h-40 w-40 rounded-full bg-sky-50/50 blur-2xl transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-8">
                  <div className="h-4 w-4 rounded-md bg-sky-300" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Live Overview</h3>
              <p className="mt-4 text-zinc-500 leading-relaxed text-sm">
                See exactly what everyone is working on in real-time. A calm, uncluttered queue.
              </p>
              <div className="mt-12 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-900/5 shadow-inner">
                      <span className="text-sm font-medium text-zinc-700">Front Desk</span>
                      <span className="rounded-lg bg-emerald-100/60 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 tracking-wider">Active</span>
                  </div>
                   <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-900/5 shadow-inner">
                      <span className="text-sm font-medium text-zinc-700">Warehouse</span>
                      <span className="rounded-lg bg-amber-100/60 border border-amber-100 px-3 py-1 text-xs font-bold text-amber-700 tracking-wider">Pending</span>
                  </div>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2.5rem] bg-white p-9 shadow-md ring-1 ring-zinc-900/5 overflow-hidden transition-all duration-300 transform-3d hover:shadow-2xl hover:shadow-teal-100">
            <div className="absolute bottom-[-10%] left-[-10%] h-40 w-40 rounded-full bg-teal-50/50 blur-2xl transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex h-full flex-col justify-between space-y-12">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-8">
                    <div className="h-4 w-4 rotate-45 rounded-sm bg-teal-300" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Balanced Teams</h3>
                <p className="mt-4 text-zinc-500 leading-relaxed text-sm">
                  Keep workloads even to prevent burnout. A healthier, happier workplace.
                </p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-7 ring-1 ring-zinc-900/5 shadow-inner text-center">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Coverage</span>
                  <div className="mt-3 text-6xl font-black text-teal-600 tracking-tighter">
                      100<span className="text-3xl font-bold text-teal-300">%</span>
                  </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}