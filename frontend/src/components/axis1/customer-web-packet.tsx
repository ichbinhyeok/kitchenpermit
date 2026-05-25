"use client";

import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import {
  IconAlertTriangleFilled,
  IconArrowsHorizontal,
  IconCalendarDue,
  IconChevronDown,
  IconCircleCheckFilled,
  IconClipboardText,
  IconFileText,
  IconFlame,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconRoute,
  IconShieldCheckFilled,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeaderBrandLink,
  HeaderChrome,
  HeaderMobileMenu,
  type HeaderMobileMenuItem,
  headerNavLinkClass,
  headerPrimaryActionClass,
  headerSecondaryActionClass,
} from "@/components/header-chrome";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

type CustomerWebPacketSectionVisibility = {
  photos: boolean;
  checklist: boolean;
  routeDetail: boolean;
  nextService: boolean;
};

export type CustomerWebPacketEditTarget =
  | "result"
  | "openItem"
  | "action"
  | "recordNote";

type CustomerWebPacketEditField = {
  label: string;
  value: string;
  placeholder: string;
  helper?: string;
  maxLength?: number;
  onChange: (value: string) => void;
};

export type CustomerWebPacketEditConfig = {
  enabled?: boolean;
  activeTarget?: CustomerWebPacketEditTarget | null;
  fields?: Partial<Record<CustomerWebPacketEditTarget, CustomerWebPacketEditField>>;
  onSelectTarget?: (target: CustomerWebPacketEditTarget) => void;
  onEditScope?: () => void;
  onClose?: () => void;
};

type CustomerWebPacketProps = {
  data: Axis1PacketPreviewData;
  className?: string;
  heroHeadingLevel?: "h1" | "h2";
  presentationMode?: "standard" | "short";
  visibleSections?: Partial<CustomerWebPacketSectionVisibility>;
  editConfig?: CustomerWebPacketEditConfig;
};

type ProofPhoto = Axis1PacketPreviewData["proofPhotos"][number];
type ComponentRow = Axis1PacketPreviewData["componentStatusRows"][number];
type RouteSegment = Axis1PacketPreviewData["routeSegments"][number];
type CoverageEducation = NonNullable<Axis1PacketPreviewData["closeout"]>["coverageEducation"];
type CloseoutCta = NonNullable<Axis1PacketPreviewData["closeout"]>["ctas"][number];
type LinkedCloseoutCta = CloseoutCta & { href: string };

const defaultSections: CustomerWebPacketSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isPublicSamplePacket(data: Axis1PacketPreviewData) {
  return (
    data.reportUrl.includes("/p/sample-") ||
    data.sampleFooter.some(([label]) => /^sample variant$/i.test(label))
  );
}

function hexToRgb(hex: string) {
  const normalized = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.slice(1) : "f26a21";

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function accentTextColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? "#111315" : "#ffffff";
}

function mixWithWhite(hex: string, whiteAmount = 0.54) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (value: number) =>
    Math.round(value * (1 - whiteAmount) + 255 * whiteAmount)
      .toString(16)
      .padStart(2, "0");

  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

function accentVariables(hex: string) {
  return {
    "--axis1-vendor-accent": hex,
    "--axis1-vendor-accent-contrast": accentTextColor(hex),
    "--axis1-vendor-accent-highlight": mixWithWhite(hex, 0.24),
    "--axis1-vendor-accent-soft": mixWithWhite(hex),
    "--axis1-vendor-accent-tint": hexToRgba(hex, 0.14),
    "--axis1-vendor-accent-glow": hexToRgba(hex, 0.24),
    "--axis1-vendor-accent-border": hexToRgba(hex, 0.34),
  } as CSSProperties;
}

function isRenderableLogoSrc(src: string) {
  if (!src.startsWith("data:")) {
    return true;
  }

  const [, metadata = "", base64 = ""] = src.match(/^data:([^,]+),(.+)$/) ?? [];

  if (!metadata.includes(";base64") || !base64) {
    return false;
  }

  try {
    const binary = atob(base64);

    if (metadata.startsWith("image/png")) {
      return binary.startsWith("\u0089PNG\r\n\u001a\n") && binary.slice(-12, -8) === "IEND";
    }

    if (metadata.startsWith("image/jpeg") || metadata.startsWith("image/jpg")) {
      return binary.charCodeAt(0) === 0xff &&
        binary.charCodeAt(1) === 0xd8 &&
        binary.charCodeAt(binary.length - 2) === 0xff &&
        binary.charCodeAt(binary.length - 1) === 0xd9;
    }

    return true;
  } catch {
    return false;
  }
}

function customerReferenceCopy(value: string) {
  return value
    .replace(/\bP-0*(\d+)\b/gi, (_, index: string) => `Photo ${Number(index)}`)
    .replace(/\bLBL-\d+-SYS\d+\b/gi, "system label photo")
    .replace(/\bEXC-\d+-[A-Z]{2}\d+\b/gi, "open item photo")
    .replace(/\b(?:HD|FL|DK|RF|GC)-\d+\b/gi, "service area");
}

function customerCopy(value: string) {
  const copy = value
    .replace(/\bservice handoff and office archive retained\b/gi, "Customer copy and service provider archive retained")
    .replace(/\bService service record\b/g, "Customer copy")
    .replace(/\bservice service record\b/g, "customer copy")
    .replace(/\boffice archive\b/gi, "service archive")
    .replace(/\boffice file\b/gi, "service file")
    .replace(/\boffice records\b/gi, "service records")
    .replace(/\bthe office\b/gi, "the service team")
    .replace(/\bproof link\b/gi, "service report link")
    .replace(/\bcustomer proof\b/gi, "customer record")
    .replace(/\bcustomer-side correction\b/gi, "customer action")
    .replace(/\bvendor-provided\b/gi, "service-provider recorded")
    .replace(/\bvendor-issued\b/gi, "service-provider issued")
    .replace(/\bother trade service\b/gi, "separate corrective work")
    .replace(/\bseparate trade service\b/gi, "separate corrective work")
    .replace(/\bseparate corrective work and follow-up work\b/gi, "separate corrective or follow-up work")
    .replace(/\bfollow-up work authorization\b/gi, "follow-up go-ahead")
    .replace(/\breply\s+so\b/gi, "contact the service team so")
    .replace(/\breply\s+when\b/gi, "contact the service team when")
    .replace(/\breply\s+if\b/gi, "contact the service team if")
    .replace(/\breply\s+to\b/gi, "contact the service team to")
    .replace(/\breply\s+before\b/gi, "contact the service team before")
    .replace(/\breply\s+after\b/gi, "contact the service team after")
    .replace(/\bcall\s+after\s+clearing\s+access\b/gi, "contact the service team after clearing access")
    .replace(/\bcall\s+service\s+team\b/gi, "contact service team")
    .replace(/\bcall\s+service\s+provider\b/gi, "contact service provider")
    .replace(/\bnext reply\b/gi, "next response")
    .replace(/\bservice close-out\b/gi, "service record")
    .replace(/\bcustomer handoff\b/gi, "customer service record")
    .replace(/\bhandoff\b/gi, "service record")
    .replace(/\bRecord type\b/gi, "Report type")
    .replace(/\bRecord support\b/gi, "Documentation support")
    .replace(/\bRecord basis\b/gi, "Documentation")
    .replace(/\bVendor action\b/gi, "Service team follow-up")
    .replace(/\bThis closeout\b/g, "This service record")
    .replace(/\bthis closeout\b/g, "this service record")
    .replaceAll("Open access item", "Blocked access area")
    .replaceAll("open access item", "blocked access area")
    .replaceAll("Open item", "Area needing action")
    .replaceAll("open item", "area needing action")
    .replaceAll("Exception shown", "Needs action")
    .replaceAll("Full raw archive", "Full service archive")
    .replaceAll("PDF packet", "PDF copy")
    .replaceAll("sample packet", "service visit")
    .replaceAll("Sample packet", "Service visit")
    .replaceAll("outside the customer packet", "outside this service report link")
    .replaceAll("outside the Customer packet", "outside this service report link")
    .replaceAll("customer packet", "service report link")
    .replaceAll("Customer packet", "Service report link")
    .replaceAll("Office note", "Record note")
    .replace(/no field-photo proof is attached/gi, "photos are not attached to this visit")
    .replace(/without attached field photos/gi, "based on service notes instead of attached photos")
    .replace(/\bproof\s+P-\d+(?:\s*(?:and|\/)\s*P-\d+)*\b/gi, "service photos")
    .replace(/\b[A-Z]{2}-\d+\b/g, "service area")
    .replaceAll("; ", ", ");

  return customerReferenceCopy(copy);
}

function compactCtaLabel(value: string) {
  return customerCopy(value).replace(/\s+-\s+.+$/, "");
}

function mobileCtaLabel(value: string, hasOpenAccessItem = false) {
  const compact = compactCtaLabel(value);

  if (/^call\b|^reply\b|^contact\b/i.test(compact)) {
    return hasOpenAccessItem ? "Contact after clearing access" : "Contact service team";
  }

  if (hasOpenAccessItem || /access/i.test(compact)) {
    return "Contact after clearing access";
  }

  if (/quote/i.test(compact)) {
    return "Request quote";
  }

  if (/next service|next cleaning|schedule|rebook/i.test(compact)) {
    return "Confirm service";
  }

  return compact;
}

function phoneFallbackCtaLabel(value: string, hasOpenAccessItem = false) {
  const compact = compactCtaLabel(value);

  if (hasOpenAccessItem || /access/i.test(compact)) {
    return "Contact after clearing access";
  }

  if (/quote/i.test(compact)) {
    return "Contact about follow-up quote";
  }

  if (/next service|next cleaning|schedule|rebook|confirm/i.test(compact)) {
    return "Contact to confirm next service";
  }

  return "Contact service team";
}

function providerCallLabel(vendorName: string, compact = false) {
  const name = vendorName.trim();

  if (!name || /^service report$/i.test(name)) {
    return compact ? "Contact service team" : "Contact service provider";
  }

  return compact ? "Contact service team" : `Contact ${name}`;
}

function CustomerReportHeader({
  data,
  primaryCtaLabel,
  compactPrimaryCtaLabel,
  primaryCtaHref,
  primaryCtaEnabled,
  pdfServiceRecordHref,
  onEvidencePdfAction,
  hasVendorPhone,
  compactReport = false,
}: {
  data: Axis1PacketPreviewData;
  primaryCtaLabel: string;
  compactPrimaryCtaLabel: string;
  primaryCtaHref?: string;
  primaryCtaEnabled: boolean;
  pdfServiceRecordHref: string | null;
  onEvidencePdfAction: () => void;
  hasVendorPhone: boolean;
  compactReport?: boolean;
}) {
  const navItems = (compactReport
    ? [
        ["#summary", "Result"],
        data.proofPhotos.length > 0 ? ["#proof-story", "Photos"] : null,
        ["#record", "Record"],
      ]
    : [
        ["#summary", "Summary"],
        data.proofPhotos.length > 0 ? ["#proof-story", "Photos"] : null,
        ["#record", "Record"],
        ["#contact", "Contact"],
      ]).filter(Boolean) as Array<[string, string]>;
  const primaryCtaUsesPhone = Boolean(primaryCtaHref?.startsWith("tel:"));
  const showPhoneShortcut = hasVendorPhone && !primaryCtaUsesPhone;
  const mobileMenuItems = [
    ...navItems.map(([href, label]) => ({ href, label })),
    pdfServiceRecordHref
      ? { href: pdfServiceRecordHref, label: "Open PDF copy" }
      : { label: "Save PDF copy", onSelect: onEvidencePdfAction },
    showPhoneShortcut
      ? {
          href: `tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`,
          label: "Contact service provider",
        }
      : null,
    primaryCtaHref && primaryCtaEnabled
      ? {
          href: primaryCtaHref,
          label: compactPrimaryCtaLabel,
          kind: "primary" as const,
        }
      : null,
  ].filter(Boolean) as HeaderMobileMenuItem[];
  const headerVendorBrandColor =
    data.vendor.brandColor && /^#[0-9A-Fa-f]{6}$/.test(data.vendor.brandColor)
      ? data.vendor.brandColor
      : "#f26a21";

  return (
    <HeaderChrome
      tone="dark"
      padded={!compactReport}
      containerClassName={compactReport ? "w-full" : "mx-auto w-full max-w-[1180px]"}
      shellClassName={
        compactReport
          ? "min-h-[60px] !rounded-none border-x-0 border-t-0 px-4 py-2 shadow-none sm:px-6"
          : "flex-wrap px-2 py-1.5 sm:px-4"
      }
    >
      <HeaderBrandLink
        href="#report-top"
        ariaLabel="Back to report top"
        icon={
          data.vendor.logoUrl ? (
            <VendorLogoImage
              src={data.vendor.logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain p-1.5"
              fallbackText={data.vendor.initials}
            />
          ) : (
            <span className="text-sm font-semibold">{data.vendor.initials}</span>
          )
        }
        title={data.vendor.name}
        subtitle={compactReport ? "Service report" : "Service report link"}
        tone="dark"
        className="max-w-[62vw] sm:max-w-[240px] lg:max-w-[260px]"
        titleClassName="whitespace-normal text-clip leading-[1.05] sm:truncate"
        markClassName={
          data.vendor.logoUrl
            ? "customer-report-logo-mark"
            : "customer-report-brand-mark"
        }
      />

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <nav
          className="hidden min-w-0 flex-1 gap-1 lg:flex lg:flex-none lg:overflow-visible"
          aria-label="Service report sections"
        >
          {navItems.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={headerNavLinkClass("dark")}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {pdfServiceRecordHref ? (
            <a
              href={pdfServiceRecordHref}
              className={headerSecondaryActionClass("dark")}
            >
              <IconFileText className="h-4 w-4" />
              PDF copy
            </a>
          ) : (
            <button
              type="button"
              onClick={onEvidencePdfAction}
              className={headerSecondaryActionClass("dark")}
            >
              <IconFileText className="h-4 w-4" />
              PDF copy
            </button>
          )}
          {showPhoneShortcut ? (
            <a
              href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}
              className={headerSecondaryActionClass("dark")}
            >
              <IconPhone className="h-4 w-4" />
              Call
            </a>
          ) : null}
        </div>
        {primaryCtaHref && primaryCtaEnabled ? (
          <div className="hidden shrink-0 lg:block">
            <a
              href={primaryCtaHref}
              className={headerPrimaryActionClass()}
              style={{
                backgroundColor: headerVendorBrandColor,
                color: accentTextColor(headerVendorBrandColor),
              }}
              aria-label={primaryCtaLabel}
            >
              <IconClipboardText className="h-4 w-4" />
              {compactPrimaryCtaLabel}
            </a>
          </div>
        ) : null}
        <HeaderMobileMenu
          tone="dark"
          className="lg:hidden"
          items={mobileMenuItems}
        />
      </div>
    </HeaderChrome>
  );
}

function getLocalEvidencePdfHref() {
  if (typeof window === "undefined") {
    return null;
  }

  const currentUrl = new URL(window.location.href);
  const supportsPdfView =
    currentUrl.pathname.startsWith("/p/sample-") ||
    (currentUrl.pathname === "/p/local" && Boolean(currentUrl.searchParams.get("packetId"))) ||
    (currentUrl.pathname === "/p/server" && Boolean(currentUrl.searchParams.get("reportId")));

  if (!supportsPdfView) {
    return null;
  }

  currentUrl.searchParams.set("format", "pdf");
  return `${currentUrl.pathname}${currentUrl.search}`;
}

function subscribeLocalEvidencePdfHref() {
  return () => {};
}

function PublicSampleBanner() {
  return (
    <div
      id="public-sample-note"
      className="pdf-print-hide scroll-mt-20 border-b border-[#eadfd4] bg-[#fbfaf7] px-5 py-3 text-[#5f2b14] sm:px-8 lg:px-10"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b3f13]">
            Customer receives two outputs
          </p>
          <p className="mt-1 max-w-3xl break-words text-sm font-semibold leading-6 text-[#5f574f]">
            This is the customer link. The retained PDF copy is the document
            version for customer files.
          </p>
        </div>
        <a
          href="?format=pdf"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#111315] px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#2a2d30]"
        >
          View retained PDF copy
        </a>
      </div>
    </div>
  );
}

