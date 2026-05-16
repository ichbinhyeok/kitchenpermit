import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { Suspense } from "react";
import { ArrowLeft, Flame } from "lucide-react";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";
import { HeaderBrandLink } from "@/components/header-chrome";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a one-time password reset link for a KitchenPermit account.",
};

function ResetRequestFallback() {
  return (
    <div className="min-h-[220px] rounded-2xl border border-black/10 bg-white p-6 text-sm font-semibold text-[#75695f]">
      Loading password reset...
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f3eee5] px-3 py-4 text-[#111315] sm:px-5 sm:py-5">
      <div className="mx-auto flex w-[min(960px,100%)] items-center justify-between gap-3 pb-4">
        <HeaderBrandLink
          href="/"
          icon={<Flame className="h-5 w-5 text-[#ff7a1a]" strokeWidth={2.1} />}
          title={siteConfig.name.toUpperCase()}
          tone="light"
          className="px-0"
        />
        <Link
          href="/login"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 text-[11px] font-black uppercase text-[#111315]/70 transition hover:bg-white hover:text-[#111315]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>

      <section className="mx-auto grid w-[min(960px,100%)] overflow-hidden rounded-[28px] border border-black/10 bg-[#fffaf3] shadow-[0_28px_90px_rgba(26,20,16,0.12)] lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="order-2 relative min-h-[360px] bg-[#111315] p-6 text-white sm:p-8 lg:order-1 lg:min-h-[460px]">
          <div className="max-w-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ffb27d]">
              Account recovery
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-5xl">
              Get back to the report history.
            </h1>
            <p className="mt-5 max-w-lg text-sm font-semibold leading-6 text-white/62">
              The reset link is sent to the account email. It lets you set a new
              password without exposing the old one.
            </p>
          </div>
          <div className="absolute inset-x-6 bottom-6 border-t border-white/10 pt-5 text-xs font-semibold leading-5 text-white/48 sm:inset-x-8">
            Use an email inbox you can access. Saved company info, report links,
            PDFs, and service history stay tied to that account email.
          </div>
        </div>

        <aside className="order-1 flex flex-col justify-center p-5 sm:p-7 lg:order-2 lg:p-8">
          <div className="border-b border-black/10 pb-5">
            <p className="font-mono text-[10px] uppercase text-[#7b6f65]">
              Forgot password
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Send reset link
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6f665e]">
              For security, the response is the same even if the email is not
              registered.
            </p>
          </div>
          <div className="pt-5">
            <Suspense fallback={<ResetRequestFallback />}>
              <PasswordResetRequestForm />
            </Suspense>
          </div>
        </aside>
      </section>
    </main>
  );
}
