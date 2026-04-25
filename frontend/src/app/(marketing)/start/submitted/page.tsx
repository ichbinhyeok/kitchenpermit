import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { fetchBackendJson } from "@/lib/backend";
import { readQueryValue } from "@/lib/start-request";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start Submitted",
  description: "Confirmation surface for the hood manual intake flow.",
};

export const dynamic = "force-dynamic";

type SubmittedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function StartSubmittedPage({
  searchParams,
}: SubmittedPageProps) {
  const params = await searchParams;
  const leadId = readQueryValue(params.leadId);

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
              Send your request to {siteConfig.supportEmail} if you want to bypass the
              form while the migration is still in progress.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center border border-border-strong bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-surface"
              >
                Go to start
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

  let inquiry: InquiryView;

  try {
    inquiry = await fetchBackendJson<InquiryView>(`/api/public/inquiries/${leadId}`);
  } catch {
    notFound();
  }

  return (
    <>
      <PageHeader
        label="START // SUBMITTED"
        title="The request is structured. The next step is human."
        description="For MVP, the website hands the request into manual commerce. That keeps the flow honest while the order spine and paid delivery path mature."
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
            Manual next step
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Open the draft, then let ops take it from there.
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            This opens a structured draft to {siteConfig.supportEmail}. After the email
            is sent, hood can review the inquiry, convert it into an order, and
            fulfill the packet or paid batch without forcing fake self-serve flow.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              "The site captured the structured intake and stored it in the inquiry queue.",
              "Manual reply, quoting, and fulfillment still happen off the public page.",
              "This is intentional until payment and delivery paths are proven enough to productize.",
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
              Open Email Draft
            </a>
            <Link
              href="/start"
              className="inline-flex items-center justify-center border border-border-strong bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition hover:bg-white"
            >
              Edit Request
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
