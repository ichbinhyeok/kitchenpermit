"use client";

import Link from "@/components/navigation/static-link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileDown,
  History,
  Mail,
  MessageSquare,
  PencilLine,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { axis1ExceptionOptions } from "@/lib/axis1-packet-builder";
import {
  deleteAxis1ServerReport,
  loadAxis1AccountEntitlements,
  loadAxis1ServerReportHistory,
  type Axis1ServerReportRecord,
} from "@/lib/axis1-server-storage";

const dueSoonWindowDays = 14;

type HistoryViewMode = "queue" | "customers" | "dates";
type ReportSortMode = "attention" | "nextService" | "serviceDate" | "customer";
type SortDirection = "asc" | "desc";
type ReportViewPreset = "attention" | "upcoming" | "recent" | "customers";

const defaultSortDirections: Record<ReportSortMode, SortDirection> = {
  attention: "asc",
  nextService: "asc",
  serviceDate: "desc",
  customer: "asc",
};

function parseDateValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null) {
  const date = parseDateValue(value);

  if (!date) {
    return value || "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatFullDate(value?: string | null) {
  const date = parseDateValue(value);

  if (!date) {
    return value || "date recorded";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatShortDateTime(value?: string | null) {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getDateOnly(value?: string | null) {
  return parseDateValue(value);
}

function daysUntil(value?: string | null) {
  const date = getDateOnly(value);

  if (!date) {
    return null;
  }

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.ceil((date.getTime() - todayOnly.getTime()) / 86_400_000);
}

function getFollowUpStatus(report: Axis1ServerReportRecord) {
  const days = daysUntil(report.nextServiceDate);

  if (days === null) {
    return {
      label: "No next date",
      tone: "neutral",
    } as const;
  }

  if (days < 0) {
    return {
      label: `${Math.abs(days)}d past due`,
      tone: "past-due",
    } as const;
  }

  if (days === 0) {
    return {
      label: "Due today",
      tone: "due",
    } as const;
  }

  if (days <= dueSoonWindowDays) {
    return {
      label: `Due in ${days}d`,
      tone: "due",
    } as const;
  }

  return {
    label: `Next ${formatDate(report.nextServiceDate)}`,
    tone: "scheduled",
  } as const;
}

function getCustomerSiteKey(report: Axis1ServerReportRecord) {
  const customer = report.customerName?.trim() || "Customer";
  const site = report.siteName?.trim() || report.title.trim() || "Service site";

  return `${customer.toLowerCase()}::${site.toLowerCase()}`;
}

function getCustomerSiteLabel(report: Axis1ServerReportRecord) {
  const customer = report.customerName?.trim();
  const site = report.siteName?.trim();

  if (customer && site && customer.toLowerCase() !== site.toLowerCase()) {
    return `${customer} / ${site}`;
  }

  return customer || site || report.title;
}

function getMessageCustomerName(report: Axis1ServerReportRecord) {
  return report.customerName?.trim() || "there";
}

function getMessageSiteName(report: Axis1ServerReportRecord) {
  const site = report.siteName?.trim();
  const customer = report.customerName?.trim();

  if (site && site.toLowerCase() !== customer?.toLowerCase()) {
    return site;
  }

  return report.title?.trim() || "";
}

function getReportActionText(report: Axis1ServerReportRecord) {
  if (report.customerAction?.trim()) {
    return report.customerAction.trim();
  }

  const values = report.payload?.values;
  const override =
    values?.customerActionOverride?.trim() ||
    values?.followUpOverride?.trim() ||
    values?.followUpNote?.trim();

  if (override) {
    return override;
  }

  if (report.nextServiceDate) {
    return `Next service is scheduled for ${formatFullDate(report.nextServiceDate)}.`;
  }

  return "";
}

function getOwnerPreviewReportHref(report: Axis1ServerReportRecord) {
  return buildReportHref(report.href, { preview: true });
}

function getOwnerPreviewReportPdfHref(report: Axis1ServerReportRecord) {
  return buildReportHref(report.href, { format: "pdf", preview: true });
}

function buildReportHref(
  href: string,
  options: { format?: "pdf"; preview?: boolean },
) {
  try {
    const base =
      typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(href, base);

    if (options.format) {
      url.searchParams.set("format", options.format);
    }

    if (options.preview) {
      url.searchParams.set("preview", "1");
    }

    return `${url.pathname}${url.search}`;
  } catch {
    const params = [
      options.format ? `format=${encodeURIComponent(options.format)}` : null,
      options.preview ? "preview=1" : null,
    ].filter(Boolean);

    if (params.length === 0) {
      return href;
    }

    return `${href}${href.includes("?") ? "&" : "?"}${params.join("&")}`;
  }
}

function normalizeActionText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\breply so\b/gi, "contact the service team so")
    .replace(/\breply when\b/gi, "contact the service team when")
    .replace(/\breply if\b/gi, "contact the service team if")
    .replace(/\breply to\b/gi, "contact the service team to")
    .replace(/\breply before\b/gi, "contact the service team before")
    .replace(/\breply after\b/gi, "contact the service team after")
    .replace(/\bnext reply\b/gi, "next response")
    .replace(
      /\bcall after clearing access\b/gi,
      "contact the service team after clearing access",
    )
    .replace(/\bcall service team\b/gi, "contact service team")
    .replace(/\bcall service provider\b/gi, "contact service provider")
    .trim();
}

function compactActionText(value: string) {
  const trimmed = normalizeActionText(value);

  if (trimmed.length <= 150) {
    return trimmed;
  }

  return `${trimmed.slice(0, 147).trim()}...`;
}

function hasOpenItems(report: Axis1ServerReportRecord) {
  if (typeof report.hasOpenItems === "boolean") {
    return report.hasOpenItems;
  }

  const values = report.payload?.values;

  return Boolean(
    values?.scenario === "exception" ||
      values?.exceptionKinds?.length ||
      values?.exceptionNote?.trim() ||
      values?.followUpNote?.trim() ||
      values?.customerActionOverride?.trim() ||
      values?.followUpOverride?.trim(),
  );
}

function getHistoryStatus(report: Axis1ServerReportRecord) {
  if (report.historyStatus?.label) {
    return report.historyStatus;
  }

  const values = report.payload?.values;
  const photoCount = report.assetStorage?.inlinePhotoCount ?? 0;
  const exceptionKinds = values?.exceptionKinds ?? [];
  const hasAccessException =
    values?.scenario === "exception" &&
    exceptionKinds.some((kind) =>
      [
        "blocked-storage",
        "sealed-panel",
        "panel-signage",
        "unsafe-access",
        "not-cleaned",
      ].includes(kind),
    );
  const followUpMode = values?.followUpMode;

  if (hasAccessException) {
    return { code: "open_access", label: "Open access item", tone: "action" } as const;
  }

  if (values?.scenario === "exception") {
    if (followUpMode === "quote") {
      return { code: "quote_review", label: "Quote review", tone: "review" } as const;
    }

    return { code: "monitor_condition", label: "Monitor / review", tone: "review" } as const;
  }

  if (photoCount <= 0) {
    return { code: "written_record", label: "Written record", tone: "record" } as const;
  }

  const actionText = getReportActionText(report).toLowerCase();

  if (/next|service window|schedule|rebook|confirm/.test(actionText)) {
    return { code: "next_service", label: "Next service", tone: "scheduled" } as const;
  }

  return { code: "record_only", label: "Record only", tone: "record" } as const;
}

function getOperationalPriority(report: Axis1ServerReportRecord) {
  const historyStatus = getHistoryStatus(report);
  const days = daysUntil(report.nextServiceDate);

  if (historyStatus.code === "open_access") {
    return 0;
  }

  if (days !== null && days < 0) {
    return 1;
  }

  if (days !== null && days <= dueSoonWindowDays) {
    return 2;
  }

  if (historyStatus.code === "quote_review") {
    return 3;
  }

  if (historyStatus.code === "monitor_condition") {
    return 4;
  }

  if (days !== null) {
    return 5;
  }

  if (getReportActionText(report)) {
    return 6;
  }

  return 7;
}

function getRecommendedContactAction(
  report: Axis1ServerReportRecord,
  options: { compact?: boolean } = {},
) {
  const historyStatus = getHistoryStatus(report);
  const days = daysUntil(report.nextServiceDate);
  const actionText =
    options.compact === false
      ? normalizeActionText(getReportActionText(report))
      : compactActionText(getReportActionText(report));

  if (historyStatus.code === "open_access") {
    return {
      label: "Text customer to clear access",
      copy:
        actionText ||
        "Send the report link and ask the manager to confirm access before the next visit.",
      tone: "urgent",
    } as const;
  }

  if (days !== null && days < 0) {
    return {
      label: "Text customer to rebook service",
      copy: `Next service is ${Math.abs(
        days,
      )} day${Math.abs(days) === 1 ? "" : "s"} past due. Send the report link and ask for a new service date.`,
      tone: "urgent",
    } as const;
  }

  if (days === 0) {
    return {
      label: "Confirm today's service",
      copy: "Send the report link and confirm the next service window with the customer.",
      tone: "due",
    } as const;
  }

  if (days !== null && days <= dueSoonWindowDays) {
    return {
      label: "Confirm upcoming service",
      copy: `Next service is due in ${days} day${
        days === 1 ? "" : "s"
      }. Send the report link and confirm the service window.`,
      tone: "due",
    } as const;
  }

  if (historyStatus.code === "quote_review") {
    return {
      label: "Email quote or review note",
      copy:
        actionText ||
        "Send the report link with the recorded condition and recommended review.",
      tone: "review",
    } as const;
  }

  if (historyStatus.code === "monitor_condition") {
    return {
      label: "Send condition review",
      copy:
        actionText ||
        "Send the report link so the manager has the condition note on file.",
      tone: "review",
    } as const;
  }

  if (report.nextServiceDate) {
    return {
      label: "Keep next service on file",
      copy: `Next service is scheduled for ${formatFullDate(
        report.nextServiceDate,
      )}. Resend the report if the customer asks for records.`,
      tone: "scheduled",
    } as const;
  }

  return {
    label: "Ready to resend",
    copy: "Copy the customer message if the restaurant, landlord, or inspector asks for the record.",
    tone: "record",
  } as const;
}

function compareNumberValues(
  left: number | null,
  right: number | null,
  direction: SortDirection,
) {
  const leftValue =
    left ?? (direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
  const rightValue =
    right ?? (direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
  const result = leftValue - rightValue;

  return direction === "asc" ? result : -result;
}

function compareReportText(left: string, right: string, direction: SortDirection) {
  const result = left.localeCompare(right, "en", { sensitivity: "base" });

  return direction === "asc" ? result : -result;
}

function compareReports(
  left: Axis1ServerReportRecord,
  right: Axis1ServerReportRecord,
  sortMode: ReportSortMode,
  direction: SortDirection,
) {
  if (sortMode === "attention") {
    const result = compareNumberValues(
      getOperationalPriority(left),
      getOperationalPriority(right),
      direction,
    );

    if (result !== 0) {
      return result;
    }
  }

  if (sortMode === "nextService") {
    const result = compareNumberValues(
      getDateOnly(left.nextServiceDate)?.getTime() ?? null,
      getDateOnly(right.nextServiceDate)?.getTime() ?? null,
      direction,
    );

    if (result !== 0) {
      return result;
    }
  }

  if (sortMode === "serviceDate") {
    const result = compareNumberValues(
      getDateOnly(left.serviceDate)?.getTime() ?? null,
      getDateOnly(right.serviceDate)?.getTime() ?? null,
      direction,
    );

    if (result !== 0) {
      return result;
    }
  }

  if (sortMode === "customer") {
    const result = compareReportText(
      getCustomerSiteLabel(left),
      getCustomerSiteLabel(right),
      direction,
    );

    if (result !== 0) {
      return result;
    }
  }

  return compareNumberValues(
    getDateOnly(left.serviceDate)?.getTime() ?? null,
    getDateOnly(right.serviceDate)?.getTime() ?? null,
    "desc",
  );
}

function historyStatusClassName(
  tone?: NonNullable<Axis1ServerReportRecord["historyStatus"]>["tone"],
) {
  if (tone === "action") {
    return "border-[#9a4b35]/30 bg-[#fff3ee] text-[#9a4b35]";
  }

  if (tone === "review") {
    return "border-[#b7791f]/30 bg-[#fff7ed] text-[#9a3412]";
  }

  if (tone === "scheduled") {
    return "border-[#1f7a4d]/24 bg-[#eff8f1] text-[#1f7a4d]";
  }

  return "border-black/10 bg-white text-[#75695f]";
}

function followUpClassName(tone: ReturnType<typeof getFollowUpStatus>["tone"]) {
  if (tone === "past-due") {
    return "border-[#9a4b35]/30 bg-[#fff3ee] text-[#9a4b35]";
  }

  if (tone === "due") {
    return "border-[#f26a21]/30 bg-[#fff7ed] text-[#b45309]";
  }

  if (tone === "scheduled") {
    return "border-[#1f7a4d]/24 bg-[#eff8f1] text-[#1f7a4d]";
  }

  return "border-black/10 bg-white text-[#75695f]";
}

function EngagementSummary({ report }: { report: Axis1ServerReportRecord }) {
  const engagement = report.engagement;
  const viewedAt = formatShortDateTime(engagement?.lastViewedAt);
  const pdfSavedAt = formatShortDateTime(engagement?.lastPdfSaveClickedAt);
  const confirmedAt = formatShortDateTime(engagement?.customerConfirmedAt);
  const viewCount = engagement?.publicViewCount ?? 0;
  const pdfSaveCount = engagement?.pdfSaveClickCount ?? 0;
  const parts = [
    viewCount > 0
      ? `Tracked link opened ${viewCount}x${viewedAt ? ` / ${viewedAt}` : ""}`
      : "No tracked link activity",
    pdfSaveCount > 0
      ? `PDF save clicked ${pdfSaveCount}x${pdfSavedAt ? ` / ${pdfSavedAt}` : ""}`
      : null,
    engagement?.customerConfirmed
      ? `Receipt confirmed${confirmedAt ? ` / ${confirmedAt}` : ""}`
      : null,
  ].filter(Boolean);

  return (
    <p
      className="mt-1 text-[11px] font-semibold leading-5 text-[#8a7d72]"
      title="Tracked link activity shows when the customer link was opened. It is not proof of the recipient's identity. Vendor Preview links are not counted."
      aria-label={`Tracked link activity. ${parts.join(". ")}`}
    >
      {parts.join(" | ")}
    </p>
  );
}

function reportAccentClassName(
  followUpTone: ReturnType<typeof getFollowUpStatus>["tone"],
  historyTone?: NonNullable<Axis1ServerReportRecord["historyStatus"]>["tone"],
) {
  if (historyTone === "action" || followUpTone === "past-due") {
    return "bg-[#9a4b35]";
  }

  if (followUpTone === "due" || historyTone === "review") {
    return "bg-[#f26a21]";
  }

  if (followUpTone === "scheduled" || historyTone === "scheduled") {
    return "bg-[#1f7a4d]";
  }

  return "bg-black/18";
}

function getCustomerReportUrl(report: Axis1ServerReportRecord) {
  if (typeof window === "undefined") {
    return report.href;
  }

  return new URL(report.href, window.location.origin).toString();
}

function buildDeliveryEmailMessage(report: Axis1ServerReportRecord) {
  const customer = getMessageCustomerName(report);
  const site = getMessageSiteName(report);
  const reportUrl = getCustomerReportUrl(report);
  const photoCount = report.assetStorage?.inlinePhotoCount ?? 0;
  const contactAction = getRecommendedContactAction(report, { compact: false });
  const siteCopy = site ? ` for ${site}` : "";
  const photoCopy =
    photoCount > 0
      ? `, ${photoCount} service photo${photoCount === 1 ? "" : "s"}`
      : "";
  const openItemsCopy = hasOpenItems(report)
    ? ", the recorded access item"
    : "";
  const nextCopy = contactAction.copy ? ", and the recommended next step" : "";

  return [
    `Hi ${customer}, we are following up on the hood cleaning visit${siteCopy} from ${formatFullDate(
      report.serviceDate,
    )}.`,
    `Here is the service report for your records:\n${reportUrl}`,
    `It includes the PDF copy${photoCopy}${openItemsCopy}${nextCopy}.`,
    `Recommended next step: ${contactAction.copy}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildDeliverySmsMessage(report: Axis1ServerReportRecord) {
  const customer = getMessageCustomerName(report);
  const site = getMessageSiteName(report);
  const siteCopy = site ? ` for ${site}` : "";
  const contactAction = getRecommendedContactAction(report, { compact: false });
  const nextCopy = contactAction.copy ? ` Next step: ${contactAction.copy}` : "";

  return `Hi ${customer}, following up on the hood cleaning visit${siteCopy}. Report/PDF for your records: ${getCustomerReportUrl(report)}${nextCopy}`;
}

function copyTextWithTextarea(text: string) {
  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);

    if (selection && previousRange) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }

  return copied;
}

async function copyTextToClipboard(text: string) {
  if (copyTextWithTextarea(text)) {
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  throw new Error("Clipboard unavailable");
}

function getReportSummary(report: Axis1ServerReportRecord) {
  const photoCount = report.assetStorage?.inlinePhotoCount ?? 0;
  const plan = report.productPlan === "company" ? "Company record" : "Free test";
  const photoCopy =
    photoCount > 0 ? `${photoCount} photo${photoCount === 1 ? "" : "s"}` : "No photos";

  return `${plan} / ${photoCopy} / saved ${formatDate(report.createdAt)}`;
}

function getFreeTestExpirationLabel(report: Axis1ServerReportRecord) {
  const days = daysUntil(report.expiresAt);

  if (days === null) {
    return "7-day test";
  }

  if (days < 0) {
    return "Expired";
  }

  if (days === 0) {
    return "Expires today";
  }

  return `Expires in ${days}d`;
}

function getCompanyCopyToolHref(report: Axis1ServerReportRecord) {
  const url = new URL("/axis-1/tool", "https://kitchenpermit.local");
  url.searchParams.set("step", "outputs");
  url.searchParams.set("account", "company");
  url.searchParams.set("loadReport", report.publicId);
  url.searchParams.set("copy", "company");
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function getExceptionLabels(report: Axis1ServerReportRecord) {
  const kinds = report.payload?.values?.exceptionKinds ?? [];
  const labels: string[] = [];

  kinds.forEach((kind) => {
    const label = axis1ExceptionOptions.find(
      (option) => option.value === kind,
    )?.label;

    if (label) {
      labels.push(label);
    }
  });

  return labels;
}

function getWorkMemory(report: Axis1ServerReportRecord) {
  const values = report.payload?.values;
  const systemName = values?.systemName?.trim() || report.siteName?.trim();
  const summaryOverride = values?.summaryOverride?.trim();
  const exceptionLabels = getExceptionLabels(report);
  const photoCount = report.assetStorage?.inlinePhotoCount ?? 0;

  if (summaryOverride) {
    return compactActionText(summaryOverride);
  }

  if (values?.scenario === "exception") {
    const exceptionCopy =
      exceptionLabels.length > 0
        ? `open item: ${exceptionLabels.slice(0, 2).join(", ")}`
        : "open item recorded";
    const systemCopy = systemName ? `${systemName} / ` : "";

    return `${systemCopy}service recorded with ${exceptionCopy}.`;
  }

  if (systemName) {
    return `${systemName} / accessible hood line and filters recorded.`;
  }

  if (photoCount > 0) {
    return `Service record saved with ${photoCount} photo${
      photoCount === 1 ? "" : "s"
    }.`;
  }

  return "Service record saved for restaurant documentation.";
}

function ReportActions({
  report,
  companyAccess,
  onCopy,
  onCopyLink,
  onDelete,
}: {
  report: Axis1ServerReportRecord;
  companyAccess: boolean;
  onCopy: (report: Axis1ServerReportRecord, format: "email" | "sms") => void;
  onCopyLink: (report: Axis1ServerReportRecord) => void;
  onDelete: (report: Axis1ServerReportRecord) => void;
}) {
  const primaryActionClassName =
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-[10px] font-black uppercase transition";
  const secondaryActionClassName =
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[10px] font-black uppercase transition";
  const isFreeTestReport = report.productPlan === "free";

  if (isFreeTestReport) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
        <button
          type="button"
          onClick={() => onCopyLink(report)}
          className={`${primaryActionClassName} border-[#111315] bg-[#111315] text-white hover:bg-[#2b241f]`}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy test link
        </button>
        <Link
          href={getOwnerPreviewReportHref(report)}
          className={`${secondaryActionClassName} border-black/10 bg-white text-[#111315] hover:bg-[#fbf7ef]`}
          title="Open the temporary free test report"
          aria-label={`Open free test report for ${report.title}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </Link>
        <Link
          href={report.toolHref}
          className={`${secondaryActionClassName} border-[#f26a21]/25 bg-[#fff7ef] text-[#b94d11] hover:bg-white`}
          title="Use this free test as a starting point"
          aria-label={`Edit free test report for ${report.title}`}
        >
          <PencilLine className="h-3.5 w-3.5" />
          Edit test
        </Link>
        <Link
          href={companyAccess ? getCompanyCopyToolHref(report) : "/company-version"}
          className={`${secondaryActionClassName} border-[#1f7a4d]/24 bg-[#eff8f1] text-[#1f7a4d] hover:bg-white`}
          title={
            companyAccess
              ? "Open the test, then save a company version"
              : "Upgrade to create a branded company copy"
          }
          aria-label={`Create company copy for ${report.title}`}
        >
          <FileDown className="h-3.5 w-3.5" />
          Company copy
        </Link>
        <button
          type="button"
          onClick={() => onDelete(report)}
          className="inline-flex min-h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#9a4b35]/72 transition hover:border-[#9a4b35]/22 hover:bg-[#fff3ee] hover:text-[#9a4b35]"
          title="Remove free test report"
          aria-label={`Remove ${report.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
      <button
        type="button"
        onClick={() => onCopy(report, "sms")}
        className={`${primaryActionClassName} border-[#1f7a4d]/24 bg-[#1f7a4d] text-white hover:bg-[#185f3c]`}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Text
      </button>
      <button
        type="button"
        onClick={() => onCopy(report, "email")}
        className={`${secondaryActionClassName} border-black/10 bg-white text-[#111315] hover:bg-[#fbf7ef]`}
        title="Copy email message"
        aria-label={`Copy email message for ${report.title}`}
      >
        <Mail className="h-3.5 w-3.5" />
        Email
      </button>
      <Link
        href={getOwnerPreviewReportHref(report)}
        className={`${secondaryActionClassName} border-[#111315] bg-[#111315] text-white hover:bg-[#2b241f]`}
        title="Preview customer report without counting link activity"
        aria-label={`Preview customer report for ${report.title}`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Preview
      </Link>
      <Link
        href={getOwnerPreviewReportPdfHref(report)}
        className={`${secondaryActionClassName} border-black/10 bg-white text-[#111315] hover:bg-[#fbf7ef]`}
        title="Preview PDF copy without counting save activity"
        aria-label={`Preview PDF copy for ${report.title}`}
      >
        <FileDown className="h-3.5 w-3.5" />
        PDF
      </Link>
      <Link
        href={report.toolHref}
        className={`${secondaryActionClassName} border-[#f26a21]/25 bg-[#fff7ef] text-[#b94d11] hover:bg-white`}
        title="Edit report"
        aria-label={`Edit ${report.title}`}
      >
        <PencilLine className="h-3.5 w-3.5" />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onDelete(report)}
        className="inline-flex min-h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#9a4b35]/72 transition hover:border-[#9a4b35]/22 hover:bg-[#fff3ee] hover:text-[#9a4b35]"
        title="Remove report"
        aria-label={`Remove ${report.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ReportListHeader() {
  return (
    <div className="hidden border-b border-black/10 bg-[#eee6db] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#7b6f65] lg:grid lg:grid-cols-[minmax(260px,1.18fr)_minmax(150px,0.62fr)_minmax(160px,0.72fr)_minmax(230px,0.95fr)_auto] lg:items-center">
      <span>Customer / work</span>
      <span>Status</span>
      <span>Next date</span>
      <span>Operator action</span>
      <span className="text-right">Send / record</span>
    </div>
  );
}

function FreeTestReportListHeader() {
  return (
    <div className="hidden border-b border-black/10 bg-[#eee6db] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#7b6f65] lg:grid lg:grid-cols-[minmax(260px,1.18fr)_minmax(150px,0.62fr)_minmax(160px,0.72fr)_minmax(230px,0.95fr)_auto] lg:items-center">
      <span>Test report</span>
      <span>Status</span>
      <span>Expires</span>
      <span>Next step</span>
      <span className="text-right">Test actions</span>
    </div>
  );
}

function ReportRow({
  report,
  compact = false,
  companyAccess,
  onCopy,
  onCopyLink,
  onDelete,
}: {
  report: Axis1ServerReportRecord;
  compact?: boolean;
  companyAccess: boolean;
  onCopy: (report: Axis1ServerReportRecord, format: "email" | "sms") => void;
  onCopyLink: (report: Axis1ServerReportRecord) => void;
  onDelete: (report: Axis1ServerReportRecord) => void;
}) {
  const followUp = getFollowUpStatus(report);
  const historyStatus = getHistoryStatus(report);
  const accentClassName = reportAccentClassName(followUp.tone, historyStatus.tone);
  const contactAction = getRecommendedContactAction(report);
  const workMemory = getWorkMemory(report);
  const isFreeTestReport = report.productPlan === "free";

  return (
    <article className="group relative border-b border-black/10 bg-[#fffdf9]/90 px-3 py-3 transition hover:bg-white sm:px-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.18fr)_minmax(150px,0.62fr)_minmax(160px,0.72fr)_minmax(230px,0.95fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${accentClassName}`}
            />
            <span className="font-mono text-[11px] uppercase text-[#7b6f65]">
              {formatDate(report.serviceDate)}
            </span>
          </div>
          <h3 className="mt-2 truncate text-base font-black tracking-[-0.025em]">
            {compact ? report.title : getCustomerSiteLabel(report)}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs font-black leading-5 text-[#3f3832]">
            {workMemory}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#75695f]">
            {getReportSummary(report)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 lg:grid lg:gap-1">
          {isFreeTestReport ? (
            <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-[#f26a21]/24 bg-[#fff7ef] px-2.5 text-[10px] font-black uppercase text-[#b94d11]">
              Temporary test
            </span>
          ) : (
            <span
              className={`inline-flex min-h-7 items-center justify-center rounded-full border px-2.5 text-[10px] font-black uppercase ${followUpClassName(
                followUp.tone,
              )}`}
            >
              {followUp.label}
            </span>
          )}
          <span
            className={`inline-flex min-h-7 items-center justify-center rounded-full border px-2.5 text-[10px] font-black uppercase ${historyStatusClassName(
              historyStatus.tone,
            )}`}
          >
            {historyStatus.label}
          </span>
          {isFreeTestReport ? (
            <p className="mt-1 text-[11px] font-semibold leading-5 text-[#8a7d72]">
              Not a retained company record.
            </p>
          ) : (
            <EngagementSummary report={report} />
          )}
        </div>

        <div className="text-xs font-semibold leading-5 text-[#5f574f]">
          {isFreeTestReport ? (
            <span className="font-black text-[#111315]">
              {getFreeTestExpirationLabel(report)}
            </span>
          ) : report.nextServiceDate ? (
            <>
              <span className="font-black text-[#111315]">
                {formatFullDate(report.nextServiceDate)}
              </span>
            </>
          ) : (
            <span>No next date recorded</span>
          )}
        </div>

        <p className="text-xs font-semibold leading-5 text-[#5f574f]">
          {isFreeTestReport ? (
            <>
              <span className="font-black text-[#111315]">Upgrade path:</span>{" "}
              Create a clean company copy when this should go to a customer.
            </>
          ) : (
            <>
              <span className="font-black text-[#111315]">Next step:</span>{" "}
              {contactAction.label}
            </>
          )}
        </p>

        <ReportActions
          report={report}
          companyAccess={companyAccess}
          onCopy={onCopy}
          onCopyLink={onCopyLink}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

export function ReportHistoryPanel() {
  const [reports, setReports] = useState<Axis1ServerReportRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "locked" | "error">(
    "loading",
  );
  const [viewMode, setViewMode] = useState<HistoryViewMode>("queue");
  const [sortMode, setSortMode] = useState<ReportSortMode>("attention");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [activePreset, setActivePreset] =
    useState<ReportViewPreset>("attention");
  const [companyAccess, setCompanyAccess] = useState(false);

  const reportGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        label: string;
        reports: Axis1ServerReportRecord[];
      }
    >();

    reports.forEach((report) => {
      const key = getCustomerSiteKey(report);
      const existing = groups.get(key);

      if (existing) {
        existing.reports.push(report);
        return;
      }

      groups.set(key, {
        key,
        label: getCustomerSiteLabel(report),
        reports: [report],
      });
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        reports: group.reports.sort(
          (a, b) =>
            (getDateOnly(b.serviceDate)?.getTime() ?? 0) -
            (getDateOnly(a.serviceDate)?.getTime() ?? 0),
        ),
      }))
      .sort(
        (a, b) =>
          (getDateOnly(b.reports[0]?.serviceDate)?.getTime() ?? 0) -
          (getDateOnly(a.reports[0]?.serviceDate)?.getTime() ?? 0),
      );
  }, [reports]);

  const dateSortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) => compareReports(a, b, sortMode, sortDirection),
    );
  }, [reports, sortDirection, sortMode]);

  const sortedReportGroups = useMemo(() => {
    return reportGroups
      .map((group) => ({
        ...group,
        reports: [...group.reports].sort((a, b) =>
          compareReports(a, b, sortMode, sortDirection),
        ),
      }))
      .sort((a, b) => {
        if (sortMode === "customer") {
          const result = compareReportText(a.label, b.label, sortDirection);

          if (result !== 0) {
            return result;
          }
        }

        const leftReport = a.reports[0];
        const rightReport = b.reports[0];

        if (!leftReport || !rightReport) {
          return leftReport ? -1 : rightReport ? 1 : 0;
        }

        return compareReports(leftReport, rightReport, sortMode, sortDirection);
      });
  }, [reportGroups, sortDirection, sortMode]);

  const followUpQueue = useMemo(() => {
    return reports
      .map((report) => {
        const followUp = getFollowUpStatus(report);
        const historyStatus = getHistoryStatus(report);
        const actionText = getReportActionText(report);
        const days = daysUntil(report.nextServiceDate);
        const hasOperationalItem =
          historyStatus.code === "open_access" ||
          historyStatus.code === "quote_review" ||
          historyStatus.code === "monitor_condition" ||
          Boolean(report.nextServiceDate) ||
          Boolean(actionText);

        if (!hasOperationalItem) {
          return null;
        }

        const priority =
          historyStatus.code === "open_access"
            ? 0
            : days !== null && days < 0
              ? 1
              : days !== null && days <= dueSoonWindowDays
                ? 2
                : historyStatus.code === "quote_review"
                  ? 3
                  : historyStatus.code === "monitor_condition"
                    ? 4
                    : days !== null
                      ? 5
                      : 6;

        return {
          report,
          followUp,
          historyStatus,
          actionText,
          days,
          priority,
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null)
      .sort((a, b) => compareReports(a.report, b.report, sortMode, sortDirection));
  }, [reports, sortDirection, sortMode]);

  const stats = useMemo(() => {
    const pastDueCount = reports.filter(
      (report) => (daysUntil(report.nextServiceDate) ?? 1) < 0,
    ).length;
    const upcomingCount = reports.filter((report) => {
      const days = daysUntil(report.nextServiceDate);

      return days !== null && days >= 0 && days <= dueSoonWindowDays;
    }).length;
    const openItemCount = reports.filter((report) => {
      const status = getHistoryStatus(report);

      return (
        status.code === "open_access" ||
        status.code === "quote_review" ||
        status.code === "monitor_condition" ||
        hasOpenItems(report)
      );
    }).length;

    return [
      {
        label: "Reports",
        value: reports.length,
        icon: History,
      },
      {
        label: "Customers",
        value: reportGroups.length,
        icon: Users,
      },
      {
        label: "Due soon",
        value: upcomingCount,
        icon: CalendarClock,
      },
      {
        label: "Open items",
        value: openItemCount + pastDueCount,
        icon: AlertCircle,
      },
    ];
  }, [reportGroups.length, reports]);

  useEffect(() => {
    let cancelled = false;

    loadAxis1AccountEntitlements()
      .then((entitlements) => {
        setCompanyAccess(entitlements.companyAccess);

        if (!entitlements.authenticated) {
          return null;
        }

        return loadAxis1ServerReportHistory();
      })
      .then((nextReports) => {
        if (cancelled) {
          return;
        }

        if (nextReports === null) {
          setReports([]);
          setStatus("locked");
          return;
        }

        setReports(nextReports);
        setStatus(nextReports.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function deleteReport(report: Axis1ServerReportRecord) {
    const confirmed = window.confirm(
      report.productPlan === "free"
        ? `Remove "${report.title}" from free test reports and turn off its 7-day link?`
        : `Remove "${report.title}" from history and turn off its hosted customer link?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAxis1ServerReport(report.publicId);
      const nextReports = reports.filter(
        (item) => item.publicId !== report.publicId,
      );
      setReports(nextReports);
      setStatus(nextReports.length > 0 ? "ready" : "empty");
      toast.success("Report removed", {
        description: "The hosted link will no longer resolve.",
      });
    } catch {
      toast.error("Could not remove report", {
        description: "Check your login session and try again.",
      });
    }
  }

  async function copyReportLink(report: Axis1ServerReportRecord) {
    try {
      await copyTextToClipboard(getCustomerReportUrl(report));
      toast.success(
        report.productPlan === "free"
          ? "Free test link copied"
          : "Customer link copied",
        {
          description:
            report.productPlan === "free"
              ? "This is a temporary 7-day test link, not a retained company report."
              : "Paste it into the message you send to the customer.",
        },
      );
    } catch {
      toast.error("Could not copy link", {
        description: "Open the report and copy the URL manually.",
      });
    }
  }

  async function copyDeliveryMessage(
    report: Axis1ServerReportRecord,
    format: "email" | "sms",
  ) {
    try {
      await copyTextToClipboard(
        format === "email"
          ? buildDeliveryEmailMessage(report)
          : buildDeliverySmsMessage(report),
      );
      toast.success(format === "email" ? "Email message copied" : "Text message copied", {
        description:
          format === "email"
            ? "Paste it into the email you send from your normal inbox."
            : "Paste it into the text you send from your normal phone or messaging app.",
      });
    } catch {
      toast.error("Could not copy message", {
        description: "Open the customer link and copy it manually.",
      });
    }
  }

  const viewPresets = [
    {
      key: "attention",
      label: "Needs attention",
      copy: "Open items and past-due work first",
      count: followUpQueue.length,
      viewMode: "queue",
      sortMode: "attention",
    },
    {
      key: "upcoming",
      label: "Upcoming service",
      copy: "Next scheduled dates first",
      count: followUpQueue.length,
      viewMode: "queue",
      sortMode: "nextService",
    },
    {
      key: "recent",
      label: "Recent reports",
      copy: "Latest service records first",
      count: reports.length,
      viewMode: "dates",
      sortMode: "serviceDate",
    },
    {
      key: "customers",
      label: "Customers",
      copy: "Grouped by restaurant or site",
      count: reportGroups.length,
      viewMode: "customers",
      sortMode: "customer",
    },
  ] as const satisfies ReadonlyArray<{
    key: ReportViewPreset;
    label: string;
    copy: string;
    count: number;
    viewMode: HistoryViewMode;
    sortMode: ReportSortMode;
  }>;
  function selectViewPreset(preset: (typeof viewPresets)[number]) {
    setActivePreset(preset.key);
    setViewMode(preset.viewMode);
    setSortMode(preset.sortMode);
    setSortDirection(defaultSortDirections[preset.sortMode]);
  }

  useEffect(() => {
    function applyHashTarget() {
      if (
        window.location.hash === "#next-service-queue" ||
        window.location.hash === "#next-dates"
      ) {
        setActivePreset("upcoming");
        setViewMode("queue");
        setSortMode("nextService");
        setSortDirection(defaultSortDirections.nextService);
      }
    }

    applyHashTarget();
    window.addEventListener("hashchange", applyHashTarget);

    return () => {
      window.removeEventListener("hashchange", applyHashTarget);
    };
  }, []);

  return (
    <div
      id="report-history"
      className="scroll-mt-4 bg-[#fffaf2] sm:scroll-mt-6"
    >
      <div className="border-b border-black/10 bg-[#fffaf2] px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#7b6f65]">
              {companyAccess ? "Service records" : "Free test reports"}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">
              {companyAccess
                ? "Follow-ups, links, and saved reports"
                : "Temporary reports saved for 7 days"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#6f665e]">
              {companyAccess
                ? "See what needs attention, resend customer records, open PDF copies, or edit a previous report."
                : "Logged-in free reports stay here as test copies so the first report is not lost before upgrading."}
            </p>
            <p className="mt-1 max-w-2xl text-[11px] font-semibold leading-5 text-[#8a7d72]">
              {companyAccess
                ? "Tracked link activity shows when the customer link was opened. It is not proof of the recipient's identity; vendor Preview links are not counted."
                : "Free test reports are unbranded, watermarked, and temporary. Company reports are branded, retained, and saved to customer history."}
            </p>
          </div>
          <Link
            href="/axis-1/tool"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#111315] bg-[#111315] px-4 text-[11px] font-black uppercase text-white transition hover:bg-[#2b241f]"
          >
            <FileDown className="h-3.5 w-3.5" />
            New report
          </Link>
        </div>

        {status === "ready" && companyAccess ? (
          <div className="mt-3 grid gap-2 border-y border-black/10 py-2 sm:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex min-h-9 items-center gap-2 border-black/10 sm:border-r sm:pr-4 sm:last:border-r-0"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#f26a21]" />
                  <p className="text-xl font-black tracking-[-0.04em]">
                    {item.value}
                  </p>
                  <p className="text-[10px] font-black uppercase text-[#7b6f65]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {status === "ready" && companyAccess ? (
          <div className="mt-3 border-t border-black/10 pt-3">
            <div
              className="flex flex-wrap gap-2"
              aria-label="Report list presets"
            >
              {viewPresets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => selectViewPreset(preset)}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-[11px] font-black uppercase transition ${
                    activePreset === preset.key
                      ? "border-[#111315] bg-[#111315] text-white"
                      : "border-black/10 bg-white/72 text-[#75695f] hover:border-black/24 hover:text-[#111315]"
                  }`}
                >
                  {preset.label}
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                      activePreset === preset.key
                        ? "bg-white text-[#111315]"
                        : "bg-black/[0.06] text-[#75695f]"
                    }`}
                  >
                    {preset.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div id="next-service-queue" className="scroll-mt-4 sm:scroll-mt-6" />

      {status === "loading" ? (
        <div className="p-5 text-sm font-semibold leading-6 text-[#75695f]">
          Loading saved reports...
        </div>
      ) : null}

      {status === "empty" ? (
        <div className="p-5 text-sm font-semibold leading-6 text-[#75695f]">
          {companyAccess
            ? "No saved company reports yet. Build a company report and it will appear here with the customer link, PDF copy, next service date, and resend text."
            : "No free test reports saved yet. Build a free report while logged in and the temporary 7-day test copy will appear here."}
        </div>
      ) : null}

      {status === "locked" ? (
        <div className="p-5 text-sm font-semibold leading-6 text-[#75695f]">
          Sign in to keep free test reports for 7 days. Company history, retained
          links, clean PDFs, and next-service queues unlock with the company version.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="p-5 text-sm font-semibold leading-6 text-[#75695f]">
          Could not load report history. Sign in again or contact support if it
          keeps happening.
        </div>
      ) : null}

      {status === "ready" && !companyAccess ? (
        <div>
          <FreeTestReportListHeader />
          {dateSortedReports.map((report) => (
            <ReportRow
              key={`free-test-${report.publicId}`}
              report={report}
              companyAccess={companyAccess}
              onCopy={(item, format) => void copyDeliveryMessage(item, format)}
              onCopyLink={(item) => void copyReportLink(item)}
              onDelete={(item) => void deleteReport(item)}
            />
          ))}
        </div>
      ) : null}

      {status === "ready" && companyAccess && viewMode === "queue" ? (
        <div>
          {followUpQueue.length > 0 ? (
            <>
              <ReportListHeader />
              {followUpQueue.map(({ report }) => (
                <ReportRow
                  key={`queue-${report.publicId}`}
                  report={report}
                  companyAccess={companyAccess}
                  onCopy={(item, format) => void copyDeliveryMessage(item, format)}
                  onCopyLink={(item) => void copyReportLink(item)}
                  onDelete={(item) => void deleteReport(item)}
                />
              ))}
            </>
          ) : (
            <div className="p-5 text-sm font-semibold leading-6 text-[#75695f]">
              No next service dates or open items yet. Reports without a follow-up
              still live under Customers and Date list.
            </div>
          )}
        </div>
      ) : null}

      {status === "ready" && companyAccess && viewMode === "customers" ? (
        <div className="divide-y divide-black/10">
          {sortedReportGroups.map((group) => (
            <section key={group.key} className="bg-[#fffdf9]">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#eee6db] px-3 py-3 sm:px-4">
                <div>
                  <h3 className="text-sm font-black tracking-[-0.025em]">
                    {group.label}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[#75695f]">
                    {group.reports.length} saved report
                    {group.reports.length === 1 ? "" : "s"} / latest service{" "}
                    {formatDate(group.reports[0]?.serviceDate)}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-[#1f7a4d]" />
              </div>
              <ReportListHeader />
              {group.reports.map((report) => (
                <ReportRow
                  key={report.publicId}
                  report={report}
                  compact
                  companyAccess={companyAccess}
                  onCopy={(item, format) => void copyDeliveryMessage(item, format)}
                  onCopyLink={(item) => void copyReportLink(item)}
                  onDelete={(item) => void deleteReport(item)}
                />
              ))}
            </section>
          ))}
        </div>
      ) : null}

      {status === "ready" && companyAccess && viewMode === "dates" ? (
        <div>
          <ReportListHeader />
          {dateSortedReports.map((report) => (
            <ReportRow
              key={`date-${report.publicId}`}
              report={report}
              companyAccess={companyAccess}
              onCopy={(item, format) => void copyDeliveryMessage(item, format)}
              onCopyLink={(item) => void copyReportLink(item)}
              onDelete={(item) => void deleteReport(item)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
