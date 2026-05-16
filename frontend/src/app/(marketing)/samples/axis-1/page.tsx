import type { Metadata } from "next";
import { SampleReportViewer } from "@/components/axis1/sample-report-viewer";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Customer Service Report Link and PDF Sample",
  description:
    "A real sample customer service report link and PDF copy for a hood cleaning job.",
  path: "/samples/axis-1",
});

const sampleData = buildAxis1SampleProofData("blocked_access");

export default function SampleAxis1Page() {
  return <SampleReportViewer data={sampleData} />;
}
