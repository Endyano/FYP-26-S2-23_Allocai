"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, apiPost } from "@/lib/api";

type InvitationDetails = {
  email: string;
  role: string;
  company_name: string;
  requires_signup: boolean;
};

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      try {
        const result = await apiFetch<{ invitation: InvitationDetails }>(
          `/api/auth/invitations/${token}`
        );

        if (!result.success) {
          setLoadError(result.message || "This invitation could not be found.");
          return;
        }

        setInvitation(result.invitation);
      } catch {
        setLoadError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await apiPost<{ redirect_to?: string }>(
        `/api/auth/invitations/${token}/accept`,
        invitation?.requires_signup
          ? { full_name: fullName, phone_number: phone, password }
          : {}
      );

      if (!result.success) {
        setSubmitError(result.message || "Could not accept the invitation.");
        return;
      }

      router.push(result.redirect_to || "/");
    } catch {
      setSubmitError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/30">
          {loading ? (
            <p className="text-center text-sm text-slate-500">Loading invitation...</p>
          ) : loadError || !invitation ? (
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-semibold">Invitation not available</h1>
              <p className="text-sm text-rose-600">{loadError}</p>
              <Link href="/Features/login" className="font-medium text-slate-950 underline">
                Go to login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-center">
                <h1 className="text-2xl font-semibold">Join {invitation.company_name}</h1>
                <p className="text-sm text-slate-500">
                  You&apos;ve been invited as <span className="font-semibold capitalize">{invitation.role.replace(/_/g, " ")}</span> for{" "}
                  <span className="font-medium">{invitation.email}</span>.
                </p>
              </div>

              {invitation.requires_signup ? (
                <form onSubmit={handleAccept} className="grid gap-5">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
                  />
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-950 outline-none transition disabled:opacity-50 focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
                  />

                  {submitError ? (
                    <p className="text-center text-sm text-rose-600">{submitError}</p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-80 hover:bg-slate-800"
                  >
                    {isSubmitting ? "Creating account..." : "Accept & create account"}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <p className="text-center text-sm text-slate-500">
                    An account already exists for this email. Log in with {invitation.email}, then come back to this page to accept.
                  </p>

                  {submitError ? (
                    <p className="text-center text-sm text-rose-600">{submitError}</p>
                  ) : null}

                  <button
                    onClick={handleAccept}
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-80 hover:bg-slate-800"
                  >
                    {isSubmitting ? "Accepting..." : "I'm logged in — accept invitation"}
                  </button>
                  <Link
                    href="/Features/login"
                    className="block text-center text-sm font-medium text-slate-500 underline hover:text-slate-950"
                  >
                    Go to login
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
