import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { Suspense } from "react";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";
import {
  BillingStatusPanel,
  DashboardBillingNotice,
} from "@/components/dashboard/billing-status-panel";
import { CompanyProfilePanel } from "@/components/dashboard/company-profile-panel";
import { ReportHistoryPanel } from "@/components/dashboard/report-history-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Company account workspace for service records, follow-up dates, company details, and saved restaurant report links.",
};

const workspaceActions = [
  {
    icon: FileText,
    title: "New report",
    copy: "Create a restaurant-ready link and PDF.",
    href: "/axis-1/tool",
    primary: true,
  },
  {
    icon: CalendarClock,
    title: "Next dates",
    copy: "Open upcoming service and customer items.",
    href: "#report-history",
    primary: false,
  },
  {
    icon: Building2,
    title: "Company info",
    copy: "Update branding and contact details.",
    href: "#company-profile",
    primary: false,
  },
] as const satisfies ReadonlyArray<{
  icon: typeof FileText;
  title: string;
  copy: string;
  href: string;
  primary: boolean;
}>;

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f0e9df] text-[#111315]">
        <section className="border-b border-black/10 bg-[#111315] px-3 py-4 text-white sm:px-5">
          <div className="mx-auto w-[min(1360px,100%)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#ffb27d]">
                  Account / service records
                </p>
                <h1 className="mt-2 text-2xl font-black leading-tight tracking-[-0.045em] sm:text-3xl">
                  Service record workspace
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/62">
                  Review saved restaurant reports, next service dates, customer
                  resend copy, and company details from one working surface.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/axis-1/tool"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-4 text-[11px] font-black uppercase text-white shadow-[0_12px_30px_rgba(242,106,33,0.24)] transition hover:bg-[#dd5b17]"
                >
                  <FileText className="h-3.5 w-3.5" />
                  New report
                </Link>
                <Link
                  href="#company-profile"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 text-[11px] font-black uppercase text-white transition hover:bg-white/14"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Company info
                </Link>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/14 bg-transparent px-4 text-[11px] font-black uppercase text-white/62 transition hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4">
              <Suspense fallback={null}>
                <DashboardBillingNotice />
              </Suspense>
            </div>

            <nav
              className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-3"
              aria-label="Account workspace shortcuts"
            >
              {workspaceActions.map(({ icon: Icon, title, copy, href, primary }) => (
                <Link
                  key={title}
                  href={href}
                  className="group grid min-w-[210px] grid-cols-[auto_1fr_auto] items-start gap-x-2 gap-y-1 py-1 transition"
                >
                  <span className="flex items-center gap-2 text-sm font-black tracking-[-0.025em]">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        primary ? "text-[#ffb27d]" : "text-white/54"
                      }`}
                    />
                  </span>
                  <span className="grid gap-0.5">
                    <span className="text-sm font-black tracking-[-0.025em]">
                      {title}
                    </span>
                    <span className="text-xs font-semibold leading-5 text-white/50">
                      {copy}
                    </span>
                  </span>
                  <span className="mt-1 border-b border-transparent pb-1 transition group-hover:border-[#ffb27d]">
                    <ArrowRight className="h-3.5 w-3.5 text-white/38 transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="mx-auto w-[min(1360px,100%)] px-3 py-4 sm:px-5">
          <div className="overflow-hidden border-y border-black/10 bg-[#fffaf2] shadow-[0_26px_90px_rgba(70,47,28,0.10)]">
            <Suspense
              fallback={
                <div className="border-b border-black/10 bg-[#111315] px-4 py-3 text-sm font-semibold text-white/70">
                  Checking account status...
                </div>
              }
            >
              <BillingStatusPanel showNotice={false} />
            </Suspense>
            <CompanyProfilePanel />
            <ReportHistoryPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
