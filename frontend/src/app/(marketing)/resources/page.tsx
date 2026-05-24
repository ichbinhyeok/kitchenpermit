import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { canonicalUrl, publicPageMetadata, seoResourcePages } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Hood Cleaning Report Templates and Resources | KitchenPermit",
  description:
    "Templates, samples, checklists, and customer closeout wording for hood cleaning service reports.",
  path: "/resources",
});

const resourceGroups = [
  {
    title: "Start here",
    paths: [
      "/hood-cleaning-service-report-template",
      "/kitchen-exhaust-cleaning-report-sample",
    ],
  },
  {
    title: "Handle exceptions",
    paths: [
      "/blocked-access-service-report-template",
      "/hood-cleaning-certificate-vs-service-report",
      "/nfpa-96-hood-cleaning-photo-checklist",
    ],
  },
  {
    title: "Send better customer updates",
    paths: [
      "/hood-cleaning-customer-closeout-email-template",
      "/hood-cleaning-before-after-photo-report",
      "/send-hood-cleaning-report-after-service",
    ],
  },
  {
    title: "Report types",
    paths: [
      "/restaurant-hood-cleaning-report",
      "/commercial-kitchen-exhaust-cleaning-report",
    ],
  },
] as const;

function ctaForResource(path: string) {
  if (path.includes("template")) {
    return "View template";
  }

  if (path.includes("sample")) {
    return "View sample";
  }

  return "Read guide";
}

export default function ResourcesPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "KitchenPermit hood cleaning report resources",
    itemListElement: seoResourcePages.map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: page.title,
      url: canonicalUrl(page.path),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <PageHeader
        label="RESOURCES"
        title="Hood cleaning report templates and resources."
        description="Use these templates and examples to explain completed work, blocked access, photos, and next actions more clearly after hood cleaning service."
      />

      <section className="container-shell grid gap-8 pb-16">
        {resourceGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-4 border-b border-border-strong pb-3">
              <h2 className="font-display text-[2rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-4xl">
                {group.title}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.paths.map((path) => {
                const page = seoResourcePages.find((item) => item.path === path);

                if (!page) {
                  return null;
                }

                return (
                  <Panel key={page.path} className="flex h-full flex-col px-6 py-6">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
                      {page.label}
                    </p>
                    <h3 className="mt-4 text-2xl font-black leading-[0.96] tracking-[-0.045em] text-foreground">
                      {page.title}
                    </h3>
                    <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">
                      {page.description}
                    </p>
                    <Link
                      href={page.path}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-accent transition hover:text-accent-strong"
                    >
                      {ctaForResource(page.path)}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Panel>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
