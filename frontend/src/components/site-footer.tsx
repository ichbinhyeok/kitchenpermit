import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/axis-1", label: "Existing Customers" },
  { href: "/axis-2", label: "New Sales" },
  { href: "/samples", label: "Samples" },
  { href: "/pricing", label: "Pricing" },
  { href: `mailto:${siteConfig.supportEmail}`, label: "Contact Support" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer pdf-print-hide mt-14 pb-6 pt-8 text-foreground">
      <div className="container-shell">
        <div className="overflow-hidden rounded-[38px] bg-dark-surface text-white shadow-[var(--shadow)]">
          <div className="grid gap-6 border-b border-white/10 px-6 py-8 md:grid-cols-[minmax(0,1.15fr)_auto] md:items-center md:px-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.34em] text-white/45">
                Manual request path
              </p>
              <p className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-[-0.06em] text-white md:text-5xl">
                The packet carries the value. The site just opens the deal cleanly.
              </p>
            </div>
            <ButtonLink
              href="/start"
              variant="solid"
              withIcon
              className="justify-self-start md:justify-self-end"
            >
              Request Setup
            </ButtonLink>
          </div>
          <div className="grid gap-10 px-6 py-8 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:px-8">
            <div className="space-y-4">
              <p className="font-display text-3xl font-bold uppercase tracking-[-0.06em] text-white">
                {siteConfig.name}
              </p>
              <p className="max-w-xl text-sm leading-7 text-white/62">
                Industrial-grade packet system for kitchen exhaust vendors. Service
                packets sharpen post-service trust. Sales lists sell live opportunity
                before the first-touch packet helps close.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Product
              </p>
              <nav className="grid gap-2 text-sm uppercase tracking-[0.12em] text-white/52">
                {footerLinks.slice(0, 4).map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Workflow
              </p>
              <nav className="grid gap-2 text-sm uppercase tracking-[0.12em] text-white/52">
                <Link href="/start" className="transition hover:text-white">
                  Request Setup
                </Link>
                <Link href={`mailto:${siteConfig.supportEmail}`} className="transition hover:text-white">
                  Contact Support
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
