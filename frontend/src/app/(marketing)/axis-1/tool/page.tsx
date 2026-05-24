import type { Metadata } from "next";
import { PacketBuilder } from "@/components/axis1/packet-builder";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Service Report Builder",
  description:
    "A builder for hood cleaning companies to turn job photos and notes into a restaurant-ready service report link and PDF.",
  path: "/axis-1/tool",
});

export default function Axis1ToolPage() {
  return (
    <div className="axis-tool-route">
      <PacketBuilder />
    </div>
  );
}
