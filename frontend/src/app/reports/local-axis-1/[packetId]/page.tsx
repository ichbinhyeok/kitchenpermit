import type { Metadata } from "next";
import { LocalAxis1ReportClient } from "@/components/axis1/local-axis1-report-client";

export const metadata: Metadata = {
  title: "Local Customer Proof Link",
  description: "A local browser-only kitchen exhaust customer proof link.",
  robots: {
    index: false,
    follow: false,
  },
};

type LocalAxis1ReportPageProps = {
  params: Promise<{
    packetId: string;
  }>;
};

export default async function LocalAxis1ReportPage({
  params,
}: LocalAxis1ReportPageProps) {
  const { packetId } = await params;

  return <LocalAxis1ReportClient packetId={packetId} />;
}
