import Link from "@/components/navigation/static-link";
import type { SeoResourcePageData } from "@/lib/seo";
import { ArrowRight, Check, CopyCheck, FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";

type SeoResourcePageProps = {
  page: SeoResourcePageData;
};

export function SeoResourcePage({ page }: SeoResourcePageProps) {
  return (
    <>
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
                href="/samples/axis-1"
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

      <section className="container-shell grid gap-6 pb-16 md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] bg-[#111315] px-6 py-6 text-white md:px-8 md:py-8">
          <div className="flex items-center gap-3">
            <CopyCheck className="h-5 w-5 text-[#ffb27d]" />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">
              Copy block
            </p>
          </div>
          <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-white/76">
            {page.copyBlock}
          </pre>
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
