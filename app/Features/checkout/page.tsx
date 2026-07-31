"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params?.get('plan') || 'pro';

  const handlePay = () => {
    // Simulate payment success
    const sub = { status: 'paid', plan, startedAt: Date.now() };
    localStorage.setItem('allocai_subscription', JSON.stringify(sub));
    router.push('/Features/payment-success');
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Checkout</h1>
            <p className="text-sm text-slate-500">You're about to subscribe to the <strong>{plan}</strong> plan.</p>
          </div>

          <div className="grid gap-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">Summary: <strong>{plan}</strong></div>
            <button onClick={handlePay} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">Pay Securely (Demo)</button>
            <button onClick={() => router.push('/Features/pricing')} className="rounded-full border border-slate-200 px-6 py-4 text-sm">Back to plans</button>
          </div>
        </div>
      </div>
    </main>
  );
}
