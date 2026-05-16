import Link from "@/components/navigation/static-link";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/axis-1", label: "Service Report" },
  { href: "/samples/axis-1", label: "Sample" },
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
              Start Company Version
            </ButtonLink>
          </div>
          <div className="grid gap-10 px-6 py-8 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:px-8">
            <div className="space-y-4">
              <p className="font-display text-3xl font-bold uppercase tracking-[-0.06em] text-white">
                {siteConfig.name}
              </p>
              <p className="max-w-xl text-sm leading-7 text-white/62">
                Branded hood service report links and PDFs for hood cleaning
                companies. Turn field photos, open items, and next steps into a
                restaurant-ready report after every visit.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Product
              </p>
              <nav className="grid gap-2 text-sm uppercase tracking-[0.12em] text-white/52">
                {footerLinks.slice(0, 4).map((link) => (
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
                  Company Version
                </Link>
                <Link
                  href="/start"
                  className="flex min-h-10 items-center transition hover:text-white"
                >
                  Design Help
                </Link>
                <Link
                  href="/start"
                  className="flex min-h-10 items-center transition hover:text-white"
                >
                  Request Support
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
