import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in or create an account to manage the Axis 1 company version. Active subscription unlocks saved branding, clean PDFs, live links, and report history.",
};

function LoginFallback() {
  return (
    <div className="min-h-[260px] rounded-[32px] border border-black/8 bg-white p-6 text-sm font-semibold text-[#75695f]">
      Loading login options...
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#eee6db] px-3 py-6 text-[#111315] sm:px-5 sm:py-8">
        <section className="mx-auto grid w-[min(1120px,100%)] gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="py-6 lg:py-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#7b6f65]">
              Company version
            </p>
            <h1 className="mt-4 max-w-[10ch] font-display text-[clamp(3.4rem,9vw,7.4rem)] font-bold leading-[0.83] tracking-[-0.09em]">
              Sign in when the report needs to stay.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#5f574f]">
              Free reports are for testing. Sign in to manage the company
              version; an active subscription unlocks saved company details,
              clean PDFs, live service report links, and report history.
            </p>
            <div className="mt-7 grid max-w-2xl gap-3 border-y border-black/10 py-5 sm:grid-cols-3">
              {[
                ["Company details", "Logo, phone, email, and report color prefill every report."],
                ["Clean PDF", "No free-builder watermark."],
                ["History", "Past service reports stay findable."],
              ].map(([title, copy]) => (
                <div key={title}>
                  <p className="text-sm font-black tracking-[-0.035em]">{title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#75695f]">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/axis-1/tool"
              className="mt-7 inline-flex min-h-10 items-center text-sm font-black uppercase tracking-[0.12em] text-[#f26a21] underline-offset-4 hover:underline"
            >
              Use free builder without login
            </Link>
          </div>

          <div className="rounded-[36px] bg-[#f7f1e8] p-4 shadow-[0_32px_100px_rgba(26,20,16,0.16)] sm:p-6">
            <div className="rounded-[30px] border border-black/10 bg-[#fffaf3] p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#7b6f65]">
                    Login
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-bold leading-[0.92] tracking-[-0.07em]">
                    Google or email password.
                  </h2>
                </div>
                <span className="rounded-full bg-[#111315] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  Simple account
                </span>
              </div>
              <Suspense fallback={<LoginFallback />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
