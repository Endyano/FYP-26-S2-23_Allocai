'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Plan = {
  subscription_plan_id: string;
  plan_name: string;
  plan_description: string | null;
  plan_price: number;
  staff_cap: number | null;
  feature_gate: Record<string, unknown> | null;
};

const ACRONYMS: Record<string, string> = { ai: 'AI', sms: 'SMS', api: 'API' };

function prettifyKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => ACRONYMS[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatFeatureGates(gates: Plan['feature_gate']): string[] {
  if (!gates || Object.keys(gates).length === 0) return [];

  const features: string[] = [];

  for (const [key, value] of Object.entries(gates)) {
    if (value === false || (value === null && key !== 'departments')) continue;

    if (key === 'departments') {
      features.push(value === null ? 'Unlimited departments' : `${value} department${value === 1 ? '' : 's'}`);
    } else if (key === 'reports' && typeof value === 'string') {
      features.push(`${prettifyKey(value)} reports`);
    } else if (key === 'alerts' && Array.isArray(value)) {
      features.push(`${value.map(v => prettifyKey(String(v))).join(', ')} alerts`);
    } else if (value === true) {
      features.push(prettifyKey(key));
    } else if (Array.isArray(value)) {
      features.push(`${prettifyKey(key)}: ${value.map(String).join(', ')}`);
    } else {
      features.push(`${prettifyKey(key)}: ${String(value)}`);
    }
  }

  return features;
}

export default function PricingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (savedUser) setUserName(savedUser);
  }, []);

  useEffect(() => {
    async function loadPlans() {
      const result = await apiFetch<{ plans?: Plan[] }>('/api/public/subscription-plans');
      setPlans(result.plans ?? []);
      setLoading(false);
    }
    loadPlans();
  }, []);

  const maxPrice = Math.max(0, ...plans.map(p => Number(p.plan_price)));

  const handleLogout = () => {
    localStorage.removeItem('allocai_user');
    setUserName(null);
  };

  return (
    <main className="relative min-h-screen bg-white text-zinc-900 font-sans">

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(231,229,228,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(231,229,228,0.6)_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">

        {/* Nav */}
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
              <div onClick={handleLogout} className="flex cursor-pointer items-center gap-3 rounded-full bg-white/60 pl-1.5 pr-5 py-1.5 ring-1 ring-zinc-200 backdrop-blur-md transition-all hover:bg-white hover:shadow-md" title="Click to log out">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-bold uppercase">{userName.charAt(0)}</div>
                <span className="font-semibold text-zinc-800 capitalize">{userName}</span>
              </div>
            ) : (
              <>
                <Link href="/Features/login" className="bg-zinc-900 text-white border border-zinc-700 border-b-[4px] font-semibold px-6 py-2 rounded-full hover:bg-zinc-800 transition-all">Log in</Link>
                <Link href="/Features/register" className="bg-white text-zinc-900 border border-zinc-200 border-b-[4px] font-semibold px-6 py-2 rounded-full hover:bg-zinc-50 transition-all">Register</Link>
              </>
            )}
          </div>
        </nav>

        {/* Heading */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-zinc-500">Start for free, upgrade when your team grows.</p>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => <div key={i} className="h-96 rounded-2xl bg-zinc-100 animate-pulse" />)}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-center text-zinc-500">Plans are not available right now. Please check back shortly.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(plan => {
              const price = Number(plan.plan_price);
              const featured = price === maxPrice && price > 0;
              const features = [
                plan.staff_cap != null ? `Up to ${plan.staff_cap} staff members` : 'Unlimited staff members',
                ...formatFeatureGates(plan.feature_gate),
              ];

              return (
                <div
                  key={plan.subscription_plan_id}
                  className={`relative flex flex-col rounded-2xl p-8 ${
                    featured
                      ? 'bg-zinc-900 text-white shadow-2xl'
                      : 'bg-white border border-zinc-200 shadow-sm'
                  }`}
                >
                  {/* Most Popular badge */}
                  {featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan name */}
                  <h3 className={`text-xl font-bold mb-1 ${featured ? 'text-white' : 'text-zinc-900'}`}>
                    {plan.plan_name}
                  </h3>

                  {/* Price */}
                  <div className={`flex items-baseline gap-1 mt-3 mb-3 ${featured ? 'text-white' : 'text-zinc-900'}`}>
                    <span className="text-5xl font-extrabold">${price % 1 === 0 ? price.toFixed(0) : price}</span>
                    <span className={`text-lg font-medium ${featured ? 'text-zinc-400' : 'text-zinc-500'}`}>/mo</span>
                  </div>

                  {/* Description */}
                  <p className={`text-sm mb-8 ${featured ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {plan.plan_description || `The ${plan.plan_name} plan.`}
                  </p>

                  {/* Features */}
                  <ul className="space-y-4 flex-1 mb-8">
                    {features.map((f, i) => (
                      <li key={i} className={`flex items-center gap-3 text-sm ${featured ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        <svg className={`h-4 w-4 flex-shrink-0 ${featured ? 'text-rose-400' : 'text-zinc-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => router.push(`/Features/checkout?plan=${encodeURIComponent(plan.plan_name)}`)}
                    className={`w-full rounded-full py-3.5 text-sm font-bold transition-all ${
                      featured
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {price === 0 ? 'Start for free' : 'Get Started'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
