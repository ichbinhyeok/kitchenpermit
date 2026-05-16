import Link from "@/components/navigation/static-link";
import { ArrowRight } from "lucide-react";
import { seoResourcePages } from "@/lib/seo";
import { Panel } from "@/components/ui/panel";

const featuredResourcePaths = [
  "/hood-cleaning-service-report-template",
  "/restaurant-hood-cleaning-report",
  "/hood-cleaning-before-after-photo-report",
  "/send-hood-cleaning-report-after-service",
] as const;

type ResourceLinkStripProps = {
  label?: string;
  title?: string;
  description?: string;
};

export function ResourceLinkStrip({
  label = "Resources",
  title = "Useful pages before a vendor tries the builder.",
  description = "These pages answer the search and cold-email questions around service reports, photos, customer handoffs, and after-service follow-up.",
}: ResourceLinkStripProps) {
  const resources = featuredResourcePaths
    .map((path) => seoResourcePages.find((page) => page.path === path))
    .filter((page): page is (typeof seoResourcePages)[number] => Boolean(page));

  return (
    <section className="container-shell pb-12">
      <Panel className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] md:px-7 md:py-7">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            {label}
          </p>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => (
            <Link
              key={resource.path}
              href={resource.path}
              className="group flex min-h-28 flex-col justify-between gap-4 border border-border bg-white px-4 py-4 transition hover:border-border-strong hover:bg-[#fff8f0]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {resource.label}
              </span>
              <span className="flex items-end justify-between gap-4">
                <span className="text-base font-black leading-tight tracking-[-0.03em] text-foreground">
                  {resource.title}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-accent transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Panel>
    </section>
  );
}
