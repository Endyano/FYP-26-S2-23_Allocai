'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  manager: '/Features/manager_dashboard',
  company_admin: '/Features/company-admin_dashboard',
  full_time_staff: '/Features/department_dashboard',
  part_time_staff: '/Features/casual-staff_dashboard',
  registered_user: '/Features/register/setup-workspace',
};

export default function SubmitReviewPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerTitle, setReviewerTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const dashboardPath = ROLE_DASHBOARD_MAP[role] || '/';

  async function handleLogout() {
    setLoggingOut(true);
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  useEffect(() => {
    async function checkSession() {
      const result = await apiFetch<{ full_name?: string; role?: string }>('/api/auth/session');
      setLoggedIn(!!result.success);
      setFullName(result.full_name || '');
      setRole(result.role || '');
      setCheckingSession(false);
    }
    checkSession();
  }, []);

  async function submitReview() {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await apiPost('/api/auth/reviews', {
      rating,
      review_text: reviewText || null,
      reviewer_title: reviewerTitle || null,
    });
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.message || 'Could not submit your review. Please try again.');
    }
    setSubmitting(false);
  }

  if (checkingSession) return null;

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <div className="space-y-8 rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-2xl shadow-zinc-200/30">

          {!loggedIn ? (
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-semibold">Log in to leave a review</h1>
              <p className="text-sm text-zinc-500">Only Allocai users can share their experience.</p>
              <Link href="/Features/login?redirect=/Features/submit-review" className="inline-block rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
                Log in
              </Link>
            </div>
          ) : role === 'platform_admin' ? (
            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-semibold">Reviews aren't for platform admins</h1>
              <p className="text-sm text-zinc-500">Reviews are for the companies and staff using Allocai, not the team running it.</p>
              <Link href="/" className="inline-block text-sm font-semibold text-zinc-950 underline">Back to home</Link>
            </div>
          ) : submitted ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Thanks for the review!</h1>
                <p className="text-sm text-zinc-500 mt-1">It'll appear on our landing page once approved.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push(dashboardPath)}
                  className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition disabled:opacity-60"
                >
                  {loggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold">Share your experience</h1>
                <p className="text-sm text-zinc-500">{fullName ? `Thanks for being part of Allocai, ${fullName}.` : 'Tell other teams what you think.'}</p>
              </div>

              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <svg
                      className={`w-9 h-9 transition-colors ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-zinc-200'}`}
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
                    </svg>
                  </button>
                ))}
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Your role <span className="text-zinc-400 font-normal">(optional, e.g. "Store Manager")</span></label>
                  <input
                    type="text"
                    value={reviewerTitle}
                    onChange={e => setReviewerTitle(e.target.value)}
                    placeholder="Store Manager"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 py-3.5 text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Your review <span className="text-zinc-400 font-normal">(optional)</span></label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="What's Allocai changed for your team?"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-5 py-3.5 text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 resize-none"
                  />
                </div>

                {error && <p className="text-center text-sm text-rose-600">{error}</p>}

                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="rounded-full bg-zinc-950 px-6 py-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-80 hover:bg-zinc-800"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
