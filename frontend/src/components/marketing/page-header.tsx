import { SectionLabel } from "@/components/ui/section-label";

type PageHeaderProps = {
  label: string;
  title: string;
  description: string;
};

export function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <section className="container-shell pb-8 pt-5 md:pb-16 md:pt-6">
      <div className="relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(255,255,255,0.46))] px-5 py-6 shadow-[var(--shadow-soft)] md:rounded-[38px] md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,106,33,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(17,17,17,0.04),transparent_32%)]" />
        <div className="relative flex flex-col gap-6">
          <SectionLabel>{label}</SectionLabel>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-end">
            <h1 className="font-display text-[2.3rem] font-bold leading-[0.96] tracking-normal text-foreground sm:text-5xl sm:leading-[0.92] md:max-w-[11ch] md:text-7xl md:leading-[0.88]">
              {title}
            </h1>
            <div className="space-y-4">
              <p className="max-w-2xl border-l border-border-strong pl-5 text-base leading-8 text-muted-foreground md:text-lg">
                {description}
              </p>
              <div className="hidden gap-3 md:grid md:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-white/72 px-4 py-4 text-sm leading-7 text-foreground">
                  Customer-ready handoff. Service result, photos, open items,
                  and next action stay in one clean record.
                </div>
                <div className="rounded-[24px] border border-border bg-[rgba(17,17,17,0.04)] px-4 py-4 text-sm leading-7 text-muted-foreground">
                  Simple policy. Test the builder free, then use the company
                  version when reports need your brand and history.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
