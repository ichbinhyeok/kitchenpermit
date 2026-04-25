"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  Axis1PacketBranding,
  Axis1PacketScenario,
} from "@/lib/axis1-packet-preview";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";

type Option<T extends string> = {
  value: T;
  label: string;
};

type PreviewStateControlsProps = {
  branding: Axis1PacketBranding;
  scenario: Axis1PacketScenario;
  brandingOptions: readonly Option<Axis1PacketBranding>[];
  scenarioOptions: readonly Option<Axis1PacketScenario>[];
};

export function PreviewStateControls({
  branding,
  scenario,
  brandingOptions,
  scenarioOptions,
}: PreviewStateControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function pushState(next: {
    branding?: Axis1PacketBranding;
    scenario?: Axis1PacketScenario;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("branding", next.branding ?? branding);
    params.set("scenario", next.scenario ?? scenario);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className={isPending ? "opacity-85 transition" : undefined}>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Branding
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Public shell / branded packet
          </p>
        </div>
        <SegmentedControl
          type="single"
          value={branding}
          onValueChange={(value) => {
            if (value) {
              pushState({ branding: value as Axis1PacketBranding });
            }
          }}
        >
          {brandingOptions.map((option) => (
            <SegmentedControlItem key={option.value} value={option.value} aria-label={option.label}>
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Packet state
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Exception / clean close
          </p>
        </div>
        <SegmentedControl
          type="single"
          value={scenario}
          onValueChange={(value) => {
            if (value) {
              pushState({ scenario: value as Axis1PacketScenario });
            }
          }}
        >
          {scenarioOptions.map((option) => (
            <SegmentedControlItem key={option.value} value={option.value} aria-label={option.label}>
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
    </div>
  );
}
