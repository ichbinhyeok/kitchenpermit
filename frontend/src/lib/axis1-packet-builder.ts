import { z } from "zod";
import {
  getAxis1PacketPreviewData,
  type Axis1PacketPreviewData,
  type Axis1PacketScenario,
} from "@/lib/axis1-packet-preview";

export const axis1CadenceOptions = [
  {
    value: "30",
    label: "30 days",
    copy: "Heavy line volume or heavier grease load.",
  },
  {
    value: "60",
    label: "60 days",
    copy: "Elevated volume with a tighter cycle than standard.",
  },
  {
    value: "90",
    label: "90 days",
    copy: "Standard operating pattern for this sample packet.",
  },
  {
    value: "120",
    label: "120 days",
    copy: "Lighter use that still needs a locked next window.",
  },
] as const;

export const axis1ExceptionGroups = [
  {
    value: "access",
    label: "Access / incomplete cleaning",
    copy: "Use when full cleaning could not be completed because access or service conditions blocked the work.",
  },
  {
    value: "condition",
    label: "Rooftop / condition review",
    copy: "Use when the crew recorded a condition that should stay visible in the customer report.",
  },
] as const;

export const axis1ExceptionOptions = [
  {
    value: "blocked-storage",
    group: "access",
    label: "Storage block",
    copy: "Stored equipment blocked the rear access path.",
  },
  {
    value: "sealed-panel",
    group: "access",
    label: "Sealed panel",
    copy: "The access panel could not be opened during service.",
  },
  {
    value: "panel-signage",
    group: "access",
    label: "Panel / signage issue",
    copy: "Access panel or required signage was missing or non-conforming.",
  },
  {
    value: "unsafe-access",
    group: "access",
    label: "Unsafe access",
    copy: "Unsafe service conditions prevented full access or cleaning.",
  },
  {
    value: "not-cleaned",
    group: "access",
    label: "Section open",
    copy: "One section remained open and not cleaned at departure.",
  },
  {
    value: "rooftop-hinge-curb",
    group: "condition",
    label: "Fan hinge / curb",
    copy: "Visible fan hinge or curb condition should stay on record.",
  },
  {
    value: "fan-belt-drive",
    group: "condition",
    label: "Belt / pulley",
    copy: "Fan belt or pulley condition should stay on record.",
  },
  {
    value: "liquid-tight",
    group: "condition",
    label: "Liquid-tight issue",
    copy: "The exhaust system may not be liquid-tight at recorded points.",
  },
  {
    value: "grease-containment",
    group: "condition",
    label: "Containment review",
    copy: "Grease containment or drip-path condition should be reviewed.",
  },
] as const;

export const axis1FollowUpOptions = [
  {
    value: "none",
    label: "Record only",
    copy: "Keep the condition in the packet without an open quote ask.",
  },
  {
    value: "monitor",
    label: "Monitor",
    copy: "Tell the customer to watch the condition before the next cycle.",
  },
  {
    value: "quote",
    label: "Quote review",
    copy: "Surface a repair-review path in the packet.",
  },
] as const;

export type Axis1BuilderCadence = (typeof axis1CadenceOptions)[number]["value"];
export type Axis1BuilderExceptionKind =
  (typeof axis1ExceptionOptions)[number]["value"];
export type Axis1BuilderFollowUpMode =
  (typeof axis1FollowUpOptions)[number]["value"];

const exceptionKindSchema = z.enum(
  axis1ExceptionOptions.map((option) => option.value) as [
    Axis1BuilderExceptionKind,
    ...Axis1BuilderExceptionKind[],
  ],
);

export const axis1BuilderSchema = z.object({
  scenario: z.enum(["exception", "clean"]),
  propertyName: z.string().trim().min(2).max(60),
  siteCity: z.string().trim().min(2).max(60),
  serviceDate: z.string().min(1),
  authorizedBy: z.string().trim().min(2).max(40),
  cadence: z.enum(
    axis1CadenceOptions.map((option) => option.value) as [
      Axis1BuilderCadence,
      ...Axis1BuilderCadence[],
    ],
  ),
  serviceWindow: z.string().trim().min(4).max(40),
  systemName: z.string().trim().min(3).max(72),
  exceptionKinds: z.array(exceptionKindSchema).max(5),
  exceptionNote: z.string().trim().max(220).optional().or(z.literal("")),
  followUpMode: z.enum(
    axis1FollowUpOptions.map((option) => option.value) as [
      Axis1BuilderFollowUpMode,
      ...Axis1BuilderFollowUpMode[],
    ],
  ),
  followUpNote: z.string().trim().max(220).optional().or(z.literal("")),
  summaryOverride: z.string().trim().max(260).optional().or(z.literal("")),
  customerActionOverride: z.string().trim().max(220).optional().or(z.literal("")),
  followUpOverride: z.string().trim().max(220).optional().or(z.literal("")),
});

