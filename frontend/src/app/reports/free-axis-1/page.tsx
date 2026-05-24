import { ClientRedirect } from "@/components/navigation/client-redirect";

import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Free Service Report",
  description: "Redirect to the free customer-facing hood service report route.",
  path: "/reports/free-axis-1",
});

export default function FreeAxis1ReportPage() {
  return (
    <ClientRedirect
      href="/p/free"
      preserveSearch
      copy="The free report route now lands on the customer-link route directly."
    />
  );
}
