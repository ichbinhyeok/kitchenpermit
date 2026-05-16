"use client";

import { Flame } from "lucide-react";
import Link from "@/components/navigation/static-link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HeaderBrandLink,
  HeaderChrome,
  HeaderMobileMenu,
  headerPrimaryActionClass,
  headerTextNavLinkClass,
} from "@/components/header-chrome";
import { siteConfig } from "@/lib/site";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/axis-1", label: "Service Report" },
  { href: "/samples/axis-1", label: "Sample" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Account" },
  { href: "/login", label: "Login" },
];

type HeaderAuthStatus = "checking" | "authenticated" | "anonymous";

export function SiteHeader() {
  const pathname = usePathname();
  const [authStatus, setAuthStatus] =
    useState<HeaderAuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    fetch("/auth/session", {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { authenticated?: boolean } | null) => {
        if (!cancelled) {
          setAuthStatus(data?.authenticated ? "authenticated" : "anonymous");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthStatus("anonymous");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const visibleNavigation = navigation.filter(
    (item) => item.href !== "/login" || authStatus === "anonymous",
  );

  return (
    <HeaderChrome tone="light" className="site-header">
      <div className="flex min-w-0 items-center gap-2 lg:gap-8">
        <HeaderBrandLink
          href="/"
          icon={<Flame className="h-5 w-5 text-[#ff7a1a]" strokeWidth={2.1} />}
          title={siteConfig.name.toUpperCase()}
          tone="light"
        />
        <nav className="hidden items-center lg:flex lg:gap-5 xl:gap-7">
          {visibleNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={headerTextNavLinkClass("light", isActive(item.href))}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden lg:block">
          <Link
            href="/company-version"
            aria-label="Start company version"
            className={headerPrimaryActionClass()}
          >
            Company Version
          </Link>
        </div>
        <HeaderMobileMenu
          tone="light"
          className="lg:hidden"
          items={[
            ...visibleNavigation.map((item) => ({
              href: item.href,
              label: item.label,
              active: isActive(item.href),
            })),
            {
              href: "/company-version",
              label: "Company Version",
              kind: "primary",
            },
          ]}
        />
      </div>
    </HeaderChrome>
  );
}
