"use client";

import Link from "@/components/navigation/static-link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import {
  AXIS1_COMPANY_MONTHLY_PRICE,
} from "@/lib/axis1-product-policy";
import {
  loadAxis1AccountEntitlements,
  type Axis1AccountEntitlements,
} from "@/lib/axis1-server-storage";

type EntitlementState =
  | { status: "loading" }
  | { status: "ready"; entitlements: Axis1AccountEntitlements }
  | { status: "error" };

type BillingNoticeContent = {
  title: string;
  copy: string;
  tone: "good" | "warn";
  actionLabel?: string;
  actionHref?: string;
};

function StatusPill({ children, tone = "muted" }: { children: string; tone?: "good" | "warn" | "muted" }) {
  const toneClass =
    tone === "good"
      ? "bg-[#1f7a4d] text-white"
      : tone === "warn"
        ? "bg-[#fff2e8] text-[#a94410]"
        : "bg-black/[0.06] text-[#5f574f]";

  return (
    <span className={`rounded-full border border-black/10 px-2.5 py-1 text-[10px] font-black uppercase ${toneClass}`}>
      {children}
    </span>
  );
}

function billingNoticeCopy(value: string | null): BillingNoticeContent | null {
  if (value === "checkout-complete") {
    return {
      title: "Checkout received.",
      copy:
        "Next step: confirm your company name, logo, report color, phone, and reply email before sending the first paid report. Access may take a moment to turn on while checkout confirms.",
      tone: "good" as const,
      actionLabel: "Set up company branding",
      actionHref: "#company-profile",
    };
  }

  if (value === "payment-failed") {
    return {
      title: "Subscription needs attention.",
      copy:
        "New clean PDFs, saved reports, company history, and builder reload depend on active company access. Contact support if the card or subscription needs to be fixed.",
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
  const billing = searchParams.get("billing");
  const access = searchParams.get("access");
  const notice = useMemo(
    () => billingNoticeCopy(billing),
    [billing],
  );

  useEffect(() => {
    if (billing !== "checkout-complete" || access === "active") {
      return;
    }

    let cancelled = false;
    let retryTimer: number | null = null;
    let attempts = 0;

    async function refreshWhenCompanyAccessIsReady() {
      attempts += 1;

      try {
        const entitlements = await loadAxis1AccountEntitlements();

        if (cancelled) {
          return;
        }

        if (entitlements.companyAccess) {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set("access", "active");
          window.location.replace(nextUrl.toString());
          return;
        }
      } catch {
        // Keep the success notice visible and retry briefly while Paddle/webhook settles.
      }

      if (!cancelled && attempts < 12) {
        retryTimer = window.setTimeout(refreshWhenCompanyAccessIsReady, 2500);
      }
    }

    void refreshWhenCompanyAccessIsReady();

    return () => {
      cancelled = true;

      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [access, billing]);

  if (!notice) {
    return null;
  }

  return (
    <div
      className={`border ${
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
      {notice.actionLabel && notice.actionHref ? (
        <Link
          href={notice.actionHref}
          className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full bg-[#111315] px-3 text-[10px] font-black uppercase text-white transition hover:bg-[#27221e]"
        >
          {notice.actionLabel}
        </Link>
      ) : null}
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

      <section className="relative overflow-hidden border-b border-black/10 bg-[#fffaf2] text-[#111315]">
        <div className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7b6f65]">
                Account status
              </p>
              <StatusPill tone={companyAccess ? "good" : "warn"}>
                {accountStatus}
              </StatusPill>
              <span className="text-xs font-bold text-[#75695f]">
                {AXIS1_COMPANY_MONTHLY_PRICE}
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#5f574f]">
              {billingStatusCopy} Saved company info, clean PDFs, live report
              links, and history unlock while access is active. Already-created
              paid links and PDFs stay available.
            </p>
          </div>

          {companyAccess ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/axis-1/tool?step=outputs&account=company"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-3 text-[10px] font-black uppercase text-white"
              >
                <FileText className="h-3.5 w-3.5" />
                Build report
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[10px] font-black uppercase text-[#111315]"
              >
                Plan
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/company-version"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-3 text-[10px] font-black uppercase text-white"
              >
                Start company version
              </Link>
              <Link
                href="/axis-1/tool?account=free"
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[10px] font-black uppercase text-[#111315]"
              >
                Try free builder
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