export type Axis1BuilderFormValues = z.infer<typeof axis1BuilderSchema>;

export const axis1BuilderDefaults: Axis1BuilderFormValues = {
  scenario: "exception",
  propertyName: "Masked restaurant group",
  siteCity: "Austin, TX",
  serviceDate: "2026-04-24",
  authorizedBy: "Store manager",
  cadence: "90",
  serviceWindow: "01:10-03:05",
  systemName: "Main cookline hood line",
  exceptionKinds: ["blocked-storage"],
  exceptionNote: "",
  followUpMode: "monitor",
  followUpNote: "",
  summaryOverride: "",
  customerActionOverride: "",
  followUpOverride: "",
};

type Axis1FreeReportSearchParams = Record<
  string,
  string | string[] | undefined
>;

function readSearchParam(
  params: Axis1FreeReportSearchParams,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function buildAxis1FreeReportHref(values: Axis1BuilderFormValues) {
  const params = new URLSearchParams({
    s: values.scenario,
    p: values.propertyName,
    c: values.siteCity,
    d: values.serviceDate,
    a: values.authorizedBy,
    cd: values.cadence,
    w: values.serviceWindow,
    y: values.systemName,
    e: values.exceptionKinds.join(","),
    fm: values.followUpMode,
  });

  const optionalParams: Array<[string, string | undefined]> = [
    ["en", values.exceptionNote],
    ["fn", values.followUpNote],
    ["so", values.summaryOverride],
    ["co", values.customerActionOverride],
    ["fo", values.followUpOverride],
  ];

  optionalParams.forEach(([key, value]) => {
    const trimmed = value?.trim();
    if (trimmed) {
      params.set(key, trimmed);
    }
  });

  return `/p/free?${params.toString()}`;
}

export function parseAxis1FreeReportSearchParams(
  params: Axis1FreeReportSearchParams,
): Axis1BuilderFormValues {
  const candidate: Axis1BuilderFormValues = {
    scenario:
      readSearchParam(params, "s") === "clean" ? "clean" : axis1BuilderDefaults.scenario,
    propertyName:
      readSearchParam(params, "p") ?? axis1BuilderDefaults.propertyName,
    siteCity: readSearchParam(params, "c") ?? axis1BuilderDefaults.siteCity,
    serviceDate: readSearchParam(params, "d") ?? axis1BuilderDefaults.serviceDate,
    authorizedBy:
      readSearchParam(params, "a") ?? axis1BuilderDefaults.authorizedBy,
    cadence:
      axis1CadenceOptions.some((option) => option.value === readSearchParam(params, "cd"))
        ? (readSearchParam(params, "cd") as Axis1BuilderCadence)
        : axis1BuilderDefaults.cadence,
    serviceWindow:
      readSearchParam(params, "w") ?? axis1BuilderDefaults.serviceWindow,
    systemName: readSearchParam(params, "y") ?? axis1BuilderDefaults.systemName,
    exceptionKinds: (readSearchParam(params, "e") ?? "")
      .split(",")
      .filter((kind): kind is Axis1BuilderExceptionKind =>
        axis1ExceptionOptions.some((option) => option.value === kind),
      ),
    exceptionNote: readSearchParam(params, "en") ?? "",
    followUpMode:
      axis1FollowUpOptions.some((option) => option.value === readSearchParam(params, "fm"))
        ? (readSearchParam(params, "fm") as Axis1BuilderFollowUpMode)
        : axis1BuilderDefaults.followUpMode,
    followUpNote: readSearchParam(params, "fn") ?? "",
    summaryOverride: readSearchParam(params, "so") ?? "",
    customerActionOverride: readSearchParam(params, "co") ?? "",
    followUpOverride: readSearchParam(params, "fo") ?? "",
  };

  if (candidate.scenario === "exception" && candidate.exceptionKinds.length === 0) {
    candidate.exceptionKinds = axis1BuilderDefaults.exceptionKinds;
  }

  const parsed = axis1BuilderSchema.safeParse(candidate);
  return parsed.success ? parsed.data : axis1BuilderDefaults;
}

type ExceptionDefinition = {
  group: (typeof axis1ExceptionGroups)[number]["value"];
  chipLabel: string;
  routeNote: string;
  issue: string;
  whyItMatters: string;
  ownerAction: string;
  notice: string;
  status: "Open" | "Action" | "Monitor";
  affectsAccess: boolean;
  location: string;
};

const exceptionDefinitions: Record<Axis1BuilderExceptionKind, ExceptionDefinition> = {
  "blocked-storage": {
    group: "access",
    chipLabel: "Storage block",
    routeNote: "Stored equipment blocked the rear access path during service.",
    issue: "Stored equipment blocked full access at service time.",
    whyItMatters:
      "The blocked section cannot be represented as fully cleaned until the access path is clear.",
    ownerAction:
      "Clear the access path and reply so dispatch can schedule a revisit or close the next window cleanly.",
    notice: "Access exception remains open at close-out.",
    status: "Open",
    affectsAccess: true,
    location: "DK-02 Rear duct access panel",
  },
  "sealed-panel": {
    group: "access",
    chipLabel: "Sealed panel",
    routeNote: "The rear access panel was sealed and not serviceable during the visit.",
    issue:
      "The access panel was sealed and could not be opened as part of normal service.",
    whyItMatters:
      "The crew could not verify or complete the full cleaning path behind the sealed panel.",
    ownerAction:
      "Approve access correction or a revisit once the panel can be opened safely.",
    notice: "Access exception remains open at close-out.",
    status: "Open",
    affectsAccess: true,
    location: "DK-02 Rear duct access panel",
  },
  "panel-signage": {
    group: "access",
    chipLabel: "Panel / signage issue",
    routeNote:
      "The access panel or required service signage was not in a compliant condition during the visit.",
    issue:
      "The access panel or required service signage was missing or non-conforming.",
    whyItMatters:
      "Poor access-panel condition creates repeat cleaning difficulty and can weaken future inspection or cleaning access.",
    ownerAction:
      "Correct the panel or signage issue before the next standard service cycle.",
    notice: "Access-related condition remains open in the customer report.",
    status: "Open",
    affectsAccess: true,
    location: "DK-02 Rear duct access panel",
  },
  "unsafe-access": {
    group: "access",
    chipLabel: "Unsafe access",
    routeNote:
      "Unsafe service conditions prevented full access or cleaning during the visit.",
    issue:
      "Unsafe service conditions prevented full access or cleaning on one section.",
    whyItMatters:
      "The section cannot be represented as fully cleaned when the crew could not access it safely.",
    ownerAction:
      "Correct the unsafe condition or approve a revisit once the area can be serviced safely.",
    notice: "Safety-related access exception remains open at close-out.",
    status: "Open",
    affectsAccess: true,
    location: "DK-02 Rear duct access panel",
  },
  "not-cleaned": {
    group: "access",
    chipLabel: "Section open",
    routeNote:
      "One section remained open and not cleaned at departure, and stays visible in the packet.",
    issue:
      "One grease-bearing section remained open and not cleaned at departure.",
    whyItMatters:
      "The customer report must show that the section remained open instead of implying the full path was completed.",
    ownerAction:
      "Approve a revisit once access or service conditions allow the section to be completed.",
    notice: "Open section stays visible in the packet instead of being implied as complete.",
    status: "Open",
    affectsAccess: true,
    location: "DK-02 Rear duct access panel",
  },
  "rooftop-hinge-curb": {
    group: "condition",
    chipLabel: "Fan hinge / curb",
    routeNote:
      "Visible fan hinge or curb condition was recorded for customer visibility.",
    issue:
      "Visible fan hinge or curb condition should be reviewed before the next cycle.",
    whyItMatters:
      "The condition may turn into a larger service or roof complaint if it is ignored between visits.",
    ownerAction:
      "Approve a repair review if the rooftop condition should be quoted before the next cycle.",
    notice: "Recorded from rooftop proof. Repair execution is not included in this packet.",
    status: "Action",
    affectsAccess: false,
    location: "RF-01 Rooftop fan area",
  },
  "fan-belt-drive": {
    group: "condition",
    chipLabel: "Belt / pulley",
    routeNote:
      "Fan belt or pulley condition was recorded as part of the rooftop review.",
    issue:
      "Fan belt or pulley condition should be reviewed before the next cycle.",
    whyItMatters:
      "Drive-condition issues can turn into airflow or equipment complaints before the next service window.",
    ownerAction:
      "Approve a repair review if the recorded belt or pulley condition should be quoted.",
    notice: "Recorded from rooftop proof. Repair execution is not included in this packet.",
    status: "Action",
    affectsAccess: false,
    location: "RF-01 Rooftop fan area",
  },
  "liquid-tight": {
    group: "condition",
    chipLabel: "Liquid-tight issue",
    routeNote:
      "The system may not be liquid-tight at recorded points and should be reviewed.",
    issue:
      "The system may not be liquid-tight at one or more recorded points.",
    whyItMatters:
      "A liquid-tight issue can turn into grease escape or roof-condition complaints between service cycles.",
    ownerAction:
      "Approve a review if the recorded condition should be corrected or quoted.",
    notice: "Recorded condition only. Repair execution is not included in this packet.",
    status: "Action",
    affectsAccess: false,
    location: "RF-01 Rooftop fan area",
  },
  "grease-containment": {
    group: "condition",
    chipLabel: "Containment review",
    routeNote:
      "Grease containment or drip-path condition was recorded for follow-up review.",
    issue:
      "Grease containment or drip-path condition should be reviewed before the next cycle.",
    whyItMatters:
      "Containment issues can turn into leak, housekeeping, or roof-condition complaints before the next cycle.",
    ownerAction:
      "Approve a containment review if the recorded condition should be corrected or quoted.",
    notice: "Condition was recorded as part of service proof; correction is not included today.",
    status: "Action",
    affectsAccess: false,
    location: "GC-01 Grease containment",
  },
};

function parseDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRange(start: Date, end: Date) {
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
  }

  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
}

