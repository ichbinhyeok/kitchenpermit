import { ClientRedirect } from "@/components/navigation/client-redirect";

import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Hood Cleaning Report",
  description: "Redirect to the sample customer-facing hood service report.",
  path: "/reports/sample-hood-cleaning",
});

export default function SampleHoodCleaningReportPage() {
  return (
    <ClientRedirect
      href="/p/sample-hood-cleaning"
      copy="The report alias now lands on the sample customer-link route directly."
    />
  );
}
