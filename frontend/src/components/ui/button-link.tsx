import Link, { type LinkProps } from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonLinkVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold uppercase tracking-[0.18em] transition duration-200",
  {
    variants: {
      variant: {
        solid:
          "border-accent bg-accent px-5 py-3 text-white shadow-[0_18px_40px_rgba(242,106,33,0.18)] hover:bg-accent-strong hover:shadow-[0_20px_50px_rgba(242,106,33,0.22)]",
        outline:
          "border-border-strong bg-white/72 px-5 py-3 text-foreground hover:bg-white",
        dark: "border-white/12 bg-dark-surface px-5 py-3 text-white hover:bg-dark-surface-soft",
      },
      size: {
        default: "",
        sm: "px-4 py-2.5 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  },
);

type ButtonLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonLinkVariants> & {
    children: React.ReactNode;
    withIcon?: boolean;
  };

export function ButtonLink({
  children,
  className,
  variant,
  size,
  withIcon = false,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonLinkVariants({ variant, size }), className)} {...props}>
      <span>{children}</span>
      {withIcon ? <ArrowUpRight className="h-4 w-4" strokeWidth={2} /> : null}
    </Link>
  );
}
