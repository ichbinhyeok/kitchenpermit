import type { Metadata } from "next";
import { PacketBuilder } from "@/components/axis1/packet-builder";

export const metadata: Metadata = {
  title: "AI Hood Job Closeout",
  description:
    "Minimal-input tool for kitchen exhaust vendors to upload messy job photos, review an AI-drafted closeout, and generate customer proof, invoice support, payment, follow-up, and next-action outputs.",
};

export default function Axis1ToolPage() {
  return (
    <div className="axis-tool-route">
      <PacketBuilder />
    </div>
  );
}
