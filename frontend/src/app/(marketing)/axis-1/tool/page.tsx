import type { Metadata } from "next";
import { PacketBuilder } from "@/components/axis1/packet-builder";

export const metadata: Metadata = {
  title: "Hood Proof Packet Input Tool",
  description:
    "Input tool for kitchen exhaust vendors to turn job facts and field photos into a customer proof link and service evidence PDF.",
};

export default function Axis1ToolPage() {
  return (
    <div className="axis-tool-route">
      <PacketBuilder />
    </div>
  );
}
