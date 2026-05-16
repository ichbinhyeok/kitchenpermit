import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export type SeoResourcePageData = {
  slug: string;
  path: string;
  metaTitle: string;
  title: string;
  description: string;
  label: string;
  summary: string;
  primaryAction: string;
  primaryHref: string;
  sections: readonly {
    title: string;
    copy: string;
  }[];
  checklistTitle: string;
  checklist: readonly string[];
  templateTitle: string;
  templateRows: readonly (readonly [string, string])[];
  copyBlock: string;
  related: readonly {
    href: string;
    label: string;
  }[];
};

const lastModified = "2026-05-16";

export function canonicalUrl(path: string) {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  return path === "/" ? baseUrl : `${baseUrl}${path}`;
}

export function publicPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(path),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function noIndexMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    ...(path
      ? {
          alternates: {
            canonical: canonicalUrl(path),
          },
        }
      : {}),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const seoResourcePages = [
  {
    slug: "hood-cleaning-service-report-template",
    path: "/hood-cleaning-service-report-template",
    metaTitle: "Hood Cleaning Service Report Template",
    title: "Hood cleaning service report template",
    description:
      "A field-ready service report structure for hood cleaning vendors: work result, photos, open items, next action, and PDF record.",
    label: "Template",
    summary:
      "Use this structure when a restaurant needs one plain-English record after a hood cleaning visit, instead of loose photos, technician shorthand, and a separate follow-up email.",
    primaryAction: "Build a free report",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Start with the service result",
        copy:
          "Lead with what was completed today, then separate any blocked access, condition notes, or follow-up work so the customer does not have to decode the visit.",
      },
      {
        title: "Attach proof to the right area",
        copy:
          "Group photos by hood canopy, filters, duct or access point, fan area, grease path, and service label so the record reads like an inspection file.",
      },
      {
        title: "End with the next action",
        copy:
          "A report should close with the next service window, an open access request, or a clear customer action instead of ending with a generic thank-you note.",
      },
    ],
    checklistTitle: "Minimum fields",
    checklist: [
      "Customer or property name",
      "Service date and technician or crew reference",
      "Completed work summary",
      "Before and after photo groups",
      "Open items or blocked access",
      "Next service window or customer action",
      "Company contact and PDF copy",
    ],
    templateTitle: "Report outline",
    templateRows: [
      ["Job details", "Location, date, crew, service type, and reference number."],
      ["Today's result", "What was cleaned and what the customer can consider complete."],
      ["Photo evidence", "Before and after photos grouped by system area."],
      ["Open items", "Blocked access, unreachable areas, or condition records."],
      ["Next step", "Recommended service window or customer action."],
      ["Saved record", "Customer link and PDF copy for restaurant files."],
    ],
    copyBlock:
      "Today's hood cleaning service is complete for the reachable areas listed in this report. Photos are grouped by system area, and any open access or condition notes are separated below so your team can see what needs attention before the next visit.",
    related: [
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/blocked-access-service-report-template", label: "Blocked access template" },
      { href: "/axis-1/tool", label: "Free builder" },
    ],
  },
  {
    slug: "kitchen-exhaust-cleaning-report-sample",
    path: "/kitchen-exhaust-cleaning-report-sample",
    metaTitle: "Kitchen Exhaust Cleaning Report Sample",
    title: "Kitchen exhaust cleaning report sample",
    description:
      "A customer-facing sample report for kitchen exhaust cleaning work, with result summary, photo evidence, open items, and PDF record posture.",
    label: "Sample",
    summary:
      "A useful sample should show exactly what the restaurant receives after service: a clean result, visible proof, open exceptions, and a saved copy.",
    primaryAction: "View the sample report",
    primaryHref: "/samples/axis-1",
    sections: [
      {
        title: "The sample should be customer-readable",
        copy:
          "Avoid internal abbreviations and crew-only language. The restaurant manager should understand the status without calling the office.",
      },
      {
        title: "The sample should separate complete from open",
        copy:
          "Completed work and blocked access should not sit in the same note. That separation protects the vendor and helps the customer act.",
      },
      {
        title: "The sample should prove the PDF path",
        copy:
          "If the customer keeps inspection records, the report should clearly support a saved PDF copy and a shareable link.",
      },
    ],
    checklistTitle: "What a strong sample proves",
    checklist: [
      "One screen tells the customer what happened",
      "Photos are grouped by system area",
      "Open access issues stay visible",
      "The next service window is recorded",
      "The PDF copy feels like a real customer record",
    ],
    templateTitle: "Sample sections",
    templateRows: [
      ["Header", "Restaurant name, service date, vendor contact, and report status."],
      ["Result", "Plain-English completion summary."],
      ["Proof", "Photos and captions tied to the cleaned areas."],
      ["Exceptions", "Blocked access or condition records kept separate."],
      ["Closeout", "Next action and saved-record instructions."],
    ],
    copyBlock:
      "Reachable hood, filter, and duct-path areas were serviced during this visit. The report below shows the completed work, the photo evidence, and the one access issue that should be corrected before the next standard cycle.",
    related: [
      { href: "/samples/axis-1", label: "Live sample" },
      { href: "/hood-cleaning-service-report-template", label: "Template" },
      { href: "/nfpa-96-hood-cleaning-photo-checklist", label: "Photo checklist" },
    ],
  },
  {
    slug: "nfpa-96-hood-cleaning-photo-checklist",
    path: "/nfpa-96-hood-cleaning-photo-checklist",
    metaTitle: "NFPA 96 Hood Cleaning Photo Checklist",
    title: "NFPA 96 hood cleaning photo checklist",
    description:
      "A practical photo checklist for hood cleaning vendors who need clearer service documentation around canopy, filters, duct access, fan area, and service labels.",
    label: "Checklist",
    summary:
      "This is a documentation checklist, not legal advice or a substitute for the standard. It helps a crew capture the proof a customer expects to save with kitchen exhaust records.",
    primaryAction: "Open the builder",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Capture before and after where it matters",
        copy:
          "A single after photo is usually too thin. Pair before and after photos around the visible system areas that explain the work.",
      },
      {
        title: "Do not hide unreachable areas",
        copy:
          "If an access panel, duct path, or fan area could not be reached, record it as an open item with the customer action needed.",
      },
      {
        title: "Keep the service label visible",
        copy:
          "A label or notice photo helps the customer connect the report to the actual site record and the next visit window.",
      },
    ],
    checklistTitle: "Photo set",
    checklist: [
      "Hood canopy before",
      "Hood canopy after",
      "Filter bank or baffle filters",
      "Plenum or duct access path",
      "Rooftop fan or discharge area",
      "Grease path or containment area",
      "Service label or posted notice",
      "Blocked access or condition issue, if present",
    ],
    templateTitle: "Photo captions",
    templateRows: [
      ["Hood canopy", "Before and after condition of the visible hood interior."],
      ["Filters", "Filter bank reset, cleaning result, or replacement note."],
      ["Duct access", "Accessible path or blocked access record."],
      ["Fan area", "Rooftop fan, discharge area, and visible grease path."],
      ["Label", "Posted service notice, next date, or report reference."],
    ],
    copyBlock:
      "Photo evidence is grouped by system area so the customer can see what was completed and what still needs access or follow-up. Keep this report with the restaurant's kitchen exhaust service records.",
    related: [
      { href: "/axis-1/tool", label: "Free builder" },
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/hood-cleaning-service-report-template", label: "Service report template" },
    ],
  },
  {
    slug: "blocked-access-service-report-template",
    path: "/blocked-access-service-report-template",
    metaTitle: "Blocked Access Service Report Template",
    title: "Blocked access service report template",
    description:
      "A customer-ready blocked access report format for hood cleaning vendors who need to show completed work and unresolved access issues clearly.",
    label: "Exception report",
    summary:
      "Blocked access should not disappear inside a general note. The customer needs to see what was completed, what could not be reached, and what must change before the next visit.",
    primaryAction: "Build a blocked-access report",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Separate completed work from blocked work",
        copy:
          "Do not let an access issue make the entire visit look incomplete. State the reachable areas completed first, then name the blocked area.",
      },
      {
        title: "Show the customer action",
        copy:
          "The report should say what needs to be moved, opened, cleared, unlocked, or scheduled before the next visit.",
      },
      {
        title: "Keep proof with the report",
        copy:
          "A blocked access photo and a short caption make the issue easier to defend than a line buried in an invoice note.",
      },
    ],
    checklistTitle: "Blocked access fields",
    checklist: [
      "Area blocked",
      "What work was still completed",
      "Why the area could not be reached",
      "Customer action required",
      "Photo or condition record",
      "Recommended revisit or next-cycle note",
    ],
    templateTitle: "Exception wording",
    templateRows: [
      ["Completed", "Reachable hood and filter areas were completed during this visit."],
      ["Blocked", "Rear duct access could not be reached safely during the service window."],
      ["Customer action", "Clear the access path before the next scheduled service."],
      ["Follow-up", "Reply to confirm when access is corrected or keep the item open for the next visit."],
    ],
    copyBlock:
      "Reachable areas were completed during this visit. Rear duct access remained blocked, so that area is recorded separately as an open item. Please clear the access path before the next service window so the crew can complete the remaining check.",
    related: [
      { href: "/p/sample-blocked-access", label: "Blocked access sample" },
      { href: "/hood-cleaning-service-report-template", label: "Service report template" },
      { href: "/hood-cleaning-customer-closeout-email-template", label: "Closeout email" },
    ],
  },
  {
    slug: "hood-cleaning-customer-closeout-email-template",
    path: "/hood-cleaning-customer-closeout-email-template",
    metaTitle: "Hood Cleaning Customer Closeout Email Template",
    title: "Hood cleaning customer closeout email template",
    description:
      "A simple customer closeout email structure for hood cleaning vendors sending a service report link, PDF copy, open items, and next action.",
    label: "Email template",
    summary:
      "The closeout email should not re-explain the whole job. It should point to the report, name the result, call out any open item, and make the next action easy.",
    primaryAction: "Create a report link",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Use the email as the handoff",
        copy:
          "Keep the email short and let the service report carry photos, details, open items, and the saved PDF copy.",
      },
      {
        title: "Mention open items plainly",
        copy:
          "If blocked access or a condition note exists, name it in one sentence so the customer does not miss it.",
      },
      {
        title: "End with one action",
        copy:
          "Ask the customer to save the report, confirm the next service window, or correct the access issue. Avoid stacking multiple asks.",
      },
    ],
    checklistTitle: "Email parts",
    checklist: [
      "Subject line with site or service date",
      "One-sentence completion summary",
      "Service report link",
      "Open item mention, if any",
      "Next service window or customer action",
      "Vendor contact route",
    ],
    templateTitle: "Email outline",
    templateRows: [
      ["Subject", "Service report for [Restaurant] - [Service date]"],
      ["Opening", "Today's hood cleaning service report is ready."],
      ["Link", "View the report and PDF copy here: [report link]"],
      ["Open item", "One access item remains open: [short note]."],
      ["Action", "Please reply to confirm [next step]."],
    ],
    copyBlock:
      "Today's hood cleaning service report is ready: [report link]\n\nThe report shows the completed work, photo evidence, and PDF copy for your records. One item remains open: [blocked access or condition note]. Please reply to confirm the next service window or the access correction plan.",
    related: [
      { href: "/axis-1/tool", label: "Free builder" },
      { href: "/samples/axis-1", label: "Sample report" },
      { href: "/blocked-access-service-report-template", label: "Blocked access template" },
    ],
  },
] as const satisfies readonly SeoResourcePageData[];

export function findSeoResourcePage(slug: string) {
  return seoResourcePages.find((page) => page.slug === slug);
}

export const indexedSiteRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/axis-1", changeFrequency: "weekly", priority: 0.9 },
  { path: "/axis-1/tool", changeFrequency: "weekly", priority: 0.85 },
  { path: "/samples", changeFrequency: "monthly", priority: 0.7 },
  { path: "/samples/axis-1", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.75 },
  { path: "/company-version", changeFrequency: "monthly", priority: 0.72 },
  { path: "/resources", changeFrequency: "monthly", priority: 0.78 },
  ...seoResourcePages.map((page) => ({
    path: page.path,
    changeFrequency: "monthly" as const,
    priority: 0.74,
  })),
  { path: "/start", changeFrequency: "monthly", priority: 0.55 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.2 },
] as const;

export const sitemapLastModified = lastModified;
