"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickStartPage() {
  const router = useRouter();
  const [managerEmail, setManagerEmail] = useState("");
  const [division, setDivision] = useState("");

  const inviteManager = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!managerEmail) {
      alert('Enter manager email or skip');
      return;
    }
    // For demo: store invites locally
    const invites = JSON.parse(localStorage.getItem('allocai_invites' ) || '[]');
    invites.push({ email: managerEmail, invitedAt: Date.now() });
    localStorage.setItem('allocai_invites', JSON.stringify(invites));
    setManagerEmail('');
    alert('Invitation sent (demo). You can skip this step.');
  };

  const createDivision = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!division) {
      alert('Enter a division name or skip');
      return;
    }
    const divs = JSON.parse(localStorage.getItem('allocai_divisions') || '[]');
    divs.push({ name: division, createdAt: Date.now() });
    localStorage.setItem('allocai_divisions', JSON.stringify(divs));
    setDivision('');
    alert('Division created (demo).');
  };

  const finishOnboarding = () => {
    // Set trial subscription info
    const trialEnds = Date.now() + 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem('allocai_subscription', JSON.stringify({ status: 'trial', plan: 'basic', expiresAt: trialEnds }));
    localStorage.setItem('allocai_onboarding_complete', 'true');
    router.push('/Features/company-admin_dashboard');
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Quick start</h1>
            <p className="text-sm text-slate-500">Do one of these to get started faster. You can skip.</p>
          </div>

          <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <input
                type="email"
                placeholder="Invite a manager (email)"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={(e) => { e.preventDefault(); inviteManager(); }} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Invite</button>
                <button onClick={() => setManagerEmail('')} className="rounded-full border border-slate-200 px-4 py-2 text-sm">Clear</button>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Create your first division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={(e) => { e.preventDefault(); createDivision(); }} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Create</button>
                <button onClick={() => setDivision('')} className="rounded-full border border-slate-200 px-4 py-2 text-sm">Clear</button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button onClick={finishOnboarding} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white">Finish and go to dashboard</button>
              <button onClick={() => { localStorage.setItem('allocai_onboarding_complete','true'); router.push('/Features/company-admin_dashboard'); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm">Skip</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
