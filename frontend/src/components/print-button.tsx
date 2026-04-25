"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-[#111315] px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#22282f]"
    >
      <Printer className="h-4 w-4" strokeWidth={2.1} />
      Print
    </button>
  );
}
