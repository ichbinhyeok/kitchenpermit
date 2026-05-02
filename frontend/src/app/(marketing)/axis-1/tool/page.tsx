import type { Metadata } from "next";
import { PacketBuilder } from "@/components/axis1/packet-builder";

export const metadata: Metadata = {
  title: "Hood Job Proof Packet Tool",
  description:
    "Minimal-input tool for kitchen exhaust vendors to turn job photos and a result confirmation into a job proof packet, customer link, evidence PDF, invoice proof, follow-up, and rebook copy.",
};

export default function Axis1ToolPage() {
  return (
    <div className="axis-tool-route">
      <PacketBuilder />
    </div>
  );
}
