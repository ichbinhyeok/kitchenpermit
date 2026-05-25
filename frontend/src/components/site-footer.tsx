import Link from "@/components/navigation/static-link";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/axis-1", label: "Service Report" },
  { href: "/samples/quick-closeout", label: "Sample" },
  { href: "/resources", label: "Resources" },
  { href: "/hood-cleaning-service-report-template", label: "Report Template" },
  { href: "/send-hood-cleaning-report-after-service", label: "After Service" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Account" },
];

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund-policy", label: "Refund Policy" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer pdf-print-hide mt-14 pb-6 pt-8 text-foreground">
      <div className="container-shell">
        <div className="overflow-hidden rounded-[38px] bg-dark-surface text-white shadow-[var(--shadow)]">
          <div className="grid gap-6 border-b border-white/10 px-6 py-8 md:grid-cols-[minmax(0,1.15fr)_auto] md:items-center md:px-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.34em] text-white/45">
                For your company
              </p>
              <p className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-[-0.06em] text-white md:text-5xl">
                If the sample works, see how it looks under your company name.
              </p>
            </div>
            <ButtonLink
              href="/company-version"
              variant="solid"
              withIcon
              className="justify-self-start md:justify-self-end"
            >
              See company version
            </ButtonLink>
          </div>
          <div className="grid gap-10 px-6 py-8 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:px-8">
            <div className="space-y-4">
              <p className="font-display text-3xl font-bold uppercase tracking-[-0.06em] text-white">
                {siteConfig.name}
              </p>
              <p className="max-w-xl text-sm leading-7 text-white/62">
                KitchenPermit helps hood cleaning companies send
                restaurant-ready service reports with photos, open items, next
                actions, and a PDF copy.
              </p>
              <p className="max-w-xl text-xs font-semibold leading-6 text-white/44">
                Service report software only. Does not issue permits,
                certificates, inspections, or compliance approvals.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Product
              </p>
              <nav className="grid gap-2 text-sm uppercase tracking-[0.12em] text-white/52">
                {footerLinks.slice(0, 6).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex min-h-10 items-center transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Next Step
              </p>
              <nav className="grid gap-2 text-sm uppercase tracking-[0.12em] text-white/52">
                <Link
                  href="/company-version"
                  className="flex min-h-10 items-center transition hover:text-white"
                >
                  Company Reports
                </Link>
                <Link
                  href="/start"
                  className="flex min-h-10 items-center transition hover:text-white"
                >
                  Optional Setup Help
                </Link>
                <Link
                  href="/start"
                  className="flex min-h-10 items-center transition hover:text-white"
                >
                  Request setup help
                </Link>
              </nav>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 px-6 py-5 text-xs uppercase tracking-[0.16em] text-white/42 md:px-8">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex min-h-9 items-center transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
