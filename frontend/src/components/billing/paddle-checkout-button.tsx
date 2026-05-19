"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { loadAxis1AccountEntitlements } from "@/lib/axis1-server-storage";

type PilotAccessResponse = {
  ok: boolean;
  accountEmail: string;
  message: string;
};

type PaddleCheckoutButtonProps = {
  children: string;
  className?: string;
  activeChildren?: string;
};

type AccountAccessState = {
  checking: boolean;
  authenticated: boolean | null;
  emailVerified: boolean;
  emailVerificationRequired: boolean;
  companyAccess: boolean;
};

const pilotLoginHref = "/login?mode=signup&next=%2Fcompany-version%3Fpilot%3D1";

export function PaddleCheckoutButton({
  children,
  className = "",
  activeChildren = "Set up company branding",
}: PaddleCheckoutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState("");
  const [accountAccess, setAccountAccess] = useState<AccountAccessState>({
    checking: true,
    authenticated: null,
    emailVerified: false,
    emailVerificationRequired: false,
    companyAccess: false,
  });

  useEffect(() => {
    let cancelled = false;

    loadAxis1AccountEntitlements()
      .then((entitlements) => {
        if (!cancelled) {
          setAccountAccess({
            checking: false,
            authenticated: entitlements.authenticated,
            emailVerified: entitlements.emailVerified,
            emailVerificationRequired: entitlements.emailVerificationRequired,
            companyAccess: entitlements.companyAccess,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAccountAccess({
            checking: false,
            authenticated: null,
            emailVerified: false,
            emailVerificationRequired: false,
            companyAccess: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function requestPilotAccess() {
    if (accountAccess.checking) {
      return;
    }

    if (accountAccess.companyAccess) {
      router.push("/dashboard#company-profile");
      return;
    }

    if (accountAccess.authenticated === false) {
      router.push(pilotLoginHref);
      return;
    }

    if (accountAccess.emailVerificationRequired && !accountAccess.emailVerified) {
      router.push("/dashboard?verify=needed");
      return;
    }

    setError("");
    setBusy(true);

    try {
      const response = await fetchApi("/api/billing/pilot/request", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        router.push(pilotLoginHref);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as Partial<PilotAccessResponse> & {
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        if (response.status === 403 && body.code === "email_unverified") {
          router.push("/dashboard?verify=needed");
          return;
        }

        throw new Error(body.message ?? `Pilot request failed with status ${response.status}`);
      }

      setRequestedEmail(body.accountEmail ?? "");
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pilot request could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  const buttonLabel = accountAccess.companyAccess
    ? activeChildren
    : accountAccess.authenticated && accountAccess.emailVerificationRequired && !accountAccess.emailVerified
      ? "Verify email first"
      : sent
        ? "Pilot request sent"
        : busy
          ? "Sending request..."
          : children;

  const helperCopy = sent
    ? requestedEmail
      ? `Request sent for ${requestedEmail}. We will review it and email you when 30-day company access is enabled.`
      : "Request sent. We will review the account and email when 30-day company access is enabled."
    : "No card is charged. We review the logged-in account email, open 30 days of company access, and email when it is ready.";

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={requestPilotAccess}
        disabled={busy || accountAccess.checking || sent}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition disabled:cursor-default disabled:opacity-75 ${className}`}
      >
        <span>{buttonLabel}</span>
        {sent ? (
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        )}
      </button>
      <p
        className={`max-w-md text-xs font-semibold leading-5 ${
          sent ? "text-[#9ee6b4]" : "text-white/58"
        }`}
      >
        {helperCopy}
      </p>
      {error ? <p className="max-w-sm text-xs font-semibold leading-5 text-[#ffb27c]">{error}</p> : null}
    </div>
  );
}
