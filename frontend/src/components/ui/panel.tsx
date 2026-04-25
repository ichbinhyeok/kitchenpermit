import { cn } from "@/lib/utils";

type PanelProps = {
  className?: string;
  children: React.ReactNode;
};

export function Panel({ className, children }: PanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-border bg-surface-strong shadow-[var(--shadow-soft)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-black/10 before:to-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
