import type { Metadata } from "next";
import { SampleAxis1ProofPageContent } from "@/components/axis1/sample-axis1-proof-page-content";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Clean Closeout Service Report",
  description: "A customer-facing clean hood service report sample.",
  path: "/p/sample-clean-closeout",
});

export default function SampleCleanCloseoutProofPage() {
  return <SampleAxis1ProofPageContent scenario="clean" />;
}
