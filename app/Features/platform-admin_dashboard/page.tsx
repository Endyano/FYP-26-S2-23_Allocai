'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  suspended: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

const DOT_STYLES: Record<string, string> = {
  active:    'bg-emerald-500',
  suspended: 'bg-amber-500',
  cancelled: 'bg-rose-500',
};

type Company = {
  company_id: string;
  company_name: string;
  company_status: 'active' | 'suspended' | 'cancelled';
  created_by_name: string | null;
  created_by_email: string | null;
  created_at: string;
};

type Plan = {
  subscription_plan_id: string;
  plan_name: string;
  plan_price: number;
  staff_cap: number;
  feature_gate: Record<string, unknown>;
  plan_status: string;
};

type Review = {
  review_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  rating: number;
  review_text: string;
  review_status: 'pending' | 'published';
  created_at: string;
};

type Faq = {
  faq_id: string;
  question: string;
  answer: string;
  display_order: number;
  faq_status: 'Active' | 'Inactive';
};

type AuditLog = {
  audit_log_id: string;
  action_type: string;
  target_table: string;
  target_record_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  created_at: string;
};

type Analytics = {
  companies: { company_status: string; total: number }[];
  subscriptions: { subscription_status: string; payment_status: string; total: number }[];
  reviews: { review_status: string; total: number }[];
  user_growth: { month_label: string; total_users: number }[];
  revenue: { month_label: string; revenue: number }[];
};

