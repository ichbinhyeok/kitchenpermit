"use client";

import Link from "@/components/navigation/static-link";
import { useSyncExternalStore } from "react";
import { ServerAxis1ReportClient } from "@/components/axis1/server-axis1-report-client";
import { Panel } from "@/components/ui/panel";

function subscribeToLocationChanges(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return "";
}

export function ServerAxis1ProofPageContent() {
  const queryString = useSyncExternalStore(
    subscribeToLocationChanges,
    getLocationSearch,
    getServerLocationSearch,
  );
  const searchParams = new URLSearchParams(queryString);
  const reportId = searchParams.get("reportId")?.trim() ?? "";
  const outputIntent =
    searchParams.get("format") === "pdf" ? "service-record" : "customer-link";

  if (!reportId) {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Hosted service report link missing report id
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
            This service report link is missing its hosted record id.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Open the builder and create a fresh service report. The report
            will be saved before the service report link is copied.
          </p>
          <Link
            href="/axis-1/tool?step=photos"
            className="mt-6 inline-flex rounded-full bg-[#111315] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            Open builder
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <ServerAxis1ReportClient
      publicId={reportId}
      outputIntent={outputIntent}
    />
  );
}
