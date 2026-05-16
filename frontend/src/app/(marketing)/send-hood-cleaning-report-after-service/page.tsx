import type { Metadata } from "next";
import { SeoResourcePage } from "@/components/marketing/seo-resource-page";
import { findSeoResourcePage, publicPageMetadata } from "@/lib/seo";

const page = findSeoResourcePage("send-hood-cleaning-report-after-service")!;

export const metadata: Metadata = publicPageMetadata({
  title: page.metaTitle,
  description: page.description,
  path: page.path,
});

export default function SendHoodCleaningReportAfterServicePage() {
  return <SeoResourcePage page={page} />;
}
