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