'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Perfect for small teams testing the waters.',
    features: ['Up to 5 staff members', 'Basic task allocation', 'Standard support'],
    cta: 'Start for free',
    featured: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/mo',
    description: 'Ideal for growing operations that need more control.',
    features: ['Up to 30 staff members', 'Smart task allocation', 'Cancellation management', 'Email support'],
    cta: 'Get Started',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99',
    period: '/mo',
    description: 'Everything you need for a fast-scaling business.',
    features: ['Up to 150 staff members', 'AI auto-scheduling', 'Advanced reports', 'Priority 24/7 support'],
    cta: 'Get Started',
    featured: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('allocai_user');
    if (savedUser) setUserName(savedUser);
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.featured
                  ? 'bg-zinc-900 text-white shadow-2xl'
                  : 'bg-white border border-zinc-200 shadow-sm'
              }`}
            >
              {/* Most Popular badge */}
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className={`text-xl font-bold mb-1 ${plan.featured ? 'text-white' : 'text-zinc-900'}`}>
                {plan.name}
              </h3>

              {/* Price */}
              <div className={`flex items-baseline gap-1 mt-3 mb-3 ${plan.featured ? 'text-white' : 'text-zinc-900'}`}>
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className={`text-lg font-medium ${plan.featured ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.period}</span>
              </div>

              {/* Description */}
              <p className={`text-sm mb-8 ${plan.featured ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-4 flex-1 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm ${plan.featured ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <svg className={`h-4 w-4 flex-shrink-0 ${plan.featured ? 'text-rose-400' : 'text-zinc-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => router.push(`/Features/checkout?plan=${plan.id}`)}
                className={`w-full rounded-full py-3.5 text-sm font-bold transition-all ${
                  plan.featured
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