function formatServiceDate(value: string) {
  const parsed = parseDate(value);
  return parsed ? formatDate(parsed) : value;
}

function buildNextWindow(value: string, cadence: Axis1BuilderCadence) {
  const parsed = parseDate(value);

  if (!parsed) {
    return cadence === "30"
      ? "May 19-24, 2026"
      : cadence === "60"
        ? "Jun 18-23, 2026"
        : cadence === "120"
          ? "Aug 17-22, 2026"
          : "Jul 18-23, 2026";
  }

  const dueDate = addDays(parsed, Number(cadence));
  const startDate = addDays(dueDate, -5);
  return formatRange(startDate, dueDate);
}

function buildNextDue(value: string, cadence: Axis1BuilderCadence) {
  const parsed = parseDate(value);

  if (!parsed) {
    return cadence === "30"
      ? "May 24, 2026"
      : cadence === "60"
        ? "Jun 23, 2026"
        : cadence === "120"
          ? "Aug 22, 2026"
          : "Jul 23, 2026";
  }

  return formatDate(addDays(parsed, Number(cadence)));
}

function withTrailingPeriod(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildCadenceBasis(cadence: Axis1BuilderCadence) {
  switch (cadence) {
    case "30":
      return "Current grease load and line volume support a 30-day cycle.";
    case "60":
      return "Current grease load supports a 60-day cycle with tighter follow-up than the standard route.";
    case "120":
      return "Current use pattern still supports a 120-day cycle, but the next window should stay locked in the packet.";
    case "90":
    default:
      return "Current grease load and line volume support a 90-day cycle.";
  }
}

function pickExceptionKinds(values: Axis1BuilderFormValues) {
  if (values.scenario !== "exception") {
    return [] as Axis1BuilderExceptionKind[];
  }

  return values.exceptionKinds.length > 0
    ? values.exceptionKinds
    : (["blocked-storage"] as Axis1BuilderExceptionKind[]);
}

function buildCompletedWork(hasAccessException: boolean) {
  return hasAccessException
    ? [
        "Degreased and wiped accessible hood interior surfaces.",
        "Removed, cleaned, and reinstalled the main filter bank.",
        "Cleaned the reachable plenum and duct-path surfaces.",
        "Recorded visible rooftop fan and grease-containment condition.",
      ]
    : [
        "Degreased and wiped hood interior surfaces.",
        "Removed, cleaned, and reinstalled the main filter bank.",
        "Cleaned the plenum and reachable duct-path surfaces.",
        "Recorded visible rooftop fan and grease-containment condition.",
      ];
}

function buildSummaryCopy(
  scenario: Axis1PacketScenario,
  kinds: Axis1BuilderExceptionKind[],
  override: string,
) {
  if (override.trim()) {
    return withTrailingPeriod(override);
  }

  const hasAccessException = kinds.some(
    (kind) => exceptionDefinitions[kind].affectsAccess,
  );

  if (scenario === "clean") {
    return "Completed today: the accessible hood line, filter bank, and reachable plenum were cleaned and closed.";
  }

  if (hasAccessException) {
    return "Completed today: accessible hood, filter, and reachable plenum areas were cleaned. Not completed: blocked access remains listed below.";
  }

  return "Completed today: the cleaning was closed. Recorded condition: review the item below before the next service window.";
}

function buildCustomerActionCopy(
  scenario: Axis1PacketScenario,
  kinds: Axis1BuilderExceptionKind[],
  nextWindow: string,
  followUpMode: Axis1BuilderFollowUpMode,
  override: string,
) {
  if (override.trim()) {
    return withTrailingPeriod(override);
  }

  if (scenario === "clean") {
    return `Reply to confirm the next service window: ${nextWindow}.`;
  }

  const hasAccessException = kinds.some(
    (kind) => exceptionDefinitions[kind].affectsAccess,
  );
  const hasConditionFollowUp = kinds.some(
    (kind) => !exceptionDefinitions[kind].affectsAccess,
  );

  if (hasAccessException && hasConditionFollowUp) {
    return "First, clear the blocked access point. Then reply to schedule the revisit. Mention the recorded condition if you want it quoted.";
  }

  if (hasAccessException) {
    return "Clear the blocked access point, then reply to schedule the revisit.";
  }

  if (hasConditionFollowUp || followUpMode === "quote") {
    return followUpMode === "quote"
      ? "Review the recorded condition and reply if you want a repair review before the next service window."
      : `Review the recorded condition, then confirm the next service window: ${nextWindow}.`;
  }

  return `Confirm the next service window: ${nextWindow}.`;
}

function buildActionTitle(
  scenario: Axis1PacketScenario,
  kinds: Axis1BuilderExceptionKind[],
  followUpMode: Axis1BuilderFollowUpMode,
) {
  if (scenario === "clean") {
    return "Confirm the next service window";
  }

  const hasAccessException = kinds.some(
    (kind) => exceptionDefinitions[kind].affectsAccess,
  );
  const hasConditionFollowUp = kinds.some(
    (kind) => !exceptionDefinitions[kind].affectsAccess,
  );

  if (hasAccessException) {
    return "Clear blocked access before revisit";
  }

  if (hasConditionFollowUp || followUpMode === "quote") {
    return "Review the recorded condition";
  }

  return "Confirm the next service window";
}

function buildFollowUpCopy(
  scenario: Axis1PacketScenario,
  kinds: Axis1BuilderExceptionKind[],
  mode: Axis1BuilderFollowUpMode,
  override: string,
  note: string,
) {
  if (override.trim()) {
    return withTrailingPeriod(override);
  }

  if (note.trim()) {
    return withTrailingPeriod(note);
  }

  const hasConditionFollowUp = kinds.some(
    (kind) => !exceptionDefinitions[kind].affectsAccess,
  );

  if (mode === "quote") {
    return "Repair review can be quoted if this condition should be corrected before the next service.";
  }

  if (mode === "monitor") {
    return hasConditionFollowUp
      ? "Keep this condition visible before the next service. Request review if it worsens."
      : "Visible rooftop and containment conditions stay on record so the office can answer follow-up questions.";
  }

  return scenario === "exception"
    ? "The report keeps the recorded condition visible even when no repair quote is being requested today."
    : "The report keeps a record-only note so the office does not have to reconstruct the visit later.";
}

function buildExceptionNote(kinds: Axis1BuilderExceptionKind[], note: string) {
  if (note.trim()) {
    return withTrailingPeriod(note);
  }

  const firstAccessException = kinds.find(
    (kind) => exceptionDefinitions[kind].affectsAccess,
  );

  return firstAccessException
    ? withTrailingPeriod(exceptionDefinitions[firstAccessException].routeNote)
    : "No open access exception remains.";
}

function buildConditionResponse(
  definition: ExceptionDefinition,
  followUpMode: Axis1BuilderFollowUpMode,
) {
  if (followUpMode === "quote") {
    return {
      ownerAction: definition.ownerAction,
      notice: definition.notice,
      status: "Action",
    } as const;
  }

  if (followUpMode === "monitor") {
    return {
      ownerAction:
        "Keep this condition visible and request review if it worsens before the next service window.",
      notice: "Recorded condition stays visible in the service report until the next cycle.",
      status: "Monitor",
    } as const;
  }

  return {
    ownerAction:
      "No immediate correction is being requested today. Keep this condition in the service record.",
    notice: "Recorded condition only. No separate repair path is being pushed in this report.",
    status: "Recorded",
  } as const;
}

function buildConditionRows(
  kinds: Axis1BuilderExceptionKind[],
  followUpMode: Axis1BuilderFollowUpMode,
  followUpCopy: string,
) {
  const rows = kinds
    .filter((kind) => !exceptionDefinitions[kind].affectsAccess)
    .map((kind) => {
      const definition = exceptionDefinitions[kind];
      const response = buildConditionResponse(definition, followUpMode);
      return {
        location: definition.location,
        issue: definition.issue,
        whyItMatters: definition.whyItMatters,
        ownerAction: response.ownerAction,
        notice: response.notice,
        status: response.status,
      };
    });

  if (rows.length > 0) {
    return rows;
  }

  return [
    {
      location: "RF-01 Rooftop / condition record",
      issue: followUpCopy,
      whyItMatters:
        "The recorded condition stays visible in the report so the next conversation starts from today's visit instead of memory.",
      ownerAction:
        followUpMode === "quote"
          ? "Approve a repair review if the recorded condition should be quoted."
          : followUpMode === "monitor"
            ? "Keep the condition on record and request review if it changes before the next cycle."
            : "No immediate correction is being requested today. Keep the condition in the service record.",
      notice:
        followUpMode === "quote"
          ? "Optional repair-review path only. Repair execution is not included in this report."
          : followUpMode === "monitor"
            ? "Recorded condition stays visible in the service report until the next cycle."
            : "Recorded condition only. No separate repair path is being pushed in this report.",
      status:
        followUpMode === "quote"
          ? "Action"
          : followUpMode === "monitor"
            ? "Monitor"
            : "Recorded",
    },
  ];
}

export function buildAxis1NeutralPacketData(
  values: Axis1BuilderFormValues,
): Axis1PacketPreviewData {
  const scenario = values.scenario as Axis1PacketScenario;
  const base = getAxis1PacketPreviewData({
    branding: "neutral",
    scenario,
  });
  const freeVendor: Axis1PacketPreviewData["vendor"] = {
    ...base.vendor,
    name: "Service report",
    initials: "SR",
    logoUrl: undefined,
    office: "Kitchen exhaust service record",
    directLine: "",
    dispatch: "",
    certification: "",
    technician: "Technician / crew",
    afterHours: "",
    reviewPrompt: "",
    preparedBy: "Technician / crew",
    previewBlurb:
      "Free report output excludes vendor branding, phone, email, and hosted customer links.",
    brandingApplied: false,
  };

  const selectedKinds = pickExceptionKinds(values);
  const hasAccessException = selectedKinds.some(
    (kind) => exceptionDefinitions[kind].affectsAccess,
  );
  const serviceDateLabel = formatServiceDate(values.serviceDate);
  const nextServiceWindow = buildNextWindow(values.serviceDate, values.cadence);
  const nextDue = buildNextDue(values.serviceDate, values.cadence);
  const intervalBasis = buildCadenceBasis(values.cadence);
  const completedWorkLines = buildCompletedWork(hasAccessException);
  const summaryCopy = buildSummaryCopy(
    scenario,
    selectedKinds,
    values.summaryOverride ?? "",
  );
  const customerAction = buildCustomerActionCopy(
    scenario,
    selectedKinds,
    nextServiceWindow,
    values.followUpMode,
    values.customerActionOverride ?? "",
  );
  const followUpCopy = buildFollowUpCopy(
    scenario,
    selectedKinds,
    values.followUpMode,
    values.followUpOverride ?? "",
    values.followUpNote ?? "",
  );
  const exceptionNote = buildExceptionNote(selectedKinds, values.exceptionNote ?? "");
  const propertyTitle = values.propertyName.trim();
  const siteLabel = values.siteCity.trim();
  const systemLabel = values.systemName.trim();
  const authorizedBy = values.authorizedBy.trim();
  const serviceResultTitle =
    scenario === "clean"
      ? "Completed and closed"
      : hasAccessException
        ? "Completed with open access exception"
        : "Completed with recorded condition";
  const actionTitle = buildActionTitle(
    scenario,
    selectedKinds,
    values.followUpMode,
  );
  const routeAccessNote =
    scenario === "exception" && hasAccessException
      ? `Not completed: ${exceptionNote} This area remains tied to the blocked access photo and should not be read as cleaned.`
      : "Access was available and documented at service time.";
  const hasRooftopCondition = selectedKinds.some((kind) =>
    ["rooftop-hinge-curb", "fan-belt-drive", "liquid-tight"].includes(kind),
  );
  const hasContainmentCondition = selectedKinds.includes("grease-containment");
  const conditionStatusLabel =
    values.followUpMode === "quote"
      ? "Action"
      : values.followUpMode === "monitor"
        ? "Monitor"
        : "Recorded";

  const exceptionRows =
    scenario === "exception"
      ? selectedKinds.map((kind) => {
          const definition = exceptionDefinitions[kind];
          const response = definition.affectsAccess
            ? null
            : buildConditionResponse(definition, values.followUpMode);
          return {
            location: definition.location,
            issue: definition.issue,
            whyItMatters: definition.whyItMatters,
            ownerAction: response ? response.ownerAction : definition.ownerAction,
            notice: response ? response.notice : definition.notice,
            status: response ? response.status : definition.status,
          };
        })
      : [];

  const conditionRows = buildConditionRows(
    selectedKinds,
    values.followUpMode,
    followUpCopy,
  );

  const cadenceRow = {
    location: "Next service timing",
    issue: `Recommended next window: ${nextServiceWindow}.`,
    whyItMatters:
      "The next service window stays explicit inside the same proof link so the customer can reply before the visit disappears into memory.",
    ownerAction:
      scenario === "clean"
        ? `Reply to confirm the next service window: ${nextServiceWindow}.`
        : customerAction,
    notice: "This timing is recorded in the proof link and the office file.",
    status: scenario === "clean" ? "Action" : "Monitor",
  };

  return {
    ...base,
    reportUrl: "",
    vendor: freeVendor,
    packetHeader: {
      title: propertyTitle,
      copy: `${systemLabel}. This proof link shows what was cleaned today, what was not completed or recorded, the proof photos, and the next action.`,
      quickFacts: [
        ["Service date", serviceDateLabel],
        ["Location", siteLabel],
        ["System", systemLabel],
        ["Today's result", serviceResultTitle],
        ["Report ID", "HDS-MASKED-0424"],
      ],
      archiveNote:
        "Customer sees the clear service report. Full image archive and raw technician detail stay retained in the office file.",
    },
    summaryCards: [
      {
        label: "Completed today",
        title:
          scenario === "clean"
            ? "Cleaned: accessible hood line and filters."
            : "Cleaned: accessible areas only.",
        copy: summaryCopy,
        icon: "status",
      },
      {
        label: scenario === "clean" ? "Nothing open" : "Still open",
        title: actionTitle,
        copy: customerAction,
        icon: "action",
      },
      {
        label: "Next step",
        title: `Recommended window: ${nextServiceWindow}`,
        copy: `${intervalBasis} Reply to confirm this window or request a different service date.`,
        icon: "next",
      },
    ],
    systemIdentityRows: [
      ["Property", propertyTitle],
      ["Site", siteLabel],
      ["System", `SYS-01 / ${systemLabel}`],
      ["Line served", systemLabel],
      ["Report coverage", "One report for one exhaust system"],
      ["Approved on site", authorizedBy],
    ],
    serviceRecordRows: [
      ["Service window", `${serviceDateLabel} | ${values.serviceWindow.trim()}`],
      ["Today's visit", "Kitchen exhaust cleaning report"],
      ["Technician", freeVendor.technician],
      ["Today's result", serviceResultTitle],
      [
        "Service label",
        scenario === "exception"
          ? hasAccessException
            ? "Exception notice applied at close-out"
            : "Recorded condition noted at close-out"
          : "Service label posted with next due date",
      ],
      [
        "Label / notice ref",
        scenario === "exception"
          ? hasAccessException
            ? "EXC-0424-DK02"
            : "COND-0424-RF01"
          : "LBL-0424-SYS01",
      ],
      ["Why this timing", intervalBasis],
      [
        "Official inspection status",
        "Not evaluated by this report. Official inspection decisions are made by the applicable authority.",
      ],
      ["Report ID", "HDS-MASKED-0424"],
    ],
    routeSegments: [
      {
        code: "HD-01",
        title: "Hood canopy",
        status: "Completed",
        note: `${completedWorkLines[0]} Proof is tied to P-01 and P-02.`,
      },
      {
        code: "FL-01",
        title: "Filter bank",
        status: "Completed",
        note: "Removed, cleaned, inspected, and returned to service.",
      },
      {
        code: "PL-01",
        title: "Plenum / duct path",
        status: "Completed",
        note: "Reachable path cleaned and documented in report scope.",
      },
      {
        code: "DK-02",
        title: "Rear duct access",
        status:
          scenario === "exception" && hasAccessException ? "Inaccessible" : "Completed",
        note: routeAccessNote,
      },
      {
        code: "RF-01",
        title: "Rooftop fan area",
        status:
          scenario === "exception" && hasRooftopCondition
            ? conditionStatusLabel
            : "Recorded",
        note: followUpCopy,
      },
    ],
    scopeRows: [
      [
        "HD-01 Hood canopy interior",
        "Completed",
        `${completedWorkLines[0]} Linked to proof photos P-01 / P-02.`,
      ],
      [
        "FL-01 Filter bank",
        "Completed",
        completedWorkLines[1],
      ],
      [
        "PL-01 Plenum / reachable duct path",
        "Completed",
        completedWorkLines[2],
      ],
      [
        "DK-02 Rear duct access panel",
        scenario === "exception" && hasAccessException ? "Inaccessible" : "Completed",
        scenario === "exception" && hasAccessException
          ? exceptionNote
          : "Access was clear and documented during service.",
      ],
      [
        "RF-01 Rooftop fan area",
        hasRooftopCondition ? conditionStatusLabel : "Recorded",
        followUpCopy,
      ],
      [
        "GC-01 Grease containment",
        hasContainmentCondition ? conditionStatusLabel : "Recorded",
        hasContainmentCondition
          ? exceptionDefinitions["grease-containment"].routeNote
          : completedWorkLines[3],
      ],
    ],
    completedWork: completedWorkLines,
    operationalChecks: [
      ["Baffle filters returned to service", "Yes"],
      ["Reachable access points resecured", "Yes"],
      ["Rooftop fan visually documented", "Yes"],
      ["Grease containment / drip area reviewed", "Yes"],
      ["Next service timing recorded", "Yes"],
      ["Service label status recorded", "Yes"],
      ["Fire suppression inspection included", "No - separate scope"],
      [
        "Open-item notice required at close-out",
        scenario === "exception" && hasAccessException
          ? "Yes - access issue remained"
          : "No - standard close-out",
      ],
    ],
    callout:
      scenario === "exception"
        ? hasAccessException
            ? {
              eyebrow: "Inaccessible / not cleaned",
              title: "Access exception stays visible.",
              copy: `${exceptionNote} The report keeps the issue explicit while still giving the customer one clear next step.`,
              tone: "issue",
            }
          : {
              eyebrow: "Recorded condition",
              title: "The recorded condition stays visible in the report.",
              copy:
                "The visit closes with one clear recorded condition instead of burying the issue in raw notes or separate emails.",
              tone: "issue",
            }
        : {
            eyebrow: "Service close-out",
            title: "No open access exception remains.",
            copy:
              "Accessible sections were cleaned, documented, and closed without an open access exception at departure.",
            tone: "success",
          },
    notesSection:
      scenario === "exception"
        ? {
            label: "Open notes + next steps",
            title: "Anything still open or recorded stays listed here in plain language.",
          }
        : {
            label: "Next steps",
            title: "This section keeps the next visit and any open note in one place.",
          },
    deficiencyRows:
      scenario === "exception"
        ? [...exceptionRows, ...conditionRows, cadenceRow]
        : [
            {
              location: "Service close-out",
              issue: "System closed without an open access exception.",
              whyItMatters:
                "The customer can understand the completed visit without another explanation call.",
              ownerAction: customerAction,
              notice: "Standard service label posted with next due date.",
              status: "Closed",
            },
            ...conditionRows,
            {
              ...cadenceRow,
              location: "Next service timing",
            },
          ],
    customerClose:
      scenario === "exception"
        ? {
            title:
              hasAccessException
                ? "Clear the blocked area, then reply to schedule the revisit."
                : "Review this condition and reply if you want it quoted.",
            copy:
              "The proof link separates completed work from the open item so the next reply can be short and clear.",
            actionItems: [
              ["Next visit window", nextServiceWindow],
              ["Reply or action", customerAction],
              ["Recorded note", followUpCopy],
            ],
          }
        : {
          title: "Reply to confirm the next service window.",
          copy:
              "The proof link keeps the recommended service window visible while the visit is still fresh.",
            actionItems: [
              ["Next visit window", nextServiceWindow],
              ["Reply or action", customerAction],
              ["Recorded note", followUpCopy],
            ],
          },
    closeoutRows: [
      [
        "Service label type",
        scenario === "exception"
          ? hasAccessException
            ? "Access exception notice"
            : "Recorded condition notice"
          : "Standard service close-out",
      ],
      [
        "Label / notice ref",
        scenario === "exception"
          ? hasAccessException
            ? "EXC-0424-DK02"
            : "COND-0424-RF01"
          : "LBL-0424-SYS01",
      ],
      [
        "Label posted",
        scenario === "exception" && hasAccessException
          ? "Yes - service date + report reference"
          : "Yes - next due date shown",
      ],
      ["Prepared by technician", freeVendor.preparedBy],
      ["Approved on site", authorizedBy],
      ["Delivery record", "PDF copy saved for customer records"],
      ["Record retention", "Customer report and office archive retained"],
      ["Next due", nextDue],
      ["Reply path", customerAction],
    ],
    scopeNote:
      "This report covers this kitchen exhaust cleaning visit for one exhaust system. Fire suppression inspection and repair work are not included unless separately quoted.",
  };
}

export function buildAxis1FreeSharedPacketData(
  values: Axis1BuilderFormValues,
): Axis1PacketPreviewData {
  const data = buildAxis1NeutralPacketData(values);

  return {
    ...data,
    proofPhotos: [],
    proofPolicyRows: [
      [
        "Shared report",
        "This link reproduces the written service report for this visit.",
      ],
      [
        "Field photos",
        "Any local field photos are supplied separately by the service provider.",
      ],
      [
        "Record copy",
        "Use the PDF copy or service record for local photo files and archive.",
      ],
    ],
    componentStatusRows: data.componentStatusRows.map((row) => ({
      ...row,
      proof: "Service record",
      note: row.note
        .replace(" Linked to proof photos P-01 / P-02.", "")
        .replace(" Proof is tied to P-01 and P-02.", "")
        .replace("Before and after proof attached to HD-01.", "Work recorded for this section."),
    })),
    routeSegments: data.routeSegments.map((segment) => ({
      ...segment,
      note: segment.note
        .replace(" Proof is tied to P-01 and P-02.", " Work recorded for this section.")
        .replace(" Exception remains tied to proof P-04.", " Exception remains tied to this service record."),
    })),
    photoCoverageRows: data.photoCoverageRows.map((row) => ({
      ...row,
      proof: "Not hosted",
      status: "Not attached",
    })),
    scopeRows: data.scopeRows.map(([area, status, note]) => [
      area,
      status,
      note
        .replace(" Linked to proof photos P-01 / P-02.", "")
        .replace(" Proof is tied to P-01 and P-02.", ""),
    ] as const),
    closeoutRows: [
      ...data.closeoutRows.map(([label, value]): [string, string] => {
        if (label === "Delivery record") {
          return [label, "Shared report link delivered"];
        }

        if (label === "Record retention") {
          return [
            label,
            "Keep this link with kitchen exhaust service records",
          ];
        }

        return [label, value];
      }),
      [
        "Field photos",
        "If field photos were captured, they are supplied separately by the service provider.",
      ] as [string, string],
    ],
  };
}
