import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Service Report",
  description: "KitchenPermit sample service report for hood cleaning companies.",
  path: "/samples/axis-2",
});

export default function DeprecatedSamplePage() {
  redirect("/samples/axis-1");
}
