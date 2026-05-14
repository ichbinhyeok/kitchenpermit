import { Suspense } from "react";
import { ServerAxis1ProofPageContent } from "@/components/axis1/server-axis1-proof-page-content";
import { Panel } from "@/components/ui/panel";

export default function ServerAxis1ProofPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
          <Panel className="mx-auto max-w-2xl px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Loading hosted service report link
            </p>
          </Panel>
        </main>
      }
    >
      <ServerAxis1ProofPageContent />
    </Suspense>
  );
}
