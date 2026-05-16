import type { Metadata } from "next";
import { SeoResourcePage } from "@/components/marketing/seo-resource-page";
import { findSeoResourcePage, publicPageMetadata } from "@/lib/seo";

const page = findSeoResourcePage("commercial-kitchen-exhaust-cleaning-report")!;

export const metadata: Metadata = publicPageMetadata({
  title: page.metaTitle,
  description: page.description,
  path: page.path,
});

export default function CommercialKitchenExhaustCleaningReportPage() {
  return <SeoResourcePage page={page} />;
}
