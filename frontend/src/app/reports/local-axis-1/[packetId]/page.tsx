import { redirect } from "next/navigation";

type LocalAxis1ReportPageProps = {
  params: Promise<{
    packetId: string;
  }>;
};

export default async function LocalAxis1ReportPage({
  params,
}: LocalAxis1ReportPageProps) {
  const { packetId } = await params;

  redirect(`/p/local/${encodeURIComponent(packetId)}`);
}
