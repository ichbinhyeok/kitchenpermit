import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { canonicalUrl, publicPageMetadata, seoResourcePages } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Hood Cleaning Service Report Resources",
  description:
    "Templates, samples, checklists, and customer closeout wording for hood cleaning service reports.",
  path: "/resources",
});

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
        title="Templates for cleaner customer handoffs."
        description="Use these pages to turn hood cleaning photos, blocked access notes, and next actions into customer-ready service report links and PDFs."
      />

      <section className="container-shell grid gap-5 pb-16 md:grid-cols-2">
        {seoResourcePages.map((page) => (
          <Panel key={page.path} className="px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              {page.label}
            </p>
            <h2 className="mt-4 text-3xl font-black leading-[0.94] tracking-[-0.05em] text-foreground">
              {page.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {page.description}
            </p>
            <Link
              href={page.path}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-accent transition hover:text-accent-strong"
            >
              Open resource
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Panel>
        ))}
      </section>
    </>
  );
}
