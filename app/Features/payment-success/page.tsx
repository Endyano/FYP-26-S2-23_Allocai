"use client";

import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30 text-center">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Payment successful</h1>
            <p className="text-sm text-slate-500">Thank you — your account has been upgraded.</p>
          </div>
          <button onClick={() => router.push('/Features/company-admin_dashboard')} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">Return to dashboard</button>
        </div>
      </div>
    </main>
  );
}
