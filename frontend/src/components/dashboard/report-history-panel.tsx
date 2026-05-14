"use client";

import Link from "@/components/navigation/static-link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  History,
  Mail,
  MessageSquare,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteAxis1ServerReport,
  loadAxis1AccountEntitlements,
  loadAxis1ServerReportHistory,
  type Axis1ServerReportRecord,
} from "@/lib/axis1-server-storage";

const dueSoonWindowDays = 14;

function formatDate(value?: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatFullDate(value?: string | null) {
  if (!value) {
    return "date recorded";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDateOnly(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
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
      label: "No follow-up date",
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
  const actionText = getReportActionText(report);
  const siteCopy = site ? ` for ${site}` : "";
  const photoCopy =
    photoCount > 0
      ? `, ${photoCount} service photo${photoCount === 1 ? "" : "s"}`
      : "";
  const openItemsCopy = hasOpenItems(report) ? ", any open items from the visit" : "";
  const nextCopy =
    actionText || report.nextServiceDate ? ", and the recommended next step" : "";

  return [
    `Hi ${customer}, we finished the hood cleaning visit${siteCopy} on ${formatFullDate(
      report.serviceDate,
    )}.`,
    `Here is the service report for your records:\n${reportUrl}`,
    `It includes the PDF copy${photoCopy}${openItemsCopy}${nextCopy}.`,
    actionText ? `Recommended next step: ${actionText}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildDeliverySmsMessage(report: Axis1ServerReportRecord) {
  const customer = getMessageCustomerName(report);
  const site = getMessageSiteName(report);
  const siteCopy = site ? ` for ${site}` : "";
  const actionText = getReportActionText(report);
  const nextCopy = actionText ? ` Next step: ${actionText}` : "";

  return `Hi ${customer}, we finished the hood cleaning visit${siteCopy}. Report/PDF for your records: ${getCustomerReportUrl(report)}${nextCopy}`;
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ReportHistoryPanel() {
  const [reports, setReports] = useState<Axis1ServerReportRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "locked" | "error">(
    "loading",
  );

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

    return Array.from(groups.values()).map((group) => ({
      ...group,
      reports: group.reports.sort(
        (a, b) =>
          (getDateOnly(b.serviceDate)?.getTime() ?? 0) -
          (getDateOnly(a.serviceDate)?.getTime() ?? 0),
      ),
    }));
  }, [reports]);

  const stats = useMemo(() => {
    const pastDueCount = reports.filter(
      (report) => (daysUntil(report.nextServiceDate) ?? 1) < 0,
    ).length;
    const upcomingCount = reports.filter((report) => {
      const days = daysUntil(report.nextServiceDate);

      return days !== null && days >= 0 && days <= dueSoonWindowDays;
    }).length;

    return [
      {
        label: "Reports",
        value: reports.length,
        icon: History,
      },
      {
        label: "Customers / sites",
        value: reportGroups.length,
        icon: Users,
      },
      {
        label: "Due soon",
        value: upcomingCount,
        icon: CalendarClock,
      },
      {
        label: "Past due",
        value: pastDueCount,
        icon: AlertCircle,
      },
    ];
  }, [reportGroups.length, reports]);

  useEffect(() => {
    let cancelled = false;

    loadAxis1AccountEntitlements()
      .then((entitlements) => {
        if (!entitlements.companyAccess) {
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
      `Remove "${report.title}" from history and turn off its hosted customer link?`,
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
            ? "Paste it into the message you send the customer."
            : "Paste it into a text message.",
      });
    } catch {
      toast.error("Could not copy message", {
        description: "Open the customer link and copy it manually.",
      });
    }
  }

  return (
    <div
      id="report-history"
      className="rounded-[32px] border border-black/8 bg-white p-5 shadow-[0_24px_80px_rgba(26,20,16,0.08)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#7b6f65]">
            Report history
          </p>
          <h2 className="mt-3 font-display text-[2.4rem] font-bold leading-[0.9] tracking-[-0.07em]">
            Saved reports to resend.
          </h2>
        </div>
        <History className="h-6 w-6 shrink-0 text-[#f26a21]" />
      </div>

      {status === "ready" ? (
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-black/10 bg-[#fbf8f3] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7b6f65]">
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 text-[#f26a21]" />
                </div>
                <p className="mt-2 text-2xl font-black tracking-[-0.05em]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
        {status === "loading" ? (
          <div className="py-4 text-sm font-semibold leading-6 text-[#75695f]">
            Loading saved reports...
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="py-4 text-sm font-semibold leading-6 text-[#75695f]">
            No saved company reports yet. Build a company report and it will appear here.
          </div>
        ) : null}

        {status === "locked" ? (
          <div className="py-4 text-sm font-semibold leading-6 text-[#75695f]">
            Report history unlocks with the company version. Free test links are
            not saved to account history.
          </div>
        ) : null}

        {status === "error" ? (
          <div className="py-4 text-sm font-semibold leading-6 text-[#75695f]">
            Could not load report history. Sign in again or contact support if it keeps happening.
          </div>
        ) : null}

        {reportGroups.map((group) => (
          <div key={group.key} className="py-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black tracking-[-0.03em]">
                  {group.label}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[#75695f]">
                  {group.reports.length} saved report
                  {group.reports.length === 1 ? "" : "s"} for this customer/site
                </p>
              </div>
              <p className="rounded-full border border-black/10 bg-[#fbf8f3] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#75695f]">
                Last service {formatDate(group.reports[0]?.serviceDate)}
              </p>
            </div>

            <div className="space-y-2">
              {group.reports.map((report) => {
                const followUp = getFollowUpStatus(report);
                const followUpClassName =
                  followUp.tone === "past-due"
                    ? "border-[#9a4b35]/30 bg-[#fff3ee] text-[#9a4b35]"
                    : followUp.tone === "due"
                      ? "border-[#f26a21]/30 bg-[#fff7ed] text-[#b45309]"
                      : "border-black/10 bg-white text-[#75695f]";

                return (
                  <div
                    key={report.publicId}
                    className="grid gap-3 rounded-2xl border border-black/10 bg-white p-3 sm:grid-cols-[0.18fr_1fr_auto] sm:items-center"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
                      {formatDate(report.serviceDate)}
                    </p>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black tracking-[-0.03em]">
                          {report.title}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${followUpClassName}`}
                        >
                          {followUp.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#75695f]">
                        {report.productPlan === "company" ? "Company" : "Free"} /{" "}
                        {hasOpenItems(report) ? "Open items recorded" : "Record only"} /{" "}
                        {(report.assetStorage?.inlinePhotoCount ?? 0) > 0
                          ? `${report.assetStorage?.inlinePhotoCount} photo${
                              report.assetStorage?.inlinePhotoCount === 1 ? "" : "s"
                            }`
                          : "No photos saved"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      <div className="flex flex-wrap gap-1.5 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => void copyDeliveryMessage(report, "sms")}
                          className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[#1f7a4d]/20 bg-[#eff8f1] px-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#1f7a4d] transition hover:bg-[#e4f3e8]"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Copy text
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyDeliveryMessage(report, "email")}
                          className="inline-flex min-h-8 items-center gap-1 rounded-full border border-black/10 bg-[#fbf8f3] px-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#111315] transition hover:bg-white"
                        >
                          <Mail className="h-3 w-3" />
                          Copy email
                        </button>
                      </div>
                      <Link
                        href={report.toolHref}
                        className="inline-flex items-center justify-end gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#f26a21]"
                      >
                        Edit report
                        <CheckCircle2 className="h-4 w-4 text-[#1f7a4d]" />
                      </Link>
                      <Link
                        href={report.href}
                        className="text-[10px] font-black uppercase tracking-[0.14em] text-[#75695f] underline-offset-4 hover:underline"
                      >
                        Open customer link
                      </Link>
                      <button
                        type="button"
                        onClick={() => void deleteReport(report)}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#9a4b35] underline-offset-4 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
