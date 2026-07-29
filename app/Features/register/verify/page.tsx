"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("allocai_pending_email");

    if (!pendingEmail) {
      router.replace("/Features/register");
      return;
    }

    setEmail(pendingEmail);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsVerifying(true);

    try {
      const result = await apiPost<{ redirect_to?: string }>(
        "/api/auth/verify-signup",
        { email, code }
      );

      if (!result.success) {
        setError(result.message || "Invalid or expired code.");
        return;
      }

      sessionStorage.removeItem("allocai_pending_email");
      router.push(result.redirect_to || "/Features/register/setup-workspace");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setIsResending(true);

    try {
      const result = await apiPost("/api/auth/resend-otp", { email });

      if (!result.success) {
        setError(result.message || "Could not resend the code.");
        return;
      }

      setInfo("A new code has been sent to your email.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Verify your account</h1>
            <p className="text-sm text-slate-500">
              Enter the 6-digit code sent to {email || "your email"}.
            </p>
          </div>

          <form onSubmit={handleVerify} className="grid gap-5">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={isVerifying}
              className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-lg tracking-[0.3em] text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />

            {error ? (
              <p className="text-center text-sm text-rose-600">{error}</p>
            ) : null}
            {info ? (
              <p className="text-center text-sm text-emerald-600">{info}</p>
            ) : null}

            <button
              type="submit"
              disabled={isVerifying}
              className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-80 hover:bg-slate-800"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="w-full text-center text-sm font-medium text-slate-500 transition hover:text-slate-950 disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend code"}
          </button>
        </div>
      </div>
    </main>
  );
}
