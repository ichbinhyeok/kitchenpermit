import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export type SeoQuestion = {
  question: string;
  answer: string;
};

export type SeoWorkflowStep = {
  title: string;
  text: string;
};

export type SeoColdEmailUse = {
  title: string;
  copy: string;
  subject: string;
  preview: string;
  ctaHref: string;
  ctaLabel: string;
};

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
  searchIntents?: readonly string[];
  faqs?: readonly SeoQuestion[];
  workflowTitle?: string;
  workflowSteps?: readonly SeoWorkflowStep[];
  coldEmail?: SeoColdEmailUse;
};

const lastModified = "2026-05-16";
export const defaultOpenGraphImagePath =
  "/images/og/kitchenpermit-service-report-resources.png";

export function canonicalUrl(path: string) {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  return path === "/" ? baseUrl : `${baseUrl}${path}`;
}

export function publicPageMetadata({
  title,
  description,
  path,
  imagePath = defaultOpenGraphImagePath,
}: {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}): Metadata {
  const url = canonicalUrl(path);
  const imageUrl = canonicalUrl(imagePath);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} service report resources`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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
  {
    slug: "restaurant-hood-cleaning-report",
    path: "/restaurant-hood-cleaning-report",
    metaTitle: "Restaurant Hood Cleaning Report",
    title: "Restaurant hood cleaning report",
    description:
      "What a restaurant manager should receive after hood cleaning: completed work, photo evidence, open items, next action, and PDF record.",
    label: "Restaurant record",
    summary:
      "A restaurant hood cleaning report should let the manager understand the visit without reading technician shorthand or chasing a separate photo thread.",
    primaryAction: "Build a restaurant report",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Make the result visible first",
        copy:
          "The manager should see whether the service was completed, partially completed, or blocked before reading photo details.",
      },
      {
        title: "Keep inspection records easy to save",
        copy:
          "A customer link and PDF copy give the restaurant a clean record to keep with kitchen exhaust service files.",
      },
      {
        title: "Write for the person on site",
        copy:
          "Use plain service language so the shift lead, owner, or facilities contact can understand what happened.",
      },
    ],
    checklistTitle: "Manager-facing fields",
    checklist: [
      "Restaurant or site name",
      "Service date",
      "Completed work summary",
      "Photo evidence grouped by area",
      "Blocked access or open items",
      "Next service window",
      "Saved PDF or shareable report link",
    ],
    templateTitle: "Customer report shape",
    templateRows: [
      ["Status", "Completed, partial, or blocked-access result."],
      ["Scope", "Hood, filters, duct access, fan, or other reachable areas."],
      ["Proof", "Photos with short captions tied to the work area."],
      ["Open item", "What still needs access, correction, or follow-up."],
      ["Record", "Link and PDF the restaurant can save."],
    ],
    copyBlock:
      "Your hood cleaning service report is ready. It shows the completed work, grouped photo evidence, any open access item, and the next service window so your team can save one clear record.",
    related: [
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/hood-cleaning-service-report-template", label: "Service report template" },
      { href: "/send-hood-cleaning-report-after-service", label: "After-service handoff" },
    ],
    searchIntents: [
      "restaurant hood cleaning report",
      "restaurant hood cleaning documentation",
      "hood cleaning report for restaurant records",
    ],
  },
  {
    slug: "commercial-kitchen-exhaust-cleaning-report",
    path: "/commercial-kitchen-exhaust-cleaning-report",
    metaTitle: "Commercial Kitchen Exhaust Cleaning Report",
    title: "Commercial kitchen exhaust cleaning report",
    description:
      "A practical report format for commercial kitchen exhaust cleaning work, with service result, photo evidence, exceptions, and PDF copy.",
    label: "Kitchen exhaust",
    summary:
      "Commercial kitchen exhaust cleaning documentation works best when it separates the service result from photos, exceptions, and the next customer action.",
    primaryAction: "Create an exhaust report",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Document the system area",
        copy:
          "Name the hood, filters, duct access, fan, grease path, and any service label so the report maps to the actual kitchen exhaust system.",
      },
      {
        title: "Separate proof from explanation",
        copy:
          "Photos should support the written result. They should not force the customer to infer what was completed.",
      },
      {
        title: "Preserve exceptions",
        copy:
          "If a panel, roof area, or fan access was blocked, record it as an exception with a requested customer action.",
      },
    ],
    checklistTitle: "Kitchen exhaust report fields",
    checklist: [
      "Service date and location",
      "System areas serviced",
      "Cleaning result by area",
      "Before and after photos",
      "Blocked access or condition notes",
      "Next service recommendation",
      "PDF copy for customer records",
    ],
    templateTitle: "Report structure",
    templateRows: [
      ["System", "Hood canopy, filter bank, duct path, fan area, and service label."],
      ["Result", "Reachable areas completed and any area left open."],
      ["Evidence", "Photos grouped by area and captioned in customer language."],
      ["Exception", "Blocked access, condition issue, or revisit need."],
      ["Closeout", "Next action and saved report copy."],
    ],
    copyBlock:
      "This commercial kitchen exhaust cleaning report records the service result by system area, includes photo evidence, and separates any blocked access or condition item so the customer has one saved closeout record.",
    related: [
      { href: "/nfpa-96-hood-cleaning-photo-checklist", label: "Photo checklist" },
      { href: "/restaurant-hood-cleaning-report", label: "Restaurant report" },
      { href: "/hood-cleaning-before-after-photo-report", label: "Before and after photos" },
    ],
    searchIntents: [
      "commercial kitchen exhaust cleaning report",
      "kitchen exhaust cleaning documentation",
      "commercial hood cleaning service report",
    ],
  },
  {
    slug: "hood-cleaning-certificate-vs-service-report",
    path: "/hood-cleaning-certificate-vs-service-report",
    metaTitle: "Hood Cleaning Certificate vs Service Report",
    title: "Hood cleaning certificate vs service report",
    description:
      "A plain-English comparison of hood cleaning certificates and service reports for vendors who need clearer customer records.",
    label: "Comparison",
    summary:
      "A certificate can confirm service posture, but a service report explains the work, photo evidence, open items, and next action in a form the customer can actually use.",
    primaryAction: "Build a service report",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Certificate confirms",
        copy:
          "A certificate usually signals that service occurred or that a system was serviced for a stated period or cycle.",
      },
      {
        title: "Report explains",
        copy:
          "A service report explains what was completed, what was blocked, which photos support the visit, and what should happen next.",
      },
      {
        title: "Customers often need both",
        copy:
          "The certificate can sit on site while the report gives the manager a saved record for photos, exceptions, and follow-up.",
      },
    ],
    checklistTitle: "Use the report when you need",
    checklist: [
      "Photo evidence",
      "Blocked access documentation",
      "Plain-English service summary",
      "Next service window",
      "Open item or revisit note",
      "PDF record for customer files",
    ],
    templateTitle: "Certificate vs report",
    templateRows: [
      ["Certificate", "Confirms service status or service window."],
      ["Service report", "Explains work result, photos, open items, and next action."],
      ["Best use", "Send the report after service and keep certificate language separate when needed."],
      ["Customer value", "Less guessing and fewer follow-up clarification calls."],
    ],
    copyBlock:
      "A certificate can confirm service status, but the service report should explain the actual visit: completed work, photo evidence, blocked access, and the next customer action.",
    related: [
      { href: "/hood-cleaning-service-report-template", label: "Service report template" },
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/blocked-access-service-report-template", label: "Blocked access template" },
    ],
    searchIntents: [
      "hood cleaning certificate vs service report",
      "hood cleaning certificate documentation",
      "hood cleaning service report example",
    ],
  },
  {
    slug: "hood-cleaning-before-after-photo-report",
    path: "/hood-cleaning-before-after-photo-report",
    metaTitle: "Hood Cleaning Before and After Photo Report",
    title: "Hood cleaning before and after photo report",
    description:
      "How to turn before and after hood cleaning photos into a customer-readable report instead of a loose image dump.",
    label: "Photo report",
    summary:
      "Before and after photos are strongest when they are grouped by area, captioned in plain language, and tied to the service result.",
    primaryAction: "Create a photo report",
    primaryHref: "/axis-1/tool",
    sections: [
      {
        title: "Pair the photos",
        copy:
          "A before image should connect to the matching after image when possible, instead of sitting in a long unstructured gallery.",
      },
      {
        title: "Caption the area",
        copy:
          "Name the hood, filter bank, duct access, fan base, or grease path so the customer knows what they are seeing.",
      },
      {
        title: "Explain missing proof",
        copy:
          "If before photos, after photos, or access photos are missing, the report should say why rather than implying everything was captured.",
      },
    ],
    checklistTitle: "Photo report checklist",
    checklist: [
      "Before photo by area",
      "After photo by area",
      "Short customer-facing caption",
      "Service result tied to the photos",
      "Blocked access photo if relevant",
      "Saved link and PDF copy",
    ],
    templateTitle: "Photo grouping",
    templateRows: [
      ["Hood canopy", "Before and after visible hood interior."],
      ["Filters", "Filter bank condition and cleaned/reset state."],
      ["Duct access", "Accessible path or blocked access record."],
      ["Fan area", "Rooftop fan, fan base, or discharge area."],
      ["Open item", "Photo and note for anything the customer must correct."],
    ],
    copyBlock:
      "Photos are grouped by kitchen exhaust area so the customer can see the before condition, the after result, and any access or condition issue that still needs attention.",
    related: [
      { href: "/nfpa-96-hood-cleaning-photo-checklist", label: "Photo checklist" },
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/commercial-kitchen-exhaust-cleaning-report", label: "Kitchen exhaust report" },
    ],
    searchIntents: [
      "hood cleaning before and after photos",
      "hood cleaning photo report",
      "kitchen exhaust cleaning before after report",
    ],
  },
  {
    slug: "send-hood-cleaning-report-after-service",
    path: "/send-hood-cleaning-report-after-service",
    metaTitle: "Send a Hood Cleaning Report After Service",
    title: "Send a hood cleaning report after service",
    description:
      "A vendor-facing landing page for sending a customer-ready hood cleaning report link after the crew finishes the job.",
    label: "After service",
    summary:
      "This page connects cold email, follow-up, and SEO traffic to the same practical promise: finish the job with a report the restaurant can save.",
    primaryAction: "Try the free builder",
    primaryHref: "/axis-1/tool?account=free",
    sections: [
      {
        title: "Use the report as the handoff",
        copy:
          "The customer receives one service link instead of a scattered thread of photos, notes, and follow-up explanations.",
      },
      {
        title: "Send the sample before the ask",
        copy:
          "In cold email, a sample or resource page can explain the artifact before the vendor is asked to try the builder.",
      },
      {
        title: "Move from sample to company version",
        copy:
          "The free builder proves the output. The company version carries the vendor logo, contact, clean PDF, and history.",
      },
    ],
    checklistTitle: "After-service handoff",
    checklist: [
      "Report link ready to send",
      "Plain service result",
      "Photo evidence grouped by area",
      "Open item clearly named",
      "Customer action or next window",
      "PDF copy available",
      "Company version path when branding matters",
    ],
    templateTitle: "Cold email bridge",
    templateRows: [
      ["Email hook", "Show the sample service report before asking for a product trial."],
      ["Resource page", "Send a neutral template or checklist when the vendor wants context."],
      ["Builder", "Let the vendor create a free test report without account setup."],
      ["Company version", "Move paid when the report should carry the vendor brand and history."],
    ],
    copyBlock:
      "After the crew finishes, send one customer-ready service report link. It should summarize the job, group the photos, call out any blocked access, and give the restaurant a PDF copy to save.",
    related: [
      { href: "/samples/axis-1", label: "Sample report" },
      { href: "/hood-cleaning-service-report-template", label: "Template" },
      { href: "/company-version", label: "Company version" },
    ],
    searchIntents: [
      "send hood cleaning report after service",
      "hood cleaning follow up report",
      "hood cleaning customer report link",
    ],
    coldEmail: {
      title: "Use this page in cold email",
      copy:
        "Send this page when the recipient needs to understand the artifact before they try the builder. It points to the sample, free builder, and paid company version without exposing any Axis 2 material.",
      subject: "A cleaner hood cleaning report after each job",
      preview:
        "Here is the kind of service report a restaurant can receive after the crew finishes: result, photos, open items, next action, and PDF copy.",
      ctaHref: "/axis-1/tool?account=free&utm_source=cold_email&utm_medium=outreach&utm_campaign=service_report",
      ctaLabel: "Open cold-email builder path",
    },
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