function PublicSampleActionNotice({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="pdf-print-hide fixed inset-0 z-[220] grid place-items-center bg-[#080a0c]/76 px-4 backdrop-blur-sm print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="public-sample-action-title"
    >
      <div className="w-full max-w-[440px] rounded-[28px] border border-white/12 bg-[#f7efe4] p-5 text-[#111315] shadow-[0_32px_110px_rgba(0,0,0,0.42)]">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c8581e]">
          Public sample
        </p>
        <h2
          id="public-sample-action-title"
          className="mt-3 text-3xl font-black leading-none tracking-normal"
        >
          This sample does not contact the service company.
        </h2>
        <p className="mt-4 text-sm font-semibold leading-7 text-[#665c53]">
          Live customer records can open the company reply, call, revisit,
          or PDF flow. This public sample only shows the restaurant-facing
          closeout format.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#111315] px-4 text-sm font-black text-white"
        >
          Continue viewing
        </button>
      </div>
    </div>
  );
}

function getRowValue(rows: readonly (readonly [string, string])[], labels: string[]) {
  return rows.find(([label]) =>
    labels.some((target) => label.toLowerCase() === target.toLowerCase()),
  )?.[1];
}

function findActionValue(
  rows: readonly (readonly [string, string])[],
  patterns: RegExp[],
) {
  return rows.find(([label]) => patterns.some((pattern) => pattern.test(label)))?.[1];
}

function isOpenStatus(status: string) {
  return /blocked|needs|review|partial|open|exception|not/i.test(status);
}

function isPrimaryOpenStatus(status: string) {
  return /blocked|needs reply|open item|exception|not represented|not completed|inaccessible|partial/i.test(
    status,
  );
}

function isCompletedStatus(status: string) {
  if (isPrimaryOpenStatus(status) || /not completed|not in this visit|blocked|inaccessible|open|needs|partial|exception/i.test(status)) {
    return false;
  }

  return /completed|cleaned|reset|documented|closed|included|posted|retained|clear/i.test(status);
}

function proofLabel(value: string) {
  return customerReferenceCopy(value).replace(/\s*\/\s*/g, " + ");
}

function photoRefLabel(value: string) {
  return customerReferenceCopy(value);
}

function photoServiceAreaLabel(photo: ProofPhoto) {
  return customerPhotoLabel(photo);
}

function componentProofLabel(row: ComponentRow) {
  const conditionStatus = /recorded condition|review|monitor|documented/i.test(row.status);
  const writtenOrMissingProof =
    !row.proof ||
    /service record|service notes|written|not attached|not hosted|not captured|not in this visit|none recorded/i.test(
      row.proof,
    );

  if (writtenOrMissingProof) {
    if (conditionStatus) {
      return "Condition recorded from service note";
    }

    return "Status recorded";
  }

  if (isPrimaryOpenStatus(row.status)) {
    return "Issue photo attached";
  }

  if (conditionStatus) {
    return /photo attached|field photo|attached photo/i.test(row.proof)
      ? "Condition photo attached"
      : "Condition recorded from service note";
  }

  if (/partial/i.test(row.proof)) {
    return "Partial photo record";
  }

  return "Field photo attached";
}

function customerPhotoLabel(photo: ProofPhoto) {
  const text = normalizeProofText(`${photo.label} ${photo.title} ${photo.proofRole}`);

  if (photo.tone === "issue" || /access|blocked|duct/.test(text)) {
    return "Blocked access";
  }

  if (photo.tone === "after" || /after|cleaned|reset/.test(text)) {
    return "After cleaning";
  }

  if (photo.tone === "before" || /before/.test(text)) {
    return "Before cleaning";
  }

  if (/filter/.test(text)) {
    return "Filters reset";
  }

  if (/grease|containment/.test(text)) {
    return "Grease path";
  }

  if (/fan|roof/.test(text)) {
    return "Fan / roof";
  }

  return customerCopy(photo.label);
}

function customerPhotoRole(value: string) {
  return customerCopy(value).replace(/\bproof\b/gi, "photo");
}

function cleanComponentLabel(value: string) {
  return customerCopy(value.replace(/^[A-Z]{2}-\d+\s+/, ""));
}

function normalizeProofText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function isMatchedBeforeAfterPair(beforePhoto: ProofPhoto, afterPhoto: ProofPhoto) {
  const beforeText = normalizeProofText(
    `${beforePhoto.systemRef} ${beforePhoto.title} ${beforePhoto.proofRole}`,
  );
  const afterText = normalizeProofText(
    `${afterPhoto.systemRef} ${afterPhoto.title} ${afterPhoto.proofRole}`,
  );
  const sameSystem = beforePhoto.systemRef === afterPhoto.systemRef;
  const sameHoodArea =
    /hood|canopy|interior/.test(beforeText) && /hood|canopy|interior/.test(afterText);

  return beforePhoto.proofId !== afterPhoto.proofId && (sameSystem || sameHoodArea);
}

function statusTone(status: string) {
  if (isPrimaryOpenStatus(status)) {
    return "open";
  }

  if (/review|needs|not/i.test(status)) {
    return "attention";
  }

  if (isCompletedStatus(status)) {
    return "success";
  }

  return "recorded";
}

function shortDate(value: string) {
  return value.replace(/,\s*2026$/, "");
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={cx(
        "text-[11px] font-semibold uppercase tracking-[0.13em]",
        light ? "text-[#ff9b63]" : "text-[#c8581e]",
      )}
    >
      {children}
    </p>
  );
}

function PreviewScopeEditButton({
  editConfig,
}: {
  editConfig?: CustomerWebPacketEditConfig;
}) {
  if (!editConfig?.enabled || !editConfig.onEditScope) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={editConfig.onEditScope}
      className="pdf-print-hide inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#d7c8b8] bg-white px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111315] transition hover:border-[#f26a21]/36 hover:bg-[#fff7ef] print:hidden"
    >
      <IconPencil className="h-3.5 w-3.5" />
      Edit areas
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);
  const Icon = tone === "success" ? IconCircleCheckFilled : IconAlertTriangleFilled;

  return (
    <Badge
      variant="outline"
      className={cx(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "success" && "border-[#b9d8c5] bg-[#eff8f3] text-[#236348]",
        tone === "open" && "border-[#e4a37d] bg-[#fff4ec] text-[#a43d18]",
        tone === "attention" && "border-[#e8c2a8] bg-[#fff7ef] text-[#9a471f]",
        tone === "recorded" && "border-[#d9d0c5] bg-white/70 text-[#62594f]",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {customerCopy(status)}
    </Badge>
  );
}

function VendorLogoImage({
  src,
  alt,
  className,
  width,
  height,
  fallbackText,
}: {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  fallbackText: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !isRenderableLogoSrc(src)) {
    return <span className="font-semibold">{fallbackText}</span>;
  }

  if (src.startsWith("data:")) {
    // Next/Image can fail on uploaded data URLs in the exported customer report.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="packet-metric-item min-w-0 border-t border-white/16 py-3.5 first:border-t-0 sm:border-l sm:border-t-0 sm:px-5 sm:first:border-l-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function ProofBadge({ photo }: { photo: ProofPhoto }) {
  const tone = photo.tone;

  return (
    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className={cx(
          "rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur",
          tone === "issue" && "border-[#f0b28e]/50 bg-[#fff2e8]/94 text-[#9c3917]",
          tone === "after" && "border-[#b9d8c5]/60 bg-[#f0f8f3]/94 text-[#28664c]",
          tone !== "issue" && tone !== "after" && "border-white/45 bg-white/92 text-[#151515]",
        )}
      >
        {customerPhotoLabel(photo)}
      </Badge>
    </div>
  );
}

function ProofMetaStrip({ photo, light = true }: { photo: ProofPhoto; light?: boolean }) {
  return (
    <dl
      className={cx(
        "grid grid-cols-2 gap-2 rounded-[18px] border p-3 text-xs",
        light
          ? "border-white/12 bg-[#111315]/62 text-white backdrop-blur-xl"
          : "border-[#ded6cc] bg-white/72 text-[#111315]",
      )}
    >
      <div>
        <dt className={cx("font-semibold uppercase tracking-[0.11em]", light ? "text-white/42" : "text-[#8d8379]")}>
          Photo ref
        </dt>
        <dd className="mt-1 font-semibold">{photoRefLabel(photo.proofId)}</dd>
      </div>
      <div>
        <dt className={cx("font-semibold uppercase tracking-[0.11em]", light ? "text-white/42" : "text-[#8d8379]")}>
          Service area
        </dt>
        <dd className="mt-1 font-semibold">{photoServiceAreaLabel(photo)}</dd>
      </div>
    </dl>
  );
}

function ProofImage({
  photo,
  priority = false,
  className,
  imageClassName,
}: {
  photo: ProofPhoto;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cx("packet-proof-media relative overflow-hidden bg-[#181818]", className)}>
      <Image
        src={photo.src}
        alt={photo.title}
        fill
        loading={priority ? "eager" : "lazy"}
        quality={92}
        sizes="(min-width: 1024px) 900px, 100vw"
        className={cx("object-cover", imageClassName)}
        style={{ objectPosition: photo.position }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.30))]" />
      <ProofBadge photo={photo} />
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        <span className="rounded-full border border-white/20 bg-[#111315]/72 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/82 backdrop-blur">
          {photoRefLabel(photo.proofId)}
        </span>
        <span className="rounded-full border border-white/16 bg-[#111315]/58 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/62 backdrop-blur">
          {photoServiceAreaLabel(photo)}
        </span>
      </div>
    </div>
  );
}

function ProofCaption({
  photo,
  large = false,
  light = false,
}: {
  photo: ProofPhoto;
  large?: boolean;
  light?: boolean;
}) {
  return (
    <figcaption>
      <p
        className={cx(
          "text-[11px] font-semibold uppercase tracking-[0.1em]",
          light ? "text-[#d0a182]" : "text-[#9a8d80]",
        )}
      >
        {customerPhotoRole(photo.proofRole)}
      </p>
      <h3
        className={cx(
          "mt-2 font-semibold leading-tight tracking-[-0.04em]",
          large ? "text-[1.65rem] sm:text-[2.25rem]" : "text-[1.15rem]",
          light ? "text-white" : "text-[#111315]",
        )}
      >
        {customerCopy(photo.title)}
      </h3>
      <p className={cx("mt-3 text-sm leading-6", light ? "text-white/62" : "text-[#6d645b]")}>
        {customerCopy(photo.caption)}
      </p>
    </figcaption>
  );
}

