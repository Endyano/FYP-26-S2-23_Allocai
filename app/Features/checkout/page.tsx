"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";

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
  const planId = params?.get('plan_id') || '';
  const planName = params?.get('plan_name') || 'selected';
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!planId) {
      setError('No plan was selected. Please go back and choose a plan.');
      return;
    }
    setPaying(true);
    setError('');
    const result = await apiPost('/api/auth/subscription/purchase', { subscription_plan_id: planId });
    if (result.success) {
      router.push('/Features/payment-success');
    } else {
      setError(result.message || 'Could not complete your purchase. Please try again.');
      setPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Checkout</h1>
            <p className="text-sm text-slate-500">You're about to subscribe to the <strong>{planName}</strong> plan.</p>
          </div>

          <div className="grid gap-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">Summary: <strong>{planName}</strong></div>
            {error && <p className="text-sm text-rose-600 font-medium text-center">{error}</p>}
            <button onClick={handlePay} disabled={paying} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {paying ? 'Processing...' : 'Pay Securely (Demo)'}
            </button>
            <button onClick={() => router.push('/Features/pricing')} className="rounded-full border border-slate-200 px-6 py-4 text-sm">Back to plans</button>
          </div>
        </div>
      </div>
    </main>
  );
}
