"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const planOptions = [
  {
    id: "free",
    name: "Free",
    subtitle: "Best for small pilot teams",
    limit: 5,
    priceLabel: "Free",
    features: [
      "Up to 5 staff",
      "1 department",
      "Basic reports",
      "Allocation + auto eligibility",
      "In-app alerts",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    subtitle: "Ideal for growing operations",
    limit: 30,
    priceLabel: "$29/mo",
    features: [
      "Up to 30 staff",
      "5 departments",
      "Standard reports",
      "Email alerts",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For fast-scaling businesses",
    limit: 150,
    priceLabel: "$99/mo",
    features: [
      "Up to 150 staff",
      "Unlimited departments",
      "Advanced reports",
      "AI recommendations",
      "All alert channels",
      "Priority support",
    ],
  },
];

export default function SetupWorkspacePage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [estimatedStaff, setEstimatedStaff] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [buttonText, setButtonText] = useState("Continue");
  const [companyError, setCompanyError] = useState<string | null>(null);

  const staffCount = Number(estimatedStaff || 0);
  const activePlan = planOptions.find((plan) => plan.id === selectedPlan) ?? planOptions[0];

  const updateButtonState = (planId: string, staffValue: number) => {
    if (staffValue > 150) {
      setSelectedPlan("pro");
      setButtonText("Purchase Plans");
      return;
    }

    if (planId === "starter" || planId === "pro") {
      setButtonText("Purchase Plans");
      return;
    }

    if (planId === "free") {
      if (staffValue > 5) {
        setButtonText("Purchase Plans");
        return;
      }
      setButtonText("Continue");
      return;
    }

    setButtonText("Continue");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyError(null);

    if (!companyName.trim()) {
      setCompanyError("Company name is required");
      return;
    }

    const company = {
      companyName,
      industry,
      estimatedStaff,
      selectedPlan,
    };
    localStorage.setItem("allocai_company", JSON.stringify(company));
    localStorage.setItem("allocai_onboarding_step", "workspace");

    if (buttonText === "Continue") {
      router.push("/Features/register/quickstart");
      return;
    }

    if (buttonText === "Purchase Plans") {
      if (selectedPlan === "free" && staffCount > 5) {
        alert("Error: The number of staff exceeds the Free plan limit. Please select the Starter or Pro plan.");
        return;
      }

      if (selectedPlan === "starter" && staffCount > 30) {
        alert("Error: The number of staff exceeds the Starter plan limit. Please select the Pro plan.");
        return;
      }

      router.push(`/Features/checkout?plan=${selectedPlan}`);
      return;
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

          <div className="grid gap-5 md:grid-cols-3">
            {planOptions.map((plan) => {
              const selected = plan.id === selectedPlan;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    const targetPlan = staffCount > 150 ? "pro" : plan.id;
                    setSelectedPlan(targetPlan);
                    updateButtonState(targetPlan, staffCount);
                  }}
                  className={`group flex flex-col rounded-[1.75rem] border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${selected ? 'border-sky-500 ring-2 ring-sky-400/30 bg-sky-50 shadow-xl' : 'border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>
                      <p className="mt-2 text-sm text-slate-500">{plan.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{plan.priceLabel}</span>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-500">
                    {plan.features.map((feature) => (
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

          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 md:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Company name</label>
                <input
                  type="text"
                  placeholder="PT. Contoh Perusahaan"
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
                    updateButtonState(selectedPlan, Number(cleanedValue || 0));
                  }}
                  className="w-full rounded-3xl border border-transparent bg-slate-100 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Plan summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activePlan.name} plan</h2>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Plan limit</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{activePlan.limit} staff</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Current estimate</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{staffCount || 0} staff</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  {selectedPlan === 'free' && staffCount > 5 ? (
                    <p className="text-rose-600">You’re over the free plan limit. Upgrade to continue.</p>
                  ) : selectedPlan !== 'free' ? (
                    <p>Paid plans require purchase before continuing.</p>
                  ) : (
                    <p className="text-slate-500">Your plan is within the allowed staff count.</p>
                  )}
                </div>
              </div>

              <button
                id="btn-continue"
                type="submit"
                className="mt-6 w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-200"
              >
                <span className="inline-block transition-all duration-300">{buttonText}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
