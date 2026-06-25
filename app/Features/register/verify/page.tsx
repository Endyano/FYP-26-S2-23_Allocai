"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");

  useEffect(() => {
    // Generate a mock OTP and "send" it (for demo purposes store in localStorage)
    const otp = Math.floor(1000 + Math.random() * 900000).toString();
    localStorage.setItem("allocai_mock_otp", otp);
    setSentCode(otp);
    // In production, trigger email/SMS send here
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = localStorage.getItem("allocai_mock_otp");
    if (code === expected) {
      localStorage.setItem("allocai_verified", "true");
      router.push('/Features/register/setup-workspace');
    } else {
      alert("Invalid code. Please check and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Verify your account</h1>
            <p className="text-sm text-slate-500">Enter the 4-6 digit code sent to your email/phone.</p>
          </div>

          <form onSubmit={handleVerify} className="grid gap-5">
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
            <button className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">Verify</button>
          </form>

          <p className="text-xs text-slate-400">(Demo) Your code: <span className="font-mono text-slate-700">{sentCode}</span></p>
        </div>
      </div>
    </main>
  );
}
