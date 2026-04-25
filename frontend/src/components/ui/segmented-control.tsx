"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

function SegmentedControl({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        "inline-flex w-full flex-wrap items-center gap-1 rounded-[14px] border border-black/10 bg-[rgba(17,17,17,0.03)] p-1",
        className,
      )}
      {...props}
    />
  );
}

function SegmentedControlItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "inline-flex min-h-8 flex-1 items-center justify-center rounded-[10px] px-3 py-1.5 text-sm font-medium tracking-[-0.02em] text-muted-foreground transition outline-none data-[state=on]:bg-white data-[state=on]:text-foreground focus-visible:ring-2 focus-visible:ring-accent/20 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
