import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { Suspense } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { LoginProductPreview } from "@/components/auth/login-product-preview";
import { HeaderBrandLink } from "@/components/header-chrome";
import { siteConfig } from "@/lib/site";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Account Login",
  description:
    "Log in or create an account to manage the Axis 1 company version. Active subscription unlocks saved branding, clean PDFs, live links, and report history.",
  path: "/login",
});

function LoginFallback() {
  return (
    <div className="min-h-[260px] rounded-2xl border border-black/10 bg-white p-6 text-sm font-semibold text-[#75695f]">
      Loading account access...
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f3eee5] px-3 py-4 text-[#111315] sm:px-5 sm:py-5">
      <div className="mx-auto flex w-[min(1120px,100%)] items-center justify-between gap-3 pb-4">
        <HeaderBrandLink
          href="/"
          icon={<Flame className="h-5 w-5 text-[#ff7a1a]" strokeWidth={2.1} />}
          title={siteConfig.name.toUpperCase()}
          tone="light"
          className="px-0"
        />
        <Link
          href="/axis-1/tool"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 text-[11px] font-black uppercase text-[#111315]/70 transition hover:bg-white hover:text-[#111315]"
        >
          Free builder
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <section className="mx-auto grid w-[min(1120px,100%)] overflow-hidden rounded-[28px] border border-black/10 bg-[#fffaf3] shadow-[0_28px_90px_rgba(26,20,16,0.12)] lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="order-2 lg:order-1">
          <LoginProductPreview />
        </div>

        <aside className="order-1 flex flex-col justify-between p-5 sm:p-7 lg:order-2 lg:p-8">
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase text-[#7b6f65]">
                  Sign in
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Account access
                </h2>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[#6f665e]">
                  Use the same account that stores company details and service
                  report history.
                </p>
              </div>
              <span className="rounded-md border border-[#111315] bg-[#111315] px-3 py-1.5 text-[10px] font-black uppercase text-white">
                Company
              </span>
            </div>

            <div className="pt-5">
              <Suspense fallback={<LoginFallback />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          <div className="mt-8 border-t border-black/10 pt-5">
            <Link
              href="/axis-1/tool"
              className="group inline-flex min-h-11 items-center justify-center gap-2 text-sm font-black text-[#b94d11] underline-offset-4 hover:underline"
            >
              Use free builder without login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <nav
              aria-label="Legal"
              className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-black uppercase text-[#75695f]"
            >
              <Link href="/terms" className="underline-offset-4 hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="underline-offset-4 hover:underline">
                Privacy
              </Link>
              <Link
                href="/refund-policy"
                className="underline-offset-4 hover:underline"
              >
                Refund Policy
              </Link>
            </nav>
          </div>
        </aside>
      </section>
    </main>
  );
}
