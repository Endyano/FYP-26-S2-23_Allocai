"use client";

import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  const choosePlan = (plan: string) => {
    // In a real app you'd pass to checkout with query params or state
    router.push(`/Features/checkout?plan=${plan}`);
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6 rounded-[1rem] border border-slate-200 bg-white p-8 shadow">
            <h3 className="text-xl font-semibold">Starter</h3>
            <p className="text-sm text-slate-500">Basic features for small teams</p>
            <p className="text-3xl font-bold">Free</p>
            <button onClick={() => choosePlan('starter')} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Choose</button>
          </div>

          <div className="space-y-6 rounded-[1rem] border border-slate-200 bg-white p-8 shadow">
            <h3 className="text-xl font-semibold">Pro</h3>
            <p className="text-sm text-slate-500">For growing companies</p>
            <p className="text-3xl font-bold">$49 / month</p>
            <button onClick={() => choosePlan('pro')} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Upgrade</button>
          </div>

          <div className="space-y-6 rounded-[1rem] border border-slate-200 bg-white p-8 shadow">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="text-sm text-slate-500">Custom solutions</p>
            <p className="text-3xl font-bold">Contact</p>
            <button onClick={() => choosePlan('enterprise')} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Contact Sales</button>
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PricingPage() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (savedUser) {
      setUserName(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('allocai_user');
    setUserName(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FCFBF9] text-zinc-900 font-sans selection:bg-rose-100">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(231,229,228,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(231,229,228,0.6)_1px,transparent_1px)] bg-[size:24px_24px] animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(251,113,133,0.15),transparent_50%)]" />

      <div className="mx-auto relative max-w-6xl px-6 py-8">
        
        {/* Navigation Bar */}
        <nav className="sticky top-4 z-50 mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/50 bg-white/80 px-6 py-3.5 shadow-sm ring-1 ring-zinc-900/5 backdrop-blur-xl mb-16">
          <Link href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">
            Allocai
          </Link>
          
          <div className="hidden items-center gap-10 md:flex text-sm font-medium text-zinc-500">
            <Link href="/#product" className="transition-colors hover:text-zinc-900">Product</Link>
            <Link href="/Features/pricing" className="text-zinc-900 font-bold">Pricing</Link>
            <Link href="/#reviews" className="transition-colors hover:text-zinc-900">Reviews</Link>
            <Link href="/#faq" className="transition-colors hover:text-zinc-900">FAQ</Link>
            <Link href="/#contact" className="transition-colors hover:text-zinc-900">Contact us</Link>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            {userName ? (
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
              <>
                <Link href="/Features/login" className="bg-zinc-900 text-white border border-zinc-700 border-b-[4px] font-semibold overflow-hidden relative px-6 py-2 rounded-full hover:bg-zinc-800 hover:border-t-[4px] hover:border-b active:opacity-75 outline-none duration-300 group backdrop-blur-sm">
                  Log in
                </Link>
                <Link href="/Features/register" className="bg-white text-zinc-900 border border-zinc-200 border-b-[4px] font-semibold overflow-hidden relative px-6 py-2 rounded-full hover:bg-zinc-50 hover:border-t-[4px] hover:border-b active:opacity-75 outline-none duration-300 group backdrop-blur-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Pricing Section */}
        <section className="py-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Simple, transparent pricing</h1>
            <p className="mt-4 text-lg text-zinc-500">Start for free, upgrade when your team grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Free Tier */}
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-900/5 flex flex-col">
              <h3 className="text-xl font-bold text-zinc-900">Starter</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-zinc-900">
                $0<span className="ml-1 text-xl font-medium text-zinc-500">/mo</span>
              </div>
              <p className="mt-4 text-zinc-500 text-sm">Perfect for small teams testing the waters.</p>
              <ul className="mt-8 space-y-4 flex-1">
                {['Up to 10 staff members', 'Basic task allocation', 'Standard support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-700">
                    <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/Features/register" className="mt-8 block w-full rounded-full bg-zinc-100 px-6 py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition-colors">
                Start for free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative rounded-3xl bg-zinc-900 p-8 shadow-xl flex flex-col">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white tracking-wide uppercase">Most Popular</div>
              <h3 className="text-xl font-bold text-white">Professional</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                $49<span className="ml-1 text-xl font-medium text-zinc-400">/mo</span>
              </div>
              <p className="mt-4 text-zinc-400 text-sm">Everything you need for a growing operation.</p>
              <ul className="mt-8 space-y-4 flex-1">
                {['Unlimited staff members', 'AI auto-scheduling', 'Live conflict resolution', 'Priority 24/7 support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/Features/register" className="mt-8 block w-full rounded-full bg-rose-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-rose-600 transition-colors">
                Get Started
              </Link>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}