import type { Metadata } from "next";
import { SampleAxis1ProofPageContent } from "@/components/axis1/sample-axis1-proof-page-content";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Condition Review Service Report",
  description:
    "A customer-facing hood service report sample with a recorded condition and follow-up quote action.",
  path: "/p/sample-condition-review",
});

export default function SampleConditionReviewProofPage() {
  return <SampleAxis1ProofPageContent scenario="condition_review" />;
}
