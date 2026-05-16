import type { Metadata } from "next";
import { SeoResourcePage } from "@/components/marketing/seo-resource-page";
import {
  findSeoResourcePage,
  publicPageMetadata,
} from "@/lib/seo";

const page = findSeoResourcePage("nfpa-96-hood-cleaning-photo-checklist")!;

export const metadata: Metadata = publicPageMetadata({
  title: page.metaTitle,
  description: page.description,
  path: page.path,
});

export default function Nfpa96HoodCleaningPhotoChecklistPage() {
  return <SeoResourcePage page={page} />;
}
