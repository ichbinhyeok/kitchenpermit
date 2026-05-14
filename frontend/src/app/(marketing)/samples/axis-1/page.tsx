import type { Metadata } from "next";
import { SampleReportViewer } from "@/components/axis1/sample-report-viewer";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";

export const metadata: Metadata = {
  title: "Customer Service Report Link and PDF Sample",
  description:
    "A real sample customer service report link and PDF copy for a hood cleaning job.",
};

const sampleData = buildAxis1SampleProofData("blocked_access");

export default function SampleAxis1Page() {
  return <SampleReportViewer data={sampleData} />;
}
