import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { Suspense, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  FileText,
  History,
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
  title: "Dashboard",
  description:
    "Company version workspace for saved report links, company details, customer history, and subscription status.",
};

const workspaceActions = [
  {
    icon: FileText,
    title: "Start next report",
    copy: "Create the customer-ready link/PDF. Company access adds branding and history.",
    href: "/axis-1/tool",
    primary: true,
  },
  {
    icon: History,
    title: "Open saved history",
    copy: "Available when company access is active: reopen, edit, or resend saved reports.",
    href: "#report-history",
    primary: false,
  },
  {
    icon: Building2,
    title: "Update company info",
    copy: "Change the logo, report color, phone, email, or service area.",
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

function DashboardAction({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-black uppercase tracking-[0.12em] transition ${
        primary
          ? "bg-[#f26a21] text-white hover:bg-[#dd5b17]"
          : "border border-black/10 bg-white text-[#111315] hover:bg-[#fbf7ef]"
      }`}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#eee6db] px-3 py-5 text-[#111315] sm:px-5 sm:py-7">
        <section className="mx-auto grid w-[min(1180px,100%)] gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="rounded-[32px] border border-black/8 bg-[#fbf7ef] p-5 shadow-[0_24px_80px_rgba(26,20,16,0.10)] sm:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#7b6f65]">
              Dashboard
            </p>
            <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(2.5rem,6vw,4.8rem)] font-bold leading-[0.88] tracking-[-0.08em]">
              Your report workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#5f574f] sm:text-base">
              Build the next hood cleaning report, resend a customer link, or
              update the company details restaurants see on the report.
            </p>

            <div className="mt-4">
              <Suspense fallback={null}>
                <DashboardBillingNotice />
              </Suspense>
            </div>

            <div className="mt-5 grid gap-2">
              {workspaceActions.map(({ icon: Icon, title, copy, href, primary }) => (
                <Link
                  key={title}
                  href={href}
                  className={`group grid gap-3 rounded-[22px] border px-4 py-3 transition sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                    primary
                      ? "border-[#f26a21]/30 bg-[#fff7ef] hover:bg-white"
                      : "border-black/8 bg-white/80 hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[16px] ${
                      primary ? "bg-[#f26a21] text-white" : "bg-[#111315] text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-black tracking-[-0.035em]">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-[#75695f]">
                      {copy}
                    </span>
                  </span>
                  <ArrowRight className="hidden h-4 w-4 text-[#f26a21] transition group-hover:translate-x-0.5 sm:block" />
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <DashboardAction href="/pricing">Review pricing</DashboardAction>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-[#111315] transition hover:bg-[#fbf7ef]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="rounded-[34px] bg-[#111315] p-6 text-sm font-semibold text-white/62">
                Checking account status...
              </div>
            }
          >
            <BillingStatusPanel showNotice={false} />
          </Suspense>
        </section>

        <section className="mx-auto mt-5 grid w-[min(1180px,100%)] gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <ReportHistoryPanel />
          <CompanyProfilePanel />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
