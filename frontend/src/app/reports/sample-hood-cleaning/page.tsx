import { ClientRedirect } from "@/components/navigation/client-redirect";

export default function SampleHoodCleaningReportPage() {
  return (
    <ClientRedirect
      href="/p/sample-hood-cleaning"
      copy="The report alias now lands on the sample customer-link route directly."
    />
  );
}
