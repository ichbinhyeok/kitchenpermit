import { cn } from "@/lib/utils";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-border bg-white/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground shadow-[var(--shadow-soft)] sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.32em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
