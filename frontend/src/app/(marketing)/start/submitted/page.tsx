"use client";

import Link from "@/components/navigation/static-link";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { fetchApiJson } from "@/lib/api";
import { siteConfig } from "@/lib/site";

type InquiryView = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  serviceArea: string;
  productInterest: string;
  notes?: string | null;
  emailDraftUrl: string;
};

type InquiryRequestState = {
  leadId: string;
  inquiry: InquiryView | null;
  requestFailed: boolean;
};

function subscribeToLocationChanges(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getLeadIdFromLocation() {
  return new URLSearchParams(window.location.search).get("leadId")?.trim() ?? "";
}

function getServerLeadIdSnapshot() {
  return null;
}

function StartSubmittedContent() {
  const leadId = useSyncExternalStore(
    subscribeToLocationChanges,
    getLeadIdFromLocation,
    getServerLeadIdSnapshot,
  );
  const [requestState, setRequestState] = useState<InquiryRequestState>({
    leadId: "",
    inquiry: null,
    requestFailed: false,
  });
  const inquiry = requestState.leadId === leadId ? requestState.inquiry : null;
  const requestFailed =
    requestState.leadId === leadId ? requestState.requestFailed : false;

  useEffect(() => {
    if (!leadId) {
      return;
    }

    let cancelled = false;

    void fetchApiJson<InquiryView>(`/api/public/inquiries/${encodeURIComponent(leadId)}`)
      .then((result) => {
        if (!cancelled) {
          setRequestState({
            leadId,
            inquiry: result,
            requestFailed: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRequestState({
            leadId,
            inquiry: null,
            requestFailed: true,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  if (!leadId) {
    return (
      <>
        <PageHeader
          label="START // SUBMITTED"
          title="No inquiry id was provided."
          description="The confirmation screen expects a saved inquiry. Start from the intake form or contact the mailbox directly."
        />
        <section className="container-shell pb-20">
          <Panel className="max-w-3xl px-6 py-6">
            <p className="text-base leading-8 text-muted-foreground">
              Send your inquiry to {siteConfig.supportEmail} if you want to bypass the
              form or prefer to share the details directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center border border-border-strong bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-surface"
              >
                Go to inquiry
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center border border-border-strong bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-white"
              >
                Review pricing
              </Link>
            </div>
          </Panel>
        </section>
      </>
    );
  }

  if (requestFailed) {
    return (
      <>
        <PageHeader
          label="START // SUBMITTED"
          title="The inquiry could not be loaded."
          description="The confirmation page now reads from the backend API directly. If the inquiry was just created, try again or open the intake form."
        />
        <section className="container-shell pb-20">
          <Panel className="max-w-3xl px-6 py-6">
            <p className="text-base leading-8 text-muted-foreground">
              The saved inquiry was not returned for this id. Start from the intake
              form again or email {siteConfig.supportEmail} directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center border border-border-strong bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-surface"
              >
                Go to start
              </Link>
              <Link
                href="/samples"
                className="inline-flex items-center justify-center border border-border-strong bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-white"
              >
                Review samples
              </Link>
            </div>
          </Panel>
        </section>
      </>
    );
  }

  if (!inquiry) {
    return (
      <>
        <PageHeader
          label="START // SUBMITTED"
          title="Loading the saved inquiry."
          description="The confirmation page is reading the saved intake from the backend."
        />
        <section className="container-shell pb-20">
          <Panel className="max-w-3xl px-6 py-6">
            <p className="text-base leading-8 text-muted-foreground">
              Loading the inquiry snapshot and manual follow-through details.
            </p>
          </Panel>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        label="START // SUBMITTED"
        title="The request is structured. The next step is human."
        description="Design help is optional and manual. The core company version remains the self-serve product."
      />
      <section className="container-shell grid gap-6 pb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="px-6 py-6">
          <div className="border-b border-border pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Submission snapshot
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              The inquiry is saved and ready for manual follow-through.
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Company", inquiry.companyName],
              ["Contact", inquiry.contactName],
              ["Email", inquiry.email],
              ["Phone", inquiry.phone || "Not provided"],
              ["Interest", inquiry.productInterest],
              ["Service area", inquiry.serviceArea],
            ].map(([label, value]) => (
              <div key={label} className="border border-border bg-white px-4 py-4">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
              </div>
            ))}
          </div>
          {inquiry.notes ? (
            <div className="mt-4 border border-border bg-surface px-4 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Operational notes
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">{inquiry.notes}</p>
            </div>
          ) : null}
        </Panel>
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Support next step
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Open the email, then support will reply.
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            This opens a prepared email to {siteConfig.supportEmail}. After it is sent,
            hood can review the request and quote optional design help without making
            it look required for the self-serve company version.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              "The site captured the inquiry details for follow-up.",
            "Design help starts at $249 and is quoted separately.",
              "You can still use the self-serve company version without buying design help.",
            ].map((step) => (
              <div key={step} className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4 text-sm leading-7 text-foreground">
                {step}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={inquiry.emailDraftUrl}
              className="inline-flex items-center justify-center border border-accent bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-accent-strong"
            >
              Open Email
            </a>
            <Link
              href="/start"
              className="inline-flex items-center justify-center border border-border-strong bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-white"
            >
              Edit Inquiry
            </Link>
            <Link
              href="/samples"
              className="inline-flex items-center justify-center border border-border-strong bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-surface"
            >
              Review Samples
            </Link>
          </div>
        </Panel>
      </section>
    </>
  );
}

export default function StartSubmittedPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            label="START // SUBMITTED"
            title="Loading the saved inquiry."
            description="The confirmation page is reading the saved intake from the backend."
          />
          <section className="container-shell pb-20">
            <Panel className="max-w-3xl px-6 py-6">
              <p className="text-base leading-8 text-muted-foreground">
                Loading the inquiry snapshot and manual follow-through details.
              </p>
            </Panel>
          </section>
        </>
      }
    >
      <StartSubmittedContent />
    </Suspense>
  );
}
