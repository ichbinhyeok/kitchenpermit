import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Service Report Builder",
  description: "KitchenPermit service report builder for hood cleaning companies.",
  path: "/axis-2",
});

export default function DeprecatedOutboundPage() {
  redirect("/axis-1");
}
