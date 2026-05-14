"use client";

import Link from "@/components/navigation/static-link";
import { useEffect, useMemo } from "react";

type ClientRedirectProps = {
  href: string;
  copy: string;
  preserveSearch?: boolean;
};

export function ClientRedirect({
  href,
  copy,
  preserveSearch = false,
}: ClientRedirectProps) {
  const destination = useMemo(() => {
    if (!preserveSearch || typeof window === "undefined") {
      return href;
    }

    const search = window.location.search;

    if (!search) {
      return href;
    }

    return `${href}${href.includes("?") ? "&" : "?"}${search.slice(1)}`;
  }, [href, preserveSearch]);

  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <main className="min-h-screen bg-[#f3efe8] px-4 py-10 text-[#151515]">
      <div className="mx-auto max-w-xl rounded-[24px] border border-black/8 bg-white px-6 py-6 shadow-[0_18px_44px_rgba(17,17,17,0.08)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Redirecting
        </p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p>
        <Link
          href={destination}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-black/10 bg-[#111315] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
