"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LocalAxis1ReportClient } from "@/components/axis1/local-axis1-report-client";
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

export function LocalAxis1ProofPageContent() {
  const queryString = useSyncExternalStore(
    subscribeToLocationChanges,
    getLocationSearch,
    getServerLocationSearch,
  );
  const searchParams = new URLSearchParams(queryString);
  const packetId = searchParams.get("packetId")?.trim() ?? "";
  const outputIntent =
    searchParams.get("format") === "pdf" ? "service-record" : "customer-link";

  if (!packetId) {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Service handoff missing packet id
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
            This service handoff link is missing its record id.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Open the builder and create a fresh customer handoff. The customer link
            and evidence PDF will be generated from the current closeout record.
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

  return <LocalAxis1ReportClient packetId={packetId} outputIntent={outputIntent} />;
}
