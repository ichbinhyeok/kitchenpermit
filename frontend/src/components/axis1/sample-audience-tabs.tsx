"use client";

import { Check } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AudienceTab = {
  value: string;
  label: string;
  title: string;
  copy: string;
  points: readonly string[];
};

type SampleAudienceTabsProps = {
  items: readonly AudienceTab[];
};

export function SampleAudienceTabs({ items }: SampleAudienceTabsProps) {
  return (
    <Tabs defaultValue={items[0]?.value}>
      <TabsList>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          <Panel className="bg-white/84 px-5 py-5 md:px-6 md:py-6">
            <h2 className="font-display text-[2rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-[2.35rem]">
              {item.title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
              {item.copy}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {item.points.map((point) => (
                <div
                  key={point}
                  className="rounded-[20px] border border-black/10 bg-[rgba(17,17,17,0.03)] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(242,106,33,0.1)] text-accent">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    <p className="text-sm leading-6 text-foreground">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      ))}
    </Tabs>
  );
}