function formatDateTime(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const ACRONYMS: Record<string, string> = { ai: 'AI', sms: 'SMS', api: 'API' };

function prettifyKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => ACRONYMS[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatFeatureGates(gates: Record<string, unknown> | null | undefined): string[] {
  if (!gates || Object.keys(gates).length === 0) return [];

  const pills: string[] = [];

  for (const [key, value] of Object.entries(gates)) {
    if (value === false || value === null && key !== 'departments') continue;

    if (key === 'departments') {
      pills.push(value === null ? 'Unlimited departments' : `${value} department${value === 1 ? '' : 's'}`);
    } else if (key === 'reports' && typeof value === 'string') {
      pills.push(`${prettifyKey(value)} reports`);
    } else if (key === 'alerts' && Array.isArray(value)) {
      pills.push(`${value.map(v => prettifyKey(String(v))).join(', ')} alerts`);
    } else if (value === true) {
      pills.push(prettifyKey(key));
    } else if (Array.isArray(value)) {
      pills.push(`${prettifyKey(key)}: ${value.map(String).join(', ')}`);
    } else {
      pills.push(`${prettifyKey(key)}: ${String(value)}`);
    }
  }

  return pills;
}

function TrendLineChart({
  title,
  points,
  color,
  formatValue,
}: {
  title: string;
  points: { label: string; value: number }[];
  color: string;
  formatValue: (v: number) => string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 420;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxValue = Math.max(1, ...points.map(p => p.value));
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (p.value / maxValue) * innerH,
    ...p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? 0} ${padding.top + innerH} L ${coords[0]?.x ?? 0} ${padding.top + innerH} Z`;
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      {points.every(p => p.value === 0) && (
        <p className="text-xs text-slate-400 mb-2">No activity yet in this range.</p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* gridlines */}
        {[0, 0.5, 1].map(frac => (
          <line
            key={frac}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * (1 - frac)}
            y2={padding.top + innerH * (1 - frac)}
            stroke="#e1e0d9"
            strokeWidth={1}
          />
        ))}

        {/* area fill */}
        <path d={areaPath} fill={color} fillOpacity={0.08} stroke="none" />

        {/* line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* rounded data-end anchor on the last point */}
        {coords.length > 0 && (
          <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r={4} fill={color} />
        )}

        {/* crosshair + hover dot */}
        {hovered && (
          <>
            <line x1={hovered.x} x2={hovered.x} y1={padding.top} y2={padding.top + innerH} stroke="#c3c2b7" strokeWidth={1} strokeDasharray="3,3" />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill="#fcfcfb" stroke={color} strokeWidth={2} />
          </>
        )}

        {/* month labels */}
        {coords.map((c, i) => (
          <text key={i} x={c.x} y={height - 8} textAnchor="middle" fontSize={10} fill="#898781">
            {c.label.split(' ')[0]}
          </text>
        ))}

        {/* invisible hit targets */}
        {coords.map((c, i) => (
          <rect
            key={i}
            x={c.x - stepX / 2}
            y={0}
            width={Math.max(stepX, 8)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}
      </svg>

      {hovered && (
        <div className="text-xs text-slate-600 font-semibold">
          {hovered.label}: <span className="text-slate-900">{formatValue(hovered.value)}</span>
        </div>
      )}
    </div>
  );
}

export default function PlatformAdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Admin');
  const [activeTab, setActiveTab] = useState('analytics');
  const [ready, setReady] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editPlanModal, setEditPlanModal] = useState<Plan | null>(null);
  const [staffCapInput, setStaffCapInput] = useState('');
  const [featureGateInput, setFeatureGateInput] = useState('');
  const [planFormError, setPlanFormError] = useState('');
  const [suspendModal, setSuspendModal] = useState<Company | null>(null);
  const [deleteTenantModal, setDeleteTenantModal] = useState<Company | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [faqModal, setFaqModal] = useState<'new' | Faq | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqOrder, setFaqOrder] = useState('0');
  const [faqFormError, setFaqFormError] = useState('');
  const [deleteFaqModal, setDeleteFaqModal] = useState<Faq | null>(null);

  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const [auditError, setAuditError] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const result = await apiFetch<{ full_name?: string; role?: string }>('/api/auth/session');

      if (!result.success || result.role !== 'platform_admin') {
        router.push('/Features/login');
        return;
      }

      setUserName(result.full_name || 'Admin');
      setReady(true);
    }

    checkSession();
  }, [router]);

  async function loadAll() {
    setLoading(true);
    const [companiesResult, plansResult, reviewsResult, auditResult, analyticsResult, faqsResult] = await Promise.all([
      apiFetch<{ companies?: Company[] }>('/api/platform-admin/companies'),
      apiFetch<{ plans?: Plan[] }>('/api/platform-admin/subscription-plans'),
      apiFetch<{ reviews?: Review[] }>('/api/platform-admin/reviews'),
      apiFetch<{ audit_logs?: AuditLog[] }>('/api/platform-admin/audit-logs'),
      apiFetch<{ analytics?: Analytics }>('/api/platform-admin/analytics'),
      apiFetch<{ faqs?: Faq[] }>('/api/platform-admin/faqs'),
    ]);
    setCompanies(companiesResult.companies ?? []);
    setPlans(plansResult.plans ?? []);
    setReviews(reviewsResult.reviews ?? []);
    setAuditLogs(auditResult.audit_logs ?? []);
    setAnalytics(analyticsResult.analytics ?? null);
    setFaqs(faqsResult.faqs ?? []);
    setLoading(false);
  }

  async function loadAuditLogs() {
    setAuditLoading(true);
    setAuditError('');
    const params = new URLSearchParams();
    if (auditStartDate) params.set('start_date', auditStartDate);
    if (auditEndDate) params.set('end_date', auditEndDate);
    const result = await apiFetch<{ audit_logs?: AuditLog[]; message?: string }>(
      `/api/platform-admin/audit-logs${params.toString() ? `?${params.toString()}` : ''}`
    );
    if (result.success) {
      setAuditLogs(result.audit_logs ?? []);
    } else {
      setAuditError(result.message || 'Failed to filter audit logs.');
    }
    setAuditLoading(false);
  }

  function clearAuditFilter() {
    setAuditStartDate('');
    setAuditEndDate('');
    setAuditError('');
    loadAuditLogs();
  }

  useEffect(() => { if (ready) loadAll(); }, [ready]);

  const confirmLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/');
  };

  async function suspendTenant() {
    if (!suspendModal) return;
    setProcessing(true); setError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/platform-admin/companies/${suspendModal.company_id}/suspend`,
      { method: 'PATCH' }
    );
    if (result.success) {
      setSuspendModal(null);
      loadAll();
    } else {
      setError(result.message || 'Failed to suspend tenant.');
    }
    setProcessing(false);
  }

  async function deleteTenant() {
    if (!deleteTenantModal) return;
    setProcessing(true); setError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/platform-admin/companies/${deleteTenantModal.company_id}`,
      { method: 'DELETE' }
    );
    if (result.success) {
      setDeleteTenantModal(null);
      loadAll();
    } else {
      setError(result.message || 'Failed to delete tenant.');
    }
    setProcessing(false);
  }

  function openEditPlan(plan: Plan) {
    setEditPlanModal(plan);
    setStaffCapInput(String(plan.staff_cap ?? ''));
    setFeatureGateInput(JSON.stringify(plan.feature_gate ?? {}, null, 2));
    setPlanFormError('');
  }

  async function savePlan() {
    if (!editPlanModal) return;
    let parsedFeatureGate: Record<string, unknown>;
    try {
      parsedFeatureGate = JSON.parse(featureGateInput);
    } catch {
      setPlanFormError('Feature gates must be valid JSON.');
      return;
    }
    const staffCapNumber = Number(staffCapInput);
    if (!staffCapInput || Number.isNaN(staffCapNumber) || staffCapNumber <= 0) {
      setPlanFormError('Staff cap must be a positive number.');
      return;
    }
    setProcessing(true); setPlanFormError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/platform-admin/subscription-plans/${editPlanModal.subscription_plan_id}`,
      { method: 'PUT', body: JSON.stringify({ staff_cap: staffCapNumber, feature_gate: parsedFeatureGate }) }
    );
    if (result.success) {
      setEditPlanModal(null);
      loadAll();
    } else {
      setPlanFormError(result.message || 'Failed to update plan.');
    }
    setProcessing(false);
  }

  async function toggleReviewVisibility(review: Review) {
    setProcessing(true); setError('');
    const nextStatus = review.review_status === 'published' ? 'pending' : 'published';
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/platform-admin/reviews/${review.review_id}/moderate`,
      { method: 'PATCH', body: JSON.stringify({ review_status: nextStatus }) }
    );
    if (result.success) {
      loadAll();
    } else {
      setError(result.message || 'Failed to update review.');
    }
    setProcessing(false);
  }

  function openCreateFaq() {
    setFaqModal('new');
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqOrder('0');
    setFaqFormError('');
  }

  function openEditFaq(faq: Faq) {
    setFaqModal(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqOrder(String(faq.display_order));
    setFaqFormError('');
  }

  async function saveFaq() {
    if (!faqModal) return;
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setFaqFormError('Question and answer are required.');
      return;
    }
    setProcessing(true); setFaqFormError('');
    const body = {
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      display_order: Number(faqOrder) || 0,
    };
    const result = faqModal === 'new'
      ? await apiFetch<{ success: boolean; message?: string }>('/api/platform-admin/faqs', { method: 'POST', body: JSON.stringify(body) })
      : await apiFetch<{ success: boolean; message?: string }>(`/api/platform-admin/faqs/${faqModal.faq_id}`, { method: 'PATCH', body: JSON.stringify(body) });
    if (result.success) {
      setFaqModal(null);
      loadAll();
    } else {
      setFaqFormError(result.message || 'Failed to save FAQ.');
    }
    setProcessing(false);
  }

  async function toggleFaqStatus(faq: Faq) {
    setProcessing(true); setError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/platform-admin/faqs/${faq.faq_id}`,
      { method: 'PATCH', body: JSON.stringify({ faq_status: faq.faq_status === 'Active' ? 'Inactive' : 'Active' }) }
    );
    if (result.success) {
      loadAll();
    } else {
      setError(result.message || 'Failed to update FAQ status.');
    }
    setProcessing(false);
  }

  async function deleteFaq() {
    if (!deleteFaqModal) return;
    setProcessing(true); setError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/platform-admin/faqs/${deleteFaqModal.faq_id}`,
      { method: 'DELETE' }
    );
    if (result.success) {
      setDeleteFaqModal(null);
      loadAll();
    } else {
      setError(result.message || 'Failed to delete FAQ.');
    }
    setProcessing(false);
  }

  if (!ready) return null;

  const totalCompanies = companies.length;
  const activeSubs = companies.filter(c => c.company_status === 'active').length;
  const pendingReviews = reviews.filter(r => r.review_status === 'pending');
  const pendingReviewsCount = pendingReviews.length;

  const compRingValue = Math.min((totalCompanies / 10) * 100, 100);
  const subsRingValue = totalCompanies > 0 ? (activeSubs / totalCompanies) * 100 : 0;
  const revRingValue = Math.min((pendingReviewsCount / 10) * 100, 100);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-slate-900 font-sans">

      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col fixed h-screen z-20">

        <div className="p-8 flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Allocai</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'companies' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Company Accounts
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'plans' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Subscription Plans
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'reviews' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Reviews
            </div>
            {pendingReviewsCount > 0 && (
              <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('auditlogs')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'auditlogs' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'faqs' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            FAQs
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center font-semibold text-base flex-shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">Platform Admin</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] p-10 max-w-6xl">

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Platform Workspace</h1>
          <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
            <span className="text-2xl">👋</span> Welcome back, <strong className="text-slate-800">{userName}</strong>!
          </p>
        </header>

        {error && <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

        {/* Dashboard Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Companies</h3>
                  <p className="text-4xl font-black text-slate-900 mt-3">{loading ? '—' : totalCompanies}</p>
                </div>
                <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
                  <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className="text-indigo-400" stroke="currentColor" strokeDasharray={`${compRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
              </div>

              <div className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tenants</h3>
                  <p className="text-4xl font-black text-slate-900 mt-3">{loading ? '—' : activeSubs}</p>
                </div>
                <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
                  <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className="text-emerald-400" stroke="currentColor" strokeDasharray={`${subsRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
              </div>

              <div className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</h3>
                  <p className="text-4xl font-black text-slate-900 mt-3">{loading ? '—' : pendingReviewsCount}</p>
                </div>
                <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
                  <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className="text-rose-400" stroke="currentColor" strokeDasharray={`${revRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
              </div>
            </div>

            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TrendLineChart
                  title="User Growth"
                  points={analytics.user_growth.map(g => ({ label: g.month_label, value: g.total_users }))}
                  color="#2a78d6"
                  formatValue={v => `${v} user${v === 1 ? '' : 's'}`}
                />
                <TrendLineChart
                  title="Revenue"
                  points={analytics.revenue.map(r => ({ label: r.month_label, value: Number(r.revenue) }))}
                  color="#1baf7a"
                  formatValue={v => `$${v.toFixed(2)}/mo`}
                />
              </div>
            )}

            {analytics && (
              <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Company Status Breakdown</h2>
                <div className="flex gap-3 flex-wrap">
                  {analytics.companies.map(c => (
                    <span key={c.company_status} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLES[c.company_status] || 'bg-slate-100 text-slate-600'}`}>
                      {c.company_status}: {c.total}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Companies */}
        {activeTab === 'companies' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Registered Companies</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Company Name</th>
                      <th className="px-6 py-4 font-semibold">Created By</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading companies...</td></tr>
                    ) : companies.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">No companies registered yet.</td></tr>
                    ) : companies.map(comp => (
                      <tr key={comp.company_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{comp.company_name}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {comp.created_by_name || '—'}
                          {comp.created_by_email && <p className="text-xs text-slate-400">{comp.created_by_email}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[comp.company_status]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[comp.company_status]}`} />
                            {comp.company_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {comp.company_status === 'active' && (
                              <button onClick={() => setSuspendModal(comp)} className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50">
                                Suspend
                              </button>
                            )}
                            {comp.company_status !== 'cancelled' && (
                              <button onClick={() => setDeleteTenantModal(comp)} className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        {activeTab === 'plans' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Subscription Plans</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Plan Name</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Staff Cap</th>
                      <th className="px-6 py-4 font-semibold">Feature Gates</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading plans...</td></tr>
                    ) : plans.map(plan => (
                      <tr key={plan.subscription_plan_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{plan.plan_name}</td>
                        <td className="px-6 py-4 text-slate-600">${Number(plan.plan_price).toFixed(2)}/mo</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{plan.staff_cap}</td>
                        <td className="px-6 py-4 max-w-sm">
                          <div className="flex flex-wrap gap-1.5">
                            {formatFeatureGates(plan.feature_gate).length === 0 ? (
                              <span className="text-xs text-slate-400 italic">No feature gates set</span>
                            ) : (
                              formatFeatureGates(plan.feature_gate).map((pill, i) => (
                                <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-indigo-600/10">
                                  {pill}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEditPlan(plan)} className="rounded-lg bg-slate-900 text-white px-4 py-1.5 text-xs font-semibold hover:bg-slate-800">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'auditlogs' && (
          <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Filter by Date Range</h2>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">From</label>
                  <input
                    type="date"
                    value={auditStartDate}
                    onChange={e => setAuditStartDate(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">To</label>
                  <input
                    type="date"
                    value={auditEndDate}
                    onChange={e => setAuditEndDate(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
                <button
                  onClick={loadAuditLogs}
                  disabled={auditLoading}
                  className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                >
                  {auditLoading ? 'Filtering...' : 'Apply Filter'}
                </button>
                <button
                  onClick={clearAuditFilter}
                  disabled={auditLoading}
                  className="rounded-xl bg-white border border-slate-200 text-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  Clear
                </button>
              </div>
              {auditError && <p className="mt-3 text-sm text-rose-600 font-medium">{auditError}</p>}
            </div>

            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">System Audit Logs</h2>
                  <p className="text-sm text-slate-500 mt-0.5">A record of all administrative actions performed on this platform.</p>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{auditLogs.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Action</th>
                      <th className="px-6 py-4 font-semibold">Target</th>
                      <th className="px-6 py-4 font-semibold">Company</th>
                      <th className="px-6 py-4 font-semibold">Actor</th>
                      <th className="px-6 py-4 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading logs...</td></tr>
                    ) : auditLogs.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No audit log entries yet.</td></tr>
                    ) : auditLogs.map(log => (
                      <tr key={log.audit_log_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{log.action_type}</td>
                        <td className="px-6 py-4 text-slate-600">{log.target_table} <span className="text-slate-400 text-xs">#{log.target_record_id.slice(0, 8)}</span></td>
                        <td className="px-6 py-4 text-slate-600">{log.company_name || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {log.full_name || log.email || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs text-right">{formatDateTime(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">FAQs</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Shown publicly on the landing page.</p>
                </div>
                <button onClick={openCreateFaq} className="rounded-lg bg-slate-900 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800">
                  + New FAQ
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order</th>
                      <th className="px-6 py-4 font-semibold">Question</th>
                      <th className="px-6 py-4 font-semibold">Answer</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading FAQs...</td></tr>
                    ) : faqs.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No FAQs yet. Create one to show it on the landing page.</td></tr>
                    ) : faqs.map(faq => (
                      <tr key={faq.faq_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{faq.display_order}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{faq.question}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-sm truncate">{faq.answer}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleFaqStatus(faq)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              faq.faq_status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-300'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${faq.faq_status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {faq.faq_status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditFaq(faq)} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-800">
                              Edit
                            </button>
                            <button onClick={() => setDeleteFaqModal(faq)} className="rounded-lg bg-white border border-slate-200 text-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-50">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Reviews</h2>
                <p className="text-sm text-slate-500 mt-0.5">Choose which reviews to show on the landing page. Every review submitted is listed here — nothing is ever deleted or rejected.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Author</th>
                      <th className="px-6 py-4 font-semibold">Rating</th>
                      <th className="px-6 py-4 font-semibold">Review Text</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading reviews...</td></tr>
                    ) : reviews.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No reviews submitted yet.</td></tr>
                    ) : reviews.map(rev => (
                      <tr key={rev.review_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {rev.full_name || rev.email || '—'}
                          {rev.company_name && <p className="text-xs text-slate-400 font-normal">{rev.company_name}</p>}
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-sm">{rev.review_text}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            rev.review_status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                              : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-300'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${rev.review_status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {rev.review_status === 'published' ? 'Shown' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleReviewVisibility(rev)}
                            disabled={processing}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60 ${
                              rev.review_status === 'published'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {rev.review_status === 'published' ? 'Hide' : 'Show on Landing Page'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODALS ================= */}
      {editPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Edit {editPlanModal.plan_name} Plan</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Set Staff Cap</label>
                <input type="number" min="1" value={staffCapInput} onChange={(e) => setStaffCapInput(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Set Feature Gates (JSON)</label>
                <textarea value={featureGateInput} onChange={(e) => setFeatureGateInput(e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-100 resize-none" />
              </div>
              {planFormError && <p className="text-sm text-rose-600 font-medium">{planFormError}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={savePlan} disabled={processing} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{processing ? '...' : 'Save'}</button>
              <button onClick={() => setEditPlanModal(null)} disabled={processing} className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Suspend Tenant?</h3>
            <p className="text-sm text-slate-500 mb-8">This will suspend <strong className="text-slate-800">{suspendModal.company_name}</strong>'s access to the platform.</p>
            <div className="flex flex-col gap-3">
              <button onClick={suspendTenant} disabled={processing} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{processing ? '...' : 'Yes, suspend'}</button>
              <button onClick={() => setSuspendModal(null)} disabled={processing} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Tenant?</h3>
            <p className="text-sm text-slate-500 mb-8">Are you sure you want to permanently cancel <strong className="text-slate-800">{deleteTenantModal.company_name}</strong>'s account?</p>
            <div className="flex flex-col gap-3">
              <button onClick={deleteTenant} disabled={processing} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{processing ? '...' : 'Yes, delete'}</button>
              <button onClick={() => setDeleteTenantModal(null)} disabled={processing} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {faqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{faqModal === 'new' ? 'New FAQ' : 'Edit FAQ'}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question</label>
                <input type="text" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answer</label>
                <textarea value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Order</label>
                <input type="number" value={faqOrder} onChange={(e) => setFaqOrder(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
                <p className="mt-1 text-xs text-slate-400">Lower numbers show first on the landing page.</p>
              </div>
              {faqFormError && <p className="text-sm text-rose-600 font-medium">{faqFormError}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={saveFaq} disabled={processing} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{processing ? '...' : 'Save'}</button>
              <button onClick={() => setFaqModal(null)} disabled={processing} className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete FAQ?</h3>
            <p className="text-sm text-slate-500 mb-8">This will remove <strong className="text-slate-800">&ldquo;{deleteFaqModal.question}&rdquo;</strong> from the landing page.</p>
            <div className="flex flex-col gap-3">
              <button onClick={deleteFaq} disabled={processing} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{processing ? '...' : 'Yes, delete'}</button>
              <button onClick={() => setDeleteFaqModal(null)} disabled={processing} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Ready to leave?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">You will need to log in again to access the dashboard.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Yes, log out</button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
