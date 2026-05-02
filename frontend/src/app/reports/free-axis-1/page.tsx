import { ClientRedirect } from "@/components/navigation/client-redirect";

export default function FreeAxis1ReportPage() {
  return (
    <ClientRedirect
      href="/p/free"
      preserveSearch
      copy="The free report route now lands on the customer-link route directly."
    />
  );
}
