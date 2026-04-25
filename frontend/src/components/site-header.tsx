"use client";

import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/axis-1", label: "Proof Packets" },
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
    <header className="pdf-print-hide sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="container-shell">
        <div className="flex min-h-[58px] items-center justify-between gap-3 rounded-full border border-black/8 bg-[#f7f2eb]/84 px-3 shadow-[0_14px_44px_rgba(26,20,16,0.10)] backdrop-blur-xl sm:min-h-[64px] sm:px-4">
          <div className="flex min-w-0 items-center gap-3 lg:gap-8">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[1.08rem] font-black tracking-[-0.08em] text-[#111315] sm:text-[1.28rem]"
            >
              <Flame className="h-5 w-5 text-accent" strokeWidth={2.1} />
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
          <Link
            href="/start"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[#f26a21] px-4 text-[12px] font-bold tracking-[0.08em] text-white transition hover:bg-[#dd5b17] sm:px-5 sm:tracking-[0.12em]"
          >
            <span className="sm:hidden">Request</span>
            <span className="hidden sm:inline">Request Setup</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
