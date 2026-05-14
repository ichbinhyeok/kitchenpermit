"use client";

import { Menu as MenuIcon, X } from "lucide-react";
import Link from "@/components/navigation/static-link";
import { useEffect, useState, type ReactNode } from "react";

export type HeaderTone = "light" | "dark";

type HeaderChromeProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  shellClassName?: string;
  sticky?: boolean;
  tone?: HeaderTone;
  padded?: boolean;
};

type HeaderBrandStaticLinkProps = {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  ariaLabel?: string;
  className?: string;
  markClassName?: string;
  tone?: HeaderTone;
};

export type HeaderMobileMenuItem = {
  href?: string;
  label: string;
  active?: boolean;
  icon?: ReactNode;
  kind?: "normal" | "primary";
  onSelect?: () => void;
};

type HeaderMobileMenuProps = {
  items: HeaderMobileMenuItem[];
  label?: string;
  tone?: HeaderTone;
  className?: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isPlainAnchorHref(href: string) {
  return (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  );
}

function HeaderHref({
  href,
  ariaLabel,
  className,
  onClick,
  children,
}: {
  href: string;
  ariaLabel?: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (isPlainAnchorHref(href)) {
    return (
      <a href={href} aria-label={ariaLabel} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function headerShellClass(tone: HeaderTone) {
  return tone === "dark"
    ? "border-white/10 bg-[#111315]/92 text-white shadow-[0_16px_48px_rgba(0,0,0,0.26)]"
    : "border-black/8 bg-[#f7f2eb]/86 text-[#111315] shadow-[0_14px_44px_rgba(26,20,16,0.10)]";
}

export function headerNavLinkClass(tone: HeaderTone, active = false) {
  if (tone === "dark") {
    return cx(
      "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-3 text-[11px] font-bold uppercase tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8a3d]",
      active
        ? "border-white/18 bg-white text-[#111315]"
        : "border-white/10 bg-white/[0.055] text-white/58 hover:bg-white/[0.11] hover:text-white",
    );
  }

  return cx(
    "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-3 text-[11px] font-bold uppercase tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111315]",
    active
      ? "border-[#111315]/16 bg-white text-[#111315]"
      : "border-black/8 bg-white/54 text-[#111315]/58 hover:bg-white/82 hover:text-[#111315]",
  );
}

export function headerTextNavLinkClass(tone: HeaderTone, active = false) {
  return cx(
    "text-[12px] font-bold uppercase tracking-[0.14em] transition xl:text-[13px] xl:tracking-[0.16em]",
    tone === "dark"
      ? active
        ? "text-white"
        : "text-white/42 hover:text-white"
      : active
        ? "text-[#111315]"
        : "text-[#111315]/42 hover:text-[#111315]",
  );
}

export function headerSecondaryActionClass(tone: HeaderTone, active = false) {
  return headerNavLinkClass(tone, active);
}

export function headerPrimaryActionClass() {
  return "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-4 text-[11px] font-bold tracking-[0.06em] text-white shadow-[0_14px_34px_rgba(242,106,33,0.22)] transition hover:bg-[#dd5b17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111315] sm:px-5 sm:text-[12px] sm:tracking-[0.1em]";
}

function mobileMenuItemClass(tone: HeaderTone, item: HeaderMobileMenuItem) {
  if (item.kind === "primary") {
    return "header-mobile-primary-action flex w-full items-center justify-between gap-3 rounded-[16px] bg-[#f26a21] px-4 py-3 text-left text-[12px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#dd5b17]";
  }

  if (tone === "dark") {
    return cx(
      "flex w-full items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left text-[12px] font-black uppercase tracking-[0.12em] transition",
      item.active
        ? "bg-white text-[#111315]"
        : "text-white/68 hover:bg-white/[0.07] hover:text-white",
    );
  }

  return cx(
    "flex w-full items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left text-[12px] font-black uppercase tracking-[0.12em] transition",
    item.active
      ? "bg-[#111315] text-white"
      : "text-[#111315]/62 hover:bg-[#111315]/6 hover:text-[#111315]",
  );
}

export function HeaderChrome({
  children,
  className,
  containerClassName = "container-shell",
  shellClassName,
  sticky = true,
  tone = "light",
  padded = true,
}: HeaderChromeProps) {
  return (
    <header
      className={cx(
        "pdf-print-hide z-50 print:hidden",
        sticky && "sticky top-0",
        padded && "px-3 pt-3 sm:px-4 sm:pt-4",
        className,
      )}
    >
      <div className={containerClassName}>
        <div
          className={cx(
            "relative flex min-h-[58px] items-center justify-between gap-2 overflow-visible rounded-full border px-2 py-1.5 backdrop-blur-xl sm:min-h-[64px] sm:gap-3 sm:px-4",
            headerShellClass(tone),
            shellClassName,
          )}
        >
          {children}
        </div>
      </div>
    </header>
  );
}

export function HeaderMobileMenu({
  items,
  label = "Menu",
  tone = "light",
  className,
}: HeaderMobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const menuPanelClass =
    tone === "dark"
      ? "border-white/10 bg-[#202326] text-white shadow-[0_22px_70px_rgba(0,0,0,0.38)]"
      : "border-black/8 bg-[#fbf7ef] text-[#111315] shadow-[0_22px_70px_rgba(26,20,16,0.16)]";

  return (
    <div className={cx("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={cx(
          headerSecondaryActionClass(tone),
          "h-10 w-10 px-0 sm:h-11 sm:w-auto sm:px-3",
        )}
      >
        {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        <span className="hidden sm:inline">{label}</span>
      </button>
      {open ? (
        <div
          className={cx(
            "absolute right-0 top-12 z-[160] w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border p-1.5",
            menuPanelClass,
          )}
        >
          {items.map((item) => {
            const content = (
              <>
                <span>{item.label}</span>
                {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              </>
            );

            if (item.href) {
              return (
                <HeaderHref
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={mobileMenuItemClass(tone, item)}
                  ariaLabel={item.label}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect?.();
                  }}
                >
                  {content}
                </HeaderHref>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={mobileMenuItemClass(tone, item)}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function HeaderBrandLink({
  href,
  icon,
  title,
  subtitle,
  ariaLabel,
  className,
  markClassName,
  tone = "light",
}: HeaderBrandStaticLinkProps) {
  return (
    <HeaderHref
      href={href}
      ariaLabel={ariaLabel}
      className={cx(
        "flex min-w-0 shrink-0 items-center gap-2 rounded-full px-1.5 py-1 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        tone === "dark"
          ? "text-white focus-visible:outline-[#ff8a3d]"
          : "text-[#111315] focus-visible:outline-[#111315]",
        className,
      )}
    >
      <span
        className={cx(
          "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] font-black tracking-[-0.06em]",
          tone === "dark" ? "bg-white text-[#111315]" : "bg-[#111315] text-white",
          markClassName,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={cx(
            "block truncate text-sm font-black leading-tight tracking-[-0.05em]",
            subtitle ? "" : "uppercase",
          )}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            className={cx(
              "mt-0.5 block truncate text-[10px] font-bold uppercase tracking-[0.14em]",
              tone === "dark" ? "text-white/42" : "text-[#111315]/42",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </HeaderHref>
  );
}
