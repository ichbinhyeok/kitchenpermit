"use client";

import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/axis-1", label: "Customer Links" },
  { href: "/axis-2", label: "Sales Lists" },
  { href: "/samples", label: "Samples" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header pdf-print-hide sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="container-shell">
        <div className="flex min-h-[58px] items-center justify-between gap-2 rounded-full border border-black/8 bg-[#f7f2eb]/84 px-2 shadow-[0_14px_44px_rgba(26,20,16,0.10)] backdrop-blur-xl sm:min-h-[64px] sm:gap-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 lg:gap-8">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1.5 text-[0.98rem] font-black tracking-[-0.08em] text-[#111315] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111315] sm:gap-2 sm:px-2.5 sm:text-[1.28rem]"
            >
              <Flame className="h-4 w-4 text-accent sm:h-5 sm:w-5" strokeWidth={2.1} />
              <span>{siteConfig.name.toUpperCase()}</span>
            </Link>
            <nav className="hidden items-center lg:flex lg:gap-5 xl:gap-7">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[12px] font-bold uppercase tracking-[0.14em] transition xl:text-[13px] xl:tracking-[0.16em] ${
                    isActive(item.href)
                      ? "text-[#111315]"
                      : "text-[#111315]/42 hover:text-[#111315]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/samples/axis-1"
              className={`inline-flex min-h-10 items-center justify-center rounded-full border px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111315] sm:px-3 sm:text-[11px] sm:tracking-[0.1em] lg:hidden ${
                isActive("/samples")
                  ? "border-[#111315]/16 bg-white text-[#111315]"
                  : "border-black/8 bg-white/54 text-[#111315]/62 hover:text-[#111315]"
              }`}
            >
              Samples
            </Link>
            <Link
              href="/start"
              aria-label="Request setup"
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[#f26a21] px-3 text-[11px] font-bold tracking-[0.06em] text-white transition hover:bg-[#dd5b17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111315] sm:px-5 sm:text-[12px] sm:tracking-[0.12em]"
            >
              <span aria-hidden="true" className="sm:hidden">
                Request
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                Request Setup
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
