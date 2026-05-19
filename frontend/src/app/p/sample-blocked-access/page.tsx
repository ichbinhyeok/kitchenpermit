import type { Metadata } from "next";
import { SampleAxis1ProofPageContent } from "@/components/axis1/sample-axis1-proof-page-content";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Blocked Access Service Report",
  description:
    "A customer-facing hood service report sample with blocked access separated from completed work.",
  path: "/p/sample-blocked-access",
});

export default function SampleBlockedAccessProofPage() {
  return <SampleAxis1ProofPageContent scenario="blocked_access" />;
}
