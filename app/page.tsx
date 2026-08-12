'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Faq = { faq_id: string; question: string; answer: string };
type Review = {
  review_id: string;
  rating: number;
  review_text: string | null;
  reviewer_title: string | null;
  full_name: string | null;
  company_name: string | null;
};

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    async function loadSession() {
      const result = await apiFetch<{ full_name?: string }>('/api/auth/session');
      if (result.success) setUserName(result.full_name || null);
    }
    loadSession();
  }, []);

  useEffect(() => {
    async function loadFaqs() {
      const result = await apiFetch<{ faq?: Faq[] }>('/api/public/faq');
      setFaqs(result.faq ?? []);
    }
    loadFaqs();
  }, []);

  useEffect(() => {
    async function loadReviews() {
      const result = await apiFetch<{ reviews?: Review[] }>('/api/public/reviews');
      setReviews(result.reviews ?? []);
    }
    loadReviews();
  }, []);

  async function submitContactForm() {
    setContactSubmitting(true);
    setContactError('');
    const result = await apiPost('/api/public/contact', {
      name: contactForm.name,
      email: contactForm.email,
      subject: 'Website Enquiry',
      message: contactForm.message,
    });
    if (result.success) {
      setContactSent(true);
    } else {
      setContactError(result.message || 'Could not send your message. Please try again.');
    }
    setContactSubmitting(false);
  }

  const handleLogout = async () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (isConfirmed) {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      setUserName(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FCFBF9] text-zinc-900 font-sans selection:bg-rose-100">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(231,229,228,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(231,229,228,0.6)_1px,transparent_1px)] bg-[size:24px_24px] animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(251,113,133,0.15),transparent_50%)]" />

      <div className="mx-auto relative max-w-6xl px-6 py-8">
        
        {/* Navigation Bar - UPDATED SESUAI GAMBAR */}
        <nav className="sticky top-4 z-50 mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/50 bg-white/80 px-6 py-3.5 shadow-sm ring-1 ring-zinc-900/5 backdrop-blur-xl">
          <Link href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">
            Allocai
          </Link>
          
          <div className="hidden items-center gap-10 md:flex text-sm font-medium text-zinc-500">
            <a href="#product" className="transition-colors hover:text-zinc-900">Product</a>
            <Link href="/Features/pricing" className="transition-colors hover:text-zinc-900">Pricing</Link>
            <a href="#reviews" className="transition-colors hover:text-zinc-900">Reviews</a>
            <a href="#faq" className="transition-colors hover:text-zinc-900">FAQ</a>
            <a href="#contact" className="transition-colors hover:text-zinc-900">Contact us</a>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            {userName ? (
              <div 
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-3 rounded-full bg-white/60 pl-1.5 pr-5 py-1.5 ring-1 ring-zinc-200 backdrop-blur-md transition-all hover:bg-white hover:shadow-md"
                title="Click to log out"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-bold shadow-inner uppercase">
                  {userName.charAt(0)}
                </div>
                <span className="font-semibold text-zinc-800 capitalize">{userName}</span>
              </div>
            ) : (
              <>
                <Link 
                  href="/Features/login" 
                  className="bg-zinc-900 text-white border border-zinc-700 border-b-[4px] font-semibold overflow-hidden relative px-6 py-2 rounded-full hover:bg-zinc-800 hover:border-t-[4px] hover:border-b active:opacity-75 outline-none duration-300 group backdrop-blur-sm"
                >
                  <span className="bg-white shadow-white absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-20 group-hover:top-[150%] duration-500 shadow-[0_0_15px_15px_rgba(255,255,255,0.2)]"></span>
                  Log in
                </Link>
                <Link 
                  href="/Features/register" 
                  className="bg-white text-zinc-900 border border-zinc-200 border-b-[4px] font-semibold overflow-hidden relative px-6 py-2 rounded-full hover:bg-zinc-50 hover:border-t-[4px] hover:border-b active:opacity-75 outline-none duration-300 group backdrop-blur-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="mt-20 mb-24 text-center flex flex-col items-center">
          <h1 className="mx-auto mt-8 max-w-4xl text-6xl font-extrabold tracking-tight sm:text-8xl leading-[1] text-zinc-900">
            Planning your team's day, <br />
            <span className="text-zinc-400">made simple.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-xl text-zinc-600 leading-relaxed font-medium">
            Stop managing spreadsheets. Allocai balances workloads and assigns shifts automatically, creating a peaceful and productive workplace for your crew.
          </p>
        </section>

        {/* Product / Features Section */}
        <section id="product" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-20">
          <div className="group relative rounded-[2.5rem] bg-white p-9 shadow-md ring-1 ring-zinc-900/5 hover:shadow-2xl transition-all">
            <h3 className="text-2xl font-bold text-zinc-900">Instant Match</h3>
            <p className="mt-4 text-zinc-500 text-sm">Pairs tasks based on skills and availability.</p>
          </div>
          <div className="group relative rounded-[2.5rem] bg-white p-9 shadow-md ring-1 ring-zinc-900/5 hover:shadow-2xl transition-all">
            <h3 className="text-2xl font-bold text-zinc-900">Live Overview</h3>
            <p className="mt-4 text-zinc-500 text-sm">Real-time queue for managers and staff.</p>
          </div>
          <div className="group relative rounded-[2.5rem] bg-white p-9 shadow-md ring-1 ring-zinc-900/5 hover:shadow-2xl transition-all">
            <h3 className="text-2xl font-bold text-zinc-900">Balanced Teams</h3>
            <p className="mt-4 text-zinc-500 text-sm">Ensure workloads are fair for everyone.</p>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-20 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Loved by Managers</h2>
            <p className="mt-4 text-lg text-zinc-500">See how Allocai is changing the way teams operate.</p>
            <Link href="/Features/submit-review" className="mt-4 inline-block text-sm font-semibold text-zinc-900 underline underline-offset-4 hover:text-zinc-600">
              Share your experience
            </Link>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.review_id} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-900/5">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400' : 'text-zinc-200'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/></svg>
                    ))}
                  </div>
                  {review.review_text && <p className="text-zinc-700 italic font-medium">&ldquo;{review.review_text}&rdquo;</p>}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500">
                      {(review.full_name || '?').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{review.full_name || 'Allocai user'}</h4>
                      <p className="text-xs text-zinc-500">{[review.reviewer_title, review.company_name].filter(Boolean).join(' · ') || null}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-400 text-sm">No reviews yet — be the first to share your experience.</p>
          )}
        </section>

        {/* FAQ Section */}
        {faqs.length > 0 && (
        <section id="faq" className="py-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Frequently Asked Questions</h2>
          </div>
          <div className="rounded-2xl bg-zinc-100 overflow-hidden divide-y divide-zinc-200 ring-1 ring-zinc-900/5">
            {faqs.map((item, i) => (
              <div key={item.faq_id}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-zinc-50 transition-colors text-left"
                >
                  <span className="text-base font-medium text-zinc-900">{item.question}</span>
                  <span className={`ml-4 flex-shrink-0 text-2xl font-light text-zinc-500 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 py-4 bg-white border-t border-zinc-100">
                    <p className="text-sm text-zinc-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        )}

      </div>

      {/* Contact Us Section */}
      <section id="contact" className="bg-zinc-100 border-t border-zinc-200 relative z-10 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-zinc-900 text-center mb-10">Contact us</h2>
          <div className="rounded-2xl bg-white ring-1 ring-zinc-900/5 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: contact info */}
              <div className="p-8 flex flex-col gap-8 md:border-r border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">Support</p>
                    <p className="text-sm text-zinc-500 mt-0.5">Email: allocai@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">Enquiries</p>
                    <p className="text-sm text-zinc-500 mt-0.5">Phone: +65 4793 5897</p>
                  </div>
                </div>
              </div>

              {/* Right: contact form */}
              <div className="p-8">
                {contactSent ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="font-semibold text-zinc-900">Message sent!</p>
                    <p className="text-sm text-zinc-500">We'll get back to you shortly.</p>
                    <button onClick={() => { setContactSent(false); setContactForm({ name: '', email: '', message: '' }); }}
                      className="mt-2 text-xs text-zinc-400 hover:text-zinc-600 underline transition-colors"
                    >Send another</button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={e => { e.preventDefault(); submitContactForm(); }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Name</label>
                        <input type="text" required placeholder="Name" value={contactForm.name}
                          onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Email</label>
                        <input type="email" required placeholder="Email" value={contactForm.email}
                          onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1 block">Message</label>
                      <textarea required rows={4} placeholder="Message" value={contactForm.message}
                        onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all resize-none"
                      />
                    </div>
                    {contactError && (
                      <p className="text-sm text-rose-600 font-medium">{contactError}</p>
                    )}
                    <button type="submit" disabled={contactSubmitting}
                      className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:opacity-60"
                    >{contactSubmitting ? 'Sending...' : 'Send Message'}</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">Allocai</span>
            <p className="mt-2 text-sm text-zinc-500 max-w-xs">Smart task allocation and scheduling for modern teams.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-zinc-600">
            <p className="font-bold text-zinc-900 text-base">Contact Us</p>
            <a href="mailto:allocai@gmail.com" className="hover:text-rose-500 transition-colors">allocai@gmail.com</a>
            <p>+65 4793 5897</p>
            <p>Singapore Institute of Management (SIM)</p>
          </div>
        </div>
        <div className="border-t border-zinc-100 py-6 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Allocai. All rights reserved.
        </div>
      </footer>

    </main>
  );
}