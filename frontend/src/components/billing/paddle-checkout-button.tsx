"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { loadAxis1AccountEntitlements } from "@/lib/axis1-server-storage";

type PaddleEnvironment = "sandbox" | "production";

type PaddleCheckoutResponse = {
  provider: "paddle";
  environment: PaddleEnvironment;
  clientToken: string;
  companyPriceId: string;
  checkoutMode: "transaction" | "items";
  transactionId: string | null;
  accountEmail: string;
  successUrl: string;
  fallbackReason?: string;
};

type PaddleCheckoutOptions = {
  transactionId?: string;
  items?: Array<{
    priceId: string;
    quantity: number;
  }>;
  customer?: {
    email: string;
  };
  customData?: Record<string, string>;
  settings?: {
    displayMode: "overlay";
    variant?: "one-page" | "multi-page";
    theme?: "light" | "dark";
    locale?: string;
    successUrl?: string;
  };
};

type PaddleGlobal = {
  Environment: {
    set: (environment: PaddleEnvironment) => void;
  };
  Initialize: (config: { token: string; pwCustomer?: Record<string, never> }) => void;
  Checkout: {
    open: (options: PaddleCheckoutOptions) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
    __hoodPaddleInitializedFor?: string;
  }
}

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

export function PaddleCheckoutButton({
  children,
  className = "",
  activeChildren = "Set up company branding",
}: PaddleCheckoutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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

  async function startCheckout() {
    if (accountAccess.checking) {
      return;
    }

    if (accountAccess.companyAccess) {
      router.push("/dashboard#company-profile");
      return;
    }

    if (accountAccess.authenticated === false) {
      router.push("/login?mode=signup&next=/company-version");
      return;
    }

    if (accountAccess.emailVerificationRequired && !accountAccess.emailVerified) {
      router.push("/dashboard?verify=needed");
      return;
    }

    setError("");
    setBusy(true);

    try {
      const response = await fetchApi("/api/billing/paddle/checkout", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        router.push("/login?mode=signup&next=/company-version");
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
        if (response.status === 403 && body.code === "email_unverified") {
          router.push("/dashboard?verify=needed");
          return;
        }
        throw new Error(body.message ?? `Checkout failed with status ${response.status}`);
      }

      const checkout = (await response.json()) as PaddleCheckoutResponse;

      if (!window.Paddle) {
        setError("Checkout is still loading. Try again in a moment.");
        return;
      }

      initializePaddle(checkout);

      const commonOptions = {
        customer: {
          email: checkout.accountEmail,
        },
        settings: {
          displayMode: "overlay" as const,
          variant: "one-page" as const,
          theme: "light" as const,
          locale: "en",
          successUrl: checkout.successUrl,
        },
      };

      if (checkout.transactionId) {
        window.Paddle.Checkout.open({
          transactionId: checkout.transactionId,
          ...commonOptions,
        });
        return;
      }

      window.Paddle.Checkout.open({
        items: [
          {
            priceId: checkout.companyPriceId,
            quantity: 1,
          },
        ],
        customData: {
          hood_product: "axis1_company_version",
          hood_account_email: checkout.accountEmail,
          hood_source: "company_version_checkout",
        },
        ...commonOptions,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout could not start.");
    } finally {
      setBusy(false);
    }
  }

  function initializePaddle(checkout: PaddleCheckoutResponse) {
    if (!window.Paddle) {
      throw new Error("Paddle checkout library is not available.");
    }

    const key = `${checkout.environment}:${checkout.clientToken}`;

    if (window.__hoodPaddleInitializedFor === key) {
      return;
    }

    if (checkout.environment === "sandbox") {
      window.Paddle.Environment.set("sandbox");
    }

    window.Paddle.Initialize({
      token: checkout.clientToken,
      pwCustomer: {},
    });
    window.__hoodPaddleInitializedFor = key;
  }

  const buttonLabel = accountAccess.companyAccess
      ? activeChildren
      : accountAccess.authenticated && accountAccess.emailVerificationRequired && !accountAccess.emailVerified
        ? "Verify email first"
      : busy
        ? "Opening checkout..."
        : children;

  return (
    <div className="grid gap-2">
      {!accountAccess.checking && accountAccess.authenticated && !accountAccess.companyAccess ? (
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
        />
      ) : null}
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy || accountAccess.checking}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition disabled:cursor-wait disabled:opacity-70 ${className}`}
      >
        <span>{buttonLabel}</span>
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </button>
      {error ? <p className="max-w-sm text-xs font-semibold leading-5 text-[#ffb27c]">{error}</p> : null}
    </div>
  );
}
