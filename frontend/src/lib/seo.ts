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
  faqs?: readonly SeoQuestion[];
  workflowTitle?: string;
  workflowSteps?: readonly SeoWorkflowStep[];
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
      "A field-ready service report structure for hood cleaning companies: work result, photos, open items, next action, and PDF record.",
    label: "Template",
    summary:
      "Use this structure when a restaurant needs one plain-English record after a hood cleaning visit, instead of loose photos, technician shorthand, and a separate follow-up email.",
    primaryAction: "Build a free test report",
    primaryHref: "/axis-1/tool?account=free",
    sections: [
      {
        title: "Start with the service result",
        copy:
          "Lead with what was completed today, then separate any blocked access, condition notes, or follow-up work so the customer does not have to decode the visit.",
      },
      {
        title: "Attach photos to the right area",
        copy:
          "Group photos by hood canopy, filters, duct or access point, fan area, grease path, and service label so the customer understands the record.",
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
      ["Photos", "Before and after photos grouped by system area."],
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
      "A customer-facing sample report for kitchen exhaust cleaning work, with result summary, grouped photos, open items, and PDF copy.",
    label: "Sample",
    summary:
      "A useful sample should show exactly what the restaurant receives after service: a clean result, grouped photos, open exceptions, and a saved copy.",
    primaryAction: "View the sample report",
    primaryHref: "/p/sample-blocked-access",
    sections: [
      {
        title: "The sample should be customer-readable",
        copy:
          "Avoid crew-only abbreviations. The restaurant manager should understand the status without calling the office.",
      },
      {
        title: "The sample should separate complete from open",
        copy:
          "Completed work and blocked access should not sit in the same note. That separation protects the service company and helps the customer act.",
      },
      {
        title: "The sample should prove the PDF path",
        copy:
          "If the customer keeps service records, the report should clearly support a saved PDF copy and a shareable link.",
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
      ["Header", "Restaurant name, service date, company contact, and report status."],
      ["Result", "Plain-English completion summary."],
      ["Photos", "Photos and captions tied to the cleaned areas."],
      ["Exceptions", "Blocked access or condition records kept separate."],
      ["Closeout", "Next action and saved-record instructions."],
    ],
    copyBlock:
      "Reachable hood, filter, and duct-path areas were serviced during this visit. The report below shows the completed work, grouped photos, and the one access issue that should be corrected before the next standard cycle.",
    related: [
      { href: "/samples/axis-1", label: "Live sample" },
      { href: "/hood-cleaning-service-report-template", label: "Template" },
      { href: "/nfpa-96-hood-cleaning-photo-checklist", label: "Photo checklist" },
    ],
  },
  {
    slug: "nfpa-96-hood-cleaning-photo-checklist",
    path: "/nfpa-96-hood-cleaning-photo-checklist",
    metaTitle: "NFPA 96 Hood Cleaning Photo Checklist | Documentation Guide",
    title: "NFPA 96 hood cleaning photo checklist",
    description:
      "A practical photo checklist for hood cleaning companies that need clearer service documentation around canopy, filters, duct access, fan area, and service labels.",
    label: "Checklist",
    summary:
      "This checklist is for service photo documentation only. It is not legal advice, not a substitute for NFPA 96, and not a code compliance determination.",
    primaryAction: "Create a report with grouped photos",
    primaryHref: "/axis-1/tool?account=free",
    sections: [
      {
        title: "Capture before and after where it matters",
        copy:
          "A single after photo is usually too thin. Pair before and after photos around accessible system areas when the crew captured them.",
      },
      {
        title: "Do not hide unreachable areas",
        copy:
          "If an access panel, duct path, or fan area could not be reached, label it as blocked or unreachable and keep it separate from completed work.",
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
      "Blocked or unreachable area, if present",
      "Do not present unverified or unreachable areas as cleaned",
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
      "This checklist is for service photo documentation only. It is not legal advice, not a substitute for NFPA 96, and not a code compliance determination. Group photos by system area and label blocked or unreachable areas honestly.",
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
      "A customer-ready blocked access report format for hood cleaning companies that need to show completed work and unresolved access issues clearly.",
    label: "Exception report",
    summary:
      "Do not let blocked access look like unfinished or completed work. Separate completed work from customer action.",
    primaryAction: "Build a blocked-access test report",
    primaryHref: "/axis-1/tool?account=free",
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
        title: "Keep photos with the report",
        copy:
          "A blocked access photo and a short caption make the issue easier to understand than a line buried in an invoice note.",
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
      "Locked roof access",
      "Equipment or storage blocking access",
      "Unsafe or inaccessible fan panel",
    ],
    templateTitle: "Exception wording",
    templateRows: [
      ["Completed", "Reachable hood and filter areas were completed during this visit."],
      ["Blocked", "Rear duct access could not be reached safely during the service window."],
      ["Customer action", "Clear the access path before the next scheduled service."],
      ["Follow-up", "Reply to confirm when access is corrected or keep the item open for the next visit."],
    ],
    copyBlock:
      "Work was completed where reachable. The area listed below was not accessible and needs customer action before follow-up. The blocked area is not presented as cleaned.",
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
      "A simple customer closeout email structure for hood cleaning companies sending a service report link, PDF copy, open items, and next action.",
    label: "Email template",
    summary:
      "The closeout email should not re-explain the whole job. It should point to the report, name the result, call out any open item, and make the next action easy.",
    primaryAction: "Create a report link",
    primaryHref: "/axis-1/tool?account=free",
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
      "Company contact route",
    ],
    templateTitle: "Email variants",
    templateRows: [
      ["Subject", "Service report for [Restaurant] - [Service date]"],
      ["Completed service", "Today's hood cleaning service report is ready: [report link]. Please save the PDF copy for your records."],
      ["Blocked access", "Work was completed where reachable. One access item remains open in the report: [short note]."],
      ["Condition found", "The report includes a recorded condition for review: [short note]. Please reply if you want a follow-up quote or review."],
    ],
    copyBlock:
      "Today's hood cleaning service report is ready: [report link]\n\nThe report shows the completed work, grouped photos, and PDF copy for your records. One item remains open: [blocked access or condition note]. Please reply to confirm the next service window or the access correction plan.",
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
      "What a restaurant manager should receive after hood cleaning: completed work, grouped photos, open items, next action, and PDF record.",
    label: "Restaurant record",
    summary:
      "A restaurant hood cleaning report should let the manager understand the visit without reading technician shorthand or chasing a separate photo thread.",
    primaryAction: "View restaurant-facing sample report",
    primaryHref: "/p/sample-blocked-access",
    sections: [
      {
        title: "Make the result visible first",
        copy:
          "The manager should see whether the service was completed, partially completed, or blocked before reading photo details.",
      },
      {
        title: "Keep service records easy to save",
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
      "Photos grouped by area",
      "Blocked access or open items",
      "Next service window",
      "Saved PDF or shareable report link",
    ],
    templateTitle: "Customer report shape",
    templateRows: [
      ["Status", "Completed, partial, or blocked-access result."],
      ["Scope", "Hood, filters, duct access, fan, or other reachable areas."],
      ["Photos", "Photos with short captions tied to the work area."],
      ["Open item", "What still needs access, correction, or follow-up."],
      ["Record", "Link and PDF the restaurant can save."],
    ],
    copyBlock:
      "Your hood cleaning service report is ready. It shows the completed work, grouped photos, any open access item, and the next service window so your team can save one clear record.",
    related: [
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/hood-cleaning-service-report-template", label: "Service report template" },
      { href: "/send-hood-cleaning-report-after-service", label: "After-service handoff" },
    ],
  },
  {
    slug: "commercial-kitchen-exhaust-cleaning-report",
    path: "/commercial-kitchen-exhaust-cleaning-report",
    metaTitle: "Commercial Kitchen Exhaust Cleaning Report",
    title: "Commercial kitchen exhaust cleaning report",
    description:
      "A practical report format for commercial kitchen exhaust cleaning work, with service result, grouped photos, exceptions, and PDF copy.",
    label: "Kitchen exhaust",
    summary:
      "Commercial kitchen exhaust cleaning documentation works best when it separates the service result from photos, exceptions, and the next customer action.",
    primaryAction: "Build a commercial kitchen exhaust report",
    primaryHref: "/axis-1/tool?account=free",
    sections: [
      {
        title: "Document the system area",
        copy:
          "Name the hood, filters, duct access, fan, grease path, and any service label so the report maps to the actual kitchen exhaust system.",
      },
      {
        title: "Separate photos from explanation",
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
      ["Photos", "Photos grouped by area and captioned in customer language."],
      ["Exception", "Blocked access, condition issue, or revisit need."],
      ["Closeout", "Next action and saved report copy."],
    ],
    copyBlock:
      "This commercial kitchen exhaust cleaning report records the service result by system area, includes grouped photos, and separates any blocked access or condition item so the customer has one saved closeout record.",
    related: [
      { href: "/nfpa-96-hood-cleaning-photo-checklist", label: "Photo checklist" },
      { href: "/restaurant-hood-cleaning-report", label: "Restaurant report" },
      { href: "/hood-cleaning-before-after-photo-report", label: "Before and after photos" },
    ],
  },
  {
    slug: "hood-cleaning-certificate-vs-service-report",
    path: "/hood-cleaning-certificate-vs-service-report",
    metaTitle: "Hood Cleaning Certificate vs Service Report",
    title: "Hood cleaning certificate vs service report",
    description:
      "A plain-English comparison of hood cleaning certificates and service reports for companies who need clearer customer records.",
    label: "Comparison",
    summary:
      "A certificate and a service report are not the same thing. A service report explains the work, photos, open items, and next action in a form the customer can actually use.",
    primaryAction: "Create a service report",
    primaryHref: "/axis-1/tool?account=free",
    sections: [
      {
        title: "Certificate confirms",
        copy:
          "A certificate may show service status, company/date, or a basic completion marker.",
      },
      {
        title: "Report explains",
        copy:
          "A service report may show what was done, where it was done, photos, blocked access, and what should happen next.",
      },
      {
        title: "Customers often need both",
        copy:
          "The certificate can sit on site while the report gives the manager a saved record for photos, exceptions, and follow-up.",
      },
    ],
    checklistTitle: "Use the report when you need",
    checklist: [
      "Photos",
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
      "KitchenPermit does not replace your certificate process. It helps the service record explain the job: completed work, photos, blocked access, and the next customer action.",
    related: [
      { href: "/hood-cleaning-service-report-template", label: "Service report template" },
      { href: "/kitchen-exhaust-cleaning-report-sample", label: "Report sample" },
      { href: "/blocked-access-service-report-template", label: "Blocked access template" },
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
    primaryAction: "Build a photo-based test report",
    primaryHref: "/axis-1/tool?account=free",
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
        title: "Explain missing photos",
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
      "Missing or blocked photos labeled honestly",
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
  },
  {
    slug: "send-hood-cleaning-report-after-service",
    path: "/send-hood-cleaning-report-after-service",
    metaTitle: "Send a Hood Cleaning Report After Service",
    title: "Send a hood cleaning report after service",
    description:
      "A company-facing guide for sending a customer-ready hood cleaning report link after the crew finishes the job.",
    label: "After service",
    summary:
      "After the job, send one report the restaurant can save instead of a long text thread or photo dump.",
    primaryAction: "Build a free after-service report",
    primaryHref: "/axis-1/tool?account=free",
    sections: [
      {
        title: "Send it while the visit is fresh",
        copy:
          "Send the report after the crew confirms the result, photos, blocked access, and any next action.",
      },
      {
        title: "Keep the email short",
        copy:
          "The closeout email should point to the report link and mention only the main result or open item.",
      },
      {
        title: "Keep blocked access separate",
        copy:
          "If access was blocked, say what was completed where reachable and what the customer needs to clear.",
      },
    ],
    checklistTitle: "After-service handoff",
    checklist: [
      "Report link ready to send",
      "Plain service result",
      "Photos grouped by area",
      "Open item clearly named",
      "Customer action or next window",
      "PDF copy available",
      "Company version path when branding matters",
    ],
    templateTitle: "Short email example",
    templateRows: [
      ["Subject", "Hood cleaning service report for [Restaurant]"],
      ["Opening", "Today's service report is ready: [report link]."],
      ["Blocked access", "If applicable: work was completed where reachable; one access item needs customer action."],
      ["Save copy", "The PDF copy is available from the report link for your records."],
    ],
    copyBlock:
      "After the crew finishes, send one customer-ready service report link. It should summarize the job, group the photos, call out any blocked access, and give the restaurant a PDF copy to save.",
    related: [
      { href: "/samples/axis-1", label: "Sample report" },
      { href: "/hood-cleaning-service-report-template", label: "Template" },
      { href: "/company-version", label: "Company version" },
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
  { path: "/samples/quick-closeout", changeFrequency: "monthly", priority: 0.82 },
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
