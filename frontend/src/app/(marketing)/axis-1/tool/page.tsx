import type { Metadata } from "next";
import { PacketBuilder } from "@/components/axis1/packet-builder";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionLabel } from "@/components/ui/section-label";

export const metadata: Metadata = {
  title: "Free Hood Proof Packet Builder",
  description:
    "Free customer-facing hood proof packet builder for kitchen exhaust vendors. Create a clean customer explanation from job facts and field photos, then copy a link or save the PDF.",
};

export default function Axis1ToolPage() {
  return (
    <>
      <section className="container-shell pdf-print-hide pb-2 pt-3 md:pb-3 md:pt-4">
        <div className="rounded-[24px] border border-border bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(243,239,233,0.58))] px-4 py-4 shadow-[var(--shadow-soft)] md:rounded-[28px] md:px-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <SectionLabel>
                <span className="sm:hidden">FREE PROOF PACKET</span>
                <span className="hidden sm:inline">FREE PROOF PACKET TOOL FOR HOOD CLEANING VENDORS</span>
              </SectionLabel>
              <h1 className="mt-2 max-w-3xl font-display text-[clamp(1.62rem,8vw,2.65rem)] font-bold leading-[0.94] tracking-[-0.07em] text-foreground">
                Make a customer-ready hood proof packet in minutes.
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-[0.95rem]">
                Pick the job result, add the field photos you have, then copy a
                clean link or save a PDF your restaurant customer can understand.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3 lg:items-end">
              <div className="grid grid-cols-3 gap-1.5 text-[11px] text-muted-foreground sm:gap-2 sm:text-xs lg:w-[520px]">
                {["1. Pick result", "2. Add photos", "3. Link / PDF"].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-black/8 bg-white/72 px-2.5 py-2 text-center font-semibold sm:px-3"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                <ButtonLink href="/samples/axis-1" variant="outline" withIcon>
                  View sample packet
                </ButtonLink>
                <ButtonLink
                  href="/exports/axis-1-packet?branding=applied&scenario=exception"
                  variant="outline"
                  withIcon
                  className="hidden sm:inline-flex"
                >
                  View print-ready PDF preview
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className="mt-4 hidden gap-2 border-t border-black/8 pt-4 text-xs leading-5 text-muted-foreground md:grid md:grid-cols-3">
            {[
              [
                "What it makes",
                "A customer-facing hood cleaning proof packet, not an internal tech note.",
              ],
              [
                "Fast path",
                "Use the defaults, add photos only if you have them, then print or save PDF.",
              ],
              [
                "Branded setup",
                "Logo, phone, dispatch email, and reply CTA are shown in the packet after setup.",
              ],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-[18px] border border-black/8 bg-white/64 px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground">
                  {label}
                </p>
                <p className="mt-1">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PacketBuilder />
    </>
  );
}
