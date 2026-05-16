import type { Metadata } from "next";
import { SeoResourcePage } from "@/components/marketing/seo-resource-page";
import {
  findSeoResourcePage,
  publicPageMetadata,
} from "@/lib/seo";

const page = findSeoResourcePage("blocked-access-service-report-template")!;

export const metadata: Metadata = publicPageMetadata({
  title: page.metaTitle,
  description: page.description,
  path: page.path,
});

export default function BlockedAccessServiceReportTemplatePage() {
  return <SeoResourcePage page={page} />;
}
