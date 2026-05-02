import { ClientRedirect } from "@/components/navigation/client-redirect";

export default function LocalAxis1ReportPage() {
  return (
    <ClientRedirect
      href="/p/local"
      preserveSearch
      copy="The local report alias now lands on the browser-only customer-link route directly."
    />
  );
}