function ProofPairCards({
  beforePhoto,
  afterPhoto,
}: {
  beforePhoto: ProofPhoto;
  afterPhoto: ProofPhoto;
}) {
  return (
    <div className="packet-proof-pair-grid grid gap-4 sm:grid-cols-2">
      {[beforePhoto, afterPhoto].map((photo) => (
        <figure
          key={photo.proofId}
          className="packet-proof-pair-card overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.045]"
        >
          <ProofImage photo={photo} className="aspect-[1.1/1] rounded-none" />
          <figcaption className="p-5">
            <ProofCaption photo={photo} light />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function BeforeAfterCompare({
  beforePhoto,
  afterPhoto,
}: {
  beforePhoto: ProofPhoto;
  afterPhoto: ProofPhoto;
}) {
  const [position, setPosition] = useState(54);
  const [isComparing, setIsComparing] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(82, Math.max(18, next)));
  };

  return (
    <div
      className={cx(
        "packet-proof-compare group relative overflow-hidden rounded-[34px] border border-white/12 bg-[#101010] shadow-[0_34px_100px_rgba(0,0,0,0.34)]",
        isComparing && "is-comparing",
      )}
    >
      <div
        ref={sliderRef}
        role="slider"
        aria-label="Compare before and after hood cleaning photos"
        aria-valuemin={18}
        aria-valuemax={82}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        className="packet-compare-stage relative aspect-[0.88/1] cursor-ew-resize touch-none select-none sm:aspect-[1.38/1]"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsComparing(true);
          updatePosition(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) {
            return;
          }

          updatePosition(event.clientX);
        }}
        onPointerUp={() => setIsComparing(false)}
        onPointerCancel={() => setIsComparing(false)}
        onLostPointerCapture={() => setIsComparing(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            setPosition((current) => Math.max(18, current - 4));
          }

          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            setPosition((current) => Math.min(82, current + 4));
          }

          if (event.key === "Home") {
            event.preventDefault();
            setPosition(18);
          }

          if (event.key === "End") {
            event.preventDefault();
            setPosition(82);
          }
        }}
      >
        <Image
          src={afterPhoto.src}
          alt={afterPhoto.title}
          fill
          sizes="(min-width: 1024px) 820px, 100vw"
          quality={92}
          loading="eager"
          className="object-cover"
          style={{ objectPosition: afterPhoto.position }}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforePhoto.src}
            alt={beforePhoto.title}
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            quality={92}
            className="object-cover"
            style={{ objectPosition: beforePhoto.position }}
            priority
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.34))]" />
        <div
          className="absolute inset-y-0 w-px bg-white/86 shadow-[0_0_24px_rgba(255,255,255,0.55)]"
          style={{ left: `${position}%` }}
        />
        <div
          className="packet-compare-handle absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white text-[#111315] shadow-[0_16px_42px_rgba(0,0,0,0.32)] transition group-hover:scale-105"
          style={{ left: `${position}%` }}
        >
          <IconArrowsHorizontal className="h-5 w-5" />
        </div>
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-[#f0b28e]/50 bg-[#fff2e8] px-3 py-1 text-xs font-semibold text-[#9c3917]"
          >
            Before
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-[#b9d8c5]/60 bg-[#f0f8f3] px-3 py-1 text-xs font-semibold text-[#28664c]"
          >
            After
          </Badge>
        </div>
        <div className="packet-compare-desktop-caption absolute bottom-4 left-4 right-4 hidden rounded-[22px] border border-white/12 bg-[#111315]/72 p-4 backdrop-blur-xl sm:block">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ffb489]">
                Before / after photos
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/72">
                Compare visible buildup before service with cleaned reachable surfaces after service.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/72">
              <IconArrowsHorizontal className="h-3.5 w-3.5" />
              Drag to compare
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicePhotoSetRail({
  photos,
  hasComparison = false,
}: {
  photos: readonly ProofPhoto[];
  hasComparison?: boolean;
}) {
  const visiblePhotos = photos.slice(0, 6);

  return (
    <section className="packet-photo-set-rail">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#ffb489]">
            Full visit photo set
          </p>
          <p className="mt-1 text-sm leading-6 text-white/58">
            {hasComparison
              ? `The large before/after comparison stays first. All ${photos.length} service photos stay available here.`
              : `All ${photos.length} service photos stay available here without forcing a false before/after comparison.`}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/72">
          {photos.length} photos
        </span>
      </div>

      <div className="packet-photo-set-scroll mt-4">
        {visiblePhotos.map((photo, index) => (
          <figure key={photo.proofId} className="packet-photo-set-thumb">
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[18px] bg-[#181818]">
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="160px"
                quality={92}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover"
                style={{ objectPosition: photo.position }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.34))]" />
              <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#111315]">
                {customerPhotoLabel(photo)}
              </span>
            </div>
            <figcaption className="mt-2 text-xs font-medium leading-5 text-white/56">
              {customerCopy(photo.title)}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function findPhotoForSegment(segment: RouteSegment, photos: readonly ProofPhoto[]) {
  return (
    photos.find((photo) => photo.systemRef === segment.code) ??
    photos.find((photo) => {
      const segmentText = normalizeProofText(`${segment.code} ${segment.title} ${segment.note}`);
      const photoText = normalizeProofText(`${photo.systemRef} ${photo.label} ${photo.title} ${photo.proofRole}`);

      return segmentText.split(" ").some((word) => word.length > 3 && photoText.includes(word));
    })
  );
}

function PreviewInlineEditor({
  target,
  field,
  active,
  onDone,
}: {
  target: CustomerWebPacketEditTarget;
  field: CustomerWebPacketEditField;
  active: boolean;
  onDone?: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorId = `customerPreview${target}Editor`;

  useEffect(() => {
    if (!active) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [active, target]);

  if (!active) {
    return null;
  }

  return (
    <div
      className="pdf-print-hide mt-4 rounded-[18px] border border-[#f26a21]/22 bg-[#fff7ef] p-3 shadow-[0_18px_46px_rgba(17,19,21,0.1)] print:hidden"
      data-preview-inline-editor={target}
    >
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={editorId}
          className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a4a1e]"
        >
          {field.label}
        </label>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111315] transition hover:bg-[#111315] hover:text-white"
        >
          Done
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id={editorId}
        rows={3}
        value={field.value}
        maxLength={field.maxLength}
        onChange={(event) => field.onChange(event.target.value)}
        placeholder={field.placeholder}
        className="mt-2 w-full resize-none rounded-[14px] border border-black/10 bg-white px-3 py-2 text-sm font-medium leading-6 text-[#111315] outline-none placeholder:text-[#8d8379] focus:border-[#f26a21]/55 focus:ring-2 focus:ring-[#f26a21]/15"
      />
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="text-xs leading-5 text-[#7b7066]">
          {field.helper ?? "Leave blank to keep the auto-written line."}
        </p>
        {field.maxLength ? (
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a8f84]">
            {field.value.length}/{field.maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ResultLine({
  label,
  title,
  copy,
  tone,
  editTarget,
  editConfig,
}: {
  label: string;
  title: string;
  copy: string;
  tone: "success" | "open" | "action" | "record";
  editTarget?: CustomerWebPacketEditTarget;
  editConfig?: CustomerWebPacketEditConfig;
}) {
  const Icon =
    tone === "open"
      ? IconAlertTriangleFilled
      : tone === "action"
        ? IconShieldCheckFilled
        : tone === "record"
          ? IconFileText
          : IconCircleCheckFilled;
  const editField = editTarget ? editConfig?.fields?.[editTarget] : undefined;
  const canEdit = Boolean(
    editConfig?.enabled && editTarget && editField && editConfig.onSelectTarget,
  );
  const isEditing = Boolean(editTarget && editConfig?.activeTarget === editTarget && editField);

  return (
    <article
      className={cx(
        "packet-result-line relative min-w-0 border-t border-[#ded6cc] px-4 py-5 first:border-t-0 sm:px-5",
        canEdit && "pr-16",
        isEditing && "bg-[#fffaf5]",
      )}
      data-preview-edit-target={editTarget}
      data-preview-edit-active={isEditing ? "true" : undefined}
    >
      {canEdit && editTarget ? (
        <button
          type="button"
          onClick={() => editConfig?.onSelectTarget?.(editTarget)}
          className={cx(
            "pdf-print-hide absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition print:hidden",
            isEditing
              ? "border-[#f26a21]/35 bg-[#111315] text-white shadow-[0_12px_28px_rgba(17,19,21,0.16)]"
              : "border-[#ead5c5] bg-white text-[#a34918] hover:border-[#f26a21]/35 hover:bg-[#fff2e8]",
          )}
          aria-pressed={isEditing}
        >
          <IconPencil className="h-3.5 w-3.5" />
          {isEditing ? "Editing" : "Edit"}
        </button>
      ) : null}
      <span
        className={cx(
          "packet-result-icon mb-4 flex h-7 w-7 items-center justify-center rounded-full",
          tone === "success" && "bg-[#edf7f1] text-[#2d7455]",
          tone === "open" && "bg-[#fff0e7] text-[#bd4d22]",
          tone === "action" && "bg-[#f7eee5] text-[#8d4a22]",
          tone === "record" && "bg-[#efebe5] text-[#6e6258]",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8d8379]">
          {label}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.035em] text-[#111315]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#6d645b]">{copy}</p>
      </div>
      {editTarget && editField ? (
        <PreviewInlineEditor
          target={editTarget}
          field={editField}
          active={isEditing}
          onDone={editConfig?.onClose}
        />
      ) : null}
    </article>
  );
}

function DataLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="packet-data-line grid gap-1 border-t border-[#ded6cc] py-3 text-sm first:border-t-0 sm:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] sm:gap-4">
      <dt className="min-w-0 text-[#796f65]">{label}</dt>
      <dd className="min-w-0 break-words font-medium leading-6 text-[#171717] sm:text-right">
        {customerCopy(value)}
      </dd>
    </div>
  );
}

type ScopeGroupName = "Completed" | "Customer action" | "Recorded for review";

function scopeGroupLabel(row: ComponentRow): ScopeGroupName {
  const tone = statusTone(row.status);

  if (tone === "success") {
    return "Completed";
  }

  if (isPrimaryOpenStatus(row.status)) {
    return "Customer action";
  }

  return "Recorded for review";
}

function groupScopeRows(rows: ComponentRow[]) {
  return rows.reduce<Record<ScopeGroupName, ComponentRow[]>>(
    (groups, row) => {
      const group = scopeGroupLabel(row);
      groups[group].push(row);
      return groups;
    },
    {
      Completed: [],
      "Customer action": [],
      "Recorded for review": [],
    },
  );
}

function ExhaustProofSpine({
  routeSegments,
  proofPhotos,
  proofPolicyRows,
  completedWork,
  scopeNote,
}: {
  routeSegments: readonly RouteSegment[];
  proofPhotos: readonly ProofPhoto[];
  proofPolicyRows: readonly (readonly [string, string])[];
  completedWork: readonly string[];
  scopeNote: string;
}) {
  const firstOpenIndex = routeSegments.findIndex((segment) => isPrimaryOpenStatus(segment.status));
  const [activeIndex, setActiveIndex] = useState(firstOpenIndex >= 0 ? firstOpenIndex : 0);
  const activeSegment = routeSegments[activeIndex] ?? routeSegments[0];
  const activeTone = activeSegment ? statusTone(activeSegment.status) : "recorded";
  const activePhoto = activeSegment ? findPhotoForSegment(activeSegment, proofPhotos) : undefined;
  const completedCount = routeSegments.filter((segment) => statusTone(segment.status) === "success").length;
  const routeProgress = routeSegments.length > 0 ? Math.round((completedCount / routeSegments.length) * 100) : 0;
  const hasOpenRouteSegment = routeSegments.some((segment) => isPrimaryOpenStatus(segment.status));
  const hasAttachedPhotos = proofPhotos.length > 0;

  return (
    <section className="packet-spine-section hidden border-b border-[#ded6cc] bg-[#f4ece1] px-5 py-10 sm:px-8 lg:block lg:px-10 lg:py-14">
      <div className="grid gap-8 xl:grid-cols-[minmax(280px,0.36fr)_minmax(0,0.64fr)] xl:items-start">
        <div className="xl:sticky xl:top-8">
          <SectionLabel>Service path</SectionLabel>
          <h2 className="font-display mt-3 max-w-xl text-[2.55rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#111315] sm:text-[4rem]">
            One exhaust path, clearly recorded.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#665b50]">
            {hasOpenRouteSegment
              ? "This service path follows the exhaust line from hood canopy to grease containment, keeping completed work, blocked access, and retained records in one customer-readable page."
              : hasAttachedPhotos
                ? "This service path follows the exhaust line from hood canopy to grease containment, keeping completed work, attached photos, and retained records in one customer-readable page."
                : "This service path follows the exhaust line from hood canopy to grease containment, keeping completed work, written service documentation, and retained records in one customer-readable page."}
          </p>
          <p className="mt-6 max-w-xl border-l border-[#d7c8b8] pl-5 text-sm leading-7 text-[#7a6f65]">
            {customerCopy(scopeNote)}
          </p>
          <div className="mt-7 rounded-[26px] border border-[#d7c8b8] bg-white/52 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8d6a51]">
                  Interactive route map
                </p>
                <p className="mt-1 text-sm font-semibold text-[#111315]">
                  Select a checkpoint to see its status and record detail.
                </p>
              </div>
              <span className="rounded-full border border-[#cfbca8] bg-[#fffaf4] px-3 py-1.5 text-xs font-semibold text-[#6b5f55]">
                {routeProgress}% closed
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e4d7c8]">
              <div
                className="h-full rounded-full bg-[#ff6b1a] transition-[width] duration-500"
                style={{ width: `${routeProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="packet-spine-panel min-w-0 overflow-hidden rounded-[34px] border border-[#2c3033] bg-[#111315] text-white shadow-[0_30px_90px_rgba(17,17,17,0.18)]">
          <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#ff9b63]">
                  Exhaust route
                </p>
                <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1 text-xs font-semibold text-white/60">
                  {routeSegments.length} checkpoints
                </span>
              </div>

              <ol className="relative space-y-4 before:absolute before:left-[17px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-white/13">
                {routeSegments.map((segment, index) => {
                  const tone = statusTone(segment.status);
                  const isActive = index === activeIndex;

                  return (
                    <li key={segment.code} className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                      <span
                        className={cx(
                          "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold",
                          tone === "success" && "border-[#9fd0b6]/35 bg-[#164332] text-[#bff0d5]",
                          tone === "open" && "border-[#ff9b63]/40 bg-[#3d2014] text-[#ffb489]",
                          tone === "attention" && "border-[#ff9b63]/34 bg-[#2d2117] text-[#ffb489]",
                          tone === "recorded" && "border-white/14 bg-white/8 text-white/62",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        className={cx(
                          "packet-spine-card min-w-0 rounded-[22px] border bg-white/[0.045] p-4 text-left transition",
                          isActive
                            ? "border-[#ff9b63]/48 shadow-[0_0_0_1px_rgba(255,155,99,0.16),0_20px_60px_rgba(0,0,0,0.22)]"
                            : "border-white/10 hover:border-white/22 hover:bg-white/[0.065]",
                        )}
                        aria-pressed={isActive}
                        onClick={() => setActiveIndex(index)}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38">
                              {segment.code} · Step {String(index + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mt-1 text-base font-semibold leading-tight tracking-[-0.035em]">
                              {customerCopy(segment.title)}
                            </h3>
                          </div>
                          <div>
                            <StatusBadge status={segment.status} />
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/56">
                          {customerCopy(segment.note)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="border-t border-white/10 bg-white/[0.035] p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center gap-2 text-[#ff9b63]">
                <IconRoute className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em]">
                  Selected checkpoint
                </p>
              </div>

              {activeSegment ? (
                <motion.div
                  key={activeSegment.code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mt-5"
                >
                  {activePhoto ? (
                    <div className="relative aspect-[1.12/1] overflow-hidden rounded-[24px] border border-white/10 bg-[#181818]">
                      <Image
                        src={activePhoto.src}
                        alt={activePhoto.title}
                        fill
                        sizes="420px"
                        quality={92}
                        className="object-cover"
                        style={{ objectPosition: activePhoto.position }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.42))]" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <ProofMetaStrip photo={activePhoto} />
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38">
                          {activeSegment.code}
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.055em] text-white">
                          {customerCopy(activeSegment.title)}
                        </h3>
                      </div>
                      <StatusBadge status={activeSegment.status} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/58">
                      {customerCopy(activeSegment.note)}
                    </p>
                    {activeTone === "open" ? (
                      <p className="mt-4 rounded-[18px] border border-[#ff9b63]/24 bg-[#ff6b1a]/10 p-3 text-sm font-semibold leading-6 text-[#ffcfb5]">
                        This section is separated from completed work until access is clear.
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#0c0e10] p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#ff9b63]">
                Work represented in this service report
              </p>
              <p className="text-xs text-white/42">{completedWork.length} service actions retained</p>
            </div>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {completedWork.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-white/66">
                  <IconCircleCheckFilled className="mt-1 h-4 w-4 shrink-0 text-[#9fd0b6]" />
                  <span>{customerCopy(item)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
              {proofPolicyRows.slice(0, 2).map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm font-semibold tracking-[-0.02em] text-white">
                    {customerCopy(label)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/48">
                    {customerCopy(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemCoverageBanner({
  education,
  scopeNote,
}: {
  education?: CoverageEducation;
  scopeNote: string;
}) {
  const items =
    education?.items ?? [
      {
        label: "Hood canopy + filters",
        copy: "Reachable hood and filter work stay tied to this service visit.",
        state: "covered" as const,
      },
      {
        label: "Reachable plenum / duct path",
        copy: "Reachable exhaust-path work is kept with the same customer record.",
        state: "covered" as const,
      },
      {
        label: "Fan, roof discharge + grease path",
        copy: "Visible rooftop and grease-path conditions stay in the service history.",
        state: "recorded" as const,
      },
    ];

  return (
    <div className="packet-system-coverage mt-7 hidden rounded-[24px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur-xl lg:block">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#ffb489]">
        {education?.title ?? "Covered system path"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className={cx(
              "packet-system-chip inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold",
              item.state === "action_required"
                ? "border-[#ffb489]/34 bg-[#ff6b1a]/14 text-[#ffbf97]"
                : item.state === "not_claimed"
                  ? "border-white/10 bg-white/6 text-white/58"
                  : "border-white/12 bg-white/8 text-white/80",
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
      <p className="mt-3 max-w-2xl text-xs leading-6 text-white/54">
        {customerCopy(education?.summary ?? scopeNote)}
      </p>
    </div>
  );
}

function CoverageEducationSection({
  education,
  proofCoverageLabel,
  hasAttachedPhotos,
  editConfig,
}: {
  education?: CoverageEducation;
  proofCoverageLabel: string;
  hasAttachedPhotos: boolean;
  editConfig?: CustomerWebPacketEditConfig;
}) {
  if (!education) {
    return null;
  }

  return (
    <section className="packet-coverage-education-section border-b border-[#ded6cc] bg-[#f4ece1] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="grid gap-9 xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] xl:items-start">
        <div className="max-w-xl">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Service coverage</SectionLabel>
            <PreviewScopeEditButton editConfig={editConfig} />
          </div>
          <h2 className="font-display mt-3 text-[2.45rem] font-semibold leading-[0.96] tracking-[-0.07em] sm:text-[3.75rem]">
            {customerCopy(education.title)}
          </h2>
          <p className="mt-5 text-base leading-7 text-[#665b50]">
            {customerCopy(education.summary)}
          </p>
          <p className="mt-5 border-l border-[#d7c8b8] pl-5 text-sm leading-7 text-[#7a6f65]">
            {customerCopy(education.boundaryCopy)}
          </p>
        </div>

        <div className="min-w-0 divide-y divide-[#d7c8b8] border-y border-[#d7c8b8]">
          {education.items.map((item) => (
            <article
              key={item.label}
              className="grid gap-4 py-5 lg:grid-cols-[minmax(210px,0.38fr)_minmax(0,0.62fr)] lg:items-start"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8d8379]">
                  {item.state === "action_required"
                    ? "Customer action"
                    : item.state === "not_claimed"
                      ? "Not claimed"
                      : item.state === "recorded"
                        ? "Recorded"
                        : "Covered"}
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.04em]">
                  {customerCopy(item.label)}
                </h3>
              </div>
              <p className="text-sm leading-7 text-[#665b50]">
                {customerCopy(item.copy)}
              </p>
            </article>
          ))}
          <div className="grid gap-4 py-5 lg:grid-cols-[minmax(210px,0.38fr)_minmax(0,0.62fr)] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8d8379]">
                Documentation
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.04em]">
                {customerCopy(proofCoverageLabel)}
              </h3>
            </div>
            <p className="text-sm leading-7 text-[#665b50]">
              {hasAttachedPhotos
                ? "Photos describe only the attached areas. The PDF copy remains the submission, archive, or print copy."
                : "This visit is documented from written service notes. The PDF copy remains the submission, archive, or print copy."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileProofCommand({
  data,
  proofPhotos,
  customerNextStep,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaEnabled,
  supportingCtas,
  pdfServiceRecordHref,
  onEvidencePdfAction,
  accessRevisitWindow,
  nextServiceWindow,
  hasOpenAccessItem,
  hasVendorPhone,
}: {
  data: Axis1PacketPreviewData;
  proofPhotos: ProofPhoto[];
  customerNextStep: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  primaryCtaEnabled: boolean;
  supportingCtas: LinkedCloseoutCta[];
  pdfServiceRecordHref: string | null;
  onEvidencePdfAction: () => void;
  accessRevisitWindow: string;
  nextServiceWindow: string;
  hasOpenAccessItem: boolean;
  hasVendorPhone: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const compactPrimaryCtaLabel = mobileCtaLabel(primaryCtaLabel, hasOpenAccessItem);
  const hasProofPhotos = proofPhotos.length > 0;
  const primaryCtaUsesPhone = Boolean(primaryCtaHref?.startsWith("tel:"));
  const mobileVendorBrandColor =
    data.vendor.brandColor && /^#[0-9A-Fa-f]{6}$/.test(data.vendor.brandColor)
      ? data.vendor.brandColor
      : "#f26a21";

  return (
    <div className="packet-mobile-command pdf-print-hide mt-5 lg:hidden">
      <div className="packet-mobile-command-shell">
        <div className="mb-3 flex flex-col items-start gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between min-[360px]:gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/42">
              Quick actions
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {hasProofPhotos
                ? "Next action, photos, and PDF copy."
                : "Next action and PDF copy."}
            </p>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{
              borderColor: hexToRgba(mobileVendorBrandColor, 0.34),
              backgroundColor: hexToRgba(mobileVendorBrandColor, 0.14),
              color: mixWithWhite(mobileVendorBrandColor, 0.56),
            }}
          >
            {hasOpenAccessItem ? "Action needed" : "Ready"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {primaryCtaHref && primaryCtaEnabled ? (
            <a
              href={primaryCtaHref}
              className="packet-mobile-primary-action col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] px-4 text-[13px] font-semibold min-[360px]:text-sm"
              style={{
                background: `linear-gradient(180deg, ${mixWithWhite(
                  mobileVendorBrandColor,
                  0.24,
                )}, ${mobileVendorBrandColor})`,
                color: accentTextColor(mobileVendorBrandColor),
                boxShadow: `0 18px 42px ${hexToRgba(mobileVendorBrandColor, 0.28)}`,
              }}
              aria-label={primaryCtaLabel}
            >
              <IconClipboardText className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{compactPrimaryCtaLabel}</span>
            </a>
          ) : null}

          {supportingCtas.length > 0 ? (
            <div className="col-span-2 grid gap-2">
              {supportingCtas.map((cta) => (
                <a
                  key={`${cta.kind}-${cta.label}`}
                  href={cta.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-[16px] border border-white/12 bg-white/[0.055] px-3 text-xs font-semibold text-white/78"
                >
                  {customerCopy(cta.label)}
                </a>
              ))}
            </div>
          ) : null}

          {hasProofPhotos ? (
            <button
              type="button"
              onPointerDown={() => setIsDrawerOpen(true)}
              onClick={() => setIsDrawerOpen(true)}
              className="packet-mobile-secondary-action inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/8 px-3 text-sm font-semibold text-white"
            >
              <IconPhoto className="h-4 w-4" />
              Photos
            </button>
          ) : null}

          {hasProofPhotos ? (
            <Drawer
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
              shouldScaleBackground={false}
            >
              <DrawerContent className="packet-mobile-proof-drawer bg-[#101214] text-white">
              <DrawerHeader className="px-5 pb-2 pt-5">
                <DrawerTitle className="text-white">Photos and PDF copy</DrawerTitle>
                <DrawerDescription className="text-white/58">
                  {hasOpenAccessItem
                    ? "Blocked access, before/after photos, and the PDF copy stay separated."
                    : "Completed photos and the PDF copy stay separated."}
                </DrawerDescription>
              </DrawerHeader>

              <Tabs defaultValue="result" className="min-h-0 overflow-y-auto px-5 pb-5">
                <TabsList className="packet-mobile-tabs border-white/10 bg-white/7">
                  <TabsTrigger value="result" className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#111315]">
                    Result
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#111315]">
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="record" className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#111315]">
                    Record
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="result">
                  <div className="packet-mobile-result-stack">
                    <div className="packet-mobile-result-card">
                      <p className="packet-mobile-kicker">Customer action</p>
                      <h3>{customerNextStep}</h3>
                    </div>
                    <div className="grid gap-2">
                      <div className="packet-mobile-data-row">
                        <span>Access revisit</span>
                        <strong>{accessRevisitWindow}</strong>
                      </div>
                      <div className="packet-mobile-data-row">
                        <span>Next routine service</span>
                        <strong>{nextServiceWindow}</strong>
                      </div>
                      <div className="packet-mobile-data-row">
                        <span>PDF copy</span>
                        <strong>Available for files</strong>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="photos">
                  <div className="packet-mobile-photo-strip">
                    {proofPhotos.map((photo, index) => (
                      <figure
                        key={photo.proofId}
                        className="packet-mobile-photo-card"
                      >
                        <ProofImage
                          photo={photo}
                          priority={index < 3}
                          className="aspect-[0.92/1] rounded-[24px]"
                        />
                        <figcaption className="pt-4">
                          <p className="packet-mobile-kicker">{customerPhotoRole(photo.proofRole)}</p>
                          <h3 className="mt-1 text-xl font-semibold leading-tight tracking-[-0.04em]">
                            {customerCopy(photo.title)}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/58">
                            {customerCopy(photo.caption)}
                          </p>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="mt-3 text-center text-xs font-medium text-white/42">
                    Swipe photos sideways.
                  </p>
                </TabsContent>

                <TabsContent value="record">
                  <div className="packet-mobile-record-card">
                    <IconFileText className="h-6 w-6 text-[#ff9b63]" />
                    <h3>Keep the PDF copy.</h3>
                    <p>
                      The PDF is the file version for managers, insurance, or documentation requests. It stays separate from corrective or follow-up work.
                    </p>
                    {pdfServiceRecordHref ? (
                      <a href={pdfServiceRecordHref}>
                        Open PDF copy
                      </a>
                    ) : (
                      <button type="button" onClick={onEvidencePdfAction}>
                        Save PDF copy
                      </button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DrawerFooter className="border-white/10 bg-[#101214] px-5 py-4">
                {primaryCtaHref && primaryCtaEnabled ? (
                  <a
                    href={primaryCtaHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-[18px] px-4 text-sm font-semibold"
                    style={{
                      background: `linear-gradient(180deg, ${mixWithWhite(
                        mobileVendorBrandColor,
                        0.24,
                      )}, ${mobileVendorBrandColor})`,
                      color: accentTextColor(mobileVendorBrandColor),
                    }}
                  >
                    {primaryCtaLabel}
                  </a>
                ) : null}
                {hasVendorPhone && !primaryCtaUsesPhone ? (
                  <a
                    href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-[16px] border border-white/12 bg-white/7 px-4 text-sm font-semibold text-white"
                  >
                    {providerCallLabel(data.vendor.name, true)}
                  </a>
                ) : null}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          ) : null}

          {pdfServiceRecordHref ? (
            <a
              href={pdfServiceRecordHref}
              className={cx(
                "packet-mobile-secondary-action inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/8 px-3 text-sm font-semibold text-white",
                !hasProofPhotos && "col-span-2",
              )}
              aria-label="Open PDF copy"
            >
              <IconFileText className="h-4 w-4" />
              PDF copy
            </a>
          ) : (
            <button
              type="button"
              onClick={onEvidencePdfAction}
              className={cx(
                "packet-mobile-secondary-action inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/8 px-3 text-sm font-semibold text-white",
                !hasProofPhotos && "col-span-2",
              )}
              aria-label="Save PDF copy"
            >
              <IconFileText className="h-4 w-4" />
              PDF copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ScopeGroup({
  label,
  rows,
}: {
  label: ScopeGroupName;
  rows: ComponentRow[];
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="packet-scope-column min-w-0 border-t border-[#ded6cc] p-5 first:border-t-0 xl:border-l xl:border-t-0 xl:first:border-l-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#7c7066]">
          {label}
        </h3>
        <span className="text-sm font-semibold text-[#171717]">{rows.length}</span>
      </div>
      <div className="space-y-4">
        {rows.map((row) => (
          <article
            key={row.component}
            className="packet-scope-item min-w-0"
          >
            <div className="flex flex-col gap-2">
              <div className="min-w-0">
                <p className="font-semibold tracking-[-0.025em] text-[#111315]">
                  {cleanComponentLabel(row.component)}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6d645b]">{customerCopy(row.note)}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <p className="mt-3 text-xs font-medium text-[#9a8f84]">
              {componentProofLabel(row)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CustomerWebPacket({
  data,
  className,
  heroHeadingLevel = "h1",
  presentationMode = "standard",
  visibleSections,
  editConfig,
}: CustomerWebPacketProps) {
  const [showMobileDock, setShowMobileDock] = useState(false);
  const [publicSampleNoticeOpen, setPublicSampleNoticeOpen] = useState(false);
  const HeroHeading = heroHeadingLevel;
  const sections = { ...defaultSections, ...visibleSections };
  const isPublicSample = isPublicSamplePacket(data);
  const isShort = presentationMode === "short";
  const closeoutOutcomeType = data.closeout?.outcomeType;
  const isBlockedAccessOutcome = closeoutOutcomeType === "blocked_access";
  const isConditionReviewOutcome = closeoutOutcomeType === "condition_review";
  const openItems = data.componentStatusRows.filter((row) => isPrimaryOpenStatus(row.status));
  const primaryOpenItem =
    data.deficiencyRows.find((row) => isOpenStatus(row.status)) ?? data.deficiencyRows[0];
  const accessScopeNote = data.scopeRows.find(([area, status]) =>
    /access|duct/i.test(`${area} ${status}`) &&
    (isPrimaryOpenStatus(status) || isOpenStatus(status)),
  )?.[2];
  const nextServiceWindow =
    findActionValue(data.customerClose.actionItems, [/next routine service/i, /next visit window/i]) ??
    getRowValue(data.frequencyRows, ["Next service window"]) ??
    "Next window recorded";
  const hasOpenAccessItem =
    isBlockedAccessOutcome &&
    Boolean(primaryOpenItem || accessScopeNote || openItems.length > 0);
  const previewResultEditValue = editConfig?.fields?.result?.value.trim() ?? "";
  const previewOpenItemEditValue = editConfig?.fields?.openItem?.value.trim() ?? "";
  const previewActionEditValue = editConfig?.fields?.action?.value.trim() ?? "";
  const previewRecordNoteEditValue = editConfig?.fields?.recordNote?.value.trim() ?? "";
  const conditionScopeNote = data.scopeRows.find(([area, status, note]) =>
    /fan|rooftop|containment|condition/i.test(`${area} ${status} ${note}`) &&
    note.trim().length > 0 &&
    !/access/i.test(area),
  )?.[2];
  const accessRevisitWindow =
    findActionValue(data.customerClose.actionItems, [/access revisit/i]) ??
    (hasOpenAccessItem ? "After rear duct access is cleared" : "No access revisit needed");
  const proofCoverage = data.closeout?.proofCoverage;
  const rawPrimaryCta = data.closeout?.primaryCta;
  const primaryCta =
    String(rawPrimaryCta?.kind) === "pay_invoice"
      ? data.closeout?.ctas.find(
          (cta) =>
            cta.kind === "confirm_next_service" ||
            cta.kind === "schedule_next_cleaning",
        )
      : rawPrimaryCta;
  const serviceDate =
    getRowValue(data.packetHeader.quickFacts, ["Service date"]) ?? "Service date recorded";
  const serviceLocation =
    getRowValue(data.packetHeader.quickFacts, ["Location"]) ??
    getRowValue(data.systemIdentityRows, ["Site"]) ??
    "";
  const reviewedOnSite =
    getRowValue(data.systemIdentityRows, ["Reviewed on site"]) ?? "";
  const hasAttachedPhotos = data.proofPhotos.length > 0;
  const serviceSiteBadges = [
    ["Property", data.packetHeader.title],
    ["Location", serviceLocation],
    ["Reviewed", reviewedOnSite],
  ].filter(([, value]) => value.trim().length > 0);
  const resultSubcopy = customerCopy(previewResultEditValue || data.packetHeader.copy);
  const mobileResultSubcopy = isBlockedAccessOutcome
    ? "Reachable work was completed. Blocked access stays separate."
    : isConditionReviewOutcome
      ? "Service was completed. One recorded condition is listed for follow-up or next-service planning."
      : hasAttachedPhotos
        ? "Service completed. Attached photos support the areas shown, and the PDF copy is available for files."
        : "Service completed from written notes. Photos are not attached to this visit, and the PDF copy is available for files.";
  const beforePhoto = data.proofPhotos.find((photo) => photo.tone === "before");
  const afterPhoto =
    data.proofPhotos.find((photo) => photo.tone === "after") ??
    data.proofPhotos.find((photo) => photo.tone !== "issue") ??
    data.proofPhotos[0];
  const issuePhoto = data.proofPhotos.find((photo) => photo.tone === "issue");
  const issuePhotoEyebrow = isConditionReviewOutcome
    ? "Condition recorded"
    : "Customer action needed";
  const issuePhotoTitle = isConditionReviewOutcome
    ? "Condition photo + next action"
    : "Blocked access photo + next action";
  const issuePhotoBadge = isConditionReviewOutcome ? "Recorded" : "Not included";
  const issuePhotoBody = isConditionReviewOutcome
    ? "This condition is separated from completed work until the customer decides on quote, monitoring, or next-service planning."
    : "This section is separated from completed work until access is clear.";
  const issuePhotoAreaLabel = isConditionReviewOutcome ? "Condition area" : "Blocked area";
  const issuePhotoFallbackReason = isConditionReviewOutcome
    ? "Condition was recorded during service."
    : "Access was blocked during service.";
  const hasDistinctPhotoPair =
    Boolean(beforePhoto && afterPhoto && beforePhoto.proofId !== afterPhoto.proofId);
  const canCompareBeforeAfter =
    hasDistinctPhotoPair && beforePhoto && afterPhoto
      ? isMatchedBeforeAfterPair(beforePhoto, afterPhoto)
      : false;
  const photoSectionTitle = canCompareBeforeAfter
    ? "Before and after photos are attached."
    : issuePhoto
      ? "Photos attached to this service record."
      : afterPhoto
        ? "After-service photos are attached."
        : "Photos attached to this service record.";
  const photoSectionCopy = hasOpenAccessItem
    ? canCompareBeforeAfter
      ? "Review the blocked access item first. Then compare the completed hood area before and after service."
      : "Review the blocked access item first. Other attached photos stay with the service record without implying a matched before/after set."
    : canCompareBeforeAfter
      ? "Compare the completed hood area before and after service, then keep the PDF copy for files."
      : "Review the attached service photos, then keep the PDF copy for files.";
  const customerActionTitle = customerCopy(
    data.closeout?.customerActionTitle ?? data.customerClose.title,
  );
  const customerActionCopy = customerCopy(
    previewActionEditValue || data.closeout?.customerActionCopy || data.customerClose.copy,
  );
  const customerNextStep = customerActionCopy;
  const mobileCustomerNextStep = customerActionCopy;
  const openAccessAreaCount = Math.max(openItems.length, isBlockedAccessOutcome ? 1 : 0);
  const actionAreaHeadline = `${openAccessAreaCount} area${openAccessAreaCount > 1 ? "s" : ""} ${
    openAccessAreaCount > 1 ? "need" : "needs"
  } your action`;
  const conditionHeadline = `${Math.max(openItems.length, 1)} condition recorded`;
  const serviceOutcomeLabel =
    isBlockedAccessOutcome && openItems.length > 0
      ? actionAreaHeadline
      : isConditionReviewOutcome
        ? conditionHeadline
        : "Ready for records";
  const hasVendorPhone = data.vendor.directLine.trim().length > 0;
  const canUseVendorPhone = hasVendorPhone && !isPublicSample;
  const vendorPhoneHref = canUseVendorPhone
    ? `tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`
    : undefined;
  const vendorBrandColor =
    data.vendor.brandColor && /^#[0-9A-Fa-f]{6}$/.test(data.vendor.brandColor)
      ? data.vendor.brandColor
      : "#f26a21";
  const vendorAccentStyle = accentVariables(vendorBrandColor);
  const vendorAccentSoft = mixWithWhite(vendorBrandColor, 0.56);
  const vendorAccentContrast = accentTextColor(vendorBrandColor);
  const isUnbrandedTestLink = !data.vendor.brandingApplied;
  const rawPrimaryCtaLabel = customerCopy(
    primaryCta?.label ??
      (hasOpenAccessItem ? "Reply after clearing access" : "Confirm next service window"),
  );
  const primaryCtaUsesPhoneFallback = !primaryCta?.href && Boolean(vendorPhoneHref);
  const primaryCtaLabel = primaryCtaUsesPhoneFallback
    ? phoneFallbackCtaLabel(rawPrimaryCtaLabel, hasOpenAccessItem)
    : rawPrimaryCtaLabel;
  const compactPrimaryCtaLabel = mobileCtaLabel(primaryCtaLabel, hasOpenAccessItem);
  const rawProofCoverageLabel =
    proofCoverage?.label ??
    (data.proofPhotos.length > 0
      ? `${data.proofPhotos.length} field photos attached`
      : "Written service record");
  const proofCoverageLabel =
    data.proofPhotos.length > 0
      ? rawProofCoverageLabel
      : isBlockedAccessOutcome
        ? "Written access record"
        : isConditionReviewOutcome
          ? "Written condition record"
          : "Written service record";
  const proofCoverageMetricValue =
    proofCoverage?.shortLabel ??
    (data.proofPhotos.length > 0 ? `${data.proofPhotos.length} photos` : "Written record");
  const resultMetricValue = data.closeout?.primaryStatusLabel ?? serviceOutcomeLabel;
  const serviceResultLabel = serviceDate.toLowerCase().includes("recorded")
    ? "Service result"
    : `${shortDate(serviceDate)} service result`;
  const downloadPdfCta = data.closeout?.ctas.find((cta) => cta.kind === "download_pdf");
  const localEvidencePdfHref = useSyncExternalStore(
    subscribeLocalEvidencePdfHref,
    getLocalEvidencePdfHref,
    () => null,
  );
  const pdfServiceRecordHref = downloadPdfCta?.href ?? localEvidencePdfHref;
  const keyPhotoIds = [issuePhoto, beforePhoto, afterPhoto]
    .filter(Boolean)
    .map((photo) => photo?.proofId);
  const detailPhotos = data.proofPhotos.filter((photo) => !keyPhotoIds.includes(photo.proofId));
  const mobileProofPhotos = [issuePhoto, beforePhoto, afterPhoto, ...detailPhotos]
    .reduce<ProofPhoto[]>((photos, photo) => {
      if (photo && !photos.some((item) => item.proofId === photo.proofId)) {
        photos.push(photo);
      }

      return photos;
    }, [])
    .slice(0, 6);
  const scopeGroups = groupScopeRows([...data.componentStatusRows]);
  const primaryCtaHref = isPublicSample
    ? "#public-sample-note"
    : primaryCta?.href ?? vendorPhoneHref;
  const primaryCtaEnabled = isPublicSample
    ? true
    : primaryCta?.href
    ? primaryCta.enabled
    : Boolean(primaryCtaHref);
  const primaryCtaReason =
    primaryCta?.reason && !/local preview|link field/i.test(primaryCta.reason)
      ? customerCopy(primaryCta.reason)
      : null;
  const supportingCtas = (data.closeout?.ctas ?? []).filter(
    (cta): cta is LinkedCloseoutCta =>
      String(cta.kind) !== "pay_invoice" &&
      cta.priority !== "primary" &&
      cta.priority !== "utility" &&
      cta.enabled &&
      Boolean(cta.href),
  );
  const resultLineTitle = customerCopy(
    data.summaryCards[0]?.title ?? "Accessible service areas were completed.",
  );
  const resultLineCopy = customerCopy(
    previewResultEditValue || data.summaryCards[0]?.copy || data.packetHeader.copy,
  );
  const openItemLineLabel = hasOpenAccessItem
    ? "Needs customer action"
    : isConditionReviewOutcome
      ? "Condition recorded"
      : "No blocked area";
  const openItemLineTitle = hasOpenAccessItem
    ? customerCopy(primaryOpenItem?.issue ?? "A blocked area needs customer action.")
    : isConditionReviewOutcome
      ? customerCopy(primaryOpenItem?.issue ?? "A condition was recorded for review.")
      : "No blocked area remained at the end of the visit.";
  const openItemLineCopy = hasOpenAccessItem
    ? customerCopy(
          previewOpenItemEditValue ||
            accessScopeNote ||
            primaryOpenItem?.ownerAction ||
          "Review the blocked area and contact the service team for follow-up.",
      )
    : isConditionReviewOutcome
      ? customerCopy(
          previewOpenItemEditValue ||
            conditionScopeNote ||
            primaryOpenItem?.ownerAction ||
            data.closeout?.responsibilityCopy ||
            "Keep the recorded condition visible for follow-up planning.",
        )
      : customerCopy(
          previewOpenItemEditValue ||
            "The service can be kept with kitchen exhaust maintenance records.",
        );
  const recordNoteLineCopy = customerCopy(
    previewRecordNoteEditValue ||
      findActionValue(data.customerClose.actionItems, [/pdf copy note/i, /evidence pdf note/i]) ||
      "The PDF copy is for manager, insurance, or documentation requests. It stays separate from corrective or follow-up work.",
  );
  const isCompactReport = isShort;
  const isWrittenCompactReport = isCompactReport && !hasAttachedPhotos;

  function handleEvidencePdfAction() {
    const saveEvent = new CustomEvent("axis1:save-evidence-pdf", {
      cancelable: true,
    });
    const wasNotHandled = window.dispatchEvent(saveEvent);

    if (!wasNotHandled) {
      return;
    }

    document.documentElement.classList.add("app-printing");

    const clearPrintUiLock = () => {
      document.documentElement.classList.remove("app-printing");
    };

    window.addEventListener("afterprint", clearPrintUiLock, { once: true });
    window.setTimeout(() => {
      window.print();
      window.setTimeout(clearPrintUiLock, 900);
    }, 120);
  }

  useEffect(() => {
    const updateMobileDock = () => {
      const proofSection = document.getElementById("proof-story");
      const proofTop = proofSection
        ? proofSection.getBoundingClientRect().top + window.scrollY
        : 2400;

      setShowMobileDock(window.scrollY > 520 && window.scrollY < Math.min(proofTop - 620, 820));
    };

    updateMobileDock();
    window.addEventListener("scroll", updateMobileDock, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateMobileDock);
    };
  }, []);

  useEffect(() => {
    if (!isPublicSample) {
      return undefined;
    }

    const handlePublicSampleClick = (event: globalThis.MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const link = target.closest("a");
      const href = link?.getAttribute("href") ?? "";

      if (
        href === "#sample-action" ||
        href === "#public-sample-note" ||
        href.startsWith("tel:")
      ) {
        event.preventDefault();
        event.stopPropagation();
        setPublicSampleNoticeOpen(true);
      }
    };

    document.addEventListener("click", handlePublicSampleClick, true);

    return () => {
      document.removeEventListener("click", handlePublicSampleClick, true);
    };
  }, [isPublicSample]);

  return (
    <article
      id="report-top"
      style={vendorAccentStyle}
      className={cx(
        "customer-web-packet packet-shell overflow-hidden bg-[#f7f1e9] text-[#111315] shadow-[0_36px_110px_rgba(17,17,17,0.1)] print:rounded-none print:border-0 print:shadow-none",
        isCompactReport && "customer-web-packet-short",
        className,
      )}
    >
      <CustomerReportHeader
        data={data}
        primaryCtaLabel={primaryCtaLabel}
        compactPrimaryCtaLabel={compactPrimaryCtaLabel}
        primaryCtaHref={primaryCtaHref}
        primaryCtaEnabled={primaryCtaEnabled}
        pdfServiceRecordHref={pdfServiceRecordHref}
        onEvidencePdfAction={handleEvidencePdfAction}
        hasVendorPhone={canUseVendorPhone}
        compactReport={isCompactReport}
      />
      {isPublicSample ? <PublicSampleBanner /> : null}
      <div className="h-1.5 w-full" style={{ backgroundColor: vendorBrandColor }} />
      <section
        className={cx(
          "packet-hero-shell relative overflow-hidden bg-[#0f141b] text-white",
          hasAttachedPhotos
            ? "min-h-[100svh] lg:min-h-[720px]"
            : isCompactReport
              ? "min-h-[500px] lg:min-h-[540px]"
            : "min-h-[560px] lg:min-h-[590px]",
        )}
      >
        {afterPhoto ? (
          <Image
            src={afterPhoto.src}
            alt=""
            fill
            loading="eager"
            sizes="1080px"
            className="hidden scale-105 object-cover opacity-[0.18] blur-[2px] lg:block"
            style={{ objectPosition: afterPhoto.position }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle_at_78%_18%,${hexToRgba(
              vendorBrandColor,
              0.24,
            )},transparent 28%),linear-gradient(90deg,rgba(15,20,27,0.97)_0%,rgba(15,20,27,0.88)_44%,rgba(15,20,27,0.42)_100%)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0f141b] to-transparent" />

        <div
          className={cx(
            "relative grid gap-5 px-5 py-5 sm:px-8 sm:py-7 lg:gap-8 lg:px-10 lg:py-10",
            hasAttachedPhotos
              ? "min-h-[100svh] content-between lg:min-h-[720px] lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.72fr)]"
              : isCompactReport
                ? "min-h-[500px] content-start lg:min-h-[540px] lg:content-center"
                : "min-h-[560px] content-between lg:min-h-[590px]",
          )}
        >
          <div className={hasAttachedPhotos ? "lg:col-span-2" : ""}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="packet-vendor-mark flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white text-[#121821] shadow-[0_18px_46px_rgba(0,0,0,0.28)]"
                  style={{
                    background: data.vendor.logoUrl ? "#ffffff" : vendorBrandColor,
                    color: data.vendor.logoUrl ? "#121821" : "#ffffff",
                  }}
                >
                  {data.vendor.logoUrl ? (
                    <VendorLogoImage
                      src={data.vendor.logoUrl}
                      alt={`${data.vendor.name} logo`}
                      width={52}
                      height={52}
                      className="h-full w-full object-contain p-1.5"
                      fallbackText={data.vendor.initials}
                    />
                  ) : (
                    <span className="font-semibold">{data.vendor.initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold leading-tight tracking-[-0.04em]">
                    {data.vendor.name}
                  </p>
                  <p className="mt-1 text-sm text-white/62">{data.vendor.office}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {isUnbrandedTestLink ? (
                  <Badge
                    variant="outline"
                    className="packet-hero-badge rounded-full border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/82 backdrop-blur"
                  >
                    Free test link
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className="packet-hero-badge rounded-full border-white/14 bg-white/9 px-3 py-1.5 text-xs font-medium text-white/82 backdrop-blur"
                >
                  {serviceDate}
                </Badge>
                <Badge
                  variant="outline"
                  className={cx(
                    "packet-hero-badge rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur",
                    isBlockedAccessOutcome || isConditionReviewOutcome
                      ? "border-[#ffb489]/40 bg-[#ffb489]/13 text-[#ffb489]"
                      : "border-[#b6d8c5]/35 bg-[#b6d8c5]/13 text-[#bfe8d0]",
                  )}
                >
                  {isBlockedAccessOutcome || isConditionReviewOutcome ? (
                    <IconAlertTriangleFilled className="h-3.5 w-3.5" />
                  ) : (
                    <IconCircleCheckFilled className="h-3.5 w-3.5" />
                  )}
                  {serviceOutcomeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div
            className={cx(
              "flex flex-col justify-end pb-2 lg:pb-5",
              isWrittenCompactReport ? "max-w-4xl" : "max-w-3xl",
            )}
          >
            <SectionLabel light>Service report</SectionLabel>
            <div className="mt-3 flex max-w-2xl flex-wrap gap-2">
              {serviceSiteBadges.map(([label, value]) => (
                <span
                  key={label}
                  className="min-w-0 rounded-full border border-white/14 bg-white/9 px-3 py-1 text-[11px] font-semibold leading-5 text-white/74 backdrop-blur"
                >
                  <span className="text-white/42">{label}:</span>{" "}
                  {customerCopy(value)}
                </span>
              ))}
            </div>
            <HeroHeading className="font-display mt-5 max-w-4xl text-[2.35rem] font-semibold leading-[0.92] tracking-[-0.07em] text-white min-[390px]:text-[2.5rem] sm:text-[4.15rem] sm:leading-[0.9] sm:tracking-[-0.075em] lg:text-[6rem]">
              {isBlockedAccessOutcome && openItems.length > 0 ? (
                <>
                  Reachable work completed.{" "}
                  <br />
                  <span className="text-[#ff7a1a]">{actionAreaHeadline}.</span>
                </>
              ) : (
                <>
                  Service completed.
                  {isConditionReviewOutcome ? (
                    <>
                      {" "}
                      <br />
                      <span className="text-[#ff7a1a]">{conditionHeadline}.</span>
                    </>
                  ) : null}
                </>
              )}
            </HeroHeading>
            <p className="mt-5 hidden max-w-2xl text-base leading-7 text-white/72 lg:block">
              {resultSubcopy}
            </p>
            <p className="mt-4 max-w-[20rem] text-sm leading-6 text-white/68 lg:hidden">
              {mobileResultSubcopy}
            </p>

              <MobileProofCommand
              data={data}
              proofPhotos={mobileProofPhotos}
              customerNextStep={mobileCustomerNextStep}
              primaryCtaLabel={primaryCtaLabel}
              primaryCtaHref={primaryCtaHref}
              primaryCtaEnabled={primaryCtaEnabled}
              supportingCtas={supportingCtas}
              pdfServiceRecordHref={pdfServiceRecordHref}
              onEvidencePdfAction={handleEvidencePdfAction}
              accessRevisitWindow={accessRevisitWindow}
              nextServiceWindow={nextServiceWindow}
              hasOpenAccessItem={hasOpenAccessItem}
              hasVendorPhone={canUseVendorPhone}
            />

            <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[22px] border border-white/13 bg-white/[0.075] backdrop-blur-xl sm:grid-cols-4">
              {[
                ["Result", resultMetricValue],
                ["Documentation", proofCoverageMetricValue],
                ["Customer action", compactPrimaryCtaLabel],
                ["PDF copy", "Record copy"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 border-t border-white/12 px-4 py-3 odd:border-r odd:border-white/12 first:border-t-0 sm:border-l sm:border-t-0 sm:odd:border-r-0 sm:first:border-l-0"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/42">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-base font-semibold leading-tight text-white sm:text-lg">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden flex-col gap-3 sm:flex-row lg:flex">
              {primaryCtaHref && primaryCtaEnabled ? (
                <Button
                  asChild
                  className="packet-primary-cta min-h-12 rounded-[14px] px-6 text-sm font-semibold"
                  style={{
                    backgroundColor: vendorBrandColor,
                    color: vendorAccentContrast,
                    boxShadow: `0 20px 45px ${hexToRgba(vendorBrandColor, 0.24)}`,
                  }}
                >
                  <a href={primaryCtaHref}>
                    <IconClipboardText className="h-4 w-4" />
                    {primaryCtaLabel}
                  </a>
                </Button>
              ) : null}
              <Button
                asChild={Boolean(pdfServiceRecordHref)}
                type={pdfServiceRecordHref ? undefined : "button"}
                onClick={pdfServiceRecordHref ? undefined : handleEvidencePdfAction}
                variant="outline"
                className="packet-secondary-cta min-h-12 rounded-[14px] border-white/16 bg-white/6 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
              >
                {pdfServiceRecordHref ? (
                  <a href={pdfServiceRecordHref}>
                    <IconFileText className="h-4 w-4" />
                    Open PDF copy
                  </a>
                ) : (
                  <>
                  <IconFileText className="h-4 w-4" />
                  Save PDF copy
                  </>
                )}
              </Button>
              {canUseVendorPhone && !primaryCtaUsesPhoneFallback ? (
                <Button
                  asChild
                  variant="outline"
                  className="packet-secondary-cta min-h-12 rounded-[14px] border-white/16 bg-white/6 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
                >
                  <a href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}>
                    <IconPhone className="h-4 w-4" />
                    {providerCallLabel(data.vendor.name)}
                  </a>
                </Button>
              ) : null}
            </div>
            {!primaryCtaEnabled && primaryCtaReason ? (
              <p className="mt-2 max-w-xl text-xs leading-5 text-white/46">
                {primaryCtaReason}
              </p>
            ) : null}
            {supportingCtas.length > 0 ? (
              <div className="mt-3 hidden flex-wrap gap-2 lg:flex">
                {supportingCtas.map((cta) => (
                  <a
                    key={`${cta.kind}-${cta.label}`}
                    href={cta.href}
                    className="inline-flex min-h-10 items-center justify-center rounded-[14px] border border-white/13 bg-white/[0.045] px-4 text-xs font-semibold text-white/72 backdrop-blur transition hover:bg-white/[0.09] hover:text-white"
                  >
                    {customerCopy(cta.label)}
                  </a>
                ))}
              </div>
            ) : null}

            {!isCompactReport ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/13 bg-white/[0.075] px-4 py-3 backdrop-blur-xl">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.13em]"
                  style={{ color: vendorAccentSoft }}
                >
                  Documentation
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">
                  {proofCoverageLabel}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/13 bg-white/[0.075] px-4 py-3 backdrop-blur-xl">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.13em]"
                  style={{ color: vendorAccentSoft }}
                >
                  PDF copy
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">
                  Record copy for archive, submission, or print.
                </p>
              </div>
            </div>
            ) : null}

            <div
              className="packet-hero-next-step mt-4 rounded-[22px] border px-4 py-3 backdrop-blur-xl"
              style={{
                borderColor: hexToRgba(vendorBrandColor, 0.28),
                backgroundColor: hexToRgba(vendorBrandColor, 0.12),
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.13em]"
                style={{ color: vendorAccentSoft }}
              >
                Customer next step
              </p>
              <p className="mt-2 hidden max-w-2xl text-sm font-semibold leading-6 text-white sm:block">
                {customerNextStep}
              </p>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white sm:hidden">
                {mobileCustomerNextStep}
              </p>
              {issuePhoto ? (
                <ProofImage
                  photo={issuePhoto}
                  className="packet-mobile-action-photo mt-3 aspect-[1.65/1] rounded-[18px] lg:hidden"
                />
              ) : null}
            </div>
            {!isCompactReport ? (
              <SystemCoverageBanner
                education={data.closeout?.coverageEducation}
                scopeNote={data.scopeNote}
              />
            ) : null}
          </div>

        <div className="hidden self-center lg:block">
            {issuePhoto ? (
              <div className="packet-glass-card overflow-hidden rounded-[30px] border border-white/13 bg-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#ffb489]">
                      {issuePhotoEyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.045em]">
                      {issuePhotoTitle}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#ffb489]/30 bg-[#ff6b1a]/13 px-3 py-1.5 text-xs font-semibold text-[#ffc29d]">
                    {issuePhotoBadge}
                  </span>
                </div>

                <div className="grid gap-0 xl:grid-cols-[0.96fr_1.04fr]">
                  <ProofImage
                    photo={issuePhoto}
                    className="aspect-[1.04/1] rounded-none xl:aspect-auto"
                    imageClassName="transition duration-700 hover:scale-[1.025]"
                  />

                  <div className="flex min-w-0 flex-col justify-between gap-4 p-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/42">
                        Action required
                      </p>
                      <p className="mt-2 text-xl font-semibold leading-tight tracking-[-0.04em] text-white">
                        {mobileCustomerNextStep}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/58">
                        {issuePhotoBody}
                      </p>
                    </div>

                    <dl className="grid gap-2">
                      {[
                        [
                          issuePhotoAreaLabel,
                          cleanComponentLabel(primaryOpenItem?.location ?? issuePhotoAreaLabel),
                        ],
                        [
                          "Reason",
                          primaryOpenItem?.issue ?? issuePhotoFallbackReason,
                        ],
                        ["Next", primaryCtaLabel],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="grid gap-1 rounded-[16px] border border-white/10 bg-white/[0.055] px-3 py-2.5 xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] xl:gap-3"
                        >
                          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/38">
                            {label}
                          </dt>
                          <dd className="min-w-0 break-words text-xs font-semibold leading-5 text-white/78 xl:text-right">
                            {customerCopy(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-[#111315]/46 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38">
                        Exhaust path represented
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {data.routeSegments.length} checkpoints, not just the hood canopy.
                      </p>
                    </div>
                    <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/68">
                      {data.proofPhotos.length} photos
                    </span>
                  </div>
                </div>
              </div>
            ) : afterPhoto ? (
              <figure className="packet-glass-card overflow-hidden rounded-[30px] border border-white/13 bg-white/10 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#0b0d10]">
                  <Image
                    src={afterPhoto.src}
                    alt={afterPhoto.title}
                    fill
                    loading="eager"
                    sizes="420px"
                    quality={92}
                    className="object-contain"
                  />
                </div>
                <figcaption className="px-1 pb-1 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#ffb489]">
                    Attached service photo
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white">
                    {customerCopy(afterPhoto.title)}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-5 text-white/54">
                    Full photo set appears below with captions and PDF copy.
                  </p>
                </figcaption>
              </figure>
            ) : null}
          </div>

          {!isCompactReport ? (
          <div className="lg:col-span-2">
            <div className="packet-metric-strip grid grid-cols-2 border-y border-white/14 bg-white/[0.025] py-1 backdrop-blur-xl sm:grid-cols-4">
              <Metric label="Result" value={resultMetricValue} />
              <Metric label="Documentation" value={proofCoverageMetricValue} />
              <Metric label="Customer action" value={compactPrimaryCtaLabel} />
              <Metric label="PDF copy" value="Record copy" />
            </div>
          </div>
          ) : null}
        </div>
      </section>

      <section
        id="summary"
        className={cx(
          "packet-result-section scroll-mt-24 grid border-b border-[#ded6cc] bg-[#fbfaf7] px-5 sm:px-8 lg:px-10",
          isCompactReport
            ? "gap-5 py-8 lg:py-10 xl:grid-cols-[minmax(260px,0.52fr)_minmax(0,1.48fr)]"
            : "gap-9 py-10 lg:py-14 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)]",
        )}
      >
        <div className="max-w-xl">
          <SectionLabel>{serviceResultLabel}</SectionLabel>
          <h2
            className={cx(
              "font-display mt-3 font-semibold leading-[0.98] tracking-[-0.07em]",
              isCompactReport ? "text-[2.15rem] sm:text-[3rem]" : "text-[2.65rem] sm:text-[4.1rem]",
            )}
          >
            {isCompactReport ? "Service result." : "Here's the bottom line."}
          </h2>
          <p className="mt-5 text-base leading-7 text-[#6d645b]">
            {isCompactReport
              ? "Completed work, customer action, and the PDF copy are kept together for restaurant records."
              : hasOpenAccessItem
                ? "This page separates completed work from blocked access so the customer can understand the visit without another explanation call."
                : hasAttachedPhotos
                  ? "This page keeps completed work, attached photos, and the next step easy to understand without another explanation call."
                  : "This page keeps completed work, written service documentation, and the next step easy to understand without another explanation call."}
          </p>
        </div>

        <div className="packet-result-list grid min-w-0 overflow-hidden rounded-[30px] border border-[#ded6cc] bg-white/72 sm:grid-cols-2 xl:grid-cols-4">
          <ResultLine
            label="Completed this visit"
            title={resultLineTitle}
            copy={resultLineCopy}
            tone="success"
            editTarget="result"
            editConfig={editConfig}
          />
          <ResultLine
            label={openItemLineLabel}
            title={openItemLineTitle}
            copy={openItemLineCopy}
            tone={hasOpenAccessItem ? "open" : isConditionReviewOutcome ? "action" : "success"}
            editTarget="openItem"
            editConfig={editConfig}
          />
          <ResultLine
            label="Customer action"
            title={customerActionTitle}
            copy={customerActionCopy}
            tone="action"
            editTarget="action"
            editConfig={editConfig}
          />
          <ResultLine
            label="Record note"
            title="Keep the PDF copy with kitchen exhaust files."
            copy={recordNoteLineCopy}
            tone="record"
            editTarget="recordNote"
            editConfig={editConfig}
          />
        </div>
      </section>

      {sections.checklist ? (
        <CoverageEducationSection
          education={data.closeout?.coverageEducation}
          proofCoverageLabel={proofCoverageLabel}
          hasAttachedPhotos={hasAttachedPhotos}
          editConfig={editConfig}
        />
      ) : null}

      {sections.routeDetail ? (
        <ExhaustProofSpine
          routeSegments={data.routeSegments}
          proofPhotos={data.proofPhotos}
          proofPolicyRows={data.proofPolicyRows}
          completedWork={data.completedWork}
          scopeNote={data.scopeNote}
        />
      ) : null}

      {sections.photos && data.proofPhotos.length > 0 ? (
        <section
          id="proof-story"
          className="packet-proof-section scroll-mt-24 border-b border-[#ded6cc] bg-[#111111] px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-16"
        >
          <div className="grid gap-10 xl:grid-cols-[minmax(300px,0.52fr)_minmax(0,1fr)] xl:items-start">
            <motion.div
              className="order-1 lg:sticky lg:top-8 lg:order-1"
              initial={false}
            >
              <SectionLabel light>Service photos from this visit</SectionLabel>
              <h2 className="font-display mt-3 max-w-xl text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.07em] sm:text-[4.1rem]">
                {photoSectionTitle}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/62">
                {photoSectionCopy}
              </p>
              <ol className="packet-proof-steps mt-8 hidden border-l border-white/12 pl-5 lg:block">
                {(hasOpenAccessItem
                  ? [
                      [
                        "01",
                        "Review blocked access",
                        "The blocked access item is shown first so it cannot be confused with completed work.",
                      ],
                      [
                        "02",
                        canCompareBeforeAfter ? "Compare before and after" : "Review completed photos",
                        canCompareBeforeAfter
                          ? "The hood photos show visible change in the completed area."
                          : "Completed service photos stay grouped without forcing a false matched comparison.",
                      ],
                      ["03", "Keep the record", "The PDF copy stays available for files and documentation requests."],
                    ]
                  : [
                      [
                        "01",
                        canCompareBeforeAfter ? "Compare before and after" : "Review completed photos",
                        canCompareBeforeAfter
                          ? "The hood photos show visible change in the completed area."
                          : "Completed service photos stay grouped without forcing a false matched comparison.",
                      ],
                      ["02", "Check attached photos", "The link keeps service areas and field photos in the same customer-readable record."],
                      ["03", "Keep the record", "The PDF copy stays available for files and documentation requests."],
                    ]).map(([step, title, copy]) => (
                  <li
                    key={step}
                    className="relative py-4 first:pt-0 last:pb-0"
                  >
                    <span className="absolute -left-[1.8rem] top-5 h-2.5 w-2.5 rounded-full bg-[#ff9b63] shadow-[0_0_0_6px_rgba(255,155,99,0.12)] first:top-1" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#ffb489]">
                      {step}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/52">{copy}</p>
                  </li>
                ))}
              </ol>
            </motion.div>

            <div className="order-2 grid min-w-0 gap-7 overflow-hidden lg:order-2">
              {issuePhoto ? (
                <motion.figure
                  className="order-1 grid overflow-hidden rounded-[30px] border border-[#f0b28e]/22 bg-[#231812] shadow-[0_28px_70px_rgba(0,0,0,0.28)] lg:order-2 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,0.82fr)]"
                  initial={false}
                >
                  <ProofImage
                    photo={issuePhoto}
                    priority
                    className="aspect-[1.12/1] rounded-none lg:aspect-auto"
                  />
                  <figcaption className="flex flex-col justify-center p-6 sm:p-8">
                    <SectionLabel light>
                      {isConditionReviewOutcome ? "Condition photo" : "Blocked access photo"}
                    </SectionLabel>
                    <h3 className="mt-3 text-[2rem] font-semibold leading-[0.96] tracking-[-0.06em] sm:text-[3rem]">
                      {customerCopy(issuePhoto.title)}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
                      {customerCopy(issuePhoto.caption)}
                    </p>
                    {primaryOpenItem ? (
                      <div className="mt-6 rounded-[22px] border border-[#f0b28e]/18 bg-white/[0.055] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#ffb489]">
                          Customer action
                        </p>
                        <p className="mt-2 text-lg font-semibold leading-tight tracking-[-0.035em]">
                          {customerNextStep}
                        </p>
                      </div>
                    ) : null}
                  </figcaption>
                </motion.figure>
              ) : null}

              <motion.div
                className="order-2 min-w-0 lg:order-1"
                initial={false}
              >
                {canCompareBeforeAfter && beforePhoto && afterPhoto ? (
                  <>
                    <BeforeAfterCompare beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <ProofCaption photo={beforePhoto} light />
                      <ProofCaption photo={afterPhoto} light />
                    </div>
                    <ServicePhotoSetRail photos={data.proofPhotos} hasComparison />
                  </>
                ) : hasDistinctPhotoPair && beforePhoto && afterPhoto ? (
                  <>
                    <ProofPairCards beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
                    <ServicePhotoSetRail photos={data.proofPhotos} />
                  </>
                ) : afterPhoto ? (
                  <>
                    <figure className="overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.045]">
                      <ProofImage
                        photo={afterPhoto}
                        priority
                        className="aspect-[1.1/1] rounded-none"
                      />
                      <figcaption className="p-5">
                        <ProofCaption photo={afterPhoto} light />
                      </figcaption>
                    </figure>
                    <ServicePhotoSetRail photos={data.proofPhotos} />
                  </>
                ) : (
                  <ServicePhotoSetRail photos={data.proofPhotos} />
                )}
              </motion.div>

            </div>
          </div>
        </section>
      ) : null}

      {openItems.length > 0 && primaryOpenItem ? (
        <section className="packet-open-section border-b border-[#ead8ca] bg-[#fff8f1] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-8 xl:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] xl:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <SectionLabel>
                  {hasOpenAccessItem ? "Blocked area" : "Condition recorded"}
                </SectionLabel>
                <h2 className="font-display mt-3 text-[2.45rem] font-semibold leading-[1.02] sm:text-[3.7rem]">
                  {hasOpenAccessItem
                    ? "This area was not completed because access was blocked."
                    : "This condition was recorded for follow-up."}
                </h2>
              </div>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#6b5f55]">
                {hasOpenAccessItem
                  ? "Completed work and blocked access are separated, so this visit is not mistaken for full-access service."
                  : "Completed work and recorded conditions are separated, so the condition is not mistaken for completed corrective work."}
              </p>
            </div>

            <Card className="packet-open-card gap-0 overflow-hidden rounded-[32px] border-[#edbd9f] bg-white py-0 shadow-[0_28px_80px_rgba(145,72,31,0.14)]">
              <CardHeader className="border-b border-[#ead8ca] px-6 py-6">
                <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a85a32]">
                  {hasOpenAccessItem ? "Customer action" : "Follow-up"}
                </CardDescription>
                <CardTitle className="mt-2 text-[1.9rem] leading-[0.98] tracking-[-0.055em] sm:text-[2.55rem]">
                  {customerCopy(primaryOpenItem.ownerAction)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <dl className="divide-y divide-[#ead8ca]">
                  <DataLine
                    label={hasOpenAccessItem ? "Area" : "Condition area"}
                    value={cleanComponentLabel(primaryOpenItem.location)}
                  />
                  <DataLine
                    label="Status"
                    value={hasOpenAccessItem ? "Not shown as completed" : "Recorded for review"}
                  />
                  <DataLine
                    label={hasOpenAccessItem ? "Reason" : "Note"}
                    value={primaryOpenItem.issue}
                  />
                  <DataLine label="Follow-up" value={primaryOpenItem.status} />
                </dl>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {sections.checklist ? (
        <section className="packet-scope-section border-b border-[#ded6cc] bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-8 grid gap-4 xl:grid-cols-[minmax(300px,0.68fr)_minmax(0,1.32fr)] xl:items-end">
            <div>
              <div className="flex items-center justify-between gap-3">
                <SectionLabel>Area status</SectionLabel>
                <PreviewScopeEditButton editConfig={editConfig} />
              </div>
              <h2 className="font-display mt-3 text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.07em] sm:text-[3.35rem]">
                What the service covered.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#6d645b] lg:justify-self-end">
              The customer-facing version keeps completed work, customer action, and recorded review items separated so the next reply stays simple.
            </p>
          </div>
          <div className="packet-scope-board grid overflow-hidden rounded-[28px] border border-[#ded6cc] bg-white xl:grid-cols-3">
            <ScopeGroup label="Completed" rows={scopeGroups.Completed} />
            <ScopeGroup label="Customer action" rows={scopeGroups["Customer action"]} />
            <ScopeGroup label="Recorded for review" rows={scopeGroups["Recorded for review"]} />
          </div>
        </section>
      ) : null}

      <section
        id="record"
        className="packet-record-section scroll-mt-24 grid gap-5 border-b border-[#ded6cc] bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:px-10 lg:py-14 xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.05fr)]"
      >
        <Card className="packet-record-card gap-0 rounded-[28px] border-0 bg-[#111315] py-0 text-white shadow-[0_28px_80px_rgba(17,17,17,0.18)]">
          <CardHeader className="px-6 py-6">
            <IconFileText className="h-7 w-7 text-[#ff9b63]" />
            <CardTitle className="mt-6 text-[2.35rem] leading-[0.92] tracking-[-0.075em]">
              Keep this record.
            </CardTitle>
            <CardDescription className="mt-4 text-sm leading-7 text-white/68">
              Keep this record with your kitchen exhaust maintenance files. It includes the service date, completed areas, photo status, blocked or not-completed areas, and recommended next service window.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Separator className="mb-5 bg-white/12" />
            <p className="text-sm leading-7 text-white/62">
              A PDF copy is available for files, manager review, insurance, or documentation requests. It stays separate from corrective or follow-up work.
            </p>
            <Button
              asChild={Boolean(pdfServiceRecordHref)}
              type={pdfServiceRecordHref ? undefined : "button"}
              onClick={pdfServiceRecordHref ? undefined : handleEvidencePdfAction}
              className="packet-service-record-link mt-5 min-h-11 w-full min-w-0 rounded-full bg-white px-5 text-center text-sm font-semibold leading-5 whitespace-normal text-[#111315] hover:bg-[#f4eee6] sm:w-auto sm:whitespace-nowrap"
            >
              {pdfServiceRecordHref ? (
                <a href={pdfServiceRecordHref}>
                  <IconFileText className="h-4 w-4" />
                  Open PDF copy
                </a>
              ) : (
                <>
                <IconFileText className="h-4 w-4" />
                Save PDF copy
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {sections.nextService ? (
          <Card className="packet-next-card gap-0 rounded-[28px] border-[#ded6cc] bg-white py-0 shadow-[0_20px_60px_rgba(17,17,17,0.07)]">
            <CardHeader className="px-6 py-6">
              <IconCalendarDue className="h-7 w-7 text-[#c8581e]" />
              <CardTitle className="font-display mt-6 text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.07em]">
                {hasOpenAccessItem ? "Access revisit and routine window." : "Next recommended step."}
              </CardTitle>
              <CardDescription className="mt-4 text-sm leading-7 text-[#6d645b]">
                {hasOpenAccessItem
                  ? "Clear the blocked access area, then contact the service team. They will confirm the access revisit before scheduling. The routine service window stays separate."
                  : customerCopy(data.customerClose.copy)}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                {hasOpenAccessItem ? (
                  <DataLine label="Access revisit" value={accessRevisitWindow} />
                ) : null}
                <DataLine
                  label={hasOpenAccessItem ? "Next routine service" : "Recommended window"}
                  value={nextServiceWindow}
                />
                <DataLine
                  label="Reason"
                  value={
                    getRowValue(data.frequencyRows, ["Interval note"]) ??
                    "Based on the current service record and visible buildup pattern."
                  }
                />
                <DataLine label="Customer action" value={customerNextStep} />
              </dl>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {primaryCtaHref && primaryCtaEnabled ? (
                  <Button
                    asChild
                    className="min-h-11 w-full min-w-0 rounded-full bg-[#111315] px-5 text-center text-sm font-semibold leading-5 whitespace-normal text-white sm:w-auto sm:whitespace-nowrap"
                  >
                    <a href={primaryCtaHref}>{primaryCtaLabel}</a>
                  </Button>
                ) : null}
                {canUseVendorPhone && !primaryCtaUsesPhoneFallback ? (
                  <Button
                    asChild
                    variant="outline"
                    className="min-h-11 w-full min-w-0 rounded-full border-[#d9d0c5] bg-white px-5 text-center text-sm font-semibold leading-5 whitespace-normal text-[#111315] sm:w-auto sm:whitespace-nowrap"
                  >
                    <a href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}>
                      Contact {data.vendor.name}
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      {sections.photos && detailPhotos.length > 0 && !isShort ? (
        <section className="packet-additional-section border-b border-[#ded6cc] bg-[#111315] px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-8 grid gap-5 xl:grid-cols-[minmax(300px,0.6fr)_minmax(0,1fr)] xl:items-end">
            <div>
              <SectionLabel light>Additional photos</SectionLabel>
              <h2 className="font-display mt-3 text-[2.45rem] font-semibold leading-[0.96] tracking-[-0.07em] sm:text-[3.55rem]">
                More photos, kept out of the way.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/58 lg:justify-self-end">
              The customer gets the main photos first. Supporting photos stay available below without turning the page into a photo dump.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {detailPhotos.map((photo) => (
              <figure
                key={photo.proofId}
                className="packet-support-photo group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045]"
              >
                <ProofImage
                  photo={photo}
                  className="aspect-[1.45/1] rounded-none"
                  imageClassName="transition duration-700 group-hover:scale-[1.035]"
                />
                <figcaption className="px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#ffb489]">
                    {customerPhotoRole(photo.proofRole)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.035em]">
                    {customerCopy(photo.title)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    {customerCopy(photo.caption)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {!isShort ? (
        <section className="packet-findings-section border-b border-[#ded6cc] bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-8 grid gap-4 xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] xl:items-end">
            <div>
              <SectionLabel>Findings & recommendations</SectionLabel>
              <h2 className="font-display mt-3 text-[2.45rem] font-semibold leading-[0.96] tracking-[-0.07em] sm:text-[3.55rem]">
                What we found and what happens next.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#6d645b] lg:justify-self-end">
              Follow-up notes are written in plain language so the customer can see what matters and what action is expected.
            </p>
          </div>
          <div className="packet-findings-board grid overflow-hidden rounded-[28px] border border-[#ded6cc] bg-white xl:grid-cols-3">
            {data.deficiencyRows.map((row, index) => (
              <article
                key={`${row.location}-${index}`}
                className="packet-finding-card min-w-0 border-t border-[#ded6cc] p-5 first:border-t-0 xl:border-l xl:border-t-0 xl:first:border-l-0"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#8d8379]">
                    {cleanComponentLabel(row.location)}
                  </p>
                  <StatusBadge status={row.status} />
                </div>
                <h3 className="text-xl font-semibold leading-tight tracking-[-0.04em]">
                  {customerCopy(row.issue)}
                </h3>
                <div className="mt-5 space-y-4 text-sm leading-6 text-[#6d645b]">
                  <p>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111315]">
                      Why it matters
                    </span>
                    {customerCopy(row.whyItMatters)}
                  </p>
                  <p>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111315]">
                      Action
                    </span>
                    {customerCopy(row.ownerAction)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!isShort && sections.routeDetail ? (
        <section className="packet-details-section border-b border-[#ded6cc] bg-[#f7f3ee] px-5 py-7 sm:px-8 lg:px-10">
          <details className="packet-details-panel group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <SectionLabel>Details appendix</SectionLabel>
                <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.05em]">
                  Service record details
                </h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9d0c5] bg-white transition group-open:rotate-180">
                <IconChevronDown className="h-5 w-5" />
              </span>
            </summary>
            <div className="mt-6 grid gap-7 lg:grid-cols-2">
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconClipboardText className="h-4 w-4" />
                  System details
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.systemIdentityRows.map(([label, value]) => (
                    <DataLine key={label} label={label} value={value} />
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconFileText className="h-4 w-4" />
                  Service metadata
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.serviceRecordRows.map(([label, value]) => (
                    <DataLine key={label} label={label} value={value} />
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconClipboardText className="h-4 w-4" />
                  Area details
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.scopeRows.map(([area, status, note]) => (
                    <DataLine
                      key={area}
                      label={`${cleanComponentLabel(area)} - ${customerCopy(status)}`}
                      value={note}
                    />
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconPhoto className="h-4 w-4" />
                  Service photo list
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.photoCoverageRows.map((row) => (
                    <DataLine
                      key={row.item}
                      label={customerCopy(row.item)}
                      value={`${customerCopy(proofLabel(row.proof))} - ${customerCopy(row.status)}`}
                    />
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconCalendarDue className="h-4 w-4" />
                  Operating basis
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.frequencyRows.map(([label, value]) => (
                    <DataLine key={label} label={label} value={value} />
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconShieldCheckFilled className="h-4 w-4" />
                  Operational checks
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.operationalChecks.map(([label, value]) => (
                    <DataLine key={label} label={label} value={value} />
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconCircleCheckFilled className="h-4 w-4" />
                  Service record
                </p>
                <dl className="divide-y divide-[#ded6cc] border-y border-[#ded6cc]">
                  {data.closeoutRows.map(([label, value]) => (
                    <DataLine key={label} label={label} value={value} />
                  ))}
                </dl>
              </div>
              <div className="lg:col-span-2">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111315]">
                  <IconClipboardText className="h-4 w-4" />
                  Customer acknowledgement
                </p>
                <dl className="grid divide-y divide-[#ded6cc] border-y border-[#ded6cc] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                  {data.acknowledgementRows.map(([label, value]) => (
                    <DataLine key={label} label={label} value={value} />
                  ))}
                </dl>
              </div>
            </div>
          </details>
        </section>
      ) : null}

      <footer id="contact" className="packet-footer scroll-mt-24 bg-[#111315] px-5 py-6 text-white sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2 text-[#ff9b63]">
            <IconFlame className="h-5 w-5" />
            <span className="text-sm font-semibold">{data.vendor.name}</span>
          </div>
          <p className="max-w-3xl text-xs leading-6 text-white/52">
            This link summarizes this service visit from the service provider&apos;s records. Use the PDF copy as the retained copy for files, manager review, insurance, landlord, or documentation requests. A manager, landlord, insurer, or reviewer may still apply their own requirements, and separate corrective or follow-up work needs a separate go-ahead.
          </p>
        </div>
      </footer>

      <div
        className={cx(
          "pdf-print-hide fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-40 mx-auto max-w-[430px] rounded-[22px] border border-white/18 bg-[#111315]/88 p-1 shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-300 lg:hidden print:hidden",
          showMobileDock
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0",
        )}
        aria-hidden={!showMobileDock}
      >
        <div className="grid grid-cols-[1fr_auto] gap-1">
          {primaryCtaHref && primaryCtaEnabled ? (
            <a
              href={primaryCtaHref}
              tabIndex={showMobileDock ? undefined : -1}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[18px] px-3 text-xs font-semibold"
              style={{
                backgroundColor: vendorBrandColor,
                color: vendorAccentContrast,
              }}
              aria-label={primaryCtaLabel}
            >
              <IconClipboardText className="h-4 w-4" />
              {compactPrimaryCtaLabel}
            </a>
          ) : null}
          {pdfServiceRecordHref ? (
            <a
              href={pdfServiceRecordHref}
              tabIndex={showMobileDock ? undefined : -1}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[18px] border border-white/12 bg-white/9 px-3 text-xs font-semibold text-white"
            >
              <IconFileText className="h-4 w-4" />
              PDF copy
            </a>
          ) : (
            <button
              type="button"
              onClick={handleEvidencePdfAction}
              tabIndex={showMobileDock ? undefined : -1}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[18px] border border-white/12 bg-white/9 px-3 text-xs font-semibold text-white"
            >
              <IconFileText className="h-4 w-4" />
              PDF copy
            </button>
          )}
        </div>
      </div>
      <PublicSampleActionNotice
        open={publicSampleNoticeOpen}
        onClose={() => setPublicSampleNoticeOpen(false)}
      />
    </article>
  );
}
