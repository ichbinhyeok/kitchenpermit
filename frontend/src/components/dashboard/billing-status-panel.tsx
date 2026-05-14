"use client";

import Link from "@/components/navigation/static-link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  AXIS1_COMPANY_MONTHLY_PRICE,
} from "@/lib/axis1-product-policy";
import {
  loadAxis1AccountEntitlements,
  type Axis1AccountEntitlements,
} from "@/lib/axis1-server-storage";
import { siteConfig } from "@/lib/site";

type EntitlementState =
  | { status: "loading" }
  | { status: "ready"; entitlements: Axis1AccountEntitlements }
  | { status: "error" };

function StatusPill({ children, tone = "muted" }: { children: string; tone?: "good" | "warn" | "muted" }) {
  const toneClass =
    tone === "good"
      ? "bg-[#1f7a4d] text-white"
      : tone === "warn"
        ? "bg-[#fff2e8] text-[#a94410]"
        : "bg-white/12 text-white/62";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${toneClass}`}>
      {children}
    </span>
  );
}

function billingNoticeCopy(value: string | null) {
  if (value === "checkout-complete") {
    return {
      title: "Checkout received.",
      copy:
        "Company access may take a moment to turn on. If it still looks locked after a refresh, email support with the account email.",
      tone: "good" as const,
    };
  }

  if (value === "payment-failed") {
    return {
      title: "Subscription needs attention.",
      copy:
        "Clean PDFs, saved reports, and live customer links depend on active company access. Contact support if the card or subscription needs to be fixed.",
      tone: "warn" as const,
    };
  }

  if (value === "checkout-cancelled") {
    return {
      title: "Checkout was not completed.",
      copy:
        "The free builder is still available. Company output stays locked until an active subscription is confirmed.",
      tone: "warn" as const,
    };
  }

  return null;
}

function BillingNotice({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const notice = useMemo(
    () => billingNoticeCopy(searchParams.get("billing")),
    [searchParams],
  );

  if (!notice) {
    return null;
  }

  return (
    <div
      className={`rounded-[24px] border ${
        compact ? "p-3" : "p-4"
      } ${
        notice.tone === "good"
          ? "border-[#1f7a4d]/22 bg-[#eff8f1] text-[#153d27]"
          : "border-[#f26a21]/24 bg-[#fff7ef] text-[#5b3322]"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
        Billing update
      </p>
      <p className={`${compact ? "mt-1 text-base" : "mt-2 text-lg"} font-black tracking-[-0.04em]`}>
        {notice.title}
      </p>
      <p className={`${compact ? "mt-1 text-xs leading-5" : "mt-2 text-sm leading-6"} font-semibold opacity-80`}>
        {notice.copy}
      </p>
    </div>
  );
}

function describeBillingStatus({
  companyAccess,
  billingStatus,
  provider,
}: {
  companyAccess: boolean;
  billingStatus: string;
  provider: string;
}) {
  if (companyAccess) {
    return provider === "abstract"
      ? "Company access is active for local testing."
      : "Company access is active for this account.";
  }

  if (billingStatus === "trialing") {
    return "Trial access is active.";
  }

  if (billingStatus === "past_due") {
    return "Payment needs attention before company access continues.";
  }

  return "Company access is not active yet.";
}

export function DashboardBillingNotice() {
  return <BillingNotice compact />;
}

export function BillingStatusPanel({ showNotice = true }: { showNotice?: boolean }) {
  const [state, setState] = useState<EntitlementState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    loadAxis1AccountEntitlements()
      .then((entitlements) => {
        if (!cancelled) {
          setState({ status: "ready", entitlements });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const entitlements = state.status === "ready" ? state.entitlements : null;
  const companyAccess = entitlements?.companyAccess ?? false;
  const accountStatus = companyAccess
    ? "Company active"
    : entitlements?.authenticated
      ? "Logged in, subscription required"
      : state.status === "error"
        ? "Account API unavailable"
        : "Checking account";
  const billingStatus = entitlements?.billingStatus || (companyAccess ? "active" : "not active");
  const provider = entitlements?.billingProvider || "paddle";
  const billingStatusCopy = describeBillingStatus({
    companyAccess,
    billingStatus,
    provider,
  });

  return (
    <div className="grid gap-3">
      {showNotice ? <BillingNotice /> : null}

      <div className="overflow-hidden rounded-[34px] bg-[#111315] text-white shadow-[0_36px_120px_rgba(17,19,21,0.28)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
                Account status
              </p>
              <StatusPill tone={companyAccess ? "good" : "warn"}>
                {accountStatus}
              </StatusPill>
            </div>
            <p className="mt-5 font-display text-5xl font-bold tracking-[-0.07em]">
              {AXIS1_COMPANY_MONTHLY_PRICE}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/58">
              Company version includes saved company info, logo, report color,
              clean PDFs, live service report links, customer history, and
              follow-up workflow while access is active.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              ["Company access", billingStatusCopy],
              ["Manage billing", "Email support for card updates, cancellation, receipts, or billing questions."],
              ["Access help", "If subscription access stops, support can help restore company mode after the account is corrected."],
              ["Access rule", "Free builder stays public. Company output requires active or trialing access."],
            ].map(([label, copy], index) => (
              <div key={label} className="rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3">
                <div className="flex items-start gap-3">
                  {index === 0 ? (
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb27c]" />
                  ) : index === 1 ? (
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb27c]" />
                  ) : index === 2 ? (
                    <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb27c]" />
                  ) : (
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb27c]" />
                  )}
                  <div>
                    <p className="text-sm font-black tracking-[-0.035em] text-white">
                      {label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/52">{copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:flex-wrap sm:px-6">
          <Link
            href="/axis-1/tool?step=outputs&account=company"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#f26a21] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-white"
          >
            Build company report
          </Link>
          <a
            href={`mailto:${siteConfig.supportEmail}?subject=Company%20version%20billing%20help`}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-white/72"
          >
            Billing help
          </a>
        </div>
      </div>
    </div>
  );
}
