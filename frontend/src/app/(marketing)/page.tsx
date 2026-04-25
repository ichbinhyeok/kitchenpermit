import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, Flame } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const serviceReportItems = [
  "Plain-English work summary",
  "Proof photos with context",
  "Blocked access and open items",
  "Customer action and next visit window",
];

const salesListItems = [
  "Live local trigger",
  "Why this account fits",
  "Best contact path",
  "First-touch talking points",
];

const proofRows = [
  {
    label: "After the visit",
    title: "A customer-ready proof packet replaces the explanation call.",
    detail:
      "The operator sees what happened, what was not accessible, and what they need to do next.",
  },
  {
    label: "Before the next sale",
    title: "A live account list gives outreach a reason to exist.",
    detail:
      "The vendor gets a trigger, fit reason, contact path, and first-touch angle instead of a raw spreadsheet.",
  },
];

const pricingRows = [
  ["Proof packet setup", "$149", "For existing-customer proof packets"],
  ["Sales packet setup", "$149", "For first-touch packet structure"],
  ["Service + sales bundle", "$259", "For vendors using both paths"],
  ["Live sales batch", "$149", "For 10 QA-reviewed prospects"],
];

function ArrowLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light" | "accent" | "outline";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-[#f26a21] text-white hover:bg-[#dd5b17]"
      : tone === "outline"
        ? "border border-white/16 bg-white/8 text-white hover:bg-white/14"
        : tone === "light"
          ? "bg-white text-[#111315] ring-1 ring-black/10 hover:bg-white/90"
          : "bg-[#111315] text-white hover:bg-[#20262d]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[15px] font-bold transition ${toneClass}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </Link>
  );
}

function EvidenceLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 border-t border-current/10 py-4 text-[15px] leading-6">
      <Check className="mt-1 h-4 w-4 shrink-0 text-[#f26a21]" strokeWidth={2.4} />
      <span>{children}</span>
    </li>
  );
}

function ProductDocumentPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(18,16,14,0.10)]">
        <div className="relative h-[360px]">
          <Image
            src="/images/home-hero-commercial-line-bright-v1.png"
            alt="Bright commercial kitchen exhaust hood line"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_54%,rgba(0,0,0,0.58))]" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/70">
                Service surface
              </p>
              <p className="mt-1 max-w-sm font-display text-3xl font-bold leading-[0.95]">
                Proof that looks like a real operating document.
              </p>
            </div>
            <Flame className="hidden h-6 w-6 text-[#ff8a4d] sm:block" strokeWidth={2} />
          </div>
        </div>
        <div className="grid border-t border-black/8 md:grid-cols-2">
          <div className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Existing customers
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold leading-[0.96] text-foreground">
              Same-day proof packet
            </h3>
            <ul className="mt-5 text-muted-foreground">
              {serviceReportItems.map((item) => (
                <EvidenceLine key={item}>{item}</EvidenceLine>
              ))}
            </ul>
          </div>
          <div className="border-t border-black/8 bg-[#f7f0e8] p-6 md:border-l md:border-t-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              New accounts
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold leading-[0.96] text-foreground">
              10 live prospects
            </h3>
            <ul className="mt-5 text-muted-foreground">
              {salesListItems.map((item) => (
                <EvidenceLine key={item}>{item}</EvidenceLine>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-[#11161b] p-6 text-white shadow-[0_24px_70px_rgba(18,16,14,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/48">
            What vendors buy first
          </p>
          <span className="rounded-full bg-[#f26a21] px-3 py-1 text-xs font-bold text-white">
            sample first
          </span>
        </div>
        <div className="space-y-8 py-7">
          {proofRows.map((row, index) => (
            <div key={row.label} className="grid gap-5 sm:grid-cols-[4rem_1fr]">
              <span className="font-mono text-xs text-white/38">0{index + 1}</span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#ffb27c]">
                  {row.label}
                </p>
                <h3 className="mt-3 font-display text-[2rem] font-bold leading-[0.96] text-white">
                  {row.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-white/64">{row.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6">
          <ArrowLink href="/samples/axis-1" tone="accent">
            Open proof sample
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="pb-24">
      <section className="container-shell pt-4 sm:pt-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[38px] bg-[#101419] text-white shadow-[0_42px_120px_rgba(8,10,12,0.28)] md:rounded-[48px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(242,106,33,0.20),transparent_28%),linear-gradient(90deg,#101419_0%,#101419_43%,rgba(16,20,25,0.86)_60%,rgba(16,20,25,0.52)_100%)]" />
            <div className="relative grid min-h-[720px] lg:grid-cols-[0.94fr_1.06fr]">
              <div className="z-10 flex flex-col justify-between gap-10 px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                <div className="max-w-2xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ffb27c]">
                    For kitchen exhaust vendors
                  </p>
                  <h1 className="mt-8 max-w-[9ch] font-display text-[3.75rem] font-bold leading-[0.9] text-white min-[390px]:text-[4.3rem] md:text-[6.2rem] lg:text-[5.7rem] xl:text-[6.25rem]">
                    Proof after service. Leads before sales.
                  </h1>
                  <p className="mt-7 max-w-xl text-base leading-8 text-white/70 md:text-lg md:leading-8">
                    hood gives kitchen exhaust vendors two useful deliverables: a
                    customer-ready proof packet after the job and a live local prospect
                    list before the next one.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <ArrowLink href="/samples/axis-1" tone="accent">
                      Open free sample
                    </ArrowLink>
                    <ArrowLink href="/start" tone="outline">
                      Request setup
                    </ArrowLink>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-white/10 pt-6 text-sm text-white/64 sm:grid-cols-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/36">
                      Existing customers
                    </p>
                    <p className="mt-2 font-semibold leading-6 text-white">
                      Send proof they can understand.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/36">
                      New accounts
                    </p>
                    <p className="mt-2 font-semibold leading-6 text-white">
                      Buy a list that has a reason to call.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/36">
                      Delivery
                    </p>
                    <p className="mt-2 font-semibold leading-6 text-white">
                      Public samples first. Paid delivery by inquiry.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[440px] lg:min-h-full">
                <Image
                  src="/images/home-hero-commercial-line-bright-v1.png"
                  alt="Clean commercial kitchen hood line"
                  fill
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,20,25,0.10),rgba(16,20,25,0.16)),linear-gradient(90deg,#101419_0%,rgba(16,20,25,0.60)_20%,transparent_58%)]" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[26px] border border-white/24 bg-white/82 p-5 text-[#111315] shadow-[0_26px_70px_rgba(0,0,0,0.18)] backdrop-blur md:bottom-8 md:left-8 md:right-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#75695f]">
                    sample link surface
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <h2 className="font-display text-2xl font-bold leading-[0.96]">
                        Proof packet
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#60554c]">
                        Proof, exceptions, and customer action in one clean link.
                      </p>
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold leading-[0.96]">
                        Sales list
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#60554c]">
                        Triggers and contact paths packaged for first touch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-shell py-12 md:py-18">
        <Reveal className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Two moments
            </p>
            <h2 className="mt-4 font-display text-[2.55rem] font-bold leading-[0.93] text-foreground md:text-[4.6rem]">
              The product earns money where vendors lose time.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            The site should not feel like generic field-service software. It should feel
            like a packet system for a vendor who needs clearer customer handoff and more
            usable sales opportunities.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-8">
          <ProductDocumentPreview />
        </Reveal>
      </section>

      <section className="container-shell py-4 md:py-12">
        <Reveal>
          <div className="overflow-hidden rounded-[34px] border border-black/8 bg-white/72 shadow-[0_26px_80px_rgba(17,17,17,0.08)]">
            <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
              <div className="bg-[#12171c] p-6 text-white sm:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffb27c]">
                  What ships
                </p>
                <h2 className="mt-5 max-w-md font-display text-[2.35rem] font-bold leading-[0.95] md:text-[3.3rem]">
                  Not a portal. Not a dashboard. A useful deliverable.
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-7 text-white/65">
                  Login-heavy history and account management can come later. The first
                  version should make the vendor look sharper today and support outreach
                  this week.
                </p>
              </div>
              <div className="grid divide-y divide-black/8 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                <div className="p-6 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Existing-customer product
                  </p>
                  <h3 className="mt-4 font-display text-3xl font-bold leading-[0.96] text-foreground">
                    Send this after the technician leaves.
                  </h3>
                  <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                    It reduces basic explanation calls and makes blocked access defensible
                    before it turns into a complaint.
                  </p>
                  <div className="mt-7">
                    <ArrowLink href="/axis-1">See proof packets</ArrowLink>
                  </div>
                </div>
                <div className="bg-[#fbf3ea] p-6 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    New-account product
                  </p>
                  <h3 className="mt-4 font-display text-3xl font-bold leading-[0.96] text-foreground">
                    Use this before the first cold touch.
                  </h3>
                  <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                    It keeps sales lists commercial: fewer dead rows, clearer triggers,
                    and better reasons to contact.
                  </p>
                  <div className="mt-7">
                    <ArrowLink href="/axis-2">See sales lists</ArrowLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-shell py-10 md:py-16">
        <Reveal className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Pricing frame
            </p>
            <h2 className="mt-4 font-display text-[2.4rem] font-bold leading-[0.95] text-foreground md:text-[3.8rem]">
              Setup-led, because the output has to be defensible.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
              Pricing stays visible, but recurring delivery only makes sense after a
              vendor has bought again.
            </p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-black/8 bg-white">
            {pricingRows.map(([name, price, summary]) => (
              <div
                key={name}
                className="grid gap-3 border-b border-black/8 p-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    {name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
                </div>
                <p className="font-display text-4xl font-bold text-foreground">{price}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

    </div>
  );
}
