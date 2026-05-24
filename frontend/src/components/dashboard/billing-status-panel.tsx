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

function emailVerificationNoticeCopy(value: string | null): BillingNoticeContent | null {
  if (value === "sent") {
    return {
      title: "Verification email sent.",
      copy:
        "Open the link in that inbox before saving company branding, clean paid reports, or starting checkout.",
      tone: "warn" as const,
    };
  }

  if (value === "needed") {
    return {
      title: "Verify your email first.",
      copy:
        "Dashboard stays open, but company output and checkout stay locked until this account email is verified.",
      tone: "warn" as const,
    };
  }

  if (value === "already") {
    return {
      title: "Email already verified.",
      copy:
        "This account can use company features when subscription access is active.",
      tone: "good" as const,
    };
  }

  return null;
}

function BillingNotice({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const billing = searchParams.get("billing");
  const verify = searchParams.get("verify");
  const access = searchParams.get("access");
  const notice = useMemo(
    () => billingNoticeCopy(billing) ?? emailVerificationNoticeCopy(verify),
    [billing, verify],
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
  emailVerified,
  emailVerificationRequired,
}: {
  companyAccess: boolean;
  billingStatus: string;
  provider: string;
  emailVerified: boolean;
  emailVerificationRequired: boolean;
}) {
  if (emailVerificationRequired && !emailVerified) {
    return "Email verification is required before company branding, clean PDFs, live paid links, report history, and checkout unlock.";
  }

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
  const emailVerified = entitlements?.emailVerified ?? false;
  const emailVerificationRequired = entitlements?.emailVerificationRequired ?? false;
  const companyAccess = entitlements?.companyAccess ?? false;
  const accountStatus = companyAccess
    ? "Company active"
    : entitlements?.authenticated
      ? !emailVerificationRequired || emailVerified
        ? "Company access not enabled yet"
        : "Email verification required"
      : state.status === "error"
        ? "Account API unavailable"
        : state.status === "ready"
          ? "Sign in required"
          : "Loading account access";
  const billingStatus = entitlements?.billingStatus || (companyAccess ? "active" : "not active");
  const provider = entitlements?.billingProvider || "paddle";
  const billingStatusCopy = describeBillingStatus({
    companyAccess,
    billingStatus,
    provider,
    emailVerified,
    emailVerificationRequired,
  });

  if (state.status === "ready" && !entitlements?.authenticated) {
    return (
      <div className="grid gap-3">
        {showNotice ? <BillingNotice /> : null}
        <section className="border-b border-black/10 bg-[#fffaf2] px-4 py-4 text-[#111315]">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7b6f65]">
            Sign in required
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.04em]">
            Sign in to manage service reports.
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#5f574f]">
            Use your account to request company access, save service records,
            manage company details, and send branded reports.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/login?next=%2Fdashboard"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#111315] px-4 text-[11px] font-black uppercase text-white transition hover:bg-[#27221e]"
            >
              Sign in
            </Link>
            <Link
              href="/axis-1/tool?account=free"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[11px] font-black uppercase text-[#111315]"
            >
              Build a free test report
            </Link>
          </div>
        </section>
      </div>
    );
  }

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
              {entitlements?.authenticated && (emailVerified || emailVerificationRequired) ? (
                <StatusPill tone={emailVerified ? "good" : "warn"}>
                  {emailVerified ? "Email verified" : emailVerificationRequired ? "Verify email" : "Email unverified"}
                </StatusPill>
              ) : null}
              <span className="text-xs font-bold text-[#75695f]">
                {AXIS1_COMPANY_MONTHLY_PRICE}
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#5f574f]">
              {companyAccess
                ? `${billingStatusCopy} Saved company info, clean PDFs, retained report links, and history unlock while access is active.`
                : "Company access not enabled yet. During launch, you can request a 30-day company pilot with no card required."}
            </p>
          </div>

          {entitlements?.authenticated && emailVerificationRequired && !emailVerified ? (
            <form action="/auth/email-verification/request" method="post">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#111315] px-4 text-[11px] font-black uppercase text-white transition hover:bg-[#27221e]"
              >
                Send verification email
              </button>
            </form>
          ) : companyAccess ? (
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
                href="/company-version?pilot=1"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-3 text-[10px] font-black uppercase text-white"
              >
                Request company pilot
              </Link>
              <Link
                href="/axis-1/tool?account=free"
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[10px] font-black uppercase text-[#111315]"
              >
                Build a free test report
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
