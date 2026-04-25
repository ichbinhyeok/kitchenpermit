export type Axis1PacketBranding = "applied" | "neutral";
export type Axis1PacketScenario = "exception" | "clean";

type SummaryIcon = "status" | "action" | "next";
type StatusTone = "before" | "after" | "issue" | "record";

export type Axis1PacketPreviewData = {
  branding: Axis1PacketBranding;
  scenario: Axis1PacketScenario;
  reportUrl: string;
  vendor: {
    name: string;
    initials: string;
    logoUrl?: string;
    office: string;
    directLine: string;
    dispatch: string;
    certification: string;
    technician: string;
    afterHours: string;
    reviewPrompt: string;
    preparedBy: string;
    previewBlurb: string;
    brandingApplied: boolean;
  };
  packetHeader: {
    title: string;
    copy: string;
    quickFacts: readonly [string, string][];
    archiveNote: string;
  };
  summaryCards: ReadonlyArray<{
    label: string;
    title: string;
    copy: string;
    icon: SummaryIcon;
  }>;
  systemIdentityRows: readonly [string, string][];
  serviceRecordRows: readonly [string, string][];
  routeSegments: ReadonlyArray<{
    code: string;
    title: string;
    status: string;
    note: string;
  }>;
  proofPhotos: ReadonlyArray<{
    src: string;
    proofId: string;
    systemRef: string;
    label: string;
    title: string;
    caption: string;
    proofRole: string;
    tone: StatusTone;
    position: string;
  }>;
  proofPolicyRows: readonly [string, string][];
  componentStatusRows: ReadonlyArray<{
    component: string;
    status: string;
    proof: string;
    note: string;
  }>;
  photoCoverageRows: ReadonlyArray<{
    item: string;
    proof: string;
    status: string;
  }>;
  scopeRows: readonly [string, string, string][];
  completedWork: readonly string[];
  operationalChecks: readonly [string, string][];
  frequencyRows: readonly [string, string][];
  callout: {
    eyebrow: string;
    title: string;
    copy: string;
    tone: "issue" | "success";
  };
  notesSection: {
    label: string;
    title: string;
  };
  deficiencyRows: ReadonlyArray<{
    location: string;
    issue: string;
    whyItMatters: string;
    ownerAction: string;
    notice: string;
    status: string;
  }>;
  customerClose: {
    title: string;
    copy: string;
    actionItems: readonly [string, string][];
  };
  closeoutRows: readonly [string, string][];
  acknowledgementRows: readonly [string, string][];
  scopeNote: string;
  sampleFooter: readonly [string, string][];
};

const baseProofPhotos = [
  {
    src: "/images/packet-proof/ai-hood-before.jpg",
    proofId: "P-01",
    systemRef: "HD-01",
    label: "Before",
    title: "Hood interior before clean",
    caption: "Grease load and surface condition captured before work began.",
    proofRole: "Before clean reference",
    tone: "before",
    position: "50% 50%",
  },
  {
    src: "/images/packet-proof/ai-hood-after.jpg",
    proofId: "P-02",
    systemRef: "HD-01",
    label: "After",
    title: "Hood interior after clean",
    caption: "Same system photographed after reachable surfaces were cleaned.",
    proofRole: "After clean confirmation",
    tone: "after",
    position: "50% 50%",
  },
  {
    src: "/images/packet-proof/ai-baffle-filters.jpg",
    proofId: "P-03",
    systemRef: "FL-01",
    label: "Filters",
    title: "Baffle filters reset",
    caption: "Filters, tracks, and nearby grease collection points are documented where accessible.",
    proofRole: "Filter-line proof",
    tone: "after",
    position: "50% 50%",
  },
  {
    src: "/images/packet-proof/ai-duct-access.jpg",
    proofId: "P-04",
    systemRef: "DK-02",
    label: "Access",
    title: "Duct access condition",
    caption: "Reachable plenum and duct access are separated from anything blocked or not serviced.",
    proofRole: "Access-path proof",
    tone: "issue",
    position: "50% 50%",
  },
  {
    src: "/images/packet-proof/ai-rooftop-fan-base.jpg",
    proofId: "P-05",
    systemRef: "RF-01",
    label: "Fan",
    title: "Fan and roof discharge area",
    caption: "Fan housing, hinge/base, and roof discharge condition are tied back to the visit record.",
    proofRole: "Fan / roof record",
    tone: "record",
    position: "50% 50%",
  },
  {
    src: "/images/packet-proof/ai-grease-scraper.jpg",
    proofId: "P-06",
    systemRef: "GC-01",
    label: "Record",
    title: "Grease path and containment",
    caption: "Removed buildup, drip path, and containment condition are recorded instead of only claimed.",
    proofRole: "Grease-path proof",
    tone: "record",
    position: "50% 50%",
  },
] as const;

