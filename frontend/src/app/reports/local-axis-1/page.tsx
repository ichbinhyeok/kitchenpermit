import { ClientRedirect } from "@/components/navigation/client-redirect";

import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Local Service Report",
  description: "Redirect to the browser-local customer-facing hood service report route.",
  path: "/reports/local-axis-1",
});

export default function LocalAxis1ReportPage() {
  return (
    <ClientRedirect
      href="/p/local"
      preserveSearch
      copy="The local report alias now lands on the browser-only customer-link route directly."
    />
  );
}
