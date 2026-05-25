import Link from "@/components/navigation/static-link";
import {
  canonicalUrl,
  defaultOpenGraphImagePath,
  type SeoQuestion,
  type SeoResourcePageData,
  type SeoWorkflowStep,
} from "@/lib/seo";
import { ArrowRight, Check, CopyCheck, FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";

type SeoResourcePageProps = {
  page: SeoResourcePageData;
};

function defaultFaqs(page: SeoResourcePageData): readonly SeoQuestion[] {
  return [
    {
      question: `What should a ${page.title} include?`,
      answer: `It should include ${page.checklist.slice(0, 4).join(", ")}, and a clear saved record for the customer.`,
    },
    {
      question: "Should photos and open items stay in the same report?",
      answer:
        "Yes. Photos, completed work, blocked access, and next actions should stay in one customer-readable report so the restaurant does not have to piece together separate messages.",
    },
    {
      question: "How does the builder help with this?",
      answer:
        "The builder turns the same structure into a customer-ready report link and PDF copy after the service result is selected.",
    },
  ];
}

function defaultWorkflowSteps(page: SeoResourcePageData): readonly SeoWorkflowStep[] {
  return page.sections.map((section) => ({
    title: section.title,
    text: section.copy,
  }));
}

function structuredDataForPage({
  page,
  faqs,
  workflowSteps,
}: {
  page: SeoResourcePageData;
  faqs: readonly SeoQuestion[];
  workflowSteps: readonly SeoWorkflowStep[];
}) {
  const pageUrl = canonicalUrl(page.path);

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: canonicalUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: canonicalUrl("/resources"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: page.title,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metaTitle,
      description: page.description,
      url: pageUrl,
      isPartOf: {
        "@type": "WebSite",
        name: "KitchenPermit",
        url: canonicalUrl("/"),
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: canonicalUrl(defaultOpenGraphImagePath),
        width: 1200,
        height: 630,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: page.workflowTitle ?? `How to use ${page.title}`,
      description: page.summary,
      step: workflowSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.text,
        url: `${pageUrl}#step-${index + 1}`,
      })),
    },
  ];
}

export function SeoResourcePage({ page }: SeoResourcePageProps) {
  const faqs = page.faqs ?? defaultFaqs(page);
  const workflowSteps = page.workflowSteps ?? defaultWorkflowSteps(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredDataForPage({ page, faqs, workflowSteps })),
        }}
      />

      <section className="container-shell pb-10 pt-5 md:pb-16 md:pt-8">
        <div className="grid gap-8 border-b border-border pb-10 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-end">
          <div className="space-y-5">
            <SectionLabel>{page.label}</SectionLabel>
            <h1 className="font-display text-[2.7rem] font-bold leading-[0.92] tracking-normal text-foreground sm:text-6xl md:text-7xl">
              {page.title}
            </h1>
          </div>
          <div className="space-y-6">
            <p className="max-w-2xl border-l border-border-strong pl-5 text-base leading-8 text-muted-foreground md:text-lg">
              {page.summary}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={page.primaryHref} variant="solid" withIcon>
                {page.primaryAction}
              </ButtonLink>
              <Link
                href="/samples/quick-closeout"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-bold text-foreground transition hover:border-border-strong"
              >
                See sample
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-6 pb-8 md:grid-cols-3">
        {page.sections.map((section) => (
          <div key={section.title} className="border-t border-border pt-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              {section.title}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {section.copy}
            </p>
          </div>
        ))}
      </section>

      <section className="container-shell pb-12">
        <Panel className="px-6 py-6 md:px-7 md:py-7">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            Workflow
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-foreground">
            {page.workflowTitle ?? `How to use ${page.title}`}
          </h2>
          <div className="mt-6 grid gap-4">
            {workflowSteps.map((step, index) => (
              <div
                id={`step-${index + 1}`}
                key={step.title}
                className="grid gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0 sm:grid-cols-[72px_1fr]"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="text-base font-black tracking-[-0.03em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-6 pb-12 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Panel className="px-6 py-6 md:px-7 md:py-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Checklist
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-foreground">
                {page.checklistTitle}
              </h2>
            </div>
          </div>
          <ul className="mt-6 grid gap-3">
            {page.checklist.map((item) => (
              <li
                key={item}
                className="flex gap-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground first:border-t-0 first:pt-0"
              >
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="px-6 py-6 md:px-7 md:py-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111315] text-white">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Structure
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-foreground">
                {page.templateTitle}
              </h2>
            </div>
          </div>
          <div className="mt-6 divide-y divide-border">
            {page.templateRows.map(([label, copy]) => (
              <div key={label} className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[150px_1fr]">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">
                  {label}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell pb-12">
        <Panel className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:px-7 md:py-7">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              Common questions
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-foreground">
              Practical questions
            </h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-5">
                <h3 className="text-base font-black tracking-[-0.03em] text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-6 pb-16 md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <div className="rounded-[28px] bg-[#111315] px-6 py-6 text-white md:px-8 md:py-8">
            <div className="flex items-center gap-3">
              <CopyCheck className="h-5 w-5 text-[#ffb27d]" />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">
                Example wording
              </p>
            </div>
            <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-white/76">
              {page.copyBlock}
            </pre>
          </div>

          <Panel className="px-6 py-6 md:px-7 md:py-7">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              Build a test report
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-foreground">
              Turn this guidance into a report link.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Use the free builder to choose a service result, add optional photos and notes, then preview the customer report and PDF copy.
            </p>
            <Link
              href={page.primaryHref}
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#111315] px-5 text-sm font-bold text-white transition hover:bg-[#20262d]"
            >
              {page.primaryAction}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Panel>
        </div>

        <div className="border-t border-border pt-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Related
          </p>
          <div className="mt-4 grid gap-2">
            {page.related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-12 items-center justify-between gap-3 border-b border-border py-3 text-sm font-bold text-foreground transition hover:text-accent"
              >
                {link.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