export function parseAxis1PacketBranding(value?: string): Axis1PacketBranding {
  return value === "neutral" ? "neutral" : "applied";
}

export function parseAxis1PacketScenario(value?: string): Axis1PacketScenario {
  return value === "clean" ? "clean" : "exception";
}

export function buildAxis1PacketPreviewHref(
  pathname: string,
  options: {
    branding: Axis1PacketBranding;
    scenario: Axis1PacketScenario;
  },
) {
  const params = new URLSearchParams();
  params.set("branding", options.branding);
  params.set("scenario", options.scenario);
  return `${pathname}?${params.toString()}`;
}

export function getAxis1PacketPreviewData(options: {
  branding: Axis1PacketBranding;
  scenario: Axis1PacketScenario;
}): Axis1PacketPreviewData {
  const brandingApplied = options.branding === "applied";
  const exceptionOpen = options.scenario === "exception";

  const vendor = brandingApplied
    ? {
        name: "Summit Hood Service Co.",
        initials: "SH",
        logoUrl: "/images/sample-hood-service-logo.svg",
        office: "Austin, TX | 24/7 dispatch",
        directLine: "(512) 555-0148",
        dispatch: "dispatch@summit.example",
        certification: "TX Reg #KEX-2087",
        technician: "Miguel R. / Tech ID SH-114",
        afterHours: "(512) 555-0192",
        reviewPrompt: "review@summit.example",
        preparedBy: "Summit Hood Service Co. | SH-114",
        previewBlurb:
          "Customer sees a same-day proof packet with vendor brand, service contact, credential, and record references already in place.",
        brandingApplied: true,
      }
    : {
        name: "Sample Hood Service Co.",
        initials: "SH",
        logoUrl: "/images/sample-hood-service-logo.svg",
        office: "Vendor branding, dispatch, and service contact appear here",
        directLine: "(512) 555-0148",
        dispatch: "dispatch@samplehood.co",
        certification: "TX service ref shown here",
        technician: "Technician / crew ID",
        afterHours: "(512) 555-0192",
        reviewPrompt: "service@samplehood.co",
        preparedBy: "Technician / crew ID",
        previewBlurb:
          "Public sample uses example branding. Setup replaces this with the vendor logo, direct line, dispatch email, certification, and technician reference.",
        brandingApplied: false,
      };

  return {
    branding: options.branding,
    scenario: options.scenario,
    reportUrl: "https://kitchenpermit.com/reports/hds-masked-0424",
    vendor,
    packetHeader: {
      title: "Masked restaurant group",
      copy:
        "Main cookline exhaust system. This proof link summarizes the cleaned hood line, filters, reachable plenum and duct access, fan / roof record, open item, proof photos, and next action.",
      quickFacts: [
        ["Service date", "Apr 14, 2026"],
        ["Location", "Austin, TX"],
        ["System", "Main cookline hood line"],
        [
          "Today's result",
          exceptionOpen
            ? "Accessible areas cleaned; access item open"
            : "Accessible areas cleaned; ready for records",
        ],
      ],
      archiveNote:
        "Customer sees the clear service report. Full image archive, raw technician notes, and internal QA detail stay retained in the office file.",
    },
    summaryCards: [
      {
        label: "Completed today",
        title: exceptionOpen
          ? "Cleaned: accessible areas only."
          : "Cleaned: accessible hood line and filters.",
        copy: exceptionOpen
          ? "Hood body, filter bank, plenum, and reachable duct path were cleaned. Rear duct access was not completed."
          : "Hood body, filter bank, plenum, duct path, and visible fan area were documented with no open access item at close-out.",
        icon: "status",
      },
      {
        label: exceptionOpen ? "Still open" : "Nothing open",
        title: exceptionOpen
          ? "Not completed: rear duct access was blocked."
          : "No blocked access item remained at close-out.",
        copy: exceptionOpen
          ? "Stored items blocked the rear duct access panel. This section stays visible here so it is not mistaken as complete."
          : "The visit closed without an open access exception, so the customer can keep this with service records.",
        icon: "action",
      },
      {
        label: "Next step",
        title: exceptionOpen
          ? "Clear blocked access, then reply."
          : "Confirm the next service window.",
        copy: exceptionOpen
          ? "Move stored items away from the access panel and reply so the vendor can schedule the revisit or close the open item cleanly."
          : "Confirm the next scheduled service window, or ask dispatch to adjust the week while the record is fresh.",
        icon: "next",
      },
    ],
    systemIdentityRows: [
      ["Property", "Masked restaurant group"],
      ["Site", "Masked Austin, TX"],
      ["System", "SYS-01 / main cookline hood line"],
      ["Line served", "Main Type I cookline"],
      ["Packet coverage", "One packet for one exhaust system"],
      ["Access basis", "Accessible hood, filters, plenum, duct access, fan / roof discharge, and grease path"],
      ["On-site diagram", "Matched to SYS-01 / main cookline line"],
      ["Approved on site", "Store manager (masked)"],
    ],
    serviceRecordRows: [
      ["Service window", "Apr 14, 2026 | 01:10-03:05"],
      ["Today's visit", "Kitchen exhaust system cleaning"],
      ["Technician", vendor.technician],
      ["Credential", vendor.certification],
      [
        "Today's result",
        exceptionOpen
          ? "Accessible areas cleaned; access item open"
          : "Accessible areas cleaned; ready for records",
      ],
      [
        "Service label",
        exceptionOpen
          ? "Quarterly service label + exception notice"
          : "Quarterly service label posted with next due date",
      ],
      ["Label / notice ref", exceptionOpen ? "EXC-0414-DK02" : "LBL-0414-SYS01"],
      ["Frequency basis", "Visible grease load + high-volume cookline use"],
      [
        "Deficiency record",
        exceptionOpen
          ? "Access and rooftop conditions recorded"
          : "No deficiency record required in this sample",
      ],
      [
        "Official inspection status",
        "Not evaluated by this sample record. Official inspection decisions are made by the applicable authority.",
      ],
      ["Report ID", "HDS-MASKED-0414"],
    ],
    routeSegments: [
      {
        code: "HD-01",
        title: "Hood canopy",
        status: "Cleaned",
        note: "Before / after proof P-01 and P-02",
      },
      {
        code: "FL-01",
        title: "Filters + tracks",
        status: "Reset",
        note: "Baffle filters, tracks, and nearby grease collection points documented where accessible",
      },
      {
        code: "PL-01",
        title: "Plenum / duct path",
        status: "Reachable cleaned",
        note: "Reachable plenum and duct path cleaned and separated from blocked access",
      },
      {
        code: "DK-02",
        title: "Rear duct access",
        status: exceptionOpen ? "Access blocked" : "Access clear",
        note: exceptionOpen
          ? "Stored items blocked access at service time; exception remains open and tied to proof P-04"
          : "Access was available and documented at service time",
      },
      {
        code: "RF-01",
        title: "Fan / roof discharge",
        status: exceptionOpen ? "Review" : "Documented",
        note: "Fan housing, hinge/base, curb, and roof discharge condition recorded for follow-up",
      },
      {
        code: "GC-01",
        title: "Grease path / containment",
        status: exceptionOpen ? "Review" : "Documented",
        note: "Grease trough, drip path, and containment condition recorded for customer file",
      },
    ],
    proofPhotos: baseProofPhotos,
    proofPolicyRows: [
      [
        "What you are seeing",
        "Shows curated customer proof tied to section references, not every raw image from the visit.",
      ],
      [
        "What stays in office records",
        "Full photo archive, raw technician notes, and QA detail stay retained outside the customer packet.",
      ],
      [
        "Open items stay visible",
        "Any blocked, inaccessible, or unworked section remains visible instead of being implied as finished.",
      ],
      [
        "Not a separate trade report",
        "Fire suppression inspection, repair approval, and design compliance review are outside this service record unless separately quoted.",
      ],
    ],
    componentStatusRows: [
      {
        component: "Hood canopy interior",
        status: "Cleaned",
        proof: "P-01 / P-02",
        note: "Before and after proof attached to HD-01.",
      },
      {
        component: "Baffle filters / tracks",
        status: "Removed + reset",
        proof: "P-03",
        note: "Filters removed, cleaned, inspected, reinstalled; tracks and nearby grease collection points documented where accessible.",
      },
      {
        component: "Plenum / reachable duct path",
        status: "Reachable cleaned",
        proof: "P-04",
        note: "Accessible path cleaned; rear access remains blocked.",
      },
      {
        component: "Rear duct access panel",
        status: exceptionOpen ? "Access blocked" : "Access clear",
        proof: "P-04",
        note: exceptionOpen
          ? "Stored items blocked access; not represented as cleaned."
          : "Access was clear during service.",
      },
      {
        component: "Fan / roof discharge",
        status: exceptionOpen ? "Review" : "Documented",
        proof: "P-05",
        note: "Fan housing, hinge/base, curb, and roof discharge condition recorded for review.",
      },
      {
        component: "Grease trough / containment path",
        status: exceptionOpen ? "Review" : "Documented",
        proof: "P-06",
        note: "Grease trough, drip path, removed buildup, and containment condition recorded for customer file.",
      },
    ],
    photoCoverageRows: [
      { item: "Before hood interior", proof: "P-01", status: "Included" },
      { item: "After hood interior", proof: "P-02", status: "Included" },
      { item: "Filters / tracks reset", proof: "P-03", status: "Included" },
      {
        item: "Access condition",
        proof: "P-04",
        status: exceptionOpen ? "Exception shown" : "Included",
      },
      { item: "Fan / roof discharge area", proof: "P-05", status: "Included" },
      { item: "Grease path / containment", proof: "P-06", status: "Included" },
      {
        item: "Service label / notice",
        proof: exceptionOpen ? "EXC-0414-DK02" : "LBL-0414-SYS01",
        status: "Posted",
      },
      { item: "Full raw archive", proof: "Office file", status: "Retained" },
    ],
    scopeRows: [
      ["HD-01 Hood canopy interior", "Cleaned", "Cleaned and tied to proof photos P-01 / P-02"],
      ["FL-01 Filters / tracks", "Reset", "Baffle filters reset; tracks and grease collection points documented where accessible"],
      ["PL-01 Plenum / reachable duct path", "Reachable cleaned", "Reachable path cleaned and recorded"],
      [
        "DK-02 Rear duct access panel",
        exceptionOpen ? "Access blocked" : "Access clear",
        exceptionOpen
          ? "Blocked by stored equipment at service time; not represented as cleaned"
          : "Access was clear and documented during service",
      ],
      ["RF-01 Fan / roof discharge", exceptionOpen ? "Review" : "Documented", "Fan housing, hinge/base, curb, and roof discharge condition recorded"],
      ["GC-01 Grease path / containment", exceptionOpen ? "Review" : "Documented", "Grease trough, drip path, and containment condition recorded for customer file"],
    ],
    completedWork: [
      "Protected the cookline work area before cleaning",
      "Degreased and wiped accessible hood interior surfaces",
      "Removed and cleaned filter bank before reinstall",
      "Cleaned reachable plenum and duct-path surfaces",
      "Documented visible system condition with section-linked evidence photos",
      "Recorded fan housing, hinge/base, curb, roof discharge, and grease-containment condition for future follow-up",
      "Posted service label and exception notice at close-out",
      "Prepared a same-day customer proof link with next-step guidance",
    ],
    operationalChecks: [
      ["Cookline protection before wash", "Completed"],
      ["Baffle filters returned to service", "Done"],
      ["Reachable access points resecured", "Secured"],
      ["Fan / roof discharge documented", "Documented"],
      ["Grease trough / containment path reviewed", "Reviewed"],
      ["On-site exhaust diagram checked", "Matched to SYS-01"],
      ["Next service timing recorded", "Jul 8-13, 2026"],
      ["Service label / notice status", exceptionOpen ? "Posted with exception" : "Posted"],
      ["Fire suppression inspection", "Separate scope"],
      ["Repair work included", "Separate quote"],
      [
        "Deficiency record required",
        exceptionOpen ? "Required - access item remains" : "Not required",
      ],
    ],
    frequencyRows: [
      ["Cooking line type", "Main Type I cookline"],
      ["Observed grease load", exceptionOpen ? "Moderate to heavy" : "Moderate"],
      ["Operating pattern", "High-volume dinner service"],
      ["Recommended interval", "Quarterly / 90-day cycle"],
      ["Next service window", "Jul 8-13, 2026"],
      ["Interval note", "Shorten interval if menu mix or operating hours increase"],
    ],
    callout: exceptionOpen
      ? {
          eyebrow: "Access blocked / not cleaned",
          title: "Blocked access stays visible.",
          copy:
            "Blocked access is shown directly instead of being buried in technician notes. The report stays defensible by saying what was cleaned, what was not accessible, and what the customer needs to clear next.",
          tone: "issue",
        }
      : {
          eyebrow: "Service close-out",
          title: "No open access exception remains.",
          copy:
            "Accessible sections were cleaned, documented, and closed without an open access exception at departure. The packet can move directly into record retention and next-cycle confirmation.",
          tone: "success",
        },
    notesSection: exceptionOpen
      ? {
          label: "Open items + next steps",
          title: "Anything still open is listed here in plain language.",
        }
      : {
          label: "Next steps",
          title: "This section keeps the next visit and any open note in one place.",
        },
    deficiencyRows: exceptionOpen
      ? [
          {
            location: "DK-02 Rear duct access panel",
            issue: "Stored equipment blocked full access at service time.",
            whyItMatters:
              "The grease-bearing section cannot be represented as cleaned until the access path is clear.",
            ownerAction:
              "Move stored equipment away from the access panel and reply to confirm whether a revisit is needed.",
            notice:
              "Exception notice posted at close-out. This section is excluded from the cleaned scope until access is available.",
            status: "Needs reply",
          },
          {
            location: "RF-01 Rooftop fan hinge / curb line",
            issue: "Wear is visible at the fan hinge/base and curb line during the record capture.",
            whyItMatters:
              "If ignored, the condition can turn into grease escape, roof-condition complaints, or a harder fan-access discussion between cycles.",
            ownerAction:
              "Approve a hinge and curb-line repair review now, or keep the condition on watch before the next service window.",
            notice:
              "Recorded from rooftop proof P-05. Repair is not included in this packet.",
            status: "Review",
          },
          {
            location: "GC-01 Grease trough / containment path",
            issue: "Visible staining is present near the grease trough and containment path.",
            whyItMatters:
              "Grease escape or staining can create roof complaints even when the hood cleaning itself was completed.",
            ownerAction:
              "Approve containment review if staining grows, or keep the condition on the next-cycle watch list.",
            notice: "Condition recorded from rooftop and grease-removal proof. Repair is not included in this packet.",
            status: "Review",
          },
        ]
      : [
          {
            location: "Service close-out",
            issue: "System closed without an open access exception.",
            whyItMatters:
              "The customer can understand the service visit without another explanation call.",
            ownerAction:
              "Retain this packet for records and confirm the next planned service window.",
            notice: "Standard service label posted with next due date.",
            status: "Closed",
          },
          {
            location: "RF-01 Rooftop record",
            issue: "Rooftop fan area was photographed and retained as part of the customer file.",
            whyItMatters:
              "The record supports future repair discussion without forcing the office to reconstruct the visit later.",
            ownerAction:
              "Request a repair review if the fan condition changes before the next cycle.",
            notice: "Record-only note. No open repair item is required today.",
            status: "Monitor",
          },
          {
            location: "Next visit confirmation",
            issue: "Next service window is ready for confirmation.",
            whyItMatters:
              "Rebook timing is explicit instead of disappearing into office follow-up or memory.",
            ownerAction:
              "Reply to confirm Jul 8-13, 2026 or request a different service window.",
            notice: "Rebook cue is included in the same customer packet.",
            status: "Needs reply",
          },
        ],
    customerClose: exceptionOpen
      ? {
          title: "Clear the blocked area, then reply to schedule the revisit.",
          copy:
            "The proof link separates completed work from the open item so the next reply can be short and clear.",
          actionItems: [
            ["Access action", "Move stored items from rear duct access"],
            ["Reply needed", "Confirm access correction or revisit"],
            ["Next visit window", "Jul 8-13, 2026"],
            ["Optional quote", "Fan hinge / containment review"],
          ],
        }
      : {
          title: "Reply to confirm the next service window.",
          copy:
            "The proof link keeps the recommended service window visible while the visit is still fresh.",
          actionItems: [
            ["Next visit window", "Jul 8-13, 2026"],
            ["Reply or action", "Confirm next service"],
            ["Optional follow-up", "Request repair review if condition changes"],
          ],
        },
    closeoutRows: [
      [
        "Service label type",
        exceptionOpen ? "Access exception notice" : "Standard service close-out",
      ],
      ["Label / notice ref", exceptionOpen ? "EXC-0414-DK02" : "LBL-0414-SYS01"],
      [
        "Label posted",
        exceptionOpen
          ? "Posted - service date, next due, and exception reference"
          : "Posted - next due date shown",
      ],
      [
        "Areas represented as cleaned",
        exceptionOpen ? "Accessible sections only" : "Accessible sections documented",
      ],
      ["Prepared by technician", vendor.preparedBy],
      ["Technician credential", vendor.certification],
      ["Dispatch", vendor.dispatch],
      ["After-hours", vendor.afterHours],
      ["Follow-up contact", vendor.reviewPrompt],
      ["Approved on site", "Store manager / masked"],
      ["On-site record", "Keep this report with kitchen service records"],
      ["Customer link", "https://kitchenpermit.com/reports/hds-masked-0424"],
      ["Delivery record", "PDF packet emailed same day"],
      ["Record retention", "Customer packet sent / full office archive retained"],
      ["Next due", "Jul 13, 2026"],
      ["Reply path", "Rebook confirmation or repair review reply"],
    ],
    acknowledgementRows: [
      ["Site contact", "Store manager / masked"],
      ["On-site status", "Service result reviewed at close-out"],
      ["Customer action", exceptionOpen ? "Clear rear access and reply" : "Confirm next service window"],
      ["Vendor action", "Await reply or schedule follow-up"],
      ["Record location", "Keep with kitchen exhaust service records"],
      ["Generated for", "Customer-facing service report"],
    ],
    scopeNote:
      "This packet covers accessible portions of this kitchen exhaust cleaning visit for one exhaust system. Fire suppression inspection, repair work, design compliance review, and concealed or inaccessible portions are not included unless separately quoted.",
    sampleFooter: [
      [
        "What the sample proves",
        "The packet can explain scope, findings, blocked access, and next action in language the customer can actually use.",
      ],
      [
        "What stays paid",
        "Vendor branding setup, full photo handling, customer-specific data, and real delivery workflow stay behind setup.",
      ],
      [
        "Why vendors care",
        "The vendor gets a proof asset that reduces explanation work and makes premium service easier to justify.",
      ],
    ],
  };
}
