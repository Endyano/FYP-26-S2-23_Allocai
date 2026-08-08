"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, apiPost } from "@/lib/api";

type Plan = {
  subscription_plan_id: string;
  plan_name: string;
  plan_description: string | null;
  plan_price: number;
  staff_cap: number | null;
  feature_gate: Record<string, unknown> | null;
};

const ACRONYMS: Record<string, string> = { ai: "AI", sms: "SMS", api: "API" };

function prettifyKey(key: string) {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => ACRONYMS[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFeatureGates(gates: Plan["feature_gate"]): string[] {
  if (!gates || Object.keys(gates).length === 0) return [];

  const features: string[] = [];

  for (const [key, value] of Object.entries(gates)) {
    if (value === false || (value === null && key !== "departments")) continue;

    if (key === "departments") {
      features.push(value === null ? "Unlimited departments" : `${value} department${value === 1 ? "" : "s"}`);
    } else if (key === "reports" && typeof value === "string") {
      features.push(`${prettifyKey(value)} reports`);
    } else if (key === "alerts" && Array.isArray(value)) {
      features.push(`${value.map((v) => prettifyKey(String(v))).join(", ")} alerts`);
    } else if (value === true) {
      features.push(prettifyKey(key));
    } else if (Array.isArray(value)) {
      features.push(`${prettifyKey(key)}: ${value.map(String).join(", ")}`);
    } else {
      features.push(`${prettifyKey(key)}: ${String(value)}`);
    }
  }

  return features;
}

export default function SetupWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <SetupWorkspaceContent />
    </Suspense>
  );
}

function SetupWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [estimatedStaff, setEstimatedStaff] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPlans() {
      const result = await apiFetch<{ plans?: Plan[] }>("/api/public/subscription-plans");
      const loadedPlans = result.plans ?? [];
      setPlans(loadedPlans);

      const requestedName =
        searchParams?.get("plan") || sessionStorage.getItem("allocai_selected_plan") || "";

      const preselected = requestedName
        ? loadedPlans.find((p) => p.plan_name.toLowerCase() === requestedName.toLowerCase())
        : null;

      setSelectedPlanId((preselected ?? loadedPlans[0])?.subscription_plan_id ?? null);
      setPlansLoading(false);
    }
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const staffCount = Number(estimatedStaff || 0);
  const activePlan = plans.find((plan) => plan.subscription_plan_id === selectedPlanId) ?? plans[0];
  const needsPurchase = !!activePlan && Number(activePlan.plan_price) > 0;
  const overCapacity = !!activePlan && activePlan.staff_cap != null && staffCount > activePlan.staff_cap;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyError(null);

    if (!companyName.trim()) {
      setCompanyError("Company name is required");
      return;
    }

    if (!activePlan) {
      setCompanyError("Please select a plan.");
      return;
    }

    if (overCapacity) {
      setCompanyError(`This plan supports up to ${activePlan.staff_cap} staff. Please select a higher plan.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiPost("/api/auth/setup-workspace", {
        company_name: companyName,
        industry,
      });

      if (!result.success) {
        setCompanyError(result.message || "Could not create the company workspace.");
        return;
      }

      sessionStorage.removeItem("allocai_selected_plan");

      if (needsPurchase) {
        router.push(
          `/Features/checkout?plan_id=${activePlan.subscription_plan_id}&plan_name=${encodeURIComponent(activePlan.plan_name)}`
        );
        return;
      }

      const purchaseResult = await apiPost("/api/auth/subscription/purchase", {
        subscription_plan_id: activePlan.subscription_plan_id,
      });

      if (!purchaseResult.success) {
        setCompanyError(purchaseResult.message || "Could not activate your plan.");
        return;
      }

      router.push("/Features/register/quickstart");
    } catch {
      setCompanyError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 font-sans">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <div className="space-y-10 rounded-[2rem] bg-white p-10 shadow-[0_40px_100px_rgba(15,23,42,0.08)] lg:p-14">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Workspace setup</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Choose the right plan and launch your company workspace.</h1>
            <p className="max-w-xl text-base leading-7 text-slate-500">Select a plan that fits your team size, then finish the workspace details to move into Allocai’s onboarding flow.</p>
          </div>

          {plansLoading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-[1.75rem] bg-slate-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {plans.map((plan) => {
                const selected = plan.subscription_plan_id === selectedPlanId;
                const price = Number(plan.plan_price);
                const features = [
                  plan.staff_cap != null ? `Up to ${plan.staff_cap} staff` : "Unlimited staff",
                  ...formatFeatureGates(plan.feature_gate),
                ];

                return (
                  <button
                    key={plan.subscription_plan_id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.subscription_plan_id)}
                    className={`group flex flex-col rounded-[1.75rem] border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${selected ? 'border-sky-500 ring-2 ring-sky-400/30 bg-sky-50 shadow-xl' : 'border-slate-200'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">{plan.plan_name}</h2>
                        <p className="mt-2 text-sm text-slate-500">{plan.plan_description || `The ${plan.plan_name} plan`}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {price === 0 ? "Free" : `$${price % 1 === 0 ? price.toFixed(0) : price}/mo`}
                      </span>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-slate-500">
                      {features.map((feature) => (
                        <p key={feature} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                          {feature}
                        </p>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span className={selected ? 'inline-flex h-2.5 w-2.5 rounded-full bg-sky-500' : 'inline-flex h-2.5 w-2.5 rounded-full bg-slate-300'} />
                      {selected ? 'Selected' : 'Select this plan'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 md:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Company name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation Pte. Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full rounded-3xl border border-transparent bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
                {companyError ? (
                  <p className="mt-2 text-sm text-rose-600">{companyError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Industry</label>
                <input
                  type="text"
                  placeholder="Retail, Manufacturing, Healthcare..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-3xl border border-transparent bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Estimated staff count</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 18"
                  value={estimatedStaff}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(/[^0-9]/g, '');
                    setEstimatedStaff(cleanedValue);
                  }}
                  className="w-full rounded-3xl border border-transparent bg-slate-100 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Plan summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activePlan?.plan_name ?? '—'} plan</h2>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Plan limit</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{activePlan?.staff_cap != null ? `${activePlan.staff_cap} staff` : 'Unlimited staff'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Current estimate</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{staffCount || 0} staff</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  {overCapacity ? (
                    <p className="text-rose-600">You’re over this plan’s limit. Select a higher plan.</p>
                  ) : needsPurchase ? (
                    <p>Paid plans require purchase before continuing.</p>
                  ) : (
                    <p className="text-slate-500">Your plan is within the allowed staff count.</p>
                  )}
                </div>
              </div>

              <button
                id="btn-continue"
                type="submit"
                disabled={isSubmitting || plansLoading}
                className="mt-6 w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-wait disabled:opacity-70"
              >
                <span className="inline-block transition-all duration-300">
                  {isSubmitting ? "Saving..." : needsPurchase ? "Purchase Plan" : "Continue"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
