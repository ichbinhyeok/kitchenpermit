import type { AnchorHTMLAttributes, ReactNode } from "react";

type StaticHref = string;

export type StaticLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: StaticHref;
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

export default function StaticLink({
  href,
  children,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  ...props
}: StaticLinkProps) {
  void _prefetch;
  void _replace;
  void _scroll;

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
