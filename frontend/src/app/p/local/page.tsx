import { Suspense } from "react";
import { LocalAxis1ProofPageContent } from "@/components/axis1/local-axis1-proof-page-content";
import { Panel } from "@/components/ui/panel";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Local Service Report Link",
  description: "Browser-local customer-facing hood service report link.",
  path: "/p/local",
});

export default function LocalAxis1ProofPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
          <Panel className="mx-auto max-w-2xl px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Loading local service report link
            </p>
          </Panel>
        </main>
      }
    >
      <LocalAxis1ProofPageContent />
    </Suspense>
  );
}
