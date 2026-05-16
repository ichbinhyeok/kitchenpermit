"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS as DndCss } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowRight,
  IconCameraPlus,
  IconCircleCheck,
  IconCircleDashed,
  IconPhotoScan,
} from "@tabler/icons-react";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Eye,
  FileDown,
  FileText,
  GripVertical,
  Link2,
  PencilLine,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  Axis1PacketDocument,
  type Axis1PacketDocumentSectionVisibility,
  type CustomerWebPacketEditConfig,
  type CustomerWebPacketEditTarget,
} from "@/components/axis1/packet-document";
import { Axis1BuilderHeader } from "@/components/axis1/axis1-builder-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Panel } from "@/components/ui/panel";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchApi } from "@/lib/api";
import {
  axis1BuilderDefaults,
  axis1BuilderSchema,
  axis1CadenceOptions,
  axis1ExceptionGroups,
  axis1ExceptionOptions,
  axis1FollowUpOptions,
  buildAxis1NeutralPacketData,
  type Axis1BuilderExceptionKind,
  type Axis1BuilderFormValues,
} from "@/lib/axis1-packet-builder";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
  type Axis1CloseoutAreaId,
  type Axis1CloseoutAreaLedgerItem,
  type Axis1CloseoutAreaProofBasis,
  type Axis1CloseoutAreaState,
  type Axis1CloseoutLinks,
} from "@/lib/axis1-closeout-engine";
import {
  axis1PhotoAssistLowConfidenceThreshold,
  buildMockAxis1PhotoAssistSuggestions,
  shouldKeepAxis1PhotoAssistSuggestionInReview,
  type Axis1PhotoAssistInputPhoto,
  type Axis1PhotoAssistResponse,
  type Axis1PhotoAssistSuggestion,
} from "@/lib/axis1-photo-assist";
import {
  axis1FieldPhotoSlots as fieldPhotoSlots,
  buildAxis1PacketDataWithFieldPhotos,
  emptyAxis1FieldPhotoState,
  emptyAxis1PhotoSlotResolutions,
  type Axis1FieldPhotoConfidence as FieldPhotoConfidence,
  type Axis1FieldPhotoSlotId as FieldPhotoSlotId,
  type Axis1PhotoSlotResolution as PhotoSlotResolution,
  type Axis1UploadedFieldPhoto as UploadedFieldPhoto,
} from "@/lib/axis1-field-photos";
import {
  saveAxis1LocalPacket,
  type Axis1LocalPacketSaveInput,
} from "@/lib/axis1-local-packet-store";
import {
  applyAxis1CompanyProfileToPacketData,
  defaultAxis1CompanyProfile,
  readAxis1CompanyProfile,
  saveAxis1CompanyProfile,
  subscribeAxis1CompanyProfile,
} from "@/lib/axis1-company-profile";
import {
  loadAxis1AccountEntitlements,
  loadAxis1ServerReportForBuilder,
  loadAxis1ServerCompanyProfile,
  saveAxis1ServerReport,
  type Axis1AccountEntitlements,
} from "@/lib/axis1-server-storage";
import {
  getAxis1PlanSearchValue,
  getAxis1ProductPlanPolicy,
  normalizeAxis1ProductPlan,
  type Axis1ProductPlan,
} from "@/lib/axis1-product-policy";

const jobPatternPresets = [
  {
    id: "clean-close",
    label: "Completed",
    title: "Completed",
    copy: "Use when included work was completed and no customer action is needed.",
    scenario: "clean",
    exceptionKinds: [],
    followUpMode: "none",
  },
  {
    id: "blocked-access",
    label: "Blocked / no access",
    title: "Completed where reachable",
    copy: "Use when the crew completed reachable work but one area stayed blocked or inaccessible.",
    scenario: "exception",
    exceptionKinds: ["blocked-storage"],
    followUpMode: "monitor",
  },
  {
    id: "condition-review",
    label: "Condition found",
    title: "Service done, condition noted",
    copy: "Use when service is recorded and a condition should drive quote, revisit, or next-service follow-up.",
    scenario: "exception",
    exceptionKinds: ["rooftop-hinge-curb"],
    followUpMode: "quote",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  title: string;
  copy: string;
  scenario: Axis1BuilderFormValues["scenario"];
  exceptionKinds: Axis1BuilderExceptionKind[];
  followUpMode: Axis1BuilderFormValues["followUpMode"];
}>;

type JobPatternPreset = (typeof jobPatternPresets)[number];
type JobPatternId = JobPatternPreset["id"];

type BuilderStep = "photos" | "review" | "outputs";
type MobileSheetView = "photo-review" | "report-actions";
type PacketPresentationMode = "standard" | "short";
type ReportOutputMode = "link" | "pdf";
type SetupNoticeAction = "copy-link" | "open-link" | "print-pdf";
type AuthSessionStatus = "checking" | "authenticated" | "anonymous";
type PaidFeatureNotice = "company-plan" | "branding" | "history";
type SavedReportLink = {
  url: string;
  storage: "server" | "local";
  productPlan: Axis1ProductPlan;
};
type CustomerLineEditor =
  | "result"
  | "open-item"
  | "action"
  | "photo-record"
  | "timing";
type CustomerLineEditorSurface = "draft" | "report" | "ready" | "preview";
type UnplacedFieldPhoto = UploadedFieldPhoto & {
  id: string;
  suggestedSlotId: FieldPhotoSlotId | null;
  reason: "duplicate" | "overflow";
};
type FieldPhotoSlot = (typeof fieldPhotoSlots)[number];
type UploadedFieldPhotoState = Record<FieldPhotoSlotId, UploadedFieldPhoto | null>;
type PhotoImportNotice = {
  tone: "success" | "warning" | "error";
  message: string;
};
type JobOutcomeRecommendation = {
  pattern: JobPatternPreset;
  signalLabel: string;
  reason: string;
  confidence: "Default" | "Medium" | "High";
};
type RiskFlagId =
  | "no-risk"
  | "access-risk"
  | "heavy-grease"
  | "equipment-condition"
  | "scope-unclear"
  | "customer-expectation";
type RiskFlag = {
  id: RiskFlagId;
  label: string;
  copy: string;
  tone: "clear" | "review";
};
type ScopeAreaId =
  | "hood-filters"
  | "duct-access"
  | "rooftop-fan"
  | "grease-path"
  | "service-label";
type VisitTypeId =
  | "standard-hood"
  | "hood-fan"
  | "filter-only"
  | "fan-only"
  | "access-revisit"
  | "condition-record";
type ScopeStatus =
  | "done-photo"
  | "done-no-photo"
  | "could-not-access"
  | "condition-note"
  | "not-done"
  | "not-in-scope"
  | "needs-review";
type ScopeEvidence = "photo" | "written" | "none" | "unclear";
type ScopeOverrideState = Partial<Record<ScopeAreaId, ScopeStatus>>;
type ScopeAreaDefinition = {
  id: ScopeAreaId;
  label: string;
  shortLabel: string;
  copy: string;
  slotIds: FieldPhotoSlotId[];
  expectedByDefault: boolean;
};
type ScopeLedgerRow = ScopeAreaDefinition & {
  status: ScopeStatus;
  evidence: ScopeEvidence;
  photoCount: number;
  suggestedCount: number;
  needsCheck: boolean;
  reason: string;
};
type ScopeStatusOption = {
  value: ScopeStatus;
  label: string;
  disabled?: boolean;
};
type PhotoAssistNotice = {
  tone: "idle" | "success" | "warning" | "error";
  message: string;
  meta?: string;
};
type PreparedPhotoPreview =
  | {
      ok: true;
      src: string;
      wasNormalized: boolean;
    }
  | {
      ok: false;
      reason: string;
    };

const photoDragPrefix = "photo:";
const extraPhotoDragPrefix = "extra-photo:";
const photoTargetPrefix = "photo-target:";
const maxPhotoPreviewDimension = 1600;
const maxPhotoAssistDimension = 896;
const photoAssistJpegQuality = 0.72;
const maxPhotoImportBytes = 40 * 1024 * 1024;
const maxBulkPhotoImportCount = 16;
const smallPhotoFallbackBytes = 5 * 1024 * 1024;
const scopeAreaCatalog = [
  {
    id: "hood-filters",
    label: "Hood / filters",
    shortLabel: "Hood",
    copy: "Canopy, baffle filters, tracks, and reachable hood area.",
    slotIds: ["hood-before", "hood-after", "filter-bank"],
    expectedByDefault: true,
  },
  {
    id: "duct-access",
    label: "Duct / access path",
    shortLabel: "Duct",
    copy: "Reachable plenum, duct path, rear access, and blocked-access notes.",
    slotIds: ["access-condition"],
    expectedByDefault: true,
  },
  {
    id: "rooftop-fan",
    label: "Rooftop fan",
    shortLabel: "Fan",
    copy: "Fan bowl, hinge, curb, belt/pulley visibility, and rooftop condition.",
    slotIds: ["rooftop-fan"],
    expectedByDefault: true,
  },
  {
    id: "grease-path",
    label: "Grease path",
    shortLabel: "Grease",
    copy: "Removed grease, grease cups, containment, drip path, buckets, and roof grease trail.",
    slotIds: ["grease-containment"],
    expectedByDefault: true,
  },
  {
    id: "service-label",
    label: "Label / notice",
    shortLabel: "Label",
    copy: "Next-due sticker, service label, posted notice, or manager-facing record.",
    slotIds: ["service-label"],
    expectedByDefault: false,
  },
] as const satisfies ReadonlyArray<ScopeAreaDefinition>;

const riskFlagCatalog = [
  {
    id: "no-risk",
    label: "Standard service record",
    copy: "Standard maintenance visit; no quote or access note recorded yet.",
    tone: "clear",
  },
  {
    id: "access-risk",
    label: "Access needs review",
    copy: "Panel, roof, duct, key, tenant, or manager access may block included work.",
    tone: "review",
  },
  {
    id: "heavy-grease",
    label: "Heavy grease / initial clean",
    copy: "Grease load may exceed normal maintenance pricing or time.",
    tone: "review",
  },
  {
    id: "equipment-condition",
    label: "Fan / duct condition",
    copy: "Fan, belt, hinge, curb, duct, or containment condition may need follow-up.",
    tone: "review",
  },
  {
    id: "scope-unclear",
    label: "Work boundary unclear",
    copy: "Customer expectation or included/excluded work needs a clear boundary.",
    tone: "review",
  },
  {
    id: "customer-expectation",
    label: "Payment expectation note",
    copy: "Customer may compare full exhaust work to a cheaper visible-hood wipe.",
    tone: "review",
  },
] as const satisfies ReadonlyArray<RiskFlag>;

const visitTypePresets = [
  {
    id: "standard-hood",
    label: "Standard",
    title: "Hood cleaning",
    copy: "Hood, duct, fan, and grease path expected.",
    expectedAreaIds: [
      "hood-filters",
      "duct-access",
      "rooftop-fan",
      "grease-path",
    ],
  },
  {
    id: "hood-fan",
    label: "Hood + fan",
    title: "Full exhaust path",
    copy: "Use when fan and duct were part of the visit.",
    expectedAreaIds: [
      "hood-filters",
      "duct-access",
      "rooftop-fan",
      "grease-path",
    ],
  },
  {
    id: "filter-only",
    label: "Filters only",
    title: "Filter service",
    copy: "Only hood/filter work is expected.",
    expectedAreaIds: ["hood-filters"],
  },
  {
    id: "fan-only",
    label: "Fan only",
    title: "Rooftop fan",
    copy: "Fan and rooftop grease path only.",
    expectedAreaIds: ["rooftop-fan", "grease-path"],
  },
  {
    id: "access-revisit",
    label: "Access revisit",
    title: "Blocked area return",
    copy: "Only the access path is expected.",
    expectedAreaIds: ["duct-access"],
  },
  {
    id: "condition-record",
    label: "Condition only",
    title: "Record condition",
    copy: "No cleaning completion is assumed.",
    expectedAreaIds: [],
  },
] as const satisfies ReadonlyArray<{
  id: VisitTypeId;
  label: string;
  title: string;
  copy: string;
  expectedAreaIds: ScopeAreaId[];
}>;

function getVisitTypePreset(id: VisitTypeId) {
  return (
    visitTypePresets.find((preset) => preset.id === id) ??
    visitTypePresets[0]
  );
}

function toDisplaySentence(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function makePhotoDragId(slotId: FieldPhotoSlotId) {
  return `${photoDragPrefix}${slotId}`;
}

function makeExtraPhotoDragId(photoId: string) {
  return `${extraPhotoDragPrefix}${photoId}`;
}

function makePhotoTargetId(slotId: FieldPhotoSlotId) {
  return `${photoTargetPrefix}${slotId}`;
}

function isFieldPhotoSlotId(value: string): value is FieldPhotoSlotId {
  return fieldPhotoSlots.some((slot) => slot.id === value);
}

function slotIdFromDndId(id: string | number, prefix: string) {
  const value = String(id);

  if (!value.startsWith(prefix)) {
    return null;
  }

  const slotId = value.slice(prefix.length);
  return isFieldPhotoSlotId(slotId) ? slotId : null;
}

function extraPhotoIdFromDndId(id: string | number) {
  const value = String(id);
  return value.startsWith(extraPhotoDragPrefix)
    ? value.slice(extraPhotoDragPrefix.length)
    : null;
}

function isMobileViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  );
}

function scrollPacketWorkspaceBelowHeader(behavior: ScrollBehavior = "smooth") {
  window.scrollTo({ top: 0, behavior });
}

function createLocalPhotoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isVendorConfirmedPhoto(photo: UploadedFieldPhoto | null | undefined) {
  return (
    Boolean(photo) &&
    (photo?.confidence === "manual" ||
      photo?.vendorDecision === "confirmed" ||
      photo?.vendorDecision === "edited" ||
      isFastConfirmableSuggestedPhoto(photo))
  );
}

type FastConfirmPhotoCandidate = Partial<
  Pick<
    UploadedFieldPhoto,
    | "assistConfidence"
    | "assistSource"
    | "assistSuggestedSlotId"
    | "needsVendorReview"
    | "vendorDecision"
  >
> & {
  suggestedSlotId?: FieldPhotoSlotId | null;
};

function isFastConfirmableSuggestedPhoto(
  photo: FastConfirmPhotoCandidate | null | undefined,
) {
  if (!photo || photo.vendorDecision !== "pending") {
    return false;
  }

  return (
    photo.assistSource === "gemini" &&
    photo.needsVendorReview === false &&
    typeof photo.assistConfidence === "number" &&
    photo.assistConfidence >= axis1PhotoAssistLowConfidenceThreshold &&
    Boolean(photo.assistSuggestedSlotId ?? photo.suggestedSlotId)
  );
}

function buildConfirmedFieldPhotoState(
  uploadedFieldPhotos: UploadedFieldPhotoState,
): UploadedFieldPhotoState {
  const confirmed = emptyFieldPhotoState();

  fieldPhotoSlots.forEach((slot) => {
    const photo = uploadedFieldPhotos[slot.id];

    if (isVendorConfirmedPhoto(photo)) {
      confirmed[slot.id] = photo;
    }
  });

  return confirmed;
}

function createPhotoAssistMetadata(
  suggestion: Axis1PhotoAssistSuggestion | null,
): Partial<UploadedFieldPhoto> {
  if (!suggestion) {
    return {
      vendorDecision: "confirmed",
    };
  }

  return {
    assistSuggestionId: suggestion.id,
    assistSource: suggestion.source,
    assistConfidence: suggestion.confidence,
    assistReason: suggestion.reason,
    assistSuggestedSlotId: suggestion.suggestedSlotId,
    needsVendorReview: suggestion.needsVendorReview,
    vendorDecision: suggestion.vendorDecision,
  };
}

function getJobPatternById(id: JobPatternId): JobPatternPreset {
  return jobPatternPresets.find((pattern) => pattern.id === id) ?? jobPatternPresets[0];
}

function getScopeStatusMeta(status: ScopeStatus) {
  switch (status) {
    case "done-photo":
      return {
        label: "Completed + photo",
        chip: "Photo",
        className: "border-[#2c7a3f]/22 bg-[#f1f8ef] text-[#1f6330]",
      };
    case "done-no-photo":
      return {
        label: "Completed, no photo",
        chip: "Notes",
        className: "border-[#f26a21]/20 bg-[#fff7ef] text-[#a94410]",
      };
    case "could-not-access":
      return {
        label: "Could not access",
        chip: "Blocked",
        className: "border-[#bc3d1f]/22 bg-[#fff1ed] text-[#9d2f18]",
      };
    case "condition-note":
      return {
        label: "Condition only",
        chip: "Note",
        className: "border-[#7b5c1f]/22 bg-[#fff7d6] text-[#6b4b11]",
      };
    case "not-done":
      return {
        label: "Not done",
        chip: "Open",
        className: "border-[#bc3d1f]/22 bg-[#fff1ed] text-[#9d2f18]",
      };
    case "not-in-scope":
      return {
        label: "Not part of this job",
        chip: "Separate",
        className: "border-black/10 bg-white text-muted-foreground",
      };
    default:
      return {
        label: "Unclear / needs review",
        chip: "Review",
        className: "border-[#f26a21]/24 bg-[#fff2e8] text-[#a94410]",
      };
  }
}

function buildScopeStatusOptions(row: ScopeLedgerRow): ScopeStatusOption[] {
  return [
    ...(row.status === "needs-review"
      ? [{ value: "needs-review" as const, label: "Unclear / needs review" }]
      : []),
    {
      value: "done-photo",
      label: "Completed + photo",
      disabled: row.photoCount === 0,
    },
    {
      value: "done-no-photo",
      label: "Completed, no photo",
    },
    {
      value: "could-not-access",
      label: "Blocked / no access",
    },
    {
      value: "not-done",
      label: "Not completed",
    },
    {
      value: "condition-note",
      label: "Condition only",
    },
    {
      value: "not-in-scope",
      label: "Not part of this job",
    },
  ];
}

function buildScopeLedger(options: {
  uploadedFieldPhotos: UploadedFieldPhotoState;
  unplacedFieldPhotos: UnplacedFieldPhoto[];
  overrides: ScopeOverrideState;
  expectedAreaIds: ReadonlySet<ScopeAreaId>;
}): ScopeLedgerRow[] {
  return scopeAreaCatalog.map((area) => {
    const expectedForVisit = options.expectedAreaIds.has(area.id);
    const photoCount = area.slotIds.filter(
      (slotId) => options.uploadedFieldPhotos[slotId],
    ).length;
    const suggestedCount = options.unplacedFieldPhotos.filter((photo) =>
      photo.suggestedSlotId
        ? (area.slotIds as readonly FieldPhotoSlotId[]).includes(
            photo.suggestedSlotId,
          )
        : false,
    ).length;
    const hasPartialHoodProof =
      area.id === "hood-filters" &&
      (Boolean(options.uploadedFieldPhotos["hood-before"]) !==
        Boolean(options.uploadedFieldPhotos["hood-after"]));
    const defaultStatus: ScopeStatus = hasPartialHoodProof
      ? "needs-review"
      : photoCount > 0
        ? "done-photo"
        : expectedForVisit
          ? "done-no-photo"
          : "not-in-scope";
    const status = options.overrides[area.id] ?? defaultStatus;
    const evidence: ScopeEvidence =
      status === "done-photo"
        ? "photo"
        : status === "needs-review"
          ? "unclear"
          : status === "done-no-photo" ||
              status === "could-not-access" ||
              status === "condition-note" ||
              status === "not-done"
            ? photoCount > 0
              ? "photo"
              : "written"
            : "none";
    const reason =
      status === "needs-review"
        ? hasPartialHoodProof
          ? "Before/after support is incomplete. Confirm what should be shown."
          : "This area needs a vendor status before the customer sees it."
        : status === "done-no-photo"
          ? suggestedCount > 0
            ? "Assumed complete from the standard closeout. AI saved possible photo evidence, but customer copy will not claim it unless attached."
            : "Assumed complete from the standard closeout; no field photo is attached for this area."
          : status === "could-not-access"
            ? "This area will be written as blocked or inaccessible, not as completed."
            : status === "condition-note"
              ? "This area stays visible as a follow-up condition, separate from completed cleaning."
              : status === "not-done"
                ? "This area will be listed as not completed if it matters to the customer."
                : status === "not-in-scope"
                  ? "This area stays out of the customer message."
                  : "Photo support is attached for this area.";

    return {
      ...area,
      expectedByDefault: expectedForVisit,
      status,
      evidence,
      photoCount,
      suggestedCount,
      needsCheck:
        status === "needs-review" ||
        status === "could-not-access" ||
        status === "condition-note" ||
        status === "not-done",
      reason,
    };
  });
}

function buildScopeOutcomeRecommendation(
  rows: readonly ScopeLedgerRow[],
  fallback: JobOutcomeRecommendation,
): JobOutcomeRecommendation {
  const accessRows = rows.filter(
    (row) => row.status === "could-not-access" || row.status === "not-done",
  );
  const conditionRows = rows.filter((row) => row.status === "condition-note");

  if (accessRows.length > 0) {
    return {
      pattern: getJobPatternById("blocked-access"),
      signalLabel: "Area issue detected",
      reason: `${accessRows.map((row) => row.shortLabel).join(", ")} marked blocked or not completed in the closeout review.`,
      confidence: "High",
    };
  }

  if (conditionRows.length > 0) {
    return {
      pattern: getJobPatternById("condition-review"),
      signalLabel: "Condition note detected",
      reason: `${conditionRows.map((row) => row.shortLabel).join(", ")} marked as a customer-visible condition.`,
      confidence: "High",
    };
  }

  return fallback;
}

const scopeOutputMeta: Record<
  ScopeAreaId,
  {
    code: string;
    routeTitle: string;
    component: string;
    coverageLabel: string;
    coveredCopy: string;
    recordedCopy: string;
  }
> = {
  "hood-filters": {
    code: "HD/FL",
    routeTitle: "Hood canopy and filters",
    component: "Hood canopy and filters",
    coverageLabel: "Hood canopy and filters",
    coveredCopy:
      "Hood body, baffle filters, tracks, and nearby grease collection points were included in this visit.",
    recordedCopy:
      "Hood and filter condition stay visible in the record without implying missing photo proof.",
  },
  "duct-access": {
    code: "PL/DK",
    routeTitle: "Plenum, duct path, and access",
    component: "Plenum, duct path, and access",
    coverageLabel: "Reachable plenum, duct path, and access",
    coveredCopy:
      "Reachable plenum, duct path, and access points were included instead of stopping at the visible hood face.",
    recordedCopy:
      "Duct and access status stays visible so the customer can see whether the path was completed, blocked, or excluded.",
  },
  "rooftop-fan": {
    code: "RF-01",
    routeTitle: "Rooftop fan",
    component: "Rooftop fan and roof discharge",
    coverageLabel: "Rooftop fan and roof discharge",
    coveredCopy:
      "Rooftop fan, hinge/curb, belt/pulley visibility, and discharge-area status were included in the service record.",
    recordedCopy:
      "Fan, hinge, curb, belt/pulley visibility, and roof-discharge condition stay visible for future review.",
  },
  "grease-path": {
    code: "GC-01",
    routeTitle: "Grease path and containment",
    component: "Grease path and containment",
    coverageLabel: "Grease path and containment",
    coveredCopy:
      "Grease path, grease cups, containment, drip points, buckets, or roof grease trail were included in the service record.",
    recordedCopy:
      "Grease cup, containment, drip-path, or roof-grease condition stays visible so roof or housekeeping complaints do not depend on memory.",
  },
  "service-label": {
    code: "LBL-01",
    routeTitle: "Service label / notice",
    component: "Service label / notice",
    coverageLabel: "Service label / notice",
    coveredCopy:
      "Service label, next-due sticker, or notice status was included in the retained record.",
    recordedCopy:
      "Label or notice status stays visible for manager and outside record requests.",
  },
};

function upsertDisplayRows(
  rows: readonly (readonly [string, string])[],
  additions: readonly (readonly [string, string])[],
) {
  const additionLabels = new Set(additions.map(([label]) => label));
  return [
    ...rows
      .filter(([label]) => !additionLabels.has(label))
      .map(([label, value]) => [label, value] as [string, string]),
    ...additions.map(([label, value]) => [label, value] as [string, string]),
  ];
}

function formatScopeAreaList(rows: readonly ScopeLedgerRow[], statuses: readonly ScopeStatus[]) {
  const labels = rows
    .filter(
      (row) =>
        statuses.includes(row.status) &&
        !(row.id === "service-label" && row.status === "not-in-scope"),
    )
    .map((row) => scopeOutputMeta[row.id].coverageLabel);

  return labels.length > 0 ? labels.join(", ") : "None recorded";
}

function formatScopeAreaLabels(rows: readonly ScopeLedgerRow[]) {
  return rows.map((row) => scopeOutputMeta[row.id].coverageLabel).join(", ");
}

function scopeProofLabel(row: ScopeLedgerRow, data: Axis1PacketPreviewData) {
  if (row.photoCount <= 0) {
    return row.status === "not-in-scope" ? "Not in this visit" : "Service notes";
  }

  const attachedRefs: string[] = [];

  row.slotIds.forEach((slotId) => {
    const proofId = fieldPhotoSlots.find((slot) => slot.id === slotId)?.proofId;

    if (proofId && data.proofPhotos.some((photo) => photo.proofId === proofId)) {
      attachedRefs.push(proofId);
    }
  });

  return attachedRefs.length > 0 ? attachedRefs.join(" / ") : "Attached field photo";
}

function scopeStatusLabel(row: ScopeLedgerRow) {
  switch (row.status) {
    case "done-photo":
      return "Completed with photo";
    case "done-no-photo":
      return "Completed from notes";
    case "could-not-access":
      return "Not completed - inaccessible";
    case "condition-note":
      return "Recorded condition";
    case "not-done":
      return "Not completed";
    case "not-in-scope":
      return "Not in this visit";
    case "needs-review":
    default:
      return "Needs review";
  }
}

function closeoutAreaIdForScopeArea(areaId: ScopeAreaId): Axis1CloseoutAreaId {
  switch (areaId) {
    case "hood-filters":
      return "hood_filters";
    case "duct-access":
      return "duct_access";
    case "rooftop-fan":
      return "rooftop_fan";
    case "grease-path":
      return "grease_path";
    case "service-label":
      return "label_notice";
  }
}

function closeoutAreaStateForScopeStatus(status: ScopeStatus): Axis1CloseoutAreaState {
  switch (status) {
    case "done-photo":
      return "completed_with_photo";
    case "done-no-photo":
      return "completed_from_notes";
    case "could-not-access":
      return "blocked_no_access";
    case "not-done":
      return "not_completed";
    case "condition-note":
      return "condition_noted";
    case "not-in-scope":
      return "separate_not_this_visit";
    case "needs-review":
    default:
      return "unclear_needs_review";
  }
}

function closeoutProofBasisForScopeEvidence(
  evidence: ScopeEvidence,
): Axis1CloseoutAreaProofBasis {
  switch (evidence) {
    case "photo":
      return "photo";
    case "written":
      return "written";
    case "none":
      return "none";
    case "unclear":
    default:
      return "unclear";
  }
}

function buildCloseoutAreaLedger(
  rows: readonly ScopeLedgerRow[],
): Axis1CloseoutAreaLedgerItem[] {
  return rows.map((row) => ({
    area: closeoutAreaIdForScopeArea(row.id),
    label: row.label,
    state: closeoutAreaStateForScopeStatus(row.status),
    proofBasis: closeoutProofBasisForScopeEvidence(row.evidence),
    photoCount: row.photoCount,
    customerVisible:
      row.status !== "not-in-scope" || row.id !== "service-label",
    vendorOnlyReason:
      row.status === "needs-review"
        ? row.reason
        : row.status === "not-in-scope"
          ? "Left out of completed-work wording for this visit."
          : undefined,
  }));
}

function scopeStatusForArea(rows: readonly ScopeLedgerRow[], areaId: ScopeAreaId) {
  const row = rows.find((item) => item.id === areaId);
  return row ? scopeStatusLabel(row) : "Not in this visit";
}

function scopeRowNote(row: ScopeLedgerRow, data: Axis1PacketPreviewData) {
  const meta = scopeOutputMeta[row.id];
  const proofLabel = scopeProofLabel(row, data);

  switch (row.status) {
    case "done-photo":
      return `${meta.coveredCopy} Photo support: ${proofLabel}.`;
    case "done-no-photo":
      return `${meta.coveredCopy} Completed from service notes; no field photo is attached for this area.`;
    case "could-not-access":
      return `${meta.coverageLabel} could not be accessed during this visit and is left out of completed-work wording until access is clear.`;
    case "condition-note":
      return row.photoCount > 0
        ? `${meta.recordedCopy} Condition photo support: ${proofLabel}. This is a recorded condition, not completed corrective work.`
        : `${meta.recordedCopy} Condition recorded from service note; no condition photo is attached. This is a recorded condition, not completed corrective work.`;
    case "not-done":
      return `${meta.coverageLabel} was not completed during this visit and is left out of completed-work wording.`;
    case "not-in-scope":
      return `${meta.coverageLabel} was not part of this service visit and is not shown as completed.`;
    case "needs-review":
    default:
      return `${meta.coverageLabel} needs a confirmed area status before customer delivery.`;
  }
}

function scopeCoverageState(
  status: ScopeStatus,
): NonNullable<Axis1PacketPreviewData["closeout"]>["coverageEducation"]["items"][number]["state"] {
  if (status === "could-not-access" || status === "not-done" || status === "needs-review") {
    return "action_required";
  }

  if (status === "condition-note") {
    return "recorded";
  }

  if (status === "not-in-scope") {
    return "not_claimed";
  }

  return "covered";
}

function conditionScopeAreaForKinds(
  kinds: readonly Axis1BuilderExceptionKind[],
): ScopeAreaId {
  if (kinds.includes("grease-containment")) {
    return "grease-path";
  }

  if (
    kinds.some((kind) =>
      ["rooftop-hinge-curb", "fan-belt-drive", "liquid-tight"].includes(kind),
    )
  ) {
    return "rooftop-fan";
  }

  return "service-label";
}

type QuickCloseoutNoteSignal = {
  areaId: ScopeAreaId | null;
  status: Extract<ScopeStatus, "could-not-access" | "condition-note" | "not-in-scope">;
  title: string;
  actionLabel: string;
};

function inferQuickCloseoutNoteArea(note: string): ScopeAreaId | null {
  const text = note.toLowerCase();

  if (/\b(fan|roof|rooftop|hatch|curb|hinge|belt|pulley)\b/.test(text)) {
    return "rooftop-fan";
  }

  if (/\b(duct|plenum|access|panel|shaft)\b/.test(text)) {
    return "duct-access";
  }

  if (/\b(filter|filters|hood|baffle|canopy)\b/.test(text)) {
    return "hood-filters";
  }

  if (/\b(grease|containment|cup|bucket|drip|trail)\b/.test(text)) {
    return "grease-path";
  }

  if (/\b(label|sticker|notice|tag)\b/.test(text)) {
    return "service-label";
  }

  return null;
}

function inferQuickCloseoutNoteSignal(note: string): QuickCloseoutNoteSignal | null {
  const normalized = note.trim();

  if (!normalized) {
    return null;
  }

  const text = normalized.toLowerCase();
  const areaId = inferQuickCloseoutNoteArea(normalized);
  const areaLabel = areaId
    ? scopeAreaCatalog.find((area) => area.id === areaId)?.shortLabel ?? "area"
    : "area";

  if (
    /\b(blocked|locked|inaccessible|no access|could not access|couldn't access|access denied|no key|closed roof hatch)\b/.test(
      text,
    )
  ) {
    return {
      areaId,
      status: "could-not-access",
      title: `${areaLabel} looks blocked`,
      actionLabel: areaId ? `Apply to ${areaLabel} as blocked` : "Choose the blocked area below",
    };
  }

  if (
    /\b(not part|not this visit|separate|separate visit|outside this visit|filters only|fan only|excluded)\b/.test(
      text,
    )
  ) {
    return {
      areaId,
      status: "not-in-scope",
      title: `${areaLabel} may be separate`,
      actionLabel: areaId ? `Mark ${areaLabel} not part of this visit` : "Choose the separate area below",
    };
  }

  if (
    /\b(condition|quote|repair|review|monitor|leak|drip|damage|hinge|curb|belt|pulley|replace|broken)\b/.test(
      text,
    )
  ) {
    return {
      areaId,
      status: "condition-note",
      title: `${areaLabel} looks like a condition note`,
      actionLabel: areaId ? `Apply to ${areaLabel} as condition` : "Choose the condition area below",
    };
  }

  return null;
}

function applyScopeLedgerToPacket(
  data: Axis1PacketPreviewData,
  rows: readonly ScopeLedgerRow[],
  visitType: (typeof visitTypePresets)[number],
): Axis1PacketPreviewData {
  const conditionOnlyVisit = visitType.id === "condition-record";
  const visibleRows = rows.filter((row) =>
    conditionOnlyVisit
      ? row.status !== "not-in-scope"
      : row.id !== "service-label" || row.status !== "not-in-scope",
  );
  const completedRows = visibleRows.filter((row) =>
    row.status === "done-photo" || row.status === "done-no-photo",
  );
  const blockedRows = visibleRows.filter((row) => row.status === "could-not-access");
  const notCompletedRows = visibleRows.filter((row) => row.status === "not-done");
  const needsReviewRows = visibleRows.filter((row) => row.status === "needs-review");
  const recordedRows = visibleRows.filter((row) => row.status === "condition-note");
  const notInScopeRows = visibleRows.filter((row) => row.status === "not-in-scope");
  const boundaryParts = [
    blockedRows.length > 0
      ? `Blocked / no access: ${formatScopeAreaLabels(blockedRows)}.`
      : null,
    notCompletedRows.length > 0
      ? `Not completed: ${formatScopeAreaLabels(notCompletedRows)}.`
      : null,
    !conditionOnlyVisit && notInScopeRows.length > 0
      ? `Not part of this visit: ${formatScopeAreaLabels(notInScopeRows)}.`
      : null,
    needsReviewRows.length > 0
      ? `Needs review: ${formatScopeAreaLabels(needsReviewRows)}.`
      : null,
  ].filter(Boolean) as string[];
  const completedAreas = formatScopeAreaLabels(completedRows);
  const recordedAreas = formatScopeAreaLabels(recordedRows);
  const scopeSummary =
    completedRows.length > 0
      ? `Completed: ${completedAreas}.`
      : conditionOnlyVisit
        ? "Condition-only record. No cleaning completion is claimed from this visit."
      : "No completed area is claimed from this visit.";
  const boundarySummary = boundaryParts.join(" ");
  const exclusionSummary = boundarySummary
    ? ` ${boundarySummary}`
    : conditionOnlyVisit
      ? ""
    : " No blocked, incomplete, or separate area is shown as completed.";
  const recordedProofSummary =
    recordedRows.some((row) => row.photoCount <= 0)
      ? " Condition recorded from service note; no condition photo is attached."
      : recordedRows.length > 0
        ? " Condition photo support is listed by area."
        : "";
  const recordedSummary = recordedAreas
    ? ` Recorded for follow-up: ${recordedAreas}.${recordedProofSummary}`
    : "";
  const recordBasisSummary =
    data.proofPhotos.length > 0
      ? " Photo status stays area-by-area."
      : conditionOnlyVisit
        ? " Written notes only; no field photos are attached."
        : " This is a written service record, so photos are not implied.";
  const scopeCopy = `${scopeSummary}${exclusionSummary}${recordedSummary}${recordBasisSummary}`;
  const componentStatusRows = visibleRows.map((row) => ({
    component: scopeOutputMeta[row.id].component,
    status: scopeStatusLabel(row),
    proof: scopeProofLabel(row, data),
    note: scopeRowNote(row, data),
  }));
  const routeSegments = visibleRows.map((row) => ({
    code: scopeOutputMeta[row.id].code,
    title: scopeOutputMeta[row.id].routeTitle,
    status: scopeStatusLabel(row),
    note: scopeRowNote(row, data),
  }));
  const scopeRows: [string, string, string][] = visibleRows.map((row) => [
    `${scopeOutputMeta[row.id].code} ${scopeOutputMeta[row.id].component}`,
    scopeStatusLabel(row),
    scopeRowNote(row, data),
  ]);
  const completedWork =
    completedRows.length > 0
      ? completedRows.map((row) => scopeRowNote(row, data))
      : conditionOnlyVisit
        ? ["No cleaning completion is claimed in this condition-only customer record."]
      : ["No completed area is claimed in this customer record."];
  const coverageItems = visibleRows.map((row) => ({
    label: scopeOutputMeta[row.id].coverageLabel,
    copy: scopeRowNote(row, data),
    state: scopeCoverageState(row.status),
  }));
  const nextCloseout =
    data.closeout
      ? {
          ...data.closeout,
          coverageEducation: {
            ...data.closeout.coverageEducation,
            summary: scopeCopy,
            items: coverageItems,
            boundaryCopy: `${data.closeout.recordFormat.label}. ${scopeCopy}`,
          },
          claimLimitCopy: [data.closeout.claimLimitCopy, exclusionSummary.trim()]
            .filter(Boolean)
            .join(" "),
        }
      : data.closeout;

  return {
    ...data,
    packetHeader: {
      ...data.packetHeader,
      copy: scopeCopy,
      quickFacts: upsertDisplayRows(data.packetHeader.quickFacts, [
        ["Visit type", visitType.title],
        ["What this service covered", scopeCopy],
        ["Areas completed", formatScopeAreaList(rows, ["done-photo", "done-no-photo"])],
        ["Recorded for follow-up", formatScopeAreaList(rows, ["condition-note"])],
        ["Blocked / no access", formatScopeAreaList(rows, ["could-not-access"])],
        ["Not completed", formatScopeAreaList(rows, ["not-done"])],
        ["Not part of this visit", formatScopeAreaList(rows, ["not-in-scope"])],
        ["Needs review", formatScopeAreaList(rows, ["needs-review"])],
      ]),
    },
    summaryCards: data.summaryCards.map((card, index) =>
      index === 0
        ? {
            ...card,
            title:
              completedRows.length > 0
        ? "Completed areas are listed by area."
        : "No completed cleaning is claimed.",
            copy: scopeCopy,
          }
        : card,
    ),
    serviceRecordRows: upsertDisplayRows(data.serviceRecordRows, [
      ["Visit type", visitType.title],
      ["What this service covered", scopeCopy],
      ["Areas completed", formatScopeAreaList(rows, ["done-photo", "done-no-photo"])],
      ["Recorded for follow-up", formatScopeAreaList(rows, ["condition-note"])],
      ["Blocked / no access", formatScopeAreaList(rows, ["could-not-access"])],
      ["Not completed", formatScopeAreaList(rows, ["not-done"])],
      ["Not part of this visit", formatScopeAreaList(rows, ["not-in-scope"])],
      ["Needs review", formatScopeAreaList(rows, ["needs-review"])],
    ]),
    routeSegments,
    componentStatusRows,
    scopeRows,
    completedWork,
    operationalChecks: upsertDisplayRows(data.operationalChecks, [
              ["Area status reviewed", "Yes"],
      ["Hood / filters status", scopeStatusForArea(rows, "hood-filters")],
      ["Duct / access status", scopeStatusForArea(rows, "duct-access")],
      ["Rooftop fan status", scopeStatusForArea(rows, "rooftop-fan")],
      ["Grease path status", scopeStatusForArea(rows, "grease-path")],
    ]),
    proofPolicyRows: upsertDisplayRows(data.proofPolicyRows, [
              ["Area status by closeout", scopeCopy],
      ["Photos and notes", recordBasisSummary.trim()],
    ]),
    closeoutRows: upsertDisplayRows(data.closeoutRows, [
      ["Visit type", visitType.title],
      ["Areas represented as completed", formatScopeAreaList(rows, ["done-photo", "done-no-photo"])],
      ["Areas recorded for follow-up", formatScopeAreaList(rows, ["condition-note"])],
      ["Areas blocked / no access", formatScopeAreaList(rows, ["could-not-access"])],
      ["Areas not completed", formatScopeAreaList(rows, ["not-done"])],
      ["Areas not part of this visit", formatScopeAreaList(rows, ["not-in-scope"])],
      ["Areas needing review", formatScopeAreaList(rows, ["needs-review"])],
    ]),
    scopeNote: conditionOnlyVisit
      ? `This service record is a condition-only record for this visit. ${scopeCopy}`
      : `This service record covers this ${visitType.title.toLowerCase()} visit. ${scopeCopy}`,
    closeout: nextCloseout,
  };
}

function replaceFirstSummaryCard(
  cards: Axis1PacketPreviewData["summaryCards"],
  copy: string,
): Axis1PacketPreviewData["summaryCards"] {
  return cards.map((card, index) => (index === 0 ? { ...card, copy } : card));
}

function replaceActionSummaryCard(
  cards: Axis1PacketPreviewData["summaryCards"],
  copy: string,
): Axis1PacketPreviewData["summaryCards"] {
  return cards.map((card, index) => (index === 1 ? { ...card, copy } : card));
}

function applyCustomerTextOverridesToPacket(
  data: Axis1PacketPreviewData,
  options: {
    result?: string;
    openItem?: string;
    action?: string;
    recordNote?: string;
  },
): Axis1PacketPreviewData {
  const resultLine = toDisplaySentence(options.result ?? "");
  const openItemLine = toDisplaySentence(options.openItem ?? "");
  const actionLine = toDisplaySentence(options.action ?? "");
  const recordNoteLine = toDisplaySentence(options.recordNote ?? "");
  let next = data;

  if (resultLine) {
    next = {
      ...next,
      packetHeader: {
        ...next.packetHeader,
        copy: resultLine,
      },
      summaryCards: replaceFirstSummaryCard(next.summaryCards, resultLine),
    };
  }

  if (openItemLine) {
  const openNote = /left out of completed-work wording|not listed as cleaned/i.test(openItemLine)
      ? openItemLine
      : `${openItemLine} This area is not listed as cleaned until the follow-up condition is cleared.`;

    next = {
      ...next,
      summaryCards: replaceActionSummaryCard(next.summaryCards, openNote),
      routeSegments: next.routeSegments.map((segment) =>
        /access|duct|fan|roof|grease|containment/i.test(`${segment.title} ${segment.status}`) &&
        /inaccessible|not completed|recorded|condition|review|open|action/i.test(segment.status)
          ? { ...segment, note: openNote }
          : segment,
      ),
      scopeRows: next.scopeRows.map(([area, status, note]) =>
        /access|duct|fan|roof|grease|containment/i.test(area) &&
        /inaccessible|not completed|recorded|condition|review|open|action/i.test(status)
          ? [area, status, openNote]
          : [area, status, note],
      ),
      componentStatusRows: next.componentStatusRows.map((row) =>
        /access|duct|fan|roof|grease|containment/i.test(row.component) &&
        /inaccessible|not completed|recorded condition|needs review|open|action/i.test(row.status)
          ? { ...row, note: openNote }
          : row,
      ),
      deficiencyRows: next.deficiencyRows.map((row, index) =>
        index === 0 && /open|action|monitor|recorded|closed/i.test(row.status)
          ? {
              ...row,
              issue: openItemLine,
              whyItMatters: row.whyItMatters,
            }
          : row,
      ),
      closeout: next.closeout
        ? {
            ...next.closeout,
            responsibilityCopy: openNote,
          }
        : next.closeout,
    };
  }

  if (actionLine) {
    next = {
      ...next,
      summaryCards: replaceActionSummaryCard(next.summaryCards, actionLine),
      customerClose: {
        ...next.customerClose,
        copy: actionLine,
        actionItems: upsertDisplayRows(next.customerClose.actionItems, [
          ["Reply or action", actionLine],
          ["Next action", actionLine],
        ]),
      },
      closeoutRows: upsertDisplayRows(next.closeoutRows, [
        ["Customer next action", actionLine],
        ["Reply path", actionLine],
      ]),
      closeout: next.closeout
        ? {
            ...next.closeout,
            customerActionCopy: actionLine,
          }
        : next.closeout,
    };
  }

  if (recordNoteLine) {
    next = {
      ...next,
      customerClose: {
        ...next.customerClose,
        actionItems: upsertDisplayRows(next.customerClose.actionItems, [
          ["PDF copy note", recordNoteLine],
          ["Service report PDF", recordNoteLine],
        ]),
      },
      serviceRecordRows: upsertDisplayRows(next.serviceRecordRows, [
        ["PDF copy note", recordNoteLine],
      ]),
      closeoutRows: upsertDisplayRows(next.closeoutRows, [
        ["PDF copy note", recordNoteLine],
      ]),
    };
  }

  return next;
}

function buildJobOutcomeRecommendation(options: {
  uploadedFieldPhotos: UploadedFieldPhotoState;
  unplacedFieldPhotos: UnplacedFieldPhoto[];
  photoSlotResolutions: Record<FieldPhotoSlotId, PhotoSlotResolution>;
}): JobOutcomeRecommendation {
  const { uploadedFieldPhotos, unplacedFieldPhotos, photoSlotResolutions } = options;
  const photosBySlot = new Map<FieldPhotoSlotId, UploadedFieldPhoto>();

  fieldPhotoSlots.forEach((slot) => {
    const photo = uploadedFieldPhotos[slot.id];

    if (photo) {
      photosBySlot.set(slot.id, photo);
    }
  });

  unplacedFieldPhotos.forEach((photo) => {
    if (photo.suggestedSlotId && !photosBySlot.has(photo.suggestedSlotId)) {
      photosBySlot.set(photo.suggestedSlotId, photo);
    }
  });

  const hasPhoto = photosBySlot.size > 0 || unplacedFieldPhotos.length > 0;
  const hasSkippedCorePhoto =
    photoSlotResolutions["hood-before"] !== "open" ||
    photoSlotResolutions["hood-after"] !== "open";

  if (hasPhoto) {
    return {
      pattern: getJobPatternById("clean-close"),
      signalLabel: "Clean closeout default",
      reason: "No access or condition cue was found, so the default closeout is ready.",
      confidence: "Medium",
    };
  }

  return {
    pattern: getJobPatternById("clean-close"),
    signalLabel: hasSkippedCorePhoto ? "Written record default" : "Vendor default",
    reason: hasSkippedCorePhoto
      ? "Photos were marked unavailable, so a written closeout is drafted by default."
      : "No job evidence has been added yet, so the tool drafts the standard completed-service closeout.",
    confidence: "Default",
  };
}

function PhotoPlacementTarget({
  slot,
  occupied,
  activeSlotId,
  mobileSheetMode = false,
}: {
  slot: FieldPhotoSlot;
  occupied: boolean;
  activeSlotId: FieldPhotoSlotId | null;
  mobileSheetMode?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: makePhotoTargetId(slot.id),
    data: { slotId: slot.id },
  });
  const isCurrent = activeSlotId === slot.id;

  return (
    <div
      ref={setNodeRef}
      aria-label={
        mobileSheetMode
          ? `${slot.shortLabel} photo role`
          : `Drop photo on ${slot.shortLabel}`
      }
      className={`min-w-0 rounded-[16px] border px-3 py-2 transition ${
        isOver
          ? "border-[#ff6b1a] bg-[#fff0e4] shadow-[0_10px_26px_rgba(255,107,26,0.14)]"
          : occupied
            ? "border-black/10 bg-[#f6f1e8]"
            : "border-dashed border-black/12 bg-white"
      }`}
    >
      <p className="truncate text-xs font-bold text-foreground">{slot.shortLabel}</p>
      <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {mobileSheetMode
          ? occupied ? "Has photo" : "Open"
          : isOver ? "Drop here" : isCurrent ? "Current" : occupied ? "Filled" : "Empty"}
      </p>
    </div>
  );
}

function PhotoPlacementRow({
  slot,
  uploaded,
  onMove,
  onConfirmSuggestion,
  onRejectSuggestion,
  mobilePickerMode = false,
}: {
  slot: FieldPhotoSlot;
  uploaded: UploadedFieldPhoto;
  onMove: (fromSlotId: FieldPhotoSlotId, toSlotId: FieldPhotoSlotId) => void;
  onConfirmSuggestion: (slotId: FieldPhotoSlotId) => void;
  onRejectSuggestion: (slotId: FieldPhotoSlotId) => void;
  mobilePickerMode?: boolean;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: makePhotoDragId(slot.id),
    data: { slotId: slot.id },
  });
  const style = {
    transform: transform ? DndCss.Transform.toString(transform) : undefined,
    transition: isDragging ? undefined : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-photo-placement-row={slot.id}
      data-photo-confidence={uploaded.confidence}
      className={`grid gap-3 transition hover:bg-[#fffaf5] ${
        mobilePickerMode
          ? "grid-cols-[56px_minmax(0,1fr)] items-center px-3 py-2.5"
          : "px-4 py-3 sm:grid-cols-[52px_minmax(0,1fr)_160px] sm:items-center"
      } ${
        isDragging ? "opacity-35" : "opacity-100"
      }`}
    >
      {mobilePickerMode ? (
        <div
          className="h-14 w-14 overflow-hidden rounded-[14px] border border-black/10 bg-cover bg-center"
          style={{ backgroundImage: `url(${uploaded.src})` }}
          aria-label={`${slot.shortLabel} photo preview`}
        />
      ) : (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="group h-12 touch-none overflow-hidden rounded-[14px] border border-black/10 bg-cover bg-center text-left outline-none ring-[#ff6b1a]/30 transition focus-visible:ring-4 active:cursor-grabbing sm:cursor-grab"
          style={{ backgroundImage: `url(${uploaded.src})` }}
          aria-label={`Drag ${slot.shortLabel} photo`}
        >
          <span className="grid h-full w-full place-items-center bg-black/22 text-[10px] font-bold uppercase tracking-[0.14em] text-white opacity-100 transition group-hover:bg-black/34 group-focus-visible:bg-black/34">
            <span className="rounded-full bg-white/92 px-2 py-1 text-[9px] text-[#111315] shadow-sm motion-safe:animate-pulse">
              Drag
            </span>
          </span>
        </button>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{slot.shortLabel}</p>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              !isVendorConfirmedPhoto(uploaded)
                ? "border-[#ff6b1a]/24 bg-[#fff0e4] text-[#b94d11]"
                : "border-black/10 bg-[#f6f1e8] text-muted-foreground"
            }`}
          >
            {isVendorConfirmedPhoto(uploaded)
              ? uploaded.vendorDecision === "edited"
                ? "Vendor edited"
                : isFastConfirmableSuggestedPhoto(uploaded)
                  ? "AI attached"
                  : "Vendor confirmed"
              : "Saved, not claimed"}
          </span>
        </div>
        <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
          {uploaded.name}
        </p>
        {!isVendorConfirmedPhoto(uploaded) ? (
          <div className="mt-2 rounded-[12px] border border-[#ff6b1a]/14 bg-[#fff7ef] px-2.5 py-2">
            <p className="text-[11px] font-semibold leading-4 text-[#6f3b19]">
              {uploaded.assistReason ?? uploaded.matchLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onConfirmSuggestion(slot.id)}
                className="rounded-full bg-[#111315] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => onRejectSuggestion(slot.id)}
                className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-foreground"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null}
        {mobilePickerMode ? (
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#ff6b1a]">
            Change role below
          </p>
        ) : (
          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ff6b1a]">
            <GripVertical className="h-3.5 w-3.5" />
            Drag to another role
          </p>
        )}
      </div>
      <select
        value={slot.id}
        onChange={(event) => onMove(slot.id, event.target.value as FieldPhotoSlotId)}
        className={`h-10 w-full rounded-full border px-3 text-xs font-semibold outline-none ${
          mobilePickerMode
            ? "col-span-2 border-[#ff6b1a]/22 bg-[#fff0e4] text-[#111315]"
            : "border-black/10 bg-[#111315] text-white"
        }`}
      >
        {fieldPhotoSlots.map((targetSlot) => (
          <option key={targetSlot.id} value={targetSlot.id}>
            {mobilePickerMode ? "Role: " : "Move to "}
            {targetSlot.shortLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function ExtraPhotoRow({
  photo,
  onPlaceExtra,
  mobilePickerMode = false,
}: {
  photo: UnplacedFieldPhoto;
  onPlaceExtra?: (photoId: string, toSlotId: FieldPhotoSlotId) => void;
  mobilePickerMode?: boolean;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: makeExtraPhotoDragId(photo.id),
    data: { photoId: photo.id },
  });
  const style = {
    transform: transform ? DndCss.Transform.toString(transform) : undefined,
    transition: isDragging ? undefined : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid gap-3 rounded-[16px] border border-dashed border-black/12 bg-[#fffaf5] transition hover:border-[#ff6b1a]/35 ${
        mobilePickerMode
          ? "grid-cols-[56px_minmax(0,1fr)] items-center px-3 py-2.5"
          : "px-3 py-3 sm:grid-cols-[52px_minmax(0,1fr)] sm:items-center"
      } ${
        isDragging ? "opacity-35" : "opacity-100"
      }`}
    >
      {mobilePickerMode ? (
        <div
          className="h-14 w-14 overflow-hidden rounded-[14px] border border-black/10 bg-cover bg-center"
          style={{ backgroundImage: `url(${photo.src})` }}
          aria-label={`Extra photo ${photo.name} preview`}
        />
      ) : (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="group h-12 touch-none overflow-hidden rounded-[14px] border border-black/10 bg-cover bg-center text-left outline-none ring-[#ff6b1a]/30 transition focus-visible:ring-4 active:cursor-grabbing sm:cursor-grab"
          style={{ backgroundImage: `url(${photo.src})` }}
          aria-label={`Drag extra photo ${photo.name}`}
        >
          <span className="grid h-full w-full place-items-center bg-black/24 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            <span className="rounded-full bg-white/92 px-2 py-1 text-[9px] text-[#111315] shadow-sm motion-safe:animate-pulse">
              Drag
            </span>
          </span>
        </button>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{photo.name}</p>
          <span className="rounded-full border border-[#ff6b1a]/20 bg-[#fff0e4] px-2 py-0.5 text-[10px] font-semibold text-[#b94d11]">
            {photo.vendorDecision === "rejected"
              ? "Rejected suggestion"
              : photo.assistSource
                ? "Saved, not claimed"
                : photo.reason === "duplicate"
                  ? "Same-label extra"
                  : "Overflow"}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {photo.assistReason
            ? photo.assistReason
            : photo.suggestedSlotId
            ? `Looks like ${
                fieldPhotoSlots.find((slot) => slot.id === photo.suggestedSlotId)
                  ?.shortLabel
              }, but that role already has a representative photo.`
            : mobilePickerMode
              ? "No role is assigned yet. Choose the correct role if needed."
              : "No role is assigned yet. Drag it onto the correct role if needed."}
        </p>
        {mobilePickerMode ? (
          <select
            defaultValue=""
            onChange={(event) => {
              const targetSlotId = event.target.value as FieldPhotoSlotId | "";
              if (targetSlotId && onPlaceExtra) {
                onPlaceExtra(photo.id, targetSlotId);
              }
              event.currentTarget.value = "";
            }}
            className="mt-3 h-10 w-full rounded-full border border-[#ff6b1a]/22 bg-[#fff0e4] px-3 text-xs font-semibold text-[#111315] outline-none"
          >
            <option value="">Assign this photo</option>
            {fieldPhotoSlots.map((targetSlot) => (
              <option key={targetSlot.id} value={targetSlot.id}>
                Role: {targetSlot.shortLabel}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}

function PhotoDragOverlayCard({
  label,
  uploaded,
}: {
  label: string;
  uploaded: UploadedFieldPhoto;
}) {
  return (
    <div className="grid w-[360px] max-w-[80vw] grid-cols-[52px_minmax(0,1fr)] items-center gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-3 shadow-[0_26px_70px_rgba(17,19,21,0.22)]">
      <div
        className="h-12 rounded-[14px] border border-black/10 bg-cover bg-center"
        style={{ backgroundImage: `url(${uploaded.src})` }}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{uploaded.name}</p>
      </div>
    </div>
  );
}

function PhotoPlacementReview({
  uploadedPhotoSlots,
  uploadedFieldPhotos,
  unplacedPhotos,
  onMove,
  onPlaceExtra,
  onConfirmSuggestion,
  onRejectSuggestion,
  mobileSheetMode = false,
}: {
  uploadedPhotoSlots: FieldPhotoSlot[];
  uploadedFieldPhotos: UploadedFieldPhotoState;
  unplacedPhotos: UnplacedFieldPhoto[];
  onMove: (fromSlotId: FieldPhotoSlotId, toSlotId: FieldPhotoSlotId) => void;
  onPlaceExtra: (photoId: string, toSlotId: FieldPhotoSlotId) => void;
  onConfirmSuggestion: (slotId: FieldPhotoSlotId) => void;
  onRejectSuggestion: (slotId: FieldPhotoSlotId) => void;
  mobileSheetMode?: boolean;
}) {
  const [activeDrag, setActiveDrag] = useState<
    | { kind: "slot"; slotId: FieldPhotoSlotId }
    | { kind: "extra"; photoId: string }
    | null
  >(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor),
  );
  const activeSlot = activeDrag?.kind === "slot"
    ? fieldPhotoSlots.find((slot) => slot.id === activeDrag.slotId)
    : null;
  const activeExtra = activeDrag?.kind === "extra"
    ? unplacedPhotos.find((photo) => photo.id === activeDrag.photoId)
    : null;
  const activePhoto = activeDrag?.kind === "slot"
    ? uploadedFieldPhotos[activeDrag.slotId]
    : activeExtra ?? null;
  const hasAnyPhoto = uploadedPhotoSlots.length > 0 || unplacedPhotos.length > 0;
  const orderMatchedCount = uploadedPhotoSlots.filter(
    (slot) => !isVendorConfirmedPhoto(uploadedFieldPhotos[slot.id]),
  ).length;

  function handleDragStart(event: DragStartEvent) {
    const slotId = slotIdFromDndId(event.active.id, photoDragPrefix);

    if (slotId) {
      setActiveDrag({ kind: "slot", slotId });
      return;
    }

    const photoId = extraPhotoIdFromDndId(event.active.id);

    if (photoId) {
      setActiveDrag({ kind: "extra", photoId });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const fromSlotId = slotIdFromDndId(event.active.id, photoDragPrefix);
    const fromExtraId = extraPhotoIdFromDndId(event.active.id);
    const toSlotId = event.over
      ? slotIdFromDndId(event.over.id, photoTargetPrefix)
      : null;

    if (fromSlotId && toSlotId) {
      onMove(fromSlotId, toSlotId);
    } else if (fromExtraId && toSlotId) {
      onPlaceExtra(fromExtraId, toSlotId);
    }

    setActiveDrag(null);
  }

  if (!hasAnyPhoto) {
    return (
      <div className="px-4 py-4">
        <p className="text-sm font-semibold text-foreground">
          No visit photos attached yet.
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Add a before/after photo or the rest of the phone batch, then correct
          mismatches here without starting over.
        </p>
      </div>
    );
  }

  const roleTargetSection = (
    <div
      className={`px-4 py-4 ${
        mobileSheetMode
          ? "border-t border-black/8 bg-[#fffdf9]"
          : "border-b border-black/8"
      }`}
    >
      <div className={mobileSheetMode ? "flex items-start justify-between gap-4" : ""}>
        <div>
          {mobileSheetMode ? (
            <>
              <p className={labelClassName()}>Role reference</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Use the role picker on each photo if the upload-order placement is wrong.
                Before / after are core; the rest are recommended photo slots.
              </p>
            </>
          ) : null}
        </div>
        {mobileSheetMode ? (
          <span className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Roles
          </span>
        ) : null}
      </div>
      <div
        className={`grid gap-2 ${
          mobileSheetMode ? "mt-3 grid-cols-2" : "sm:grid-cols-4 xl:grid-cols-7"
        }`}
      >
        {fieldPhotoSlots.map((slot) => (
          <PhotoPlacementTarget
            key={slot.id}
            slot={slot}
            occupied={Boolean(uploadedFieldPhotos[slot.id])}
            activeSlotId={activeDrag?.kind === "slot" ? activeDrag.slotId : null}
            mobileSheetMode={mobileSheetMode}
          />
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {mobileSheetMode
          ? "Same-label extras stay below until you assign them. The role picker is the mobile-safe control."
          : "Drag a photo onto a role. Same-label extras stay below until you choose the representative photo; the menu stays as a precise fallback."}
      </p>
      {orderMatchedCount > 0 ? (
        <div className="mt-3 rounded-[16px] border border-[#ff6b1a]/18 bg-[#fff0e4] px-3 py-2">
          <p className="text-xs font-semibold leading-5 text-[#b94d11]">
            {orderMatchedCount} photo(s) are saved as extras.
            Attach one only if it supports the report.
          </p>
        </div>
      ) : null}
    </div>
  );

  const placedPhotoSection = uploadedPhotoSlots.length > 0 ? (
    <div className="divide-y divide-black/8">
      {mobileSheetMode ? (
        <div className="bg-[#fffdf9] px-4 py-3">
          <p className={labelClassName()}>Uploaded photos</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Start here. Confirm filenames and roles before changing anything.
          </p>
        </div>
      ) : null}
      {uploadedPhotoSlots.map((slot) => {
        const uploaded = uploadedFieldPhotos[slot.id];

        if (!uploaded) {
          return null;
        }

        return (
          <PhotoPlacementRow
            key={slot.id}
            slot={slot}
            uploaded={uploaded}
            onMove={onMove}
            onConfirmSuggestion={onConfirmSuggestion}
            onRejectSuggestion={onRejectSuggestion}
            mobilePickerMode={mobileSheetMode}
          />
        );
      })}
    </div>
  ) : null;

  const extraPhotoSection = unplacedPhotos.length > 0 ? (
    <div className="border-t border-black/8 bg-[#fffdf9] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={labelClassName()}>Extra photos</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Duplicates and overflow are kept here instead of being filed
            into the wrong role.
          </p>
        </div>
        <span className="rounded-full border border-[#ff6b1a]/18 bg-[#fff0e4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b94d11]">
          {unplacedPhotos.length} waiting
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        {unplacedPhotos.map((photo) => (
          <ExtraPhotoRow
            key={photo.id}
            photo={photo}
            onPlaceExtra={onPlaceExtra}
            mobilePickerMode={mobileSheetMode}
          />
        ))}
      </div>
    </div>
  ) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      {mobileSheetMode ? placedPhotoSection : roleTargetSection}
      {mobileSheetMode ? extraPhotoSection : placedPhotoSection}
      {mobileSheetMode ? roleTargetSection : extraPhotoSection}
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {activePhoto ? (
          <PhotoDragOverlayCard
            label={activeSlot?.shortLabel ?? "Extra photo"}
            uploaded={activePhoto}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const builderSteps = [
  {
    value: "photos",
    label: "Photos & notes",
    navLabel: "Photos",
    title: "Add photos and notes",
    copy: "Drop job photos or one short note. The builder drafts a customer-ready service report from there.",
  },
  {
    value: "review",
    label: "Review report",
    navLabel: "Review",
    title: "Review service summary",
    copy: "Fix only wrong or uncertain parts in the preview.",
  },
  {
    value: "outputs",
    label: "Outputs",
    navLabel: "Outputs",
    title: "Preview link and PDF",
    copy: "Check the service report link and PDF copy before using the paid company version.",
  },
] as const satisfies ReadonlyArray<{
  value: BuilderStep;
  label: string;
  navLabel: string;
  title: string;
  copy: string;
}>;

function localInputDate(date = new Date()) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 10);
}

function createAxis1BuilderStartValues(): Axis1BuilderFormValues {
  return {
    ...axis1BuilderDefaults,
    scenario: "clean",
    propertyName: "",
    siteCity: "",
    serviceDate: localInputDate(),
    authorizedBy: "",
    serviceWindow: "Service visit",
    systemName: "Kitchen exhaust system",
    exceptionKinds: [],
    followUpMode: "none",
  };
}

function jobBasicsMissingFields(values: Axis1BuilderFormValues) {
  const missing: string[] = [];

  if (!values.propertyName.trim()) {
    missing.push("customer");
  }

  if (!values.siteCity.trim()) {
    missing.push("site");
  }

  if (!values.serviceDate.trim()) {
    missing.push("date");
  }

  if (!values.authorizedBy.trim()) {
    missing.push("reviewer");
  }

  if (!values.systemName.trim()) {
    missing.push("system");
  }

  return missing;
}

const standardPacketSections: Axis1PacketDocumentSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

const shortPacketSections: Axis1PacketDocumentSectionVisibility = {
  photos: true,
  checklist: false,
  routeDetail: false,
  nextService: true,
};

const packetSectionControls = [
  {
    key: "photos",
    label: "Photo section",
    copy: "Customer-visible photos.",
  },
  {
    key: "checklist",
    label: "Report checklist",
    copy: "What was documented and closed.",
  },
  {
    key: "routeDetail",
    label: "Work details",
    copy: "Hood, filters, fan, and access rows.",
  },
  {
    key: "nextService",
    label: "Next visit reminder",
    copy: "Rebook window and reply instruction.",
  },
] as const satisfies ReadonlyArray<{
  key: keyof Axis1PacketDocumentSectionVisibility;
  label: string;
  copy: string;
}>;

function fieldClassName() {
  return "mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/15";
}

function labelClassName() {
  return "text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground";
}

function findPacketRowValue(
  rows: readonly (readonly [string, string])[],
  label: string,
  fallback: string,
) {
  return rows.find(([rowLabel]) => rowLabel === label)?.[1] ?? fallback;
}

function normalizeCloseoutLinks(links: Axis1CloseoutLinks): Axis1CloseoutLinks {
  const pdfHref = links.pdfHref?.trim();

  return pdfHref ? { pdfHref } : {};
}

function generatedOutputReadinessMeta(readiness: string) {
  if (readiness === "ready") {
    return {
      label: "Ready",
      className: "border-[#2c7a3f]/24 bg-[#f1f8ef] text-[#1f6330]",
    };
  }

  if (readiness === "needs_review") {
    return {
      label: "Review",
      className: "border-[#f26a21]/24 bg-[#fff2e8] text-[#a94410]",
    };
  }

  return {
    label: "N/A",
    className: "border-black/10 bg-white text-muted-foreground",
  };
}

function vendorWarningMeta(severity: string) {
  if (severity === "blocker") {
    return {
      label: "Blocked",
      className: "border-[#bc3d1f]/24 bg-[#fff1ed] text-[#9d2f18]",
    };
  }

  if (severity === "review") {
    return {
      label: "Review",
      className: "border-[#f26a21]/24 bg-[#fff2e8] text-[#a94410]",
    };
  }

  return {
    label: "Note",
    className: "border-black/10 bg-white text-muted-foreground",
  };
}

function GeneratedOutputIcon({ kind }: { kind: string }) {
  if (kind === "customer_link") {
    return <Link2 className="h-4 w-4" />;
  }

  if (kind === "evidence_pdf") {
    return <FileDown className="h-4 w-4" />;
  }

  if (kind === "follow_up_quote_copy") {
    return <FileText className="h-4 w-4" />;
  }

  if (kind === "revisit_copy" || kind === "next_service_copy") {
    return <CalendarClock className="h-4 w-4" />;
  }

  return <ClipboardCheck className="h-4 w-4" />;
}

const textFieldLimits = {
  propertyName: 60,
  siteCity: 60,
  authorizedBy: 40,
  serviceWindow: 40,
  systemName: 72,
  exceptionNote: 220,
  followUpNote: 220,
  summaryOverride: 260,
  customerActionOverride: 220,
  followUpOverride: 220,
  recordNoteOverride: 220,
} as const;

function CharacterCount({
  value,
  max,
}: {
  value?: string;
  max: number;
}) {
  const length = value?.length ?? 0;
  const isNearLimit = length >= max * 0.86;

  return (
    <p
      className={`mt-1 text-right text-[10px] font-semibold uppercase tracking-[0.12em] ${
        isNearLimit ? "text-[#b94d11]" : "text-muted-foreground/70"
      }`}
    >
      {length}/{max}
    </p>
  );
}

function toggleExceptionKind(
  current: Axis1BuilderExceptionKind[],
  value: Axis1BuilderExceptionKind,
) {
  if (current.includes(value)) {
    return current.length === 1
      ? current
      : current.filter((item) => item !== value);
  }

  return [...current, value];
}

function emptyFieldPhotoState(): Record<FieldPhotoSlotId, UploadedFieldPhoto | null> {
  return emptyAxis1FieldPhotoState();
}

function emptyPhotoSlotResolutions(): Record<FieldPhotoSlotId, PhotoSlotResolution> {
  return emptyAxis1PhotoSlotResolutions();
}

function readFileAsDataUrl(file: File) {
  return new Promise<string | null>((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function isLikelyImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(avif|heic|heif|jpe?g|png|webp)$/i.test(file.name)
  );
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image decode failed"));
    image.decoding = "async";
    image.src = src;
  });
}

async function preparePhotoForPreview(file: File): Promise<PreparedPhotoPreview> {
  if (!isLikelyImageFile(file)) {
    return {
      ok: false,
      reason: "Only image files can be used in the service report link or PDF.",
    };
  }

  if (file.size > maxPhotoImportBytes) {
    return {
      ok: false,
      reason: "One photo was over 40MB. Use a smaller JPEG/PNG export.",
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;

    if (!sourceWidth || !sourceHeight) {
      throw new Error("Image dimensions unavailable");
    }

    const scale = Math.min(
      1,
      maxPhotoPreviewDimension / Math.max(sourceWidth, sourceHeight),
    );
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("Canvas unavailable");
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    return {
      ok: true,
      src: canvas.toDataURL("image/jpeg", 0.84),
      wasNormalized:
        scale < 1 ||
        file.type !== "image/jpeg" ||
        file.size > smallPhotoFallbackBytes,
    };
  } catch {
    const canFallback =
      file.size <= smallPhotoFallbackBytes &&
      !/\.(heic|heif)$/i.test(file.name) &&
      !/heic|heif/i.test(file.type);
    const fallback = canFallback ? await readFileAsDataUrl(file) : null;

    if (fallback) {
      return {
        ok: true,
        src: fallback,
        wasNormalized: false,
      };
    }

    return {
      ok: false,
      reason:
        "One photo could not be read in this browser. Try JPEG or PNG before saving the PDF.",
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function preparePhotoForAiAssist(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) {
    return dataUrl;
  }

  try {
    const image = await loadImageElement(dataUrl);
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;

    if (!sourceWidth || !sourceHeight) {
      return dataUrl;
    }

    const scale = Math.min(
      1,
      maxPhotoAssistDimension / Math.max(sourceWidth, sourceHeight),
    );
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      return dataUrl;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const compressed = canvas.toDataURL("image/jpeg", photoAssistJpegQuality);

    return compressed.length < dataUrl.length ? compressed : dataUrl;
  } catch {
    return dataUrl;
  }
}

const genericPhotoKeywords = new Set([
  "hood",
  "before",
  "pre",
  "dirty",
  "start",
  "after",
  "clean",
  "final",
  "done",
  "complete",
]);

const genericPhonePhotoNamePatterns = [
  /(^|[-_\s])(img|image|photo|pic|snap|screenshot)[-_\s]?\d{2,}/,
  /(^|[-_\s])(pxl|dsc|dscn)[-_\s]?\d{2,}/,
  /^img_\d{2,}/,
  /^pxl_\d{6,}/,
  /^dsc\d{2,}/,
  /^dscn\d{2,}/,
  /^whatsapp image \d{4}/,
];

function isGenericPhonePhotoName(fileName: string) {
  const normalized = fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[()[\]]/g, " ");

  return genericPhonePhotoNamePatterns.some((pattern) => pattern.test(normalized));
}

function photoKeywordScore(slot: FieldPhotoSlot, normalizedFileName: string) {
  return slot.keywords.reduce((score, keyword) => {
    if (!normalizedFileName.includes(keyword)) {
      return score;
    }

    const specificity = genericPhotoKeywords.has(keyword) ? 1 : 4;
    const lengthBonus = keyword.length >= 5 ? 1 : 0;

    return score + specificity + lengthBonus;
  }, 0);
}

function findKeywordPhotoSlot(fileName: string) {
  const normalized = fileName.toLowerCase();
  const [bestMatch] = fieldPhotoSlots
    .map((slot, index) => ({
      slot,
      index,
      score: photoKeywordScore(slot, normalized),
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return bestMatch?.slot ?? null;
}

function suggestPhotoSlot(
  fileName: string,
  usedSlotIds: Set<FieldPhotoSlotId>,
): {
  slotId: FieldPhotoSlotId;
  confidence: FieldPhotoConfidence;
  matchLabel: string;
} | null {
  if (isGenericPhonePhotoName(fileName)) {
    return null;
  }

  const keywordMatch = findKeywordPhotoSlot(fileName);

  if (keywordMatch && !usedSlotIds.has(keywordMatch.id)) {
    return {
      slotId: keywordMatch.id,
      confidence: "keyword",
      matchLabel: "Matched by filename",
    };
  }

  const orderMatch = fieldPhotoSlots.find((slot) => !usedSlotIds.has(slot.id));

  return orderMatch
    ? {
        slotId: orderMatch.id,
        confidence: "order",
        matchLabel: isGenericPhonePhotoName(fileName)
          ? "Phone filename - review order"
          : "Placed by upload order - review",
      }
    : null;
}

function subscribeProductPlanSearch(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("popstate", callback);

  return () => {
    window.removeEventListener("popstate", callback);
  };
}

function readProductPlanSearch() {
  if (typeof window === "undefined") {
    return "free";
  }

  return normalizeAxis1ProductPlan(
    new URLSearchParams(window.location.search).get("account"),
  );
}

export function PacketBuilder({
  initialProductPlan = "free",
}: {
  initialProductPlan?: Axis1ProductPlan;
} = {}) {
  const [initialBuilderValues] = useState(createAxis1BuilderStartValues);
  const form = useForm<Axis1BuilderFormValues>({
    resolver: zodResolver(axis1BuilderSchema),
    defaultValues: initialBuilderValues,
    mode: "onChange",
  });
  const watched = useWatch({
    control: form.control,
  });
  const companyProfile = useSyncExternalStore(
    subscribeAxis1CompanyProfile,
    readAxis1CompanyProfile,
    () => defaultAxis1CompanyProfile,
  );
  const values = {
    ...axis1BuilderDefaults,
    ...watched,
  } as Axis1BuilderFormValues;
  const missingJobBasics = jobBasicsMissingFields(values);
  const jobBasicsReady = missingJobBasics.length === 0;
  const jobBasicsMissingLabel = missingJobBasics.join(", ");
  const jobBasicsSummary = jobBasicsReady
    ? `${values.propertyName.trim()} - ${values.serviceDate}`
    : `Needed before output: ${jobBasicsMissingLabel}`;
  const selectedAccessCount = values.exceptionKinds.filter((kind) =>
    axis1ExceptionOptions.find((option) => option.value === kind)?.group === "access",
  ).length;
  const selectedConditionCount = values.exceptionKinds.filter((kind) =>
    axis1ExceptionOptions.find((option) => option.value === kind)?.group === "condition",
  ).length;
  const [uploadedFieldPhotos, setUploadedFieldPhotos] =
    useState<Record<FieldPhotoSlotId, UploadedFieldPhoto | null>>(
      emptyFieldPhotoState,
    );
  const [unplacedFieldPhotos, setUnplacedFieldPhotos] = useState<UnplacedFieldPhoto[]>(
    [],
  );
  const [visitTypeId, setVisitTypeId] =
    useState<VisitTypeId>("standard-hood");
  const [riskFlagIds, setRiskFlagIds] = useState<RiskFlagId[]>(["no-risk"]);
  const [scopeOverrides, setScopeOverrides] = useState<ScopeOverrideState>({});
  const [scopeAssumptionsAccepted, setScopeAssumptionsAccepted] = useState(false);
  const [showScopeDetails, setShowScopeDetails] = useState(true);
  const [photoSlotResolutions, setPhotoSlotResolutions] =
    useState<Record<FieldPhotoSlotId, PhotoSlotResolution>>(
      emptyPhotoSlotResolutions,
    );
  const [builderStep, setBuilderStep] = useState<BuilderStep>("photos");
  const [packetPresentationMode, setPacketPresentationMode] =
    useState<PacketPresentationMode>("short");
  const [reportOutputMode, setReportOutputMode] =
    useState<ReportOutputMode>("link");
  const [closeoutLinks, setCloseoutLinks] = useState<Axis1CloseoutLinks>({});
  const [packetSections, setPacketSections] =
    useState<Axis1PacketDocumentSectionVisibility>(shortPacketSections);
  const productPlanFromUrl = useSyncExternalStore(
    subscribeProductPlanSearch,
    readProductPlanSearch,
    () => initialProductPlan,
  );
  const [selectedProductPlan, setSelectedProductPlan] =
    useState<Axis1ProductPlan | null>(null);
  const [showPacketDetails, setShowPacketDetails] = useState(false);
  const [showJobBasics, setShowJobBasics] = useState(false);
  const [showTimingEditor, setShowTimingEditor] = useState(false);
  const [showExceptionDetails, setShowExceptionDetails] = useState(false);
  const [showAllPhotoSlots, setShowAllPhotoSlots] = useState(false);
  const [showProofDetails, setShowProofDetails] = useState(false);
  const [showWordingEditor, setShowWordingEditor] = useState(false);
  const [activeCustomerLineEditor, setActiveCustomerLineEditor] =
    useState<CustomerLineEditor>("result");
  const [activeCustomerLineEditorSurface, setActiveCustomerLineEditorSurface] =
    useState<CustomerLineEditorSurface | null>(null);
  const [activePreviewEditTarget, setActivePreviewEditTarget] =
    useState<CustomerWebPacketEditTarget | null>(null);
  const [hasJobOutcomeSelected, setHasJobOutcomeSelected] = useState(false);
  const [autoDraftedJobPatternId, setAutoDraftedJobPatternId] =
    useState<JobPatternId | null>(null);
  const [photoImportNotice, setPhotoImportNotice] =
    useState<PhotoImportNotice | null>(null);
  const [photoAssistSuggestions, setPhotoAssistSuggestions] = useState<
    Axis1PhotoAssistSuggestion[]
  >([]);
  const [photoAssistNotice, setPhotoAssistNotice] =
    useState<PhotoAssistNotice | null>(null);
  const [isPhotoAssistRunning, setIsPhotoAssistRunning] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheetView | null>(null);
  const [setupNoticeAction, setSetupNoticeAction] =
    useState<SetupNoticeAction | null>(null);
  const [lastSavedReportLink, setLastSavedReportLink] =
    useState<SavedReportLink | null>(null);
  const [paidFeatureNotice, setPaidFeatureNotice] =
    useState<PaidFeatureNotice | null>(null);
  const [authSessionStatus, setAuthSessionStatus] =
    useState<AuthSessionStatus>("checking");
  const [accountEntitlements, setAccountEntitlements] =
    useState<Axis1AccountEntitlements | null>(null);
  const isProofStep = builderStep === "photos";
  const isOutputStep = builderStep === "outputs";
  const isPhotoStep = isProofStep;
  const requestedProductPlan = selectedProductPlan ?? productPlanFromUrl;
  const isAuthenticated = authSessionStatus === "authenticated";
  const hasCompanyAccess = accountEntitlements?.companyAccess ?? false;
  const isCompanyFeatureRequested =
    requestedProductPlan === "company" && !hasCompanyAccess;
  const productPlan = isCompanyFeatureRequested ? "free" : requestedProductPlan;
  const productPolicy = getAxis1ProductPlanPolicy(productPlan);
  const isCompanyPlan = productPlan === "company";
  const loginNextPath = "/axis-1/tool?step=outputs&account=company";
  const loginHref = `/login?next=${encodeURIComponent(loginNextPath)}`;
  const companyUpgradeHref = isAuthenticated ? "/company-version" : loginHref;
  const companyUpgradeLabel = isAuthenticated
    ? "Start company version"
    : "Login";
  const companyLockedStatusLabel =
    authSessionStatus === "checking"
      ? "Checking account"
      : isAuthenticated
        ? "Subscription required"
        : "Login required";
  const bannerStatusLabel = isCompanyFeatureRequested
    ? companyLockedStatusLabel
    : isCompanyPlan
      ? "Company access active"
      : isAuthenticated
        ? "Logged in, free mode"
        : productPolicy.statusLabel;
  const paidFeatureHref = hasCompanyAccess
    ? "/dashboard"
    : isAuthenticated
      ? "/company-version"
      : loginHref;
  const paidFeatureCtaLabel = hasCompanyAccess
    ? "Open account"
    : isAuthenticated
      ? "Start company version"
      : "Login / subscribe";
  const uploadedFieldPhotosRef = useRef(uploadedFieldPhotos);
  const unplacedFieldPhotosRef = useRef(unplacedFieldPhotos);
  const loadedReportIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/auth/session", {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { authenticated?: boolean } | null) => {
        if (!cancelled) {
          setAuthSessionStatus(data?.authenticated ? "authenticated" : "anonymous");
        }

        if (data?.authenticated) {
          return loadAxis1AccountEntitlements()
            .then((entitlements) => {
              if (!cancelled) {
                setAccountEntitlements(entitlements);
              }

              if (!entitlements.companyAccess) {
                return undefined;
              }

              return loadAxis1ServerCompanyProfile()
                .then((profile) => {
                  if (!cancelled) {
                    saveAxis1CompanyProfile(profile);
                  }
                })
                .catch(() => undefined);
            })
            .catch(() => undefined);
        }

        if (!cancelled) {
          setAccountEntitlements(null);
        }
        return undefined;
      })
      .catch(() => {
        if (!cancelled) {
          setAuthSessionStatus("anonymous");
          setAccountEntitlements(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const reportId = new URLSearchParams(window.location.search)
      .get("loadReport")
      ?.trim();

    if (!reportId || loadedReportIdRef.current === reportId) {
      return;
    }

    loadedReportIdRef.current = reportId;
    loadAxis1ServerReportForBuilder(reportId)
      .then((report) => {
        const payload = report.payload;

        if (!payload?.values) {
          throw new Error("Saved report payload is missing builder values.");
        }

        form.reset({
          ...axis1BuilderDefaults,
          ...payload.values,
        });
        setUploadedFieldPhotos(
          payload.uploadedFieldPhotos ?? emptyFieldPhotoState(),
        );
        setUnplacedFieldPhotos([]);
        setPhotoSlotResolutions(
          payload.photoSlotResolutions ?? emptyPhotoSlotResolutions(),
        );
        setCloseoutLinks(payload.links ?? {});
        setPacketPresentationMode(
          payload.presentationMode === "standard" ? "standard" : "short",
        );
        setPacketSections(payload.visibleSections ?? shortPacketSections);
        setHasJobOutcomeSelected(true);
        setAutoDraftedJobPatternId(null);
        setScopeAssumptionsAccepted(true);
        setShowScopeDetails(false);
        setSelectedProductPlan(report.productPlan);

        if (payload.companyProfile) {
          saveAxis1CompanyProfile(payload.companyProfile);
        }

        setBuilderStep("outputs");
        const url = new URL(window.location.href);
        url.searchParams.set("step", "outputs");
        url.searchParams.set("account", report.productPlan);
        url.searchParams.delete("loadReport");
        window.history.replaceState({}, "", url);

        toast.success("Report loaded into builder", {
          description: "You can review, copy a fresh link, or save the PDF again.",
        });
      })
      .catch(() => {
        loadedReportIdRef.current = null;
        toast.error("Could not load saved report", {
          description: "Open the hosted report link, or create a fresh report from the builder.",
        });
      });
  }, [form]);

  useEffect(() => {
    uploadedFieldPhotosRef.current = uploadedFieldPhotos;
  }, [uploadedFieldPhotos]);

  useEffect(() => {
    unplacedFieldPhotosRef.current = unplacedFieldPhotos;
  }, [unplacedFieldPhotos]);

  useEffect(() => {
    const initialSearchParams = new URLSearchParams(window.location.search);
    const requestedStep = initialSearchParams.get("step");
    const normalizedStep =
      requestedStep === "job" || requestedStep === "scope"
        ? "review"
        : requestedStep === "proof" || requestedStep === "risk"
          ? "photos"
          : requestedStep === "report" ||
              requestedStep === "confirm" ||
              requestedStep === "next"
            ? "outputs"
            : requestedStep;

    if (
      normalizedStep === "photos" ||
      normalizedStep === "review" ||
      normalizedStep === "outputs"
    ) {
      const frame = window.requestAnimationFrame(() => {
        const resolvedStep = normalizedStep;
        setBuilderStep(resolvedStep);
        if (resolvedStep !== requestedStep) {
          const url = new URL(window.location.href);
          url.searchParams.set("step", resolvedStep);
          window.history.replaceState({}, "", url);
        }
        scrollPacketWorkspaceBelowHeader();
        window.setTimeout(() => scrollPacketWorkspaceBelowHeader("auto"), 90);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  const previewData = buildAxis1NeutralPacketData(values);
  const confirmedUploadedFieldPhotos =
    buildConfirmedFieldPhotoState(uploadedFieldPhotos);
  const uploadedProofCount = fieldPhotoSlots.filter(
    (slot) => uploadedFieldPhotos[slot.id],
  ).length;
  const confirmedUnplacedFieldPhotoCount = unplacedFieldPhotos.filter((photo) =>
    isVendorConfirmedPhoto(photo),
  ).length;
  const totalFieldPhotoCount = uploadedProofCount + unplacedFieldPhotos.length;
  const skippedPhotoSlotCount = fieldPhotoSlots.filter(
    (slot) =>
      !uploadedFieldPhotos[slot.id] &&
      photoSlotResolutions[slot.id] !== "open",
  ).length;
  const requiredProofCount = fieldPhotoSlots.filter((slot) => slot.required).length;
  const requiredProofReadyCount = fieldPhotoSlots.filter(
    (slot) =>
      slot.required &&
      (confirmedUploadedFieldPhotos[slot.id] ||
        photoSlotResolutions[slot.id] !== "open"),
  ).length;
  const missingRequiredSlots = fieldPhotoSlots.filter(
    (slot) =>
      slot.required &&
      !confirmedUploadedFieldPhotos[slot.id] &&
      photoSlotResolutions[slot.id] === "open",
  );
  const uploadedPhotoSlots = fieldPhotoSlots.filter(
    (slot) => uploadedFieldPhotos[slot.id],
  );
  const confirmedUploadedPhotoSlots = fieldPhotoSlots.filter((slot) =>
    confirmedUploadedFieldPhotos[slot.id],
  );
  const vendorConfirmedPhotoCount = confirmedUploadedPhotoSlots.length;
  const fastConfirmableUploadedPhotoIds = uploadedPhotoSlots.flatMap((slot) => {
    const photo = uploadedFieldPhotos[slot.id];

    return photo && isFastConfirmableSuggestedPhoto(photo)
      ? [photo.localId ?? `slot:${slot.id}`]
      : [];
  });
  const fastConfirmableUnplacedPhotoIds = unplacedFieldPhotos.flatMap((photo) =>
    isFastConfirmableSuggestedPhoto(photo) && photo.suggestedSlotId
      ? [photo.id]
      : [],
  );
  const hasSuggestedPhotoRoles =
    fastConfirmableUploadedPhotoIds.length + fastConfirmableUnplacedPhotoIds.length >
    0;
  const pendingPhotoAssistIds = new Set<string>();

  uploadedPhotoSlots.forEach((slot) => {
    const photo = uploadedFieldPhotos[slot.id];

    if (photo && !isVendorConfirmedPhoto(photo)) {
      pendingPhotoAssistIds.add(photo.localId ?? `slot:${slot.id}`);
    }
  });
  unplacedFieldPhotos.forEach((photo) => {
    if (photo.vendorDecision === "pending" && photo.needsVendorReview !== false) {
      pendingPhotoAssistIds.add(photo.id);
    }
  });
  photoAssistSuggestions.forEach((suggestion) => {
    if (suggestion.vendorDecision === "pending" && suggestion.needsVendorReview) {
      pendingPhotoAssistIds.add(suggestion.photoId);
    }
  });

  const pendingPhotoAssistCount = pendingPhotoAssistIds.size;
  const hasPendingPhotoAssist = pendingPhotoAssistCount > 0;
  const hasProofWorkStarted = totalFieldPhotoCount > 0 || skippedPhotoSlotCount > 0;
  const shouldShowProofDetails = showProofDetails || showAllPhotoSlots;
  const activeVisitType = getVisitTypePreset(visitTypeId);
  const expectedScopeAreaIds = new Set<ScopeAreaId>(
    activeVisitType.expectedAreaIds,
  );
  const activeVisitTypeScopeText =
    activeVisitType.expectedAreaIds.length > 0
      ? activeVisitType.expectedAreaIds
          .map((areaId) => scopeAreaCatalog.find((area) => area.id === areaId)?.shortLabel)
          .filter(Boolean)
          .join(", ")
      : "No cleaning area is assumed";
  const selectedRiskFlags = riskFlagCatalog.filter((flag) =>
    riskFlagIds.includes(flag.id),
  );
  const riskReviewFlags = selectedRiskFlags.filter((flag) => flag.id !== "no-risk");
  const riskSummaryLabel =
    riskReviewFlags.length > 0
      ? `${riskReviewFlags.length} context flag(s)`
      : "Standard service record";
  const riskSummaryCopy =
    riskReviewFlags.length > 0
      ? riskReviewFlags.map((flag) => flag.label).join(", ")
      : "Standard maintenance record; no special customer wording needed.";
  const hasBeforePhoto = Boolean(confirmedUploadedFieldPhotos["hood-before"]);
  const hasAfterPhoto = Boolean(confirmedUploadedFieldPhotos["hood-after"]);
  const hasBeforeOnly = hasBeforePhoto && !hasAfterPhoto;
  const hasAfterOnly = hasAfterPhoto && !hasBeforePhoto;
  const openPhotoSlots = showAllPhotoSlots
    ? fieldPhotoSlots
    : fieldPhotoSlots.filter(
        (slot) =>
          !uploadedFieldPhotos[slot.id] &&
          photoSlotResolutions[slot.id] === "open" &&
          (slot.required || slot.id === "service-label"),
      );
  const firstMissingSlots = missingRequiredSlots.slice(0, 4);
  const proofReadinessTitle =
    hasPendingPhotoAssist
      ? `${totalFieldPhotoCount} photos added`
      : hasAfterOnly
        ? "After-only record is ready"
        : hasBeforeOnly
          ? "Before-only photo needs review"
      : missingRequiredSlots.length === 0
      ? `${uploadedProofCount} service photos`
      : totalFieldPhotoCount === 0
        ? "No photos yet"
        : `${missingRequiredSlots.length} core photo(s) still open`;
  const proofReadinessCopy =
    hasPendingPhotoAssist
      ? "Only confirmed photos appear in the customer report. Other photos stay saved but are not mentioned."
      : hasAfterOnly
        ? "No before photo is attached. The report will avoid a false before/after comparison."
        : hasBeforeOnly
          ? "No after photo is attached. Add one, or mark it not captured before continuing."
      : missingRequiredSlots.length === 0
      ? "Core photos are ready. Continue to review, or add only helpful extras."
      : totalFieldPhotoCount === 0
        ? "Pick the result and continue as a written service record when photos were not captured."
        : unplacedFieldPhotos.length > 0
          ? `${unplacedFieldPhotos.length} extra photo(s) saved, not claimed.`
        : `Missing: ${firstMissingSlots.map((slot) => slot.shortLabel).join(", ")}.`;
  const proofProgressPercent = Math.max(
    4,
    (requiredProofReadyCount / requiredProofCount) * 100,
  );
  const selectedCadenceOption =
    axis1CadenceOptions.find((option) => option.value === values.cadence) ??
    axis1CadenceOptions[2];
  const selectedFollowUpOption =
    axis1FollowUpOptions.find((option) => option.value === values.followUpMode) ??
    axis1FollowUpOptions[1];
  const isConditionOnlyVisit = visitTypeId === "condition-record";
  const activeJobPatternId =
    values.scenario === "clean"
      ? "clean-close"
      : selectedAccessCount > 0
        ? "blocked-access"
        : selectedConditionCount > 0
          ? "condition-review"
          : "blocked-access";
  const activeJobPattern =
    jobPatternPresets.find((pattern) => pattern.id === activeJobPatternId) ??
    jobPatternPresets[1];
  const inferredScopeOverrides: ScopeOverrideState = { ...scopeOverrides };

  if (
    hasJobOutcomeSelected &&
    values.scenario === "exception" &&
    selectedConditionCount > 0
  ) {
    const conditionArea = conditionScopeAreaForKinds(values.exceptionKinds);

    if (!inferredScopeOverrides[conditionArea]) {
      inferredScopeOverrides[conditionArea] = "condition-note";
    }
  }

  const scopeLedgerRows = buildScopeLedger({
    uploadedFieldPhotos: confirmedUploadedFieldPhotos,
    unplacedFieldPhotos,
    overrides: inferredScopeOverrides,
    expectedAreaIds: expectedScopeAreaIds,
  });
  const quickCloseoutNote = (values.followUpNote ?? "").trim();
  const quickCloseoutNoteSignal =
    hasJobOutcomeSelected ? inferQuickCloseoutNoteSignal(quickCloseoutNote) : null;
  const quickCloseoutNoteAreaRow = quickCloseoutNoteSignal?.areaId
    ? scopeLedgerRows.find((row) => row.id === quickCloseoutNoteSignal.areaId)
    : null;
  const quickCloseoutNoteNeedsPlacement = Boolean(
    quickCloseoutNoteSignal &&
      (!quickCloseoutNoteSignal.areaId ||
        quickCloseoutNoteAreaRow?.status !== quickCloseoutNoteSignal.status),
  );
  const scopeAttentionRows = scopeLedgerRows.filter((row) => row.needsCheck);
  const scopeNeedsReviewRows = scopeLedgerRows.filter(
    (row) => row.status === "needs-review",
  );
  const scopeCustomerIssueRows = scopeLedgerRows.filter(
    (row) =>
      row.status === "could-not-access" ||
      row.status === "condition-note" ||
      row.status === "not-done",
  );
  const writtenOnlyScopeRows = scopeLedgerRows.filter(
    (row) => row.expectedByDefault && row.status === "done-no-photo",
  );
  const scopeWrittenOnlyNeedsConfirmation =
    hasJobOutcomeSelected &&
    !isConditionOnlyVisit &&
    writtenOnlyScopeRows.length > 0 &&
    !scopeAssumptionsAccepted;
  const scopePhotoEvidenceCount = scopeLedgerRows.filter(
    (row) => row.photoCount > 0,
  ).length;
  const scopeCheckTitle =
    !hasJobOutcomeSelected
      ? "Confirm result first"
      : scopeNeedsReviewRows.length > 0
      ? scopeNeedsReviewRows.length === 1
        ? "1 area needs review"
        : `${scopeNeedsReviewRows.length} areas need review`
        : scopeCustomerIssueRows.length > 0
          ? scopeCustomerIssueRows.length === 1
            ? "1 exception will be shown"
            : `${scopeCustomerIssueRows.length} exceptions will be shown`
          : scopeWrittenOnlyNeedsConfirmation
          ? scopePhotoEvidenceCount > 0
            ? "Photo record with notes-only areas"
            : "Confirm written service record"
          : "Ready to generate";
  const visibleScopeRows = showScopeDetails ? scopeLedgerRows : scopeAttentionRows;
  const photoJobOutcomeRecommendation = buildJobOutcomeRecommendation({
    uploadedFieldPhotos,
    unplacedFieldPhotos,
    photoSlotResolutions,
  });
  const jobOutcomeRecommendation = buildScopeOutcomeRecommendation(
    scopeLedgerRows,
    photoJobOutcomeRecommendation,
  );
  const closeoutAreaLedger = buildCloseoutAreaLedger(scopeLedgerRows);
  const isAutoDraftedOutcome =
    Boolean(autoDraftedJobPatternId) && autoDraftedJobPatternId === activeJobPatternId;
  const engineCloseoutLinks = normalizeCloseoutLinks(closeoutLinks);
  const closeoutEngine = evaluateAxis1Closeout({
    values,
    outcomeSelected: hasJobOutcomeSelected,
    uploadedFieldPhotos: confirmedUploadedFieldPhotos,
    unplacedPhotoCount: confirmedUnplacedFieldPhotoCount,
    photoSlotResolutions,
    areaLedger: closeoutAreaLedger,
    links: engineCloseoutLinks,
  });
  const closeoutFormatLabel =
    !closeoutEngine.canGeneratePacket
      ? "Waiting for selected result"
      : closeoutEngine.recordFormat.type === "access_issue_record"
      ? "Access action record"
      : closeoutEngine.recordFormat.type === "service_closeout_record"
        ? "Written service record"
        : closeoutEngine.recordFormat.type === "after_cleaning_record"
          ? "After-photo service record"
          : closeoutEngine.recordFormat.type === "photo_supported_service_record"
            ? "Partial-photo service record"
            : "Photo-supported service record";
  const reportNeedsPhotoReview = false;
  const pendingPlacedPhotoSlots = uploadedPhotoSlots.filter((slot) => {
    const photo = uploadedFieldPhotos[slot.id];

    return Boolean(photo && !isVendorConfirmedPhoto(photo));
  });
  const firstPendingPlacedPhotoSlot = pendingPlacedPhotoSlots[0] ?? null;
  const firstPendingPlacedPhoto = firstPendingPlacedPhotoSlot
    ? uploadedFieldPhotos[firstPendingPlacedPhotoSlot.id]
    : null;
  const firstPendingExtraPhoto =
    unplacedFieldPhotos.find((photo) => photo.vendorDecision === "pending") ??
    null;
  const firstPendingExtraSuggestedSlot = firstPendingExtraPhoto?.suggestedSlotId
    ? fieldPhotoSlots.find(
        (slot) => slot.id === firstPendingExtraPhoto.suggestedSlotId,
      ) ?? null
    : null;
  const scopeNeedsConfirmation = scopeNeedsReviewRows.length > 0;
  const sendReadinessBlockers = [
    scopeNeedsReviewRows.length > 0
      ? scopeNeedsReviewRows.length === 1
        ? "1 area needs review: completed, blocked, or not included"
        : `${scopeNeedsReviewRows.length} areas need review: completed, blocked, or not included`
      : null,
    scopeWrittenOnlyNeedsConfirmation
      ? writtenOnlyScopeRows.length === 1
        ? "1 notes-only area: confirm completed from service notes or change it"
        : `${writtenOnlyScopeRows.length} notes-only areas: confirm completed from service notes or change them`
      : null,
  ].filter(Boolean) as string[];
  const hasOutputReviewItems = closeoutEngine.generatedOutputs.some(
    (output) => output.readiness === "needs_review",
  );
  const hasVendorReviewChecks = closeoutEngine.vendorSendReadinessWarnings.some(
    (warning) => warning.severity !== "note",
  );
  const readyToSendWithoutReview =
    closeoutEngine.canGeneratePacket &&
    hasJobOutcomeSelected &&
    jobBasicsReady &&
    sendReadinessBlockers.length === 0 &&
    !hasOutputReviewItems &&
    !hasVendorReviewChecks;
  const customerOutputsReadyWithChecks =
    closeoutEngine.canGeneratePacket &&
    hasJobOutcomeSelected &&
    jobBasicsReady &&
    sendReadinessBlockers.length === 0 &&
    (hasOutputReviewItems || hasVendorReviewChecks);
  const canPreviewProofLink =
    closeoutEngine.canGeneratePacket &&
    hasJobOutcomeSelected &&
    jobBasicsReady &&
    sendReadinessBlockers.length === 0;
  const previewBlockedBy =
    !jobBasicsReady
      ? "basics"
      : scopeNeedsReviewRows.length > 0
      ? "review"
      : scopeWrittenOnlyNeedsConfirmation
        ? "notes"
        : null;
  const scopeNeedsWrittenRecordConfirmation =
    builderStep === "review" && previewBlockedBy === "notes";
  const previewProofLinkLabel = !hasJobOutcomeSelected
    ? "Confirm result first"
    : canPreviewProofLink
      ? "Go to Outputs"
      : previewBlockedBy === "basics"
        ? "Add job details"
      : previewBlockedBy === "notes"
        ? "Continue with written record"
        : "Fix area status";
  const reportStatusLabel = !closeoutEngine.canGeneratePacket
    ? "Result required"
    : !jobBasicsReady
      ? "Job details needed"
    : readyToSendWithoutReview
      ? "Ready"
      : customerOutputsReadyWithChecks
        ? "Outputs ready"
    : "Needs review";
  const mobileReportStatus =
    !closeoutEngine.canGeneratePacket
      ? {
          tone: "partial",
          title: "Confirm the result first",
          copy: "Confirm what happened before outputs are generated.",
        }
      : !jobBasicsReady
        ? {
            tone: "review",
            title: "Add customer details",
            copy: `Needed before output: ${jobBasicsMissingLabel}.`,
          }
      : sendReadinessBlockers.length > 0
      ? {
          tone: "review",
          title: "Confirm before outputs",
          copy: sendReadinessBlockers[0] ?? "Review the remaining assumption.",
        }
      : reportNeedsPhotoReview
      ? {
          tone: "review",
          title: "Check photo roles before outputs",
          copy: "Review AI photo matches first. They stay out until confirmed.",
        }
    : customerOutputsReadyWithChecks
      ? {
          tone: "neutral",
          title: "Outputs ready",
          copy:
            closeoutEngine.generatedOutputs.find(
              (output) => output.readiness === "needs_review",
            )?.reason ??
            closeoutEngine.vendorSendReadinessWarnings.find(
              (warning) => warning.severity !== "note",
            )?.copy ??
          "Service report link and PDF are ready; private send checks stay inside the builder.",
        }
      : totalFieldPhotoCount === 0
        ? {
            tone: activeJobPatternId === "clean-close" ? "neutral" : "review",
            title:
              activeJobPatternId === "blocked-access"
                ? "Ready with access action"
                : activeJobPatternId === "condition-review"
                  ? "Ready with condition note"
                  : "Ready as written record",
            copy:
              activeJobPatternId === "blocked-access"
                ? "The report records reachable work completed and the blocked area still needing action."
                : activeJobPatternId === "condition-review"
                  ? "The report records service completed with one condition kept visible."
                  : "The report can be generated from written service notes. Add photos only if the crew captured them.",
          }
        : missingRequiredSlots.length > 0
          ? {
              tone: "partial",
          title: "Sendable with partial photos",
          copy: "Open slots stay out unless attached or intentionally marked.",
            }
          : {
              tone: "ready",
              title: "Ready to send",
              copy: "Job result, photo status, note, and next window are lined up.",
            };
  const mobileReportStatusClass =
    mobileReportStatus.tone === "ready"
      ? "border-[#2c7a3f]/18 bg-[#f0f8ef] text-[#1f6330]"
      : mobileReportStatus.tone === "neutral"
        ? "border-black/8 bg-[#f8f4ec] text-foreground"
        : "border-[#f26a21]/20 bg-[#fff2e8] text-[#a94410]";
  const mobileReportIconClass =
    mobileReportStatus.tone === "ready"
      ? "bg-[#2c7a3f] text-white"
      : mobileReportStatus.tone === "neutral"
        ? "bg-[#111315] text-white"
        : "bg-[#f26a21] text-white";
  const mobileReportInlineActionLabel = reportNeedsPhotoReview
    ? "Photo tray"
    : reportOutputMode === "link"
    ? "Copy report link"
      : "Save PDF";
  const photoStepPrimaryLabel =
    hasJobOutcomeSelected
      ? "Review report"
      : hasBeforeOnly || hasAfterOnly
      ? shouldShowProofDetails
        ? "Review report"
        : "Review photos"
    : totalFieldPhotoCount === 0
      ? "Review report"
      : "Review report";
  const getBuilderStepMetric = (stepValue: BuilderStep) => {
    if (stepValue === "photos") {
      return totalFieldPhotoCount > 0
        ? `${totalFieldPhotoCount} photos`
        : "Optional";
    }

    if (stepValue === "review") {
      return hasJobOutcomeSelected
        ? activeJobPattern.label
        : "Required";
    }

    if (!closeoutEngine.canGeneratePacket) {
      return "Locked";
    }

    if (sendReadinessBlockers.length > 0) {
      return "Review";
    }

    return totalFieldPhotoCount > 0
      ? `${uploadedProofCount} placed`
      : "Ready";
  };
  const mobilePrimaryActionLabel =
    builderStep === "photos"
      ? photoStepPrimaryLabel
    : builderStep === "review"
        ? !hasJobOutcomeSelected
          ? "Choose result"
          : previewBlockedBy === "notes"
            ? "Next step"
            : previewProofLinkLabel
        : reportOutputMode === "link"
        ? "Copy report link"
          : "Save PDF";
  const mobileSecondaryActionLabel =
    builderStep === "photos"
        ? hasProofWorkStarted
          ? "Photo tray"
          : "Review"
      : builderStep === "review"
        ? "Add photos"
        : reportNeedsPhotoReview
          ? "Photo tray"
          : "Options";
  const mobilePrimaryIsPrint = isOutputStep && reportOutputMode === "pdf";
  const reportOutputMeta =
    reportOutputMode === "link"
      ? {
          label: "Service report link preview",
          title: isCompanyPlan
            ? "Branded service report link from this job"
            : "Unbranded test report link from this job",
          copy: isCompanyPlan
            ? "Company mode uses your saved company logo/contact and keeps hosted service report links live while subscribed."
            : "Free mode creates an unbranded 7-day test link with no company logo/contact.",
          badge: productPolicy.outputLabel,
        }
      : {
          label: "Service report PDF preview",
          title: isCompanyPlan
            ? "Clean service report PDF from this job"
            : "Watermarked service report PDF from this job",
          copy: isCompanyPlan
            ? "Company mode removes the free watermark for the retained customer and inspection copy."
            : "Free mode keeps a visible watermark so vendors can evaluate the output before using it under their company name.",
          badge: productPolicy.outputLabel,
        };
  const lastSavedReportLinkLabel =
    lastSavedReportLink?.storage === "server"
      ? "Hosted report link"
      : "Browser fallback link";
  const lastSavedReportLinkCopy =
    lastSavedReportLink?.storage === "server"
      ? lastSavedReportLink.productPlan === "company"
        ? "Saved to account history under the company version."
        : "Saved as a free 7-day test link."
      : "Saved in this browser only because hosted storage was not reachable.";
  const activePreviewPresentationMode =
    reportOutputMode === "pdf" ? packetPresentationMode : "standard";
  const activePreviewSections =
    reportOutputMode === "pdf" ? packetSections : standardPacketSections;
  const setupNoticeMeta =
    setupNoticeAction === "print-pdf"
      ? {
          eyebrow: "Before saving PDF",
          title: isCompanyPlan
            ? "Save the clean company service report PDF."
            : "Save the current watermarked service report PDF.",
          actionLabel: "Continue to PDF",
          copy: isCompanyPlan
            ? "Company mode removes the watermark and saves this report to history."
            : isAuthenticated
              ? "Free output has no company logo/contact, stays watermarked, and is meant for testing. The company version removes the watermark and saves report history."
              : "Free output is allowed without login: it has no company logo/contact, stays watermarked, and is meant for testing. The company version removes the watermark and saves report history.",
        }
      : setupNoticeAction === "open-link"
        ? {
            eyebrow: "Before opening link",
            title: isCompanyPlan
              ? "Open the company service report link."
              : "Open the free test report link.",
            actionLabel: "Continue to link",
            copy: isCompanyPlan
              ? "Company mode creates a hosted service report link under your company name and saves the record to account history."
              : isAuthenticated
                ? "Free output creates a 7-day test link with no company logo/contact. The company version unlocks live service report links under your company name."
                : "Free output is allowed without login: it creates a 7-day test link with no company logo/contact. The company version unlocks live service report links under your company name.",
          }
        : {
            eyebrow: "Before copying link",
            title: isCompanyPlan
              ? "Copy the company service report link."
              : "Copy the free test report link.",
            actionLabel: "Continue and copy",
            copy: isCompanyPlan
              ? "Company mode copies the service report link under your company name and keeps the report in account history."
              : isAuthenticated
                ? "Free output copies a 7-day test link with no company logo/contact. The company version unlocks live service report links and history."
                : "Free output is allowed without login: it copies a 7-day test link with no company logo/contact. The company version unlocks live service report links and history.",
          };
  const paidFeatureMeta =
    paidFeatureNotice === "branding"
      ? {
          eyebrow: "Company details are locked",
          title: isAuthenticated
            ? "Start the company version to save your company details."
            : "Login and subscribe to save your company details.",
          copy: isAuthenticated
            ? "You are logged in. An active company subscription unlocks saved logo, report color, contact details, and account defaults."
            : "The free builder stays neutral so vendors can test the report quickly. Login and an active subscription unlock saved company details from Account.",
        }
      : paidFeatureNotice === "history"
        ? {
            eyebrow: "History is locked",
            title: isAuthenticated
              ? "Report history unlocks with the company version."
              : "Saved reports belong in the company account workspace.",
            copy: isAuthenticated
              ? "An active company subscription stores completed service reports, keeps photos and links available, and lets you load past jobs back into the tool."
              : "After login and an active subscription, completed service reports can be stored, searched, loaded back into the tool, and sorted by next recommended service date for follow-up.",
          }
        : {
            eyebrow: "Company version",
            title: isAuthenticated
              ? "Keep using the free builder, or start the company version."
              : "Keep using the free builder, or login to unlock company output.",
            copy: isAuthenticated
              ? "You are logged in. Free mode still creates a neutral 7-day test link and watermarked PDF. Company mode adds your logo/contact, clean PDFs, live service report links while subscribed, saved defaults, and report history."
              : "Free mode creates a neutral 7-day test link and watermarked PDF. Company mode adds your logo/contact, clean PDFs, live service report links while subscribed, saved defaults, and report history.",
          };
  const previewPacketWithPhotos = applyScopeLedgerToPacket(
    buildAxis1PacketDataWithFieldPhotos(
      previewData,
      confirmedUploadedFieldPhotos,
      photoSlotResolutions,
    ),
    scopeLedgerRows,
    activeVisitType,
  );
  const generatedPreviewPacket = applyScopeLedgerToPacket(
    applyAxis1CloseoutEngineToPacket(
      previewPacketWithPhotos,
      closeoutEngine,
    ),
    scopeLedgerRows,
    activeVisitType,
  );
  const customerTextPreviewPacket = applyCustomerTextOverridesToPacket(
    generatedPreviewPacket,
    {
      result: values.summaryOverride,
      openItem:
        closeoutEngine.outcomeType === "blocked_access"
          ? values.exceptionNote
          : closeoutEngine.outcomeType === "condition_review"
            ? values.followUpOverride || values.followUpNote
            : values.followUpOverride,
      action: values.customerActionOverride,
      recordNote: values.recordNoteOverride,
    },
  );
  const previewPacket = isCompanyPlan
    ? applyAxis1CompanyProfileToPacketData(
        customerTextPreviewPacket,
        companyProfile,
      )
    : customerTextPreviewPacket;
  const claimLevelLabel =
    closeoutEngine.claimLevel === "photo_supported_record"
      ? "Photo record"
      : closeoutEngine.claimLevel === "partial_photo_record"
        ? "Partial photo record"
        : "Written service record";
  const enginePrimaryCta =
    closeoutEngine.primaryCta ??
    closeoutEngine.ctas.find((cta) => cta.priority === "primary");
  const enginePrimaryCtaLabel = enginePrimaryCta?.label ?? "Next step after result";
  const enginePrimaryCtaStatus =
    enginePrimaryCta?.enabled
      ? "Connected"
      : isCompanyPlan
        ? "The report will use the company phone or reply email."
        : "Free test links use your normal customer communication channel.";
  const engineWarningLabel =
    closeoutEngine.vendorSendReadinessWarnings.length > 0
      ? closeoutEngine.vendorSendReadinessWarnings[0].copy
      : "No private output check for the current inputs.";
  const generatedOutputReadyCount = closeoutEngine.generatedOutputs.filter(
    (output) => output.readiness === "ready",
  ).length;
  const generatedOutputReviewCount = closeoutEngine.generatedOutputs.filter(
    (output) => output.readiness === "needs_review",
  ).length;
  const nextActionRows = [
    {
      label: "Schedule next cleaning",
      state:
        closeoutEngine.outcomeType === "clean" ? "ready" : "needs_review",
      copy:
        closeoutEngine.outcomeType === "clean"
          ? `Use ${selectedCadenceOption.label.toLowerCase()} as the next-service window.`
          : "Clear access or follow-up before using normal rebook copy.",
    },
    {
      label: "Schedule revisit after access is clear",
      state:
        closeoutEngine.outcomeType === "blocked_access" ? "ready" : "not_applicable",
      copy:
        closeoutEngine.outcomeType === "blocked_access"
          ? "Blocked or incomplete area selected; revisit copy is available."
          : "No revisit request is needed for the current result.",
    },
    {
      label: "Send follow-up quote",
      state:
        closeoutEngine.outcomeType === "condition_review" &&
        values.followUpMode === "quote"
          ? "ready"
          : "not_applicable",
      copy:
        closeoutEngine.outcomeType === "condition_review"
          ? "Condition follow-up can become quote copy from this record."
          : "No quoted condition is selected.",
    },
    {
      label: "Monitor condition",
      state:
        closeoutEngine.outcomeType === "condition_review" &&
        values.followUpMode !== "quote"
          ? "ready"
          : "not_applicable",
      copy:
        closeoutEngine.outcomeType === "condition_review"
          ? "Keep the condition visible for the next service cycle."
          : "No monitor-only condition is selected.",
    },
  ];
  const reportDiagnosticCards = [
    {
      label: "Report context",
      value: riskSummaryLabel,
      helper: riskSummaryCopy,
      wideOnPhone: true,
    },
    {
      label: "Result",
      value: closeoutEngine.primaryStatusLabel,
    },
    {
      label: "Record",
      value: closeoutEngine.recordFormat.label,
    },
    {
      label: "Claim basis",
      value: claimLevelLabel,
    },
    {
      label: "Photo coverage",
      value: closeoutEngine.proofCoverage.shortLabel,
    },
    {
      label: "Primary CTA",
      value: enginePrimaryCtaLabel,
      helper: enginePrimaryCtaStatus,
      wideOnPhone: true,
    },
  ];
  const reportHeadingText = readyToSendWithoutReview
    ? "Send, save, and follow up from this service report."
    : customerOutputsReadyWithChecks
      ? closeoutEngine.evidenceBasis === "no_photos"
        ? "Customer written record is ready."
        : "Service report link and PDF are ready."
      : hasJobOutcomeSelected && !jobBasicsReady
      ? "Add customer and service details."
      : sendReadinessBlockers.length > 0
      ? "Confirm before outputs."
      : "Confirm a result before outputs are generated.";
  function selectCustomerLineEditor(
    editor: CustomerLineEditor,
    surface: CustomerLineEditorSurface,
  ) {
    setActiveCustomerLineEditor(editor);
    setActiveCustomerLineEditorSurface(surface);
  }

  function customerEditorForPreviewTarget(
    target: CustomerWebPacketEditTarget,
  ): CustomerLineEditor | null {
    if (target === "result") {
      return "result";
    }

    if (target === "openItem") {
      return "open-item";
    }

    if (target === "action") {
      return "action";
    }

    return null;
  }

  function selectPreviewEditTarget(target: CustomerWebPacketEditTarget) {
    const editor = customerEditorForPreviewTarget(target);

    setReportOutputMode("link");
    setShowWordingEditor(false);
    setActivePreviewEditTarget(target);

    if (editor) {
      selectCustomerLineEditor(editor, "preview");
    } else {
      setActiveCustomerLineEditorSurface("preview");
    }
  }

  function openScopeEditorFromPreview() {
    setActivePreviewEditTarget(null);
    setActiveCustomerLineEditorSurface(null);
    setReportOutputMode("link");
    setShowScopeDetails(true);
    selectBuilderStep("review");

    const scrollToScopeEditor = () => {
      document
        .querySelector("[data-axis-scope-review-panel]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.setTimeout(scrollToScopeEditor, 120);
    window.setTimeout(scrollToScopeEditor, 360);
  }

  function updatePreviewTextField(
    field:
      | "summaryOverride"
      | "customerActionOverride"
      | "followUpOverride"
      | "recordNoteOverride"
      | "exceptionNote"
      | "followUpNote",
    value: string,
  ) {
    form.setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function renderInlineCustomerLineEditor(
    editor: CustomerLineEditor,
    idPrefix: string,
  ) {
    if (editor === "result") {
      return (
        <div>
          <label className={labelClassName()} htmlFor={`${idPrefix}SummaryOverride`}>
            Customer result line
          </label>
          <textarea
            id={`${idPrefix}SummaryOverride`}
            rows={3}
            className={fieldClassName()}
            maxLength={textFieldLimits.summaryOverride}
            placeholder={generatedPreviewPacket.summaryCards[0]?.copy}
            {...form.register("summaryOverride")}
          />
          <div className="flex items-start justify-between gap-3">
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Leave blank to keep the default line. If the covered area is wrong,
              change the area status instead of only changing this sentence.
            </p>
            <CharacterCount
              value={values.summaryOverride}
              max={textFieldLimits.summaryOverride}
            />
          </div>
        </div>
      );
    }

    if (editor === "open-item") {
      const openItemNoteField =
        selectedAccessCount > 0 ? "exceptionNote" : "followUpNote";
      const openItemNoteId =
        openItemNoteField === "exceptionNote"
          ? `${idPrefix}ExceptionNote`
          : `${idPrefix}FollowUpNote`;
      const openItemNoteValue =
        openItemNoteField === "exceptionNote"
          ? values.exceptionNote
          : values.followUpNote;
      const openItemNoteLimit =
        openItemNoteField === "exceptionNote"
          ? textFieldLimits.exceptionNote
          : textFieldLimits.followUpNote;

      return (
        <>
          <div className="grid gap-2 md:grid-cols-3">
            {jobPatternPresets.map((pattern) => {
              const selected = activeJobPatternId === pattern.id;

              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => applyJobPattern(pattern)}
                  className={`rounded-[16px] border px-3 py-3 text-left transition ${
                    selected
                      ? "border-[#f26a21]/45 bg-white"
                      : "border-black/8 bg-white/55 hover:bg-white"
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                    {pattern.label}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-foreground">
                    {pattern.title}
                  </span>
                </button>
              );
            })}
          </div>
          {values.scenario === "exception" ? (
            <div>
              <label className={labelClassName()} htmlFor={openItemNoteId}>
                Optional detail note
              </label>
              <textarea
                id={openItemNoteId}
                rows={2}
                className={fieldClassName()}
                maxLength={openItemNoteLimit}
                placeholder="Optional. Add the specific blocked area or condition if the default is too broad."
                {...form.register(openItemNoteField)}
              />
              <CharacterCount
                value={openItemNoteValue}
                max={openItemNoteLimit}
              />
            </div>
          ) : null}
        </>
      );
    }

    if (editor === "action") {
      return (
        <div>
          <label className={labelClassName()} htmlFor={`${idPrefix}CustomerActionOverride`}>
            Customer instruction
          </label>
          <textarea
            id={`${idPrefix}CustomerActionOverride`}
            rows={3}
            className={fieldClassName()}
            maxLength={textFieldLimits.customerActionOverride}
            placeholder={findPacketRowValue(
              generatedPreviewPacket.customerClose.actionItems,
              "Reply or action",
              generatedPreviewPacket.customerClose.copy,
            )}
            {...form.register("customerActionOverride")}
          />
          <div className="flex items-start justify-between gap-3">
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              This is the main next-action sentence the customer sees.
            </p>
            <CharacterCount
              value={values.customerActionOverride}
              max={textFieldLimits.customerActionOverride}
            />
          </div>
        </div>
      );
    }

    if (editor === "photo-record") {
      return (
        <div className="rounded-[16px] border border-black/8 bg-white/70 px-4 py-4">
          <p className={labelClassName()}>Photo record</p>
          <p className="mt-2 text-sm font-bold leading-5 text-foreground">
            {closeoutEngine.recordFormat.builderTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {closeoutEngine.recordFormat.builderCopy}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => selectBuilderStep("photos")}
              className="rounded-full bg-[#111315] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#111315]/90"
            >
              Open photo editor
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                fieldPhotoSlots.forEach((slot) => {
                  if (!uploadedFieldPhotos[slot.id]) {
                    setPhotoSlotResolution(slot.id, "not-captured");
                  }
                });
              }}
              className="rounded-full border border-black/10 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:bg-white"
            >
              Mark missing as not captured
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p className={labelClassName()}>Next service timing</p>
        <SegmentedControl
          type="single"
          value={values.cadence}
          onValueChange={(value) => {
            if (axis1CadenceOptions.some((option) => option.value === value)) {
              form.setValue(
                "cadence",
                value as Axis1BuilderFormValues["cadence"],
                {
                  shouldDirty: true,
                  shouldValidate: true,
                },
              );
            }
          }}
          className="mt-3 flex-wrap bg-white/72"
        >
          {axis1CadenceOptions.map((option) => (
            <SegmentedControlItem key={option.value} value={option.value}>
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {selectedCadenceOption.copy}
        </p>
      </div>
    );
  }

  const generatedCustomerLines = [
    {
      label: "Today's result",
      value: previewPacket.summaryCards[0]?.copy ?? previewPacket.packetHeader.copy,
      source: values.summaryOverride?.trim() ? "Edited by you" : "Default line",
      action: "Edit line",
      editor: "result" as const,
    },
    {
      label:
        values.scenario === "exception"
          ? selectedAccessCount > 0
            ? "Access note"
            : "Follow-up note"
          : "Report status",
      value: closeoutEngine.responsibilityCopy,
      source: values.scenario === "exception" ? "Shown to customer" : "Shown as closed",
      action: "Edit line",
      editor: "open-item" as const,
    },
    {
      label: "Customer next step",
      value:
        findPacketRowValue(
          previewPacket.customerClose.actionItems,
          "Reply or action",
          previewPacket.customerClose.copy,
        ) || previewPacket.customerClose.copy,
      source: values.customerActionOverride?.trim()
        ? "Edited by you"
        : "Default next step",
      action: "Edit line",
      editor: "action" as const,
    },
    {
      label: "Photo / record basis",
      value: closeoutEngine.proofCoverage.label,
      source:
        totalFieldPhotoCount > 0
          ? `${uploadedProofCount} attached photo(s) / ${claimLevelLabel}`
          : "Written service record",
      action: "Edit photos",
      editor: "photo-record" as const,
    },
    {
      label: "Next service",
      value:
        findPacketRowValue(
          previewPacket.customerClose.actionItems,
          "Next visit window",
          `${selectedCadenceOption.label} cadence`,
        ) || `${selectedCadenceOption.label} cadence`,
      source: `${selectedCadenceOption.label} selected`,
      action: "Edit timing",
      editor: "timing" as const,
    },
  ];
  const customerShouldKnowOptions = [
    {
      label: "Completed",
      pattern: getJobPatternById("clean-close"),
      helper: "Included work completed; no customer action needed.",
    },
    {
      label: "Blocked / no access",
      pattern: getJobPatternById("blocked-access"),
      helper: "One area needs access, revisit, or area clarification.",
    },
    {
      label: "Condition found",
      pattern: getJobPatternById("condition-review"),
      helper: "Condition should drive quote, revisit, or next-service follow-up.",
    },
  ];
  const customerNoteField =
    selectedAccessCount > 0 ? "exceptionNote" : "followUpNote";
  const customerNoteValue =
    customerNoteField === "exceptionNote"
      ? values.exceptionNote
      : values.followUpNote;
  const customerNotePlaceholder =
    selectedAccessCount > 0
      ? "Optional. Example: rear duct panel blocked by stored boxes"
      : "Optional. Example: rooftop fan hinge should be reviewed";
  const primaryCustomerLines = generatedCustomerLines
    .slice(0, 3)
    .map((item, index) => {
      if (index === 1 && values.scenario === "exception") {
        const note = toDisplaySentence(customerNoteValue ?? "");

        if (note) {
          return {
            ...item,
            value: note,
            source: "Typed note",
          };
        }
      }

      return item;
    });
  const previewOpenItemValue =
    closeoutEngine.outcomeType === "blocked_access"
      ? values.exceptionNote
      : closeoutEngine.outcomeType === "condition_review"
        ? values.followUpOverride
        : values.followUpOverride;
  const customerPreviewEditConfig: CustomerWebPacketEditConfig = {
    enabled:
      isOutputStep &&
      reportOutputMode === "link" &&
      closeoutEngine.canGeneratePacket,
    activeTarget: activePreviewEditTarget,
    fields: {
      result: {
        label: "Customer result line",
        value: values.summaryOverride ?? "",
        placeholder:
          generatedPreviewPacket.summaryCards[0]?.copy ?? generatedPreviewPacket.packetHeader.copy,
        maxLength: textFieldLimits.summaryOverride,
        helper: "Blank keeps the generated service-result sentence.",
        onChange: (value) => updatePreviewTextField("summaryOverride", value),
      },
      openItem: {
        label:
          closeoutEngine.outcomeType === "blocked_access"
            ? "Access note"
            : closeoutEngine.outcomeType === "condition_review"
              ? "Condition note"
              : "Report status note",
        value: previewOpenItemValue ?? "",
        placeholder:
          closeoutEngine.outcomeType === "blocked_access"
            ? customerNotePlaceholder
            : closeoutEngine.outcomeType === "condition_review"
              ? "Optional. Example: rooftop fan hinge should be reviewed before the next cycle."
              : "Optional. Example: no open access issue remained at close-out.",
        maxLength:
          closeoutEngine.outcomeType === "blocked_access"
            ? textFieldLimits.exceptionNote
            : textFieldLimits.followUpOverride,
        helper:
          closeoutEngine.outcomeType === "blocked_access"
            ? "This keeps the blocked area separate from completed work."
            : closeoutEngine.outcomeType === "condition_review"
              ? "This keeps the recorded condition visible without changing completed work."
              : "This changes the report-status sentence, not the result title.",
        onChange: (value) =>
          updatePreviewTextField(
            closeoutEngine.outcomeType === "blocked_access"
              ? "exceptionNote"
              : "followUpOverride",
            value,
          ),
      },
      action: {
        label: "Customer instruction",
        value: values.customerActionOverride ?? "",
        placeholder:
          findPacketRowValue(
            generatedPreviewPacket.customerClose.actionItems,
            "Reply or action",
            generatedPreviewPacket.customerClose.copy,
          ) || generatedPreviewPacket.customerClose.copy,
        maxLength: textFieldLimits.customerActionOverride,
        helper: "This is the main sentence telling the customer what to do next.",
        onChange: (value) => updatePreviewTextField("customerActionOverride", value),
      },
      recordNote: {
        label: "Record note body",
        value: values.recordNoteOverride ?? "",
        placeholder:
          findPacketRowValue(
            generatedPreviewPacket.customerClose.actionItems,
            "PDF copy note",
            "The service report PDF is for manager, insurance, or documentation requests.",
          ) || "The service report PDF is for manager, insurance, or documentation requests.",
        maxLength: textFieldLimits.recordNoteOverride,
    helper: "This changes the PDF note shown in the service report link.",
        onChange: (value) => updatePreviewTextField("recordNoteOverride", value),
      },
    },
    onSelectTarget: selectPreviewEditTarget,
    onEditScope: openScopeEditorFromPreview,
    onClose: () => {
      setActivePreviewEditTarget(null);
      setActiveCustomerLineEditorSurface(null);
    },
  };
  const selectedRecommendedOutcome =
    hasJobOutcomeSelected &&
    activeJobPatternId === jobOutcomeRecommendation.pattern.id;
  const customerChoiceStatus = selectedRecommendedOutcome
    ? isAutoDraftedOutcome
      ? "Recommended applied"
      : "Recommended accepted"
    : hasJobOutcomeSelected
      ? "Changed by you"
      : "Pick one";
  const customerChoiceReason =
    selectedRecommendedOutcome
      ? "The report follows the recommended result. Change it only if the visit was different."
      : !hasJobOutcomeSelected
      ? totalFieldPhotoCount === 0
        ? "No photos or result are confirmed yet. Pick what happened to build a written record."
        : jobOutcomeRecommendation.reason
      : "You changed the suggested answer. The report now follows your selected result.";

  function resetBuilder() {
    form.reset(createAxis1BuilderStartValues());
    setHasJobOutcomeSelected(false);
    setAutoDraftedJobPatternId(null);
    setUploadedFieldPhotos(emptyFieldPhotoState());
    setUnplacedFieldPhotos([]);
    setVisitTypeId("standard-hood");
    setRiskFlagIds(["no-risk"]);
    setScopeOverrides({});
    setScopeAssumptionsAccepted(false);
    setShowScopeDetails(true);
    setPhotoAssistSuggestions([]);
    setPhotoAssistNotice(null);
    setPhotoSlotResolutions(emptyPhotoSlotResolutions());
    setPacketPresentationMode("short");
    setPacketSections(shortPacketSections);
    setCloseoutLinks({});
    selectBuilderStep("photos");
    setShowPacketDetails(false);
    setShowJobBasics(false);
    setShowAllPhotoSlots(false);
    setShowProofDetails(false);
    setShowTimingEditor(false);
    setPhotoImportNotice(null);
    setMobileSheet(null);
    setShowWordingEditor(false);
    setActiveCustomerLineEditor("result");
    setActiveCustomerLineEditorSurface(null);
    setActivePreviewEditTarget(null);
    toast("Report reset", {
      description: "The service summary is back to the default visit.",
    });
  }

  function focusScopeReviewPanel() {
    window.setTimeout(() => {
      document
        .querySelector("[data-axis-scope-review-panel]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  function focusJobBasicsPanel() {
    window.setTimeout(() => {
      document
        .querySelector("[data-axis-job-basics-panel]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  function showJobBasicsBlocker() {
    setShowJobBasics(true);
    toast.error("Add customer and service details first.", {
      description: `Needed before output: ${jobBasicsMissingLabel}.`,
    });
    focusJobBasicsPanel();
  }

  function handleJobPrimaryAction() {
    if (!hasJobOutcomeSelected) {
      toast.error("Pick today's result first.");
      return;
    }

    if (previewBlockedBy === "basics") {
      showJobBasicsBlocker();
      return;
    }

    if (previewBlockedBy === "notes") {
      setScopeAssumptionsAccepted(true);
      toast("Written record confirmed", {
        description: "Notes-only areas will be treated as a written service record, without claiming missing photos.",
      });
      return;
    }

    if (previewBlockedBy === "review") {
      setShowScopeDetails(true);
      focusScopeReviewPanel();
      return;
    }

    selectBuilderStep("outputs");
  }

  function selectBuilderStep(step: BuilderStep) {
    toast.dismiss();
    let shouldFocusScopePanel = false;

    if ((step === "outputs") && !hasJobOutcomeSelected) {
      toast.error("Pick today's result first.", {
        description: "The tool will not create customer-facing outputs from untouched defaults.",
      });
      step = "review";
    }

    if ((step === "outputs") && hasJobOutcomeSelected && !jobBasicsReady) {
      setShowJobBasics(true);
      shouldFocusScopePanel = false;
      toast.error("Add customer and service details first.", {
        description: `Needed before output: ${jobBasicsMissingLabel}.`,
      });
      step = "review";
    }

    if (
      (step === "outputs") &&
      hasJobOutcomeSelected &&
      jobBasicsReady &&
      sendReadinessBlockers.length > 0
    ) {
      setShowScopeDetails(true);
      shouldFocusScopePanel = true;
      toast.error("Confirm the area status before sending.", {
          description:
            sendReadinessBlockers[0] ??
            "The report needs one area status confirmation before outputs are ready.",
      });
      step = "review";
    }

    setBuilderStep(step);
    setMobileSheet(null);

    const url = new URL(window.location.href);
    url.searchParams.set("step", step);
    window.history.replaceState({}, "", url);

    window.requestAnimationFrame(() => {
      scrollPacketWorkspaceBelowHeader();
      window.setTimeout(() => scrollPacketWorkspaceBelowHeader("auto"), 90);
      if (shouldFocusScopePanel) {
        focusScopeReviewPanel();
      } else if (step === "review" && hasJobOutcomeSelected && !jobBasicsReady) {
        focusJobBasicsPanel();
      }
    });
  }

  function selectProductPlan(nextPlan: Axis1ProductPlan) {
    if (nextPlan === "company" && !hasCompanyAccess) {
      setPaidFeatureNotice("company-plan");
      setSetupNoticeAction(null);
      return;
    }

    setSelectedProductPlan(nextPlan);
    setSetupNoticeAction(null);

    const url = new URL(window.location.href);
    url.searchParams.set("account", getAxis1PlanSearchValue(nextPlan));
    window.history.replaceState({}, "", url);

    const nextPolicy = getAxis1ProductPlanPolicy(nextPlan);
    toast.success(`${nextPolicy.label} preview selected`, {
      description: nextPolicy.isPaid
        ? "Company logo/contact, clean PDF, live service report links, and history are available in the company version."
        : "This shows the public no-login builder limits.",
    });
  }

  function requestPaidFeature(feature: PaidFeatureNotice) {
    setPaidFeatureNotice(feature);
    setSetupNoticeAction(null);
  }

  function handleMobilePrimaryAction() {
    if (builderStep === "photos") {
      proceedFromPhotoStep();
      return;
    }

    if (builderStep === "review") {
      handleJobPrimaryAction();
      return;
    }

    if (builderStep === "outputs") {
      if (reportOutputMode === "link") {
        requestFreeReportOutput("copy-link");
        return;
      }

      requestFreeReportOutput("print-pdf");
      return;
    }

    if (reportOutputMode === "link") {
      requestFreeReportOutput("copy-link");
      return;
    }

    requestFreeReportOutput("print-pdf");
  }

  function requestFreeReportOutput(action: SetupNoticeAction) {
    if (!hasJobOutcomeSelected) {
      toast.error("Pick today's result first.", {
        description: "The tool will not create outputs from untouched defaults.",
      });
      selectBuilderStep("review");
      return;
    }

    if (!jobBasicsReady) {
      selectBuilderStep("review");
      showJobBasicsBlocker();
      return;
    }

    if (sendReadinessBlockers.length > 0) {
      toast.error("Review needed before output.", {
        description: sendReadinessBlockers[0],
      });
      selectBuilderStep("outputs");
      return;
    }

    setMobileSheet(null);
    toast.dismiss();
    setSetupNoticeAction(action);
  }

  async function confirmFreeReportOutput() {
    const action = setupNoticeAction;
    setSetupNoticeAction(null);

    if (action === "copy-link") {
      await copyReportLink();
      return;
    }

    if (action === "open-link") {
      const savedReport = await saveCurrentReportLink();

      if (savedReport) {
        setLastSavedReportLink(savedReport);
        openSavedReportLink(savedReport);
      }

      return;
    }

    if (action === "print-pdf") {
      const savedReport = await saveCurrentReportLink({ quiet: true });

      if (savedReport) {
        setLastSavedReportLink(savedReport);
      }

      window.setTimeout(printCustomerReport, 160);
    }
  }

  function buildReportSaveInput(): Axis1LocalPacketSaveInput {
    return {
      productPlan,
      companyProfile: isCompanyPlan ? companyProfile : undefined,
      values,
      uploadedFieldPhotos,
      photoSlotResolutions,
      links: engineCloseoutLinks,
      presentationMode: packetPresentationMode,
      visibleSections: packetSections,
      packetData: previewPacket,
    };
  }

  async function saveCurrentReportLink(options?: { quiet?: boolean }) {
    const input = buildReportSaveInput();

    try {
      const hostedResult = await saveAxis1ServerReport(input);
      return {
        url: new URL(hostedResult.href, window.location.origin).toString(),
        storage: "server",
        productPlan: hostedResult.productPlan,
      } satisfies SavedReportLink;
    } catch {
      // Keep the builder usable in static dev mode or if hosted storage rejects an oversized payload.
    }

    const result = saveAxis1LocalPacket(input);

    if (!result.ok) {
      if (!options?.quiet) {
      toast.error("Could not save browser report link", {
          description: result.error,
        });
      }
      return null;
    }

    return {
      url: new URL(result.href, window.location.origin).toString(),
      storage: "local",
      productPlan,
    } satisfies SavedReportLink;
  }

  async function copyReportLink() {
    const savedReport = await saveCurrentReportLink();

    if (!savedReport) {
      return;
    }

    setLastSavedReportLink(savedReport);

    try {
      await navigator.clipboard.writeText(savedReport.url);
      const isHosted = savedReport.storage === "server";
      toast.success(
        isHosted ? "Hosted service report link copied" : "Browser fallback link copied",
        {
          description: isHosted
            ? savedReport.productPlan === "company"
              ? "This branded report is saved to the account history."
              : "This free test link is saved on the server and expires after 7 days."
            : "The Spring storage API was not reachable, so this link only works in this browser.",
        },
      );
    } catch {
      toast.error("Could not copy automatically", {
        description: "The generated service report link is visible below. Open it or copy the URL from the field.",
      });
    }
  }

  async function copySavedReportUrl(savedReport: SavedReportLink | null) {
    if (!savedReport) {
      return;
    }

    try {
      await navigator.clipboard.writeText(savedReport.url);
      toast.success("Report link copied", {
        description:
          savedReport.storage === "server"
            ? "The hosted service report URL is ready to send."
            : "The browser fallback URL is ready to test in this browser.",
      });
    } catch {
      toast.error("Could not copy automatically", {
        description: "Select the visible URL field, or open the report and copy the browser address.",
      });
    }
  }

  function openSavedReportLink(savedReport: SavedReportLink) {
    const opened = window.open(savedReport.url, "_blank", "noopener,noreferrer");

    if (!opened) {
      window.location.assign(savedReport.url);
    }
  }

  function openMobileSheet(sheet: MobileSheetView) {
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    toast.dismiss();
    window.requestAnimationFrame(() => setMobileSheet(sheet));
  }

  function printCustomerReport() {
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    document.documentElement.classList.add("app-printing");
    setReportOutputMode("pdf");
    setMobileSheet(null);
    toast.dismiss();

    const clearPrintUiLock = () => {
      document.documentElement.classList.remove("app-printing");
    };

    window.addEventListener("afterprint", clearPrintUiLock, { once: true });
    window.setTimeout(() => {
      window.print();
      window.setTimeout(clearPrintUiLock, 900);
    }, 420);
  }

  useEffect(() => {
    const handleEvidencePdfRequest = (event: Event) => {
      event.preventDefault();
      toast.dismiss();
      setBuilderStep("outputs");
      setReportOutputMode("pdf");
      setMobileSheet(null);

      window.setTimeout(() => {
        document.documentElement.classList.add("app-printing");

        const clearPrintUiLock = () => {
          document.documentElement.classList.remove("app-printing");
        };

        window.addEventListener("afterprint", clearPrintUiLock, { once: true });
        window.print();
        window.setTimeout(clearPrintUiLock, 900);
      }, 160);
    };

    window.addEventListener("axis1:save-evidence-pdf", handleEvidencePdfRequest);

    return () => {
      window.removeEventListener("axis1:save-evidence-pdf", handleEvidencePdfRequest);
    };
  }, []);

  function handleMobileSecondaryAction() {
    if (builderStep === "photos") {
      if (hasProofWorkStarted) {
        openMobileSheet("photo-review");
        return;
      }

      selectBuilderStep("review");
      return;
    }

    if (builderStep === "review") {
      selectBuilderStep("photos");
      return;
    }

    if (reportNeedsPhotoReview) {
      openMobileSheet("photo-review");
      return;
    }

    setReportOutputMode("pdf");
    openMobileSheet("report-actions");
  }

  function applyPacketPresentationMode(mode: PacketPresentationMode) {
    setPacketPresentationMode(mode);
    setPacketSections(
      mode === "short" ? shortPacketSections : standardPacketSections,
    );
  }

  function togglePacketSection(
    sectionKey: keyof Axis1PacketDocumentSectionVisibility,
    checked: boolean,
  ) {
    setPacketSections((current) => ({
      ...current,
      [sectionKey]: checked,
    }));
  }

  function useSimpleWording() {
    if (values.scenario === "clean") {
      form.setValue(
        "summaryOverride",
        "Service was completed today. No customer follow-up was recorded.",
        { shouldDirty: true, shouldValidate: true },
      );
      form.setValue(
        "customerActionOverride",
        "Please confirm the next service window or request a different date.",
        { shouldDirty: true, shouldValidate: true },
      );
      form.setValue(
        "followUpOverride",
        "No open condition was recorded at close-out.",
        { shouldDirty: true, shouldValidate: true },
      );
      toast.success("Short wording applied", {
        description: "The service report link now uses the compact copy.",
      });
      return;
    }

    form.setValue(
      "summaryOverride",
      "Reachable areas were cleaned today. One item still needs access or review.",
      { shouldDirty: true, shouldValidate: true },
    );
    form.setValue(
      "customerActionOverride",
      "Please clear the listed item and reply so the revisit can be scheduled.",
      { shouldDirty: true, shouldValidate: true },
    );
    form.setValue(
      "followUpOverride",
        "The follow-up note stays on the service report link.",
      { shouldDirty: true, shouldValidate: true },
    );
    toast.success("Short wording applied", {
      description: "The service report link now uses the compact copy.",
    });
  }

  function restoreAutoWording() {
    form.setValue("summaryOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("customerActionOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("followUpOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("recordNoteOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast("Recommended copy restored", {
      description: "The service report link is back to the recommended wording.",
    });
  }

  function setPhotoSlotResolution(
    slotId: FieldPhotoSlotId,
    resolution: PhotoSlotResolution,
  ) {
    setPhotoSlotResolutions((current) => ({
      ...current,
      [slotId]: resolution,
    }));
  }

  async function collectPhotoAssistInputs(
    options: { onlyUnconfirmed?: boolean } = {},
  ): Promise<Axis1PhotoAssistInputPhoto[]> {
    const slottedPhotos = await Promise.all(
      fieldPhotoSlots.flatMap((slot) => {
        const photo = uploadedFieldPhotos[slot.id];

        if (options.onlyUnconfirmed && isVendorConfirmedPhoto(photo)) {
          return [];
        }

        return photo
          ? [
              (async () => ({
                photoId: photo.localId ?? `slot:${slot.id}`,
                fileName: photo.name,
                dataUrl: await preparePhotoForAiAssist(photo.src),
                currentSlotId: slot.id,
              }))(),
            ]
          : [];
      }),
    );
    const unplacedPhotos = await Promise.all(
      unplacedFieldPhotos.flatMap((photo) =>
        options.onlyUnconfirmed && isVendorConfirmedPhoto(photo)
          ? []
          : [
              (async () => ({
                photoId: photo.id,
                fileName: photo.name,
                dataUrl: await preparePhotoForAiAssist(photo.src),
                currentSlotId: null,
              }))(),
            ],
      ),
    );

    return [...slottedPhotos, ...unplacedPhotos];
  }

  function mergePhotoAssistSuggestions(
    suggestions: readonly Axis1PhotoAssistSuggestion[],
  ) {
    const suggestionsByPhotoId = new Map(
      suggestions.map((suggestion) => [suggestion.photoId, suggestion]),
    );
    const currentUploadedFieldPhotos = uploadedFieldPhotosRef.current;
    const currentUnplacedFieldPhotos = unplacedFieldPhotosRef.current;
    const slottedPhotoSuggestions = fieldPhotoSlots.flatMap((slot) => {
      const photo = currentUploadedFieldPhotos[slot.id];
      const photoId = photo?.localId ?? `slot:${slot.id}`;
      const suggestion = suggestionsByPhotoId.get(photoId);

      return photo && suggestion
        ? [
            {
              slotId: slot.id,
              photo,
              photoId,
              suggestion,
            },
          ]
        : [];
    });
    const photosToReview = slottedPhotoSuggestions.filter(({ suggestion }) =>
      shouldKeepAxis1PhotoAssistSuggestionInReview(suggestion),
    );
    const moveCandidates = slottedPhotoSuggestions
      .filter(
        ({ slotId, suggestion }) =>
          !shouldKeepAxis1PhotoAssistSuggestionInReview(suggestion) &&
          Boolean(suggestion.suggestedSlotId) &&
          suggestion.suggestedSlotId !== slotId,
      )
      .sort((a, b) => b.suggestion.confidence - a.suggestion.confidence);
    const photoMoves: Array<
      (typeof slottedPhotoSuggestions)[number] & { toSlotId: FieldPhotoSlotId }
    > = [];
    const assignedMoveTargets = new Set<FieldPhotoSlotId>();

    moveCandidates.forEach((item) => {
      const toSlotId = item.suggestion.suggestedSlotId;

      if (!toSlotId) {
        return;
      }

      const targetPhoto = currentUploadedFieldPhotos[toSlotId];
      const targetPhotoId = targetPhoto?.localId ?? `slot:${toSlotId}`;
      const targetSuggestion = targetPhoto
        ? suggestionsByPhotoId.get(targetPhotoId)
        : undefined;
      const targetWillBeCleared =
        !targetPhoto ||
        item.photoId === targetPhotoId ||
        Boolean(targetSuggestion && targetSuggestion.suggestedSlotId !== toSlotId);

      if (!assignedMoveTargets.has(toSlotId) && targetWillBeCleared) {
        assignedMoveTargets.add(toSlotId);
        photoMoves.push({ ...item, toSlotId });
        return;
      }

      photosToReview.push(item);
    });
    const photoIdsToReview = new Set(
      photosToReview.map((item) => item.photoId),
    );
    const photoIdsMovedToSlot = new Set(
      photoMoves.map((item) => item.photoId),
    );
    const autoPlaceTargets = new Set<FieldPhotoSlotId>(
      photoMoves.map((item) => item.toSlotId),
    );
    const unplacedAutoPlacements: Array<{
      photo: UnplacedFieldPhoto;
      suggestion: Axis1PhotoAssistSuggestion;
      toSlotId: FieldPhotoSlotId;
    }> = [];

    currentUnplacedFieldPhotos.forEach((photo) => {
      const suggestion = suggestionsByPhotoId.get(photo.id);
      const toSlotId = suggestion?.suggestedSlotId;

      if (
        !suggestion ||
        !toSlotId ||
        shouldKeepAxis1PhotoAssistSuggestionInReview(suggestion) ||
        currentUploadedFieldPhotos[toSlotId] ||
        autoPlaceTargets.has(toSlotId)
      ) {
        return;
      }

      autoPlaceTargets.add(toSlotId);
      unplacedAutoPlacements.push({
        photo,
        suggestion,
        toSlotId,
      });
    });
    const autoPlacedUnplacedPhotoIds = new Set(
      unplacedAutoPlacements.map((item) => item.photo.id),
    );

    setPhotoAssistSuggestions((current) => {
      const byPhotoId = new Map(
        current.map((suggestion) => [suggestion.photoId, suggestion]),
      );

      suggestions.forEach((suggestion) => {
        byPhotoId.set(suggestion.photoId, suggestion);
      });

      return Array.from(byPhotoId.values());
    });
    setUploadedFieldPhotos((current) => {
      const next = { ...current };

      fieldPhotoSlots.forEach((slot) => {
        const photo = current[slot.id];
        const suggestion = suggestionsByPhotoId.get(
          photo?.localId ?? `slot:${slot.id}`,
        );

        if (photo && suggestion) {
          const photoId = photo.localId ?? `slot:${slot.id}`;

          if (photoIdsToReview.has(photoId) || photoIdsMovedToSlot.has(photoId)) {
            next[slot.id] = null;
            return;
          }

          next[slot.id] = {
            ...photo,
            matchLabel:
              suggestion.source === "gemini"
                ? suggestion.needsVendorReview
                  ? "Possible role - saved as extra photo"
                  : "AI attached photo"
                : photo.matchLabel,
            ...createPhotoAssistMetadata(suggestion),
          };
        }
      });
      photoMoves.forEach(({ photo, suggestion, toSlotId }) => {
        next[toSlotId] = {
          ...photo,
          matchLabel:
            suggestion.source === "gemini"
              ? suggestion.needsVendorReview
                ? "Possible role - saved as extra photo"
                : "AI attached photo"
              : photo.matchLabel,
          ...createPhotoAssistMetadata(suggestion),
        };
      });
      unplacedAutoPlacements.forEach(({ photo, suggestion, toSlotId }) => {
        next[toSlotId] = {
          localId: photo.id,
          src: photo.src,
          name: photo.name,
          source: photo.source,
          confidence: photo.confidence,
          matchLabel:
            suggestion.source === "gemini"
              ? suggestion.needsVendorReview
                ? "Possible role - saved as extra photo"
                : "AI attached photo"
              : photo.matchLabel,
          ...createPhotoAssistMetadata(suggestion),
        };
      });

      return next;
    });
    setUnplacedFieldPhotos((current) => {
      const updated = current.flatMap((photo) => {
        if (autoPlacedUnplacedPhotoIds.has(photo.id)) {
          return [];
        }

        const suggestion = suggestionsByPhotoId.get(photo.id);

        if (!suggestion) {
          return [photo];
        }

        return [
          {
            ...photo,
            suggestedSlotId: suggestion.suggestedSlotId,
            matchLabel:
              suggestion.source === "gemini"
                ? suggestion.suggestedSlotId
                  ? "Possible role - saved as extra photo"
                  : "No safe report role found"
              : photo.matchLabel,
            ...createPhotoAssistMetadata(suggestion),
          },
        ];
      });
      const existingIds = new Set(updated.map((photo) => photo.id));
      const additions = photosToReview.flatMap(
        ({ photo, photoId, suggestion }) => {
          const id = photo.localId ?? photoId;

          return existingIds.has(id)
            ? []
            : [
                {
                  ...photo,
                  id,
                  reason: "overflow" as const,
                  suggestedSlotId: suggestion.suggestedSlotId,
                  matchLabel: suggestion.suggestedSlotId
                    ? "Possible role - saved as extra photo"
                    : "No safe report role found",
                  assistSuggestedSlotId: suggestion.suggestedSlotId,
                  assistReason: suggestion.reason,
                  confidence: photo.confidence,
                  ...createPhotoAssistMetadata(suggestion),
                },
              ];
        },
      );

      return [...updated, ...additions];
    });
    if (photosToReview.length > 0) {
      const movedCount = photosToReview.length;
      toast("Photo(s) saved as extras", {
        description: `${movedCount} photo(s) remain visible; customer outputs will not mention them unless you attach them.`,
      });
    }
  }

  async function requestPhotoAssistForPhotos(
    photos: readonly Axis1PhotoAssistInputPhoto[],
    origin: "auto-upload" | "manual",
  ) {
    if (photos.length === 0) {
      setPhotoAssistNotice({
        tone: "warning",
        message: "Add photos before using Photo Assist.",
      });
      return;
    }

    setIsPhotoAssistRunning(true);
    setPhotoAssistNotice({
      tone: "idle",
      message:
        origin === "auto-upload"
          ? "Checking photo content. Phone filenames are normal; suggestions still need review."
          : "Checking job photos with Photo Assist.",
      meta: "Live Gemini is used when available; any fallback is labeled as local hints.",
    });

    try {
      const response = await fetchApi("/api/axis1/photo-assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photos }),
      });

      if (!response.ok) {
        throw new Error(`Photo Assist failed with HTTP ${response.status}`);
      }

      const data = (await response.json()) as Axis1PhotoAssistResponse;

      mergePhotoAssistSuggestions(data.suggestions);
      setPhotoAssistNotice({
        tone: data.provider === "gemini" ? "success" : "warning",
        message:
          data.warning ??
          (data.provider === "gemini"
            ? "Photo Assist read the photos. Clear matches are attached; uncertain photos stay saved as extras for your review."
            : "Local photo hints are ready. Unclear photos stay saved as extras."),
        meta:
          data.provider === "gemini"
            ? `Live Gemini (${data.model}) - vendor must confirm each photo role.`
            : `Local hints (${data.model}) - vendor must confirm each photo role.`,
      });
      setShowProofDetails(false);
      setShowAllPhotoSlots(false);
    } catch {
      const suggestions = buildMockAxis1PhotoAssistSuggestions(photos);

      mergePhotoAssistSuggestions(suggestions);
      setPhotoAssistNotice({
        tone: "warning",
        message:
          "Photo Assist API was unavailable, so local photo hints were used. Continue as a written report; attach photos only if they help.",
        meta: "Local hints only - Photo Assist API did not return live suggestions.",
      });
      setShowProofDetails(false);
      setShowAllPhotoSlots(false);
    } finally {
      setIsPhotoAssistRunning(false);
    }
  }

  async function runPhotoAssist() {
    const photos = await collectPhotoAssistInputs({ onlyUnconfirmed: true });

    if (photos.length === 0) {
      setPhotoAssistNotice({
        tone: "success",
        message:
          "All usable photos are already attached. Add or replace a photo to run Photo Assist again.",
      });
      return;
    }

    await requestPhotoAssistForPhotos(photos, "manual");
  }

  async function handlePhotoUpload(
    slotId: FieldPhotoSlotId,
    file: File | undefined,
    source: UploadedFieldPhoto["source"],
  ) {
    const slot = fieldPhotoSlots.find((item) => item.id === slotId);

    if (!file) {
      setUploadedFieldPhotos((current) => ({
        ...current,
        [slotId]: null,
      }));
      setPhotoSlotResolution(slotId, "open");
      toast("Photo cleared", {
        description: slot ? `${slot.shortLabel} is open again.` : "Photo slot is open again.",
      });
      return;
    }

    const result = await preparePhotoForPreview(file);
    const isMobile = isMobileViewport();

    if (!result.ok) {
      setPhotoImportNotice({
        tone: "error",
        message: result.reason,
      });
      if (!isMobile) {
        toast.error("Photo not attached", {
          description: result.reason,
        });
      }
      return;
    }

    setUploadedFieldPhotos((current) => ({
      ...current,
      [slotId]: {
        localId: createLocalPhotoId(),
        src: result.src,
        name: file.name,
        source,
        confidence: "manual",
        matchLabel: "Manually placed",
        vendorDecision: "confirmed",
      },
    }));
    setPhotoSlotResolution(slotId, "open");
      setPhotoImportNotice(
      result.wasNormalized
        ? {
            tone: "success",
            message: "Photo compressed to save storage and AI cost.",
          }
        : null,
    );
    setShowProofDetails(!isMobile);
    if (isMobile) {
      setShowAllPhotoSlots(false);
      toast.dismiss();
      return;
    }
    toast.success("Photo attached", {
      description: slot
      ? `${slot.shortLabel} is ready for the service report link and PDF.`
      : "Photo is ready for the service report link and PDF.",
    });
  }

  async function handleBulkPhotoUpload(fileList: FileList | null) {
    const selectedFiles = Array.from(fileList ?? []);
    const eligibleImageFiles = selectedFiles.filter(isLikelyImageFile);
    const skippedNonImageCount = selectedFiles.length - eligibleImageFiles.length;
    const imageFiles = eligibleImageFiles.slice(0, maxBulkPhotoImportCount);
    const truncatedCount = Math.max(
      0,
      eligibleImageFiles.length - maxBulkPhotoImportCount,
    );

    if (imageFiles.length === 0) {
      if (selectedFiles.length > 0) {
        setPhotoImportNotice({
          tone: "error",
          message: "No readable image files were selected.",
        });
      }
      return;
    }

    setScopeAssumptionsAccepted(false);
    setShowScopeDetails(false);

    const usedSlotIds = new Set<FieldPhotoSlotId>(
      fieldPhotoSlots
        .filter((slot) => uploadedFieldPhotos[slot.id])
        .map((slot) => slot.id),
    );
    const slotAssignments: Array<{
      file: File;
      suggestion: NonNullable<ReturnType<typeof suggestPhotoSlot>>;
    }> = [];
    const extraAssignments: Array<{
      file: File;
      confidence: FieldPhotoConfidence;
      matchLabel: string;
      reason: UnplacedFieldPhoto["reason"];
      suggestedSlotId: FieldPhotoSlotId | null;
    }> = [];

    imageFiles.forEach((file) => {
      const keywordSlot = findKeywordPhotoSlot(file.name);

      if (keywordSlot && usedSlotIds.has(keywordSlot.id)) {
        extraAssignments.push({
          file,
          confidence: "keyword",
          matchLabel: `Also matched ${keywordSlot.shortLabel}`,
          reason: "duplicate",
          suggestedSlotId: keywordSlot.id,
        });
        return;
      }

      const suggestion = suggestPhotoSlot(file.name, usedSlotIds);

      if (!suggestion) {
        extraAssignments.push({
          file,
          confidence: keywordSlot ? "keyword" : "order",
          matchLabel: keywordSlot
            ? `Also matched ${keywordSlot.shortLabel}`
            : "Waiting for AI read",
          reason: keywordSlot ? "duplicate" : "overflow",
          suggestedSlotId: keywordSlot?.id ?? null,
        });
        return;
      }

      usedSlotIds.add(suggestion.slotId);
      slotAssignments.push({ file, suggestion });
    });

    const loaded = await Promise.all(
      slotAssignments.map(async ({ file, suggestion }) => {
        const prepared = await preparePhotoForPreview(file);

        return {
          id: createLocalPhotoId(),
          slotId: suggestion.slotId,
          src: prepared.ok ? prepared.src : null,
          name: file.name,
          confidence: suggestion.confidence,
          matchLabel: suggestion.matchLabel,
          wasNormalized: prepared.ok ? prepared.wasNormalized : false,
          error: prepared.ok ? null : prepared.reason,
        };
      }),
    );
    const loadedExtras = await Promise.all(
      extraAssignments.map(async (assignment) => {
        const prepared = await preparePhotoForPreview(assignment.file);

        return {
          id: createLocalPhotoId(),
          src: prepared.ok ? prepared.src : null,
          name: assignment.file.name,
          source: "bulk" as const,
          confidence: assignment.confidence,
          matchLabel: assignment.matchLabel,
          reason: assignment.reason,
          suggestedSlotId: assignment.suggestedSlotId,
          wasNormalized: prepared.ok ? prepared.wasNormalized : false,
          error: prepared.ok ? null : prepared.reason,
        };
      }),
    );
    const photoAssistInputs = await Promise.all(
      [
        ...loaded.flatMap((item) =>
          item.src
            ? [
                {
                  photoId: item.id,
                  fileName: item.name,
                  dataUrl: item.src,
                  currentSlotId: item.slotId,
                },
              ]
            : [],
        ),
        ...loadedExtras.flatMap((item) =>
          item.src
            ? [
                {
                  photoId: item.id,
                  fileName: item.name,
                  dataUrl: item.src,
                  currentSlotId: null,
                },
              ]
            : [],
        ),
      ].map(async (photo): Promise<Axis1PhotoAssistInputPhoto> => ({
        ...photo,
        dataUrl: await preparePhotoForAiAssist(photo.dataUrl),
      })),
    );
    const loadedExtraPhotos: UnplacedFieldPhoto[] = loadedExtras.flatMap((item) =>
      item.src
        ? [
            {
              ...item,
              src: item.src,
              vendorDecision: "pending",
              needsVendorReview: true,
              assistReason:
                "AI is reading this photo content. Phone filenames are normal; confirm the role after the read finishes.",
            },
          ]
        : [],
    );

    setUploadedFieldPhotos((current) => {
      const next = { ...current };

      loaded.forEach((item) => {
        if (item.src) {
          next[item.slotId] = {
            localId: item.id,
            src: item.src,
            name: item.name,
            source: "bulk",
            confidence: item.confidence,
            matchLabel: item.matchLabel,
            vendorDecision: "pending",
            needsVendorReview: true,
            assistReason:
              "Axis saved this as an extra photo. Attach it only if it supports this report.",
          };
        }
      });

      return next;
    });
    setUnplacedFieldPhotos((current) => [
      ...current,
      ...loadedExtraPhotos,
    ]);
    setPhotoSlotResolutions((current) => {
      const next = { ...current };

      loaded.forEach((item) => {
        if (item.src) {
          next[item.slotId] = "open";
        }
      });

      return next;
    });
    setShowProofDetails(false);
    setShowAllPhotoSlots(false);
    const loadedPhotoCount = loaded.filter((item) => item.src).length;
    const failedPhotoCount =
      loaded.filter((item) => item.error).length +
      loadedExtras.filter((item) => item.error).length +
      skippedNonImageCount +
      truncatedCount;
    const normalizedPhotoCount =
      loaded.filter((item) => item.src && item.wasNormalized).length +
      loadedExtras.filter((item) => item.src && item.wasNormalized).length;
    const noticeMessage =
      failedPhotoCount > 0
        ? `${failedPhotoCount} file(s) were skipped. Use JPEG or PNG if a field photo is missing.`
        : normalizedPhotoCount > 0
          ? `${normalizedPhotoCount} photo(s) were compressed to save storage and AI cost.`
          : null;

    setPhotoImportNotice(
      noticeMessage
        ? {
            tone: failedPhotoCount > 0 ? "warning" : "success",
            message: noticeMessage,
          }
        : null,
    );

    if (isMobileViewport()) {
      toast.dismiss();
    } else if (failedPhotoCount > 0) {
      toast.warning(`${failedPhotoCount} file(s) skipped`, {
        description: "Use JPEG or PNG if a field photo is missing from the output.",
      });
    } else {
      toast.success(`${loadedPhotoCount} photo(s) added`, {
        description:
          loadedExtraPhotos.length > 0
            ? `${loadedExtraPhotos.length} extra photo(s) kept visible outside the customer report.`
            : "Job photos are ready. Unclear photos stay saved as extras.",
      });
    }

    if (photoAssistInputs.length > 0) {
      void requestPhotoAssistForPhotos(photoAssistInputs, "auto-upload");
    }
  }

  function applyJobPattern(
    pattern: JobPatternPreset,
    options: { autoDraft?: boolean } = {},
  ) {
    const existingExceptionNote = (form.getValues("exceptionNote") ?? "").trim();
    const existingFollowUpNote = (form.getValues("followUpNote") ?? "").trim();
    const noteSignal = inferQuickCloseoutNoteSignal(existingFollowUpNote);
    const signalPattern =
      pattern.id === "clean-close" && noteSignal?.areaId
        ? noteSignal.status === "could-not-access"
          ? getJobPatternById("blocked-access")
          : noteSignal.status === "condition-note"
            ? getJobPatternById("condition-review")
            : pattern
        : pattern;
    const nextExceptionNote =
      signalPattern.id === "blocked-access"
        ? existingExceptionNote || existingFollowUpNote
        : "";

    setHasJobOutcomeSelected(true);
    setAutoDraftedJobPatternId(options.autoDraft ? signalPattern.id : null);
    setScopeAssumptionsAccepted(
      visitTypeId === "condition-record" && signalPattern.id === "condition-review",
    );
    if (noteSignal?.areaId && pattern.id === "clean-close") {
      setScopeOverrides((current) => ({
        ...current,
        [noteSignal.areaId as ScopeAreaId]: noteSignal.status,
      }));
    }
    form.setValue("scenario", signalPattern.scenario, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("exceptionKinds", [...signalPattern.exceptionKinds], {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("followUpMode", signalPattern.followUpMode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("exceptionNote", nextExceptionNote, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("summaryOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("customerActionOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("followUpOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("recordNoteOverride", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setShowWordingEditor(false);
    setShowTimingEditor(false);
    setShowExceptionDetails(false);
    if (!jobBasicsReady) {
      setShowJobBasics(true);
    }
    setActiveCustomerLineEditorSurface(null);
    setActivePreviewEditTarget(null);
  }

  function updateScopeAreaStatus(areaId: ScopeAreaId, status: ScopeStatus) {
    const area = scopeAreaCatalog.find((item) => item.id === areaId);
    const nextOverrides = {
      ...scopeOverrides,
      [areaId]: status,
    };

    setScopeOverrides(nextOverrides);

    if (status === "could-not-access" || status === "not-done") {
      const existingExceptionNote = (form.getValues("exceptionNote") ?? "").trim();
      const existingFollowUpNote = (form.getValues("followUpNote") ?? "").trim();
      const nextExceptionNote =
        existingExceptionNote ||
        existingFollowUpNote ||
        `${area?.label ?? "One area"} could not be completed during this visit`;

      applyJobPattern(getJobPatternById("blocked-access"));
      form.setValue("exceptionNote", nextExceptionNote, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (status === "condition-note") {
      const existingFollowUpNote = (form.getValues("followUpNote") ?? "").trim();

      applyJobPattern(getJobPatternById("condition-review"));

      if (!existingFollowUpNote) {
        form.setValue(
          "followUpNote",
          `${area?.label ?? "One area"} should stay visible for follow-up`,
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
      } else {
        form.setValue("followUpNote", existingFollowUpNote, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    if (hasJobOutcomeSelected) {
      const nextRows = buildScopeLedger({
        uploadedFieldPhotos: buildConfirmedFieldPhotoState(uploadedFieldPhotosRef.current),
        unplacedFieldPhotos,
        overrides: nextOverrides,
        expectedAreaIds: expectedScopeAreaIds,
      });
      const nextRecommendation = buildScopeOutcomeRecommendation(
        nextRows,
        photoJobOutcomeRecommendation,
      );

      applyJobPattern(nextRecommendation.pattern, { autoDraft: true });
    }
  }

  function applyQuickCloseoutNoteSignal() {
    if (!quickCloseoutNoteSignal?.areaId) {
      setShowScopeDetails(true);
      return;
    }

    updateScopeAreaStatus(
      quickCloseoutNoteSignal.areaId,
      quickCloseoutNoteSignal.status,
    );
    setShowScopeDetails(true);
  }

  function updateVisitType(nextVisitTypeId: VisitTypeId) {
    setVisitTypeId(nextVisitTypeId);
    setScopeOverrides({});
    setScopeAssumptionsAccepted(
      nextVisitTypeId === "condition-record" &&
      hasJobOutcomeSelected &&
      activeJobPatternId === "condition-review",
    );
    setShowScopeDetails(true);
  }

  function reassignPhoto(fromSlotId: FieldPhotoSlotId, toSlotId: FieldPhotoSlotId) {
    if (fromSlotId === toSlotId) {
      return;
    }

    setUploadedFieldPhotos((current) => {
      const fromPhoto = current[fromSlotId];
      const toPhoto = current[toSlotId];
      const fromSlot = fieldPhotoSlots.find((slot) => slot.id === fromSlotId);
      const toSlot = fieldPhotoSlots.find((slot) => slot.id === toSlotId);

      if (!fromPhoto || !fromSlot || !toSlot) {
        return current;
      }

      return {
        ...current,
        [toSlotId]: {
          ...fromPhoto,
          confidence: "manual",
          matchLabel: `Moved to ${toSlot.shortLabel}`,
          vendorDecision: "edited",
          needsVendorReview: false,
        },
        [fromSlotId]: toPhoto
          ? {
              ...toPhoto,
              confidence: "manual",
              matchLabel: `Moved to ${fromSlot.shortLabel}`,
              vendorDecision: "edited",
              needsVendorReview: false,
            }
          : null,
      };
    });
    setPhotoSlotResolutions((current) => ({
      ...current,
      [fromSlotId]: "open",
      [toSlotId]: "open",
    }));
    const movedPhotoId =
      uploadedFieldPhotos[fromSlotId]?.localId ?? `slot:${fromSlotId}`;
    const displacedPhotoId =
      uploadedFieldPhotos[toSlotId]?.localId ?? `slot:${toSlotId}`;
    setPhotoAssistSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.photoId === movedPhotoId
          ? {
              ...suggestion,
              vendorDecision: "confirmed",
              confirmedSlotId: toSlotId,
            }
          : suggestion.photoId === displacedPhotoId
            ? {
                ...suggestion,
                vendorDecision: "confirmed",
                confirmedSlotId: fromSlotId,
              }
            : suggestion,
      ),
    );
    const targetSlot = fieldPhotoSlots.find((slot) => slot.id === toSlotId);
    toast.success("Photo moved", {
      description: targetSlot
        ? `Now assigned to ${targetSlot.shortLabel}.`
        : "Photo role was updated.",
    });
  }

  function confirmPhotoSuggestion(slotId: FieldPhotoSlotId) {
    const slot = fieldPhotoSlots.find((item) => item.id === slotId);

    setUploadedFieldPhotos((current) => {
      const photo = current[slotId];

      if (!photo) {
        return current;
      }

      return {
        ...current,
        [slotId]: {
          ...photo,
          confidence: "manual",
          matchLabel: "Vendor confirmed",
          vendorDecision: "confirmed",
          needsVendorReview: false,
        },
      };
    });
    setPhotoAssistSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.photoId ===
        (uploadedFieldPhotos[slotId]?.localId ?? `slot:${slotId}`)
          ? {
              ...suggestion,
              vendorDecision: "confirmed",
              confirmedSlotId: slotId,
            }
          : suggestion,
      ),
    );
    toast.success("Photo role confirmed", {
      description: slot
        ? `${slot.shortLabel} can now support the report.`
        : "Photo can now support the report.",
    });
  }

  function continueAfterPhotoDecisionIfReady() {
    if (pendingPhotoAssistCount > 1) {
      return;
    }

    selectBuilderStep("review");
  }

  function rejectPhotoSuggestion(slotId: FieldPhotoSlotId) {
    const slot = fieldPhotoSlots.find((item) => item.id === slotId);
    const photo = uploadedFieldPhotos[slotId];

    if (!photo) {
      return;
    }

    setUploadedFieldPhotos((current) => ({
      ...current,
      [slotId]: null,
    }));
    setUnplacedFieldPhotos((current) => [
      ...current,
      {
        ...photo,
        id: photo.localId ?? createLocalPhotoId(),
        reason: "overflow" as const,
        suggestedSlotId: slotId,
        confidence: "manual",
        matchLabel: "Vendor rejected suggestion",
        vendorDecision: "rejected",
        needsVendorReview: false,
      },
    ]);
    setPhotoAssistSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.photoId === (photo.localId ?? `slot:${slotId}`)
          ? {
              ...suggestion,
              vendorDecision: "rejected",
              confirmedSlotId: undefined,
            }
          : suggestion,
      ),
    );
    setPhotoSlotResolution(slotId, "open");
    toast("Photo suggestion rejected", {
      description: slot
        ? `${slot.shortLabel} is open again. The photo stays in extras.`
        : "The photo stays in extras.",
    });
  }

  function confirmAutoPlacedPhotoRoles(nextStep: BuilderStep = "outputs") {
    const occupiedSlotIds = new Set(
      fieldPhotoSlots
        .filter((slot) => uploadedFieldPhotos[slot.id])
        .map((slot) => slot.id),
    );
    const fastConfirmedPhotoIds = new Set<string>();
    const unplacedConfirmPlacements: Array<{
      photo: UnplacedFieldPhoto;
      toSlotId: FieldPhotoSlotId;
    }> = [];

    unplacedFieldPhotos.forEach((photo) => {
      const toSlotId = photo.suggestedSlotId;

      if (
        !toSlotId ||
        occupiedSlotIds.has(toSlotId) ||
        !isFastConfirmableSuggestedPhoto(photo)
      ) {
        return;
      }

      occupiedSlotIds.add(toSlotId);
      fastConfirmedPhotoIds.add(photo.id);
      unplacedConfirmPlacements.push({
        photo,
        toSlotId,
      });
    });
    const confirmedUnplacedPhotoIds = new Set(
      unplacedConfirmPlacements.map(({ photo }) => photo.id),
    );
    fieldPhotoSlots.forEach((slot) => {
      const photo = uploadedFieldPhotos[slot.id];

      if (photo && isFastConfirmableSuggestedPhoto(photo)) {
        fastConfirmedPhotoIds.add(photo.localId ?? `slot:${slot.id}`);
      }
    });
    const slotPhotoIds = new Map([
      ...fieldPhotoSlots.flatMap((slot) => {
        const photo = uploadedFieldPhotos[slot.id];

        return photo && isFastConfirmableSuggestedPhoto(photo)
          ? [[photo.localId ?? `slot:${slot.id}`, slot.id] as const]
          : [];
      }),
      ...unplacedConfirmPlacements.map(
        ({ photo, toSlotId }) => [photo.localId ?? photo.id, toSlotId] as const,
      ),
    ]);

    setUploadedFieldPhotos((current) => {
      let changed = false;
      const next = { ...current };

      fieldPhotoSlots.forEach((slot) => {
        const photo = current[slot.id];

        if (photo && isFastConfirmableSuggestedPhoto(photo)) {
          fastConfirmedPhotoIds.add(photo.localId ?? `slot:${slot.id}`);
          changed = true;
          next[slot.id] = {
            ...photo,
            confidence: "manual",
            matchLabel: "Vendor confirmed",
            vendorDecision: "confirmed",
            needsVendorReview: false,
          };
        }
      });
      unplacedConfirmPlacements.forEach(({ photo, toSlotId }) => {
        changed = true;
        next[toSlotId] = {
          localId: photo.localId ?? photo.id,
          src: photo.src,
          name: photo.name,
          source: photo.source,
          confidence: "manual",
          matchLabel: "Vendor confirmed",
          vendorDecision: "confirmed",
          needsVendorReview: false,
          assistSuggestionId: photo.assistSuggestionId,
          assistSource: photo.assistSource,
          assistConfidence: photo.assistConfidence,
          assistReason: photo.assistReason,
          assistSuggestedSlotId: photo.assistSuggestedSlotId,
        };
      });

      return changed ? next : current;
    });
    if (confirmedUnplacedPhotoIds.size > 0) {
      setUnplacedFieldPhotos((current) =>
        current.filter((photo) => !confirmedUnplacedPhotoIds.has(photo.id)),
      );
    }
    setPhotoAssistSuggestions((current) =>
      current.map((suggestion) => {
        const confirmedSlotId = slotPhotoIds.get(suggestion.photoId);

        return confirmedSlotId
          ? {
              ...suggestion,
              vendorDecision: "confirmed",
              confirmedSlotId,
            }
          : suggestion;
      }),
    );
    toast("Photos attached", {
      description:
        pendingPhotoAssistCount > fastConfirmedPhotoIds.size
          ? "Clear photo roles are now included. Uncertain photos remain saved as extras."
          : "Confirmed photo roles are now included. Job result still comes from your area status selection.",
    });
    selectBuilderStep(nextStep);
  }

  function proceedFromPhotoStep() {
    if ((hasBeforeOnly || hasAfterOnly) && !shouldShowProofDetails) {
      setShowProofDetails(true);
      return;
    }

    if (!jobBasicsReady) {
      setShowJobBasics(true);
    }

    selectBuilderStep("review");
  }

  function dismissUnplacedPhoto(photoId: string) {
    const photo = unplacedFieldPhotos.find((item) => item.id === photoId);
    const relatedPhotoIds = new Set(
      [photoId, photo?.localId].filter(Boolean) as string[],
    );

    setUnplacedFieldPhotos((current) =>
      current.filter((item) => item.id !== photoId),
    );
    setPhotoAssistSuggestions((current) =>
      current.map((suggestion) =>
        relatedPhotoIds.has(suggestion.photoId)
          ? {
              ...suggestion,
              vendorDecision: "rejected",
              confirmedSlotId: undefined,
            }
          : suggestion,
      ),
    );
    toast("Photo left out", {
      description: photo
        ? `${photo.name} will not be used in the report.`
        : "The photo will not be used in the report.",
    });
  }

  function placeUnplacedPhoto(photoId: string, toSlotId: FieldPhotoSlotId) {
    const photo = unplacedFieldPhotos.find((item) => item.id === photoId);
    const displacedPhoto = uploadedFieldPhotos[toSlotId];
    const targetSlot = fieldPhotoSlots.find((slot) => slot.id === toSlotId);

    if (!photo || !targetSlot) {
      return;
    }

    setUploadedFieldPhotos((current) => ({
      ...current,
      [toSlotId]: {
        localId: photo.localId ?? photo.id,
        src: photo.src,
        name: photo.name,
        source: photo.source,
        confidence: "manual",
        matchLabel: `Moved to ${targetSlot.shortLabel}`,
        vendorDecision: "edited",
        needsVendorReview: false,
      },
    }));
    setUnplacedFieldPhotos((current) => [
      ...current.filter((item) => item.id !== photoId),
      ...(displacedPhoto
        ? [
            {
              ...displacedPhoto,
              id: createLocalPhotoId(),
              reason: "overflow" as const,
              suggestedSlotId: toSlotId,
              matchLabel: `Replaced from ${targetSlot.shortLabel}`,
              vendorDecision: "pending" as const,
            },
          ]
        : []),
    ]);
    setPhotoSlotResolution(toSlotId, "open");
    setPhotoAssistSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.photoId === photoId
          ? {
              ...suggestion,
              vendorDecision: "confirmed",
              confirmedSlotId: toSlotId,
            }
          : suggestion,
      ),
    );
    toast.success("Extra photo placed", {
      description: `Assigned to ${targetSlot.shortLabel}.`,
    });
  }

  return (
    <section
      id="packet-builder-workspace"
      className={
        isPhotoStep
          ? "min-h-svh scroll-mt-0 bg-[#101214] px-3 py-3 pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-white sm:px-4 md:px-5 md:py-5 md:pb-8"
          : isOutputStep
            ? "workspace-shell scroll-mt-[6.5rem] pt-3 pb-[calc(15rem+env(safe-area-inset-bottom))] md:scroll-mt-0 md:pt-6 md:pb-24"
            : "workspace-shell scroll-mt-[6.5rem] pt-3 pb-[calc(12.5rem+env(safe-area-inset-bottom))] md:scroll-mt-0 md:pt-6 md:pb-20"
      }
    >
      <Axis1BuilderHeader
        activeStep={builderStep}
        getStepMetric={getBuilderStepMetric}
        onSelectStep={selectBuilderStep}
        steps={builderSteps}
      />
      <div
        className="pdf-print-hide mx-auto mb-4 grid w-full max-w-[1180px] gap-3 rounded-[24px] border border-white/10 bg-[#15181b]/92 px-3.5 py-3 text-white shadow-[0_18px_54px_rgba(0,0,0,0.24)] backdrop-blur md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-4"
        data-axis-plan-banner
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
              {isCompanyPlan || isCompanyFeatureRequested ? (
                <ShieldCheck className="h-3.5 w-3.5 text-[#ffb489]" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-[#ffb489]" />
              )}
              {isCompanyFeatureRequested ? "Company version" : productPolicy.label}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/38">
              {bannerStatusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/78">
            {isCompanyFeatureRequested
              ? isAuthenticated
                ? "You are logged in. Company output unlocks after an active subscription: saved logo/contact, clean PDF, live service report links, and history. You can still use the free builder now."
                : "Company output needs login and an active subscription. Use the free builder now, or start the company version to unlock logo/contact, clean PDF, live service report links, and history."
              : isCompanyPlan
              ? `Company mode: ${companyProfile.companyName} details are applied. Reports save to history and stay live while subscribed.`
              : "Free builder: no login, no company logo/contact, 7-day test link, watermarked PDF, and no report history."}
          </p>
          {isCompanyPlan ? (
            <p className="mt-1 text-xs font-semibold leading-5 text-white/42">
              {companyProfile.directLine} / {companyProfile.dispatchEmail}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {(["free", "company"] as const).map((plan) => {
            const planPolicy = getAxis1ProductPlanPolicy(plan);
            const active = productPlan === plan;
            const locked = plan === "company" && !hasCompanyAccess;

            return (
              <button
                key={plan}
                type="button"
                onClick={() => selectProductPlan(plan)}
                className={`inline-flex min-h-10 items-center justify-center rounded-full px-3 text-[11px] font-black uppercase tracking-[0.11em] transition ${
                  active
                    ? "bg-white text-[#111315]"
                    : locked
                      ? "border border-[#ffb489]/20 bg-[#ffb489]/10 text-[#ffd7bd] hover:bg-[#ffb489]/16"
                      : "border border-white/10 bg-white/[0.045] text-white/58 hover:bg-white/[0.09] hover:text-white"
                }`}
              >
                {locked ? `${planPolicy.shortLabel} locked` : planPolicy.shortLabel}
              </button>
            );
          })}
          <a
            href={hasCompanyAccess ? productPolicy.ctaHref : companyUpgradeHref}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#f26a21] px-3.5 text-[11px] font-black uppercase tracking-[0.11em] text-white transition hover:bg-[#dd5b17]"
          >
            {hasCompanyAccess ? productPolicy.ctaLabel : companyUpgradeLabel}
          </a>
        </div>
      </div>
      <div
        className={`grid min-w-0 gap-5 ${
          isOutputStep
            ? "mx-auto w-full max-w-[1320px]"
            : isPhotoStep
              ? "mx-auto w-full max-w-[1180px]"
              : "mx-auto w-full max-w-[980px]"
        }`}
      >
        <div
          className={`min-w-0 space-y-5 ${
            isOutputStep ? "hidden" : ""
          }`}
        >
          <Panel
            className={
              isPhotoStep
                ? "pdf-print-hide overflow-visible border-0 bg-transparent px-0 py-0 text-white shadow-none backdrop-blur-0 before:hidden xl:sticky xl:top-5"
                : "pdf-print-hide px-3 py-3 md:px-4 md:py-4"
            }
          >
            <div
              className="hidden"
            >
              <p className={`${labelClassName()} hidden md:block ${builderStep === "photos" ? "sr-only" : ""}`}>
                Hood report
              </p>
              <h2 className={`mt-2 hidden font-display text-[1.2rem] font-bold leading-[0.96] tracking-[-0.055em] text-foreground md:block md:text-[1.38rem] ${builderStep === "photos" ? "sr-only" : ""}`}>
                Build the service report.
              </h2>
              <p className={`mt-2 hidden text-xs leading-5 text-muted-foreground md:block ${builderStep === "photos" ? "sr-only" : ""}`}>
                Pick what happened, confirm area status, then use the generated
                customer report link, PDF, follow-up, revisit, and next-service outputs.
              </p>
              <div className={`mt-3 hidden gap-2 md:grid md:grid-cols-3 xl:grid-cols-1 ${builderStep === "photos" ? "sr-only" : ""}`}>
                {[
                  [
                    "Photos",
                    totalFieldPhotoCount > 0 ? `${totalFieldPhotoCount} attached` : "Optional",
                    "Drop the phone batch.",
                  ],
                  ["Result", activeJobPattern.label, "Vendor confirms outcome."],
                  [
                    "Output",
                    totalFieldPhotoCount > 0 ? `${uploadedProofCount} placed` : "Ready",
                    "Copy link or save PDF.",
                  ],
                ].map(([label, value, copy]) => (
                  <div
                    key={label}
                    className="rounded-[16px] border border-black/8 bg-white/70 px-3 py-2.5 shadow-[0_10px_26px_rgba(17,17,17,0.04)] backdrop-blur"
                  >
                    <p className={labelClassName()}>{label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{copy}</p>
                  </div>
                ))}
              </div>
              <div className={`mt-3 hidden rounded-[16px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-2.5 md:block xl:hidden ${builderStep === "photos" ? "sr-only" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={labelClassName()}>Current format</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-foreground">
                      {closeoutFormatLabel}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#f26a21]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b94d11]">
                    Rules
                  </span>
                </div>
              </div>
              <Tabs
                value={builderStep}
                onValueChange={(value) => selectBuilderStep(value as BuilderStep)}
                className={builderStep === "photos" ? "hidden" : "mt-3"}
              >
                <TabsList
                  className={
                    isPhotoStep
                      ? "fixed left-3 right-3 top-[5.35rem] z-[60] mx-auto grid max-w-[1180px] grid-cols-3 overflow-hidden rounded-[22px] border border-white/10 bg-[#202326]/96 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:left-4 sm:right-4 sm:top-[5.85rem]"
                      : "sticky top-[4.5rem] z-20 grid grid-cols-3 overflow-hidden rounded-[18px] border-black/8 bg-white/86 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_30px_rgba(17,17,17,0.08)] backdrop-blur xl:grid-cols-1 md:static md:bg-white/65"
                  }
                >
                  {builderSteps.map((step, index) => {
                    const stepMetric = getBuilderStepMetric(step.value);

                    return (
                      <TabsTrigger
                        key={step.value}
                        value={step.value}
                        className={`group min-w-0 flex-col items-start justify-center rounded-[14px] px-2 py-2 text-left data-[state=active]:bg-[#111315] data-[state=active]:text-white data-[state=active]:shadow-[0_18px_34px_rgba(17,17,17,0.18)] md:min-h-[58px] md:px-3 ${
                          isPhotoStep
                            ? "text-white/72 data-[state=active]:bg-white data-[state=active]:text-[#111315] data-[state=active]:shadow-[0_18px_44px_rgba(0,0,0,0.34)]"
                            : ""
                        }`}
                      >
                        <span className="flex w-full min-w-0 items-center justify-between gap-2">
                          <span className={`whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground group-data-[state=active]:text-[#ffb489] md:text-[10px] md:tracking-[0.14em] ${
                            isPhotoStep
                              ? "text-white/38 group-data-[state=active]:text-[#bc3d1f]"
                              : ""
                          }`}>
                            {index + 1}. {step.label}
                          </span>
                          <Badge
                            variant="outline"
                            className={`hidden border-black/10 bg-white/70 px-2 py-0.5 text-[10px] text-muted-foreground group-data-[state=active]:border-white/15 group-data-[state=active]:bg-white/8 group-data-[state=active]:text-white/72 md:inline-flex ${
                              isPhotoStep
                                ? "border-white/10 bg-white/[0.06] text-white/42 group-data-[state=active]:border-black/10 group-data-[state=active]:bg-[#111315]/5 group-data-[state=active]:text-[#111315]/58"
                                : ""
                            }`}
                          >
                            {stepMetric}
                          </Badge>
                        </span>
                        <span className="mt-1 hidden truncate text-[13px] font-bold leading-4 tracking-[-0.03em] sm:block">
                          {step.title}
                        </span>
                        <span className={`mt-0.5 hidden text-[11px] font-medium leading-4 text-muted-foreground group-data-[state=active]:text-white/56 sm:block ${
                          isPhotoStep
                            ? "text-white/36 group-data-[state=active]:text-[#111315]/52"
                            : ""
                        }`}>
                          {step.copy}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
              <motion.div
                layout
                className={`mt-3 rounded-[18px] border border-[#f26a21]/16 bg-[#fff7ef] px-3 py-2.5 md:hidden ${builderStep === "photos" ? "hidden" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#f26a21]" />
                  <span className="text-[11px] font-semibold leading-4 text-foreground">
                    {isCompanyPlan
                      ? "Local preview. Customer actions use the company phone or reply email from the report."
                      : "Free preview. This is an unbranded test link; use your normal customer communication channel."}
                  </span>
                </div>
              </motion.div>
            </div>

            <form className="mt-3 space-y-3">
              <div
                className={`rounded-[22px] border border-black/8 bg-white px-3.5 py-4 md:px-4 ${
                  builderStep === "review" ? "" : "hidden"
                }`}
              >
                <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                  <div className="min-w-0">
                    <p className={labelClassName()}>Review report</p>
                    {builderStep === "review" ? (
                      <h1
                        className="mt-2 text-xl font-bold leading-tight tracking-[-0.045em] text-foreground"
                        data-axis-tool-page-heading
                      >
                        {hasJobOutcomeSelected
                          ? "Review the service report."
                          : "Review the service summary."}
                      </h1>
                    ) : null}
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {hasJobOutcomeSelected
                        ? "Read it like the customer will. Change only wrong statuses; every output updates together."
                        : totalFieldPhotoCount === 0
                          ? "No photos is okay. Confirm the result once so Axis 1 writes a safe service record."
                          : `${jobOutcomeRecommendation.pattern.label} is drafted from ${jobOutcomeRecommendation.signalLabel.toLowerCase()}. Confirm it or change only the wrong part.`}
                    </p>
                  </div>
                  {!scopeNeedsWrittenRecordConfirmation ? (
                    <div className="flex items-center gap-2 md:shrink-0">
                      <Sparkles className="hidden h-4 w-4 text-accent sm:block" />
                      <button
                        type="button"
                        disabled={!hasJobOutcomeSelected}
                        onClick={handleJobPrimaryAction}
                        className={`tool-action-btn tool-action-mini inline-flex w-full justify-center md:w-auto ${
                          canPreviewProofLink
                            ? "tool-action-dark"
                            : "bg-[#f26a21] text-white hover:bg-[#dc5f1d]"
                        } ${!hasJobOutcomeSelected ? "cursor-not-allowed opacity-55" : ""
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      {hasJobOutcomeSelected ? "Open Outputs" : "Confirm result first"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className={`mt-4 rounded-[20px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-4 py-4 ${
                  hasJobOutcomeSelected ? "hidden" : ""
                }`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={labelClassName()}>Visit coverage</p>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        {activeVisitType.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Expected in this report: {activeVisitTypeScopeText}.
                        Pick narrower coverage or change an area before sending.
                      </p>
                    </div>
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {riskSummaryLabel}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {visitTypePresets.map((preset) => {
                      const selected = preset.id === visitTypeId;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => updateVisitType(preset.id)}
                          className={`min-w-0 rounded-[16px] border px-3 py-2.5 text-left transition ${
                            selected
                              ? "border-[#f26a21]/35 bg-[#fff7ef]"
                              : "border-black/8 bg-white hover:border-black/14"
                          }`}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            {preset.label}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-foreground">
                            {preset.title}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                            {preset.copy}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`mt-4 rounded-[20px] border border-black/8 bg-[#111315] text-white ${
                  hasJobOutcomeSelected ? "px-3 py-3" : "px-4 py-4"
                }`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ffb489]">
                        Confirm result
                      </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                        {hasJobOutcomeSelected
                          ? "Result is set. Change only if the visit outcome is wrong."
                          : "One tap sets the record basis. The report preview below is what the vendor should actually review."}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                      {customerChoiceStatus}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {customerShouldKnowOptions.map((option) => {
                      const pattern = option.pattern;
                      const selected =
                        hasJobOutcomeSelected && activeJobPatternId === pattern.id;
                      const recommended =
                        jobOutcomeRecommendation.pattern.id === pattern.id;

                      return (
                        <motion.button
                          key={option.label}
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.985 }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 30,
                          }}
                          onClick={() => applyJobPattern(pattern)}
                          className={`rounded-[18px] border px-4 py-3 text-left transition ${
                            hasJobOutcomeSelected ? "md:min-h-[78px]" : "md:min-h-[118px]"
                          } ${
                            selected
                              ? "border-[#ffb489]/45 bg-white text-[#111315]"
                              : "border-white/12 bg-white/[0.055] text-white hover:bg-white/[0.09]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p
                                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                                  selected ? "text-[#bc3d1f]" : "text-[#ffb489]"
                                }`}
                              >
                                {option.label}
                              </p>
                              <p className="mt-1 text-sm font-bold tracking-[-0.02em]">
                                {pattern.title}
                              </p>
                              <p
                                className={`mt-2 ${hasJobOutcomeSelected ? "hidden" : "hidden md:block"} text-xs leading-5 ${
                                  selected ? "text-[#5f574f]" : "text-white/55"
                                }`}
                              >
                                {option.helper}
                              </p>
                            </div>
                            {selected ? (
                              <span className="rounded-full bg-[#f26a21] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                                {selectedRecommendedOutcome ? "Applied" : "Selected"}
                              </span>
                            ) : recommended ? (
                              <span className="rounded-full border border-[#ffb489]/30 bg-[#ffb489]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ffcfb5]">
                                Recommended
                              </span>
                            ) : null}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-white/48">
                    {isAutoDraftedOutcome || !hasJobOutcomeSelected
                      ? "Why this result"
                      : "Current result"}
                    : {customerChoiceReason}
                  </p>
                  {hasJobOutcomeSelected && values.scenario === "exception" ? (
                    <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.07] px-3 py-3">
                      <label
                        className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45"
                        htmlFor="customerKnowNote"
                      >
                        Optional note
                      </label>
                      <textarea
                        id="customerKnowNote"
                        rows={2}
                        className="mt-2 min-h-[92px] w-full rounded-[14px] border border-white/10 bg-black/18 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#ffb489]/55 focus:ring-2 focus:ring-[#ffb489]/15 sm:min-h-[72px]"
                        maxLength={
                          customerNoteField === "exceptionNote"
                            ? textFieldLimits.exceptionNote
                            : textFieldLimits.followUpNote
                        }
                        placeholder={customerNotePlaceholder}
                        {...form.register(customerNoteField)}
                      />
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <p className="text-xs leading-5 text-white/42">
                          Leave blank to keep the default record wording.
                        </p>
                        <CharacterCount
                          value={customerNoteValue}
                          max={
                            customerNoteField === "exceptionNote"
                              ? textFieldLimits.exceptionNote
                              : textFieldLimits.followUpNote
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                  {hasJobOutcomeSelected && values.scenario === "exception" ? (
                    <button
                      type="button"
                      onClick={() => setShowExceptionDetails((current) => !current)}
                      className="mt-3 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/58"
                    >
                      {showExceptionDetails ? "Hide advanced details" : "Advanced details"}
                    </button>
                  ) : null}
                </div>

                <div
                  data-axis-scope-review-panel
                  className={`mt-4 overflow-hidden rounded-[18px] border bg-white shadow-[0_18px_42px_rgba(17,19,21,0.06)] ${
                    scopeNeedsConfirmation
                      ? "border-[#f26a21]/24"
                      : "border-black/8"
                  }`}
                >
                  <div
                    className={`flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 ${
                      scopeNeedsConfirmation
                        ? "border-[#f0dfd1] bg-[#fff7ef]"
                        : "border-black/8 bg-[rgba(17,17,17,0.025)]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={labelClassName()}>Customer-style report preview</p>
                      <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-foreground">
                        {scopeCheckTitle}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {hasJobOutcomeSelected
                  ? "Edit the status chips inside this preview. Service report link, PDF, follow-up, revisit, and next-service copy all use the same record."
                          : "Confirm the result above, then review the report preview instead of filling a form."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#2c7a3f]/18 bg-[#f1f8ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1f6330]">
                        {scopePhotoEvidenceCount === 1
                          ? "1 photo area"
                          : `${scopePhotoEvidenceCount} photo areas`}
                      </span>
                      <span className="rounded-full border border-[#f26a21]/18 bg-[#fff7ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a94410]">
                        {writtenOnlyScopeRows.length === 1
                          ? "1 notes-only area"
                          : `${writtenOnlyScopeRows.length} notes-only areas`}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {activeVisitType.label}
                      </span>
                      {hasJobOutcomeSelected &&
                      !scopeNeedsConfirmation &&
                      !scopeWrittenOnlyNeedsConfirmation ? (
                        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Confirmed
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-3 px-3 py-3">
                    {hasJobOutcomeSelected ? (
                      <div className="rounded-[16px] border border-black/8 bg-[#111315] px-4 py-4 text-white">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]">
                              Customer-ready copy
                            </p>
                            <p className="mt-2 text-sm font-bold leading-5">
                              {previewPacket.summaryCards[0]?.copy ?? previewPacket.packetHeader.copy}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-white/58">
                              {findPacketRowValue(
                                previewPacket.customerClose.actionItems,
                                "Reply or action",
                                previewPacket.customerClose.copy,
                              ) || previewPacket.customerClose.copy}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/62">
                            {closeoutEngine.basisLabel}
                          </span>
                        </div>
                      </div>
                    ) : null}
                    {quickCloseoutNoteNeedsPlacement && quickCloseoutNoteSignal ? (
                      <div
                        data-quick-note-placement
                        className="rounded-[16px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a94410]">
                              Vendor note needs placement
                            </p>
                            <p className="mt-1 text-sm font-bold leading-5 text-foreground">
                              {quickCloseoutNoteSignal.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              &quot;{quickCloseoutNote}&quot; is saved, but it is not yet reflected in an area status.
                            </p>
                          </div>
                          {quickCloseoutNoteSignal.areaId ? (
                            <button
                              type="button"
                              onClick={applyQuickCloseoutNoteSignal}
                              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#111315] px-4 text-[10px] font-black uppercase tracking-[0.13em] text-white"
                            >
                              {quickCloseoutNoteSignal.actionLabel}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowScopeDetails(true)}
                              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#111315] px-4 text-[10px] font-black uppercase tracking-[0.13em] text-white"
                            >
                              Pick area below
                            </button>
                          )}
                        </div>
                      </div>
                    ) : null}
                    {hasJobOutcomeSelected && unplacedFieldPhotos.length > 0 ? (
                      <div className="rounded-[16px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={labelClassName()}>Saved photos, not used yet</p>
                            <p className="mt-1 text-sm font-bold leading-5 text-foreground">
                              {unplacedFieldPhotos.length} photo(s) are saved outside the customer report.
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              They stay in the job record, but customer outputs will not mention them until you attach one to a service area.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowProofDetails(true);
                              selectBuilderStep("photos");
                            }}
                            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[10px] font-black uppercase tracking-[0.13em] text-foreground"
                          >
                            Attach if needed
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {scopeWrittenOnlyNeedsConfirmation ? (
                      <div className="rounded-[16px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a94410]">
                              {scopePhotoEvidenceCount > 0
                                ? "Notes-only area"
                                : "Notes-based record"}
                            </p>
                            <p className="mt-1 text-sm font-bold leading-5 text-foreground">
                              {writtenOnlyScopeRows.map((row) => row.shortLabel).join(", ")}{" "}
                              {writtenOnlyScopeRows.length === 1
                                ? "has"
                                : "have"} no photo.
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              The report will use service notes for these areas. Change any area that was blocked, skipped, or not part of this visit.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setScopeAssumptionsAccepted(true)}
                            className="inline-flex min-h-10 max-w-full items-center justify-center rounded-full bg-[#111315] px-4 py-2 text-center text-[10px] font-black uppercase leading-4 tracking-[0.08em] text-white sm:shrink-0 sm:tracking-[0.13em]"
                          >
                            <span className="sm:hidden">Use record</span>
                            <span className="hidden sm:inline">
                              Use written record
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {visibleScopeRows.length > 0 ? (
                      <div className="grid gap-2">
                        {visibleScopeRows.map((row) => {
                          const statusMeta = getScopeStatusMeta(row.status);
                          const statusOptions = buildScopeStatusOptions(row);

                          return (
                            <article
                              key={row.id}
                              className="rounded-[16px] border border-black/8 bg-[rgba(17,17,17,0.02)] px-3 py-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-bold text-foreground">
                                      {row.label}
                                    </p>
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${statusMeta.className}`}
                                    >
                                      {statusMeta.label}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {row.reason}
                                  </p>
                                </div>
                                <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                  {row.evidence === "photo"
                                    ? `${row.photoCount} photo`
                                    : row.evidence === "written"
                                      ? "Written only"
                                      : row.evidence === "unclear"
                                        ? "Unclear"
                                  : "Separate"}
                                </span>
                              </div>
                              <label className="mt-3 block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                  Change status
                                </span>
                                <select
                                  value={row.status}
                                  onChange={(event) =>
                                    updateScopeAreaStatus(
                                      row.id,
                                      event.target.value as ScopeStatus,
                                    )
                                  }
                                  className="h-10 w-full rounded-[14px] border border-black/10 bg-white px-3 text-xs font-bold text-foreground outline-none focus:border-[#f26a21]/45 focus:ring-2 focus:ring-[#f26a21]/12 sm:max-w-[260px]"
                                >
                                  {statusOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                      disabled={option.disabled}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {scopeLedgerRows
                          .filter((row) => row.status !== "not-in-scope")
                          .slice(0, 4)
                          .map((row) => {
                            const statusMeta = getScopeStatusMeta(row.status);

                            return (
                              <div
                                key={row.id}
                                className="flex items-center justify-between gap-3 rounded-[14px] border border-black/8 bg-[rgba(17,17,17,0.02)] px-3 py-2"
                              >
                                <span className="text-xs font-bold text-foreground">
                                  {row.shortLabel}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                  {statusMeta.chip}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScopeDetails((current) => !current)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {showScopeDetails ? "Show less" : "Change an area"}
                      </button>
                      {!scopeNeedsConfirmation && !scopeWrittenOnlyNeedsConfirmation ? (
                        <span className="rounded-full bg-[#111315] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          Ready
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[18px] border border-[#f26a21]/18 bg-[#fff7ef]">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0dfd1] bg-white/55 px-4 py-3">
                    <div className="min-w-0">
                      <p className={labelClassName()}>
                        {!jobBasicsReady && hasJobOutcomeSelected
                          ? "Job details needed"
                          : hasJobOutcomeSelected
                            ? "Outputs ready"
                            : "Outputs pending"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {!jobBasicsReady && hasJobOutcomeSelected
                          ? `Add ${jobBasicsMissingLabel} before Axis 1 creates the customer link or PDF.`
                          : hasJobOutcomeSelected
                          ? "Everything below comes from this service record. Customer-safe wording follows area status."
                          : "Pick the job result before Axis 1 generates the customer report link, PDF, follow-up, revisit, and next-service copy."}
                      </p>
                    </div>
                    {!scopeNeedsWrittenRecordConfirmation ? (
                      <button
                        type="button"
                        onClick={handleJobPrimaryAction}
                        disabled={!hasJobOutcomeSelected}
                        className={`max-md:!hidden rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          canPreviewProofLink
                            ? "bg-[#111315]"
                            : "bg-[#f26a21]"
                        }`}
                      >
                        {hasJobOutcomeSelected ? previewProofLinkLabel : "Confirm result first"}
                      </button>
                    ) : null}
                  </div>
                  {hasJobOutcomeSelected ? (
                    <div className="grid gap-2 p-3 md:grid-cols-3">
                      {primaryCustomerLines.map((item) => {
                        const isEditing =
                          activeCustomerLineEditor === item.editor &&
                          activeCustomerLineEditorSurface === "draft";

                        return (
                        <article
                          key={item.label}
                          className={`rounded-[15px] border bg-white/72 px-3 py-3 transition ${
                            isEditing
                              ? "border-[#f26a21]/35 bg-white"
                              : "border-black/8 hover:border-[#f26a21]/24 hover:bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectCustomerLineEditor(item.editor, "draft")}
                            className="block w-full text-left"
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                              {item.label}
                            </span>
                            <span className="mt-1.5 block text-sm font-bold leading-5 text-foreground">
                              {item.value}
                            </span>
                            <span className="mt-2 inline-flex rounded-full border border-black/10 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                              {isEditing ? "Editing" : item.action}
                            </span>
                          </button>
                          {isEditing ? (
                            <div className="mt-3 border-t border-black/8 pt-3">
                              {renderInlineCustomerLineEditor(item.editor, "draft")}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="rounded-[15px] border border-dashed border-black/15 bg-white/68 px-3 py-3 text-sm font-semibold leading-6 text-muted-foreground">
                        Pick a result to fill the customer result, follow-up note, and next step.
                      </div>
                    </div>
                  )}
                </div>

                <div
                  data-axis-job-basics-panel
                  className={`mt-4 overflow-hidden rounded-[18px] border ${
                    jobBasicsReady
                      ? "border-black/8 bg-[rgba(17,17,17,0.025)]"
                      : "border-[#f26a21]/24 bg-[#fff7ef]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setShowJobBasics((current) => !current)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={labelClassName()}>Job basics</p>
                        {!jobBasicsReady ? (
                          <span className="rounded-full border border-[#f26a21]/22 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a94410]">
                            Required
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`mt-1 truncate text-sm font-semibold ${
                          jobBasicsReady ? "text-foreground" : "text-[#a94410]"
                        }`}
                      >
                        {jobBasicsSummary}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {jobBasicsReady
                          ? "These details appear on the customer link, PDF, and saved history."
                          : "Add real customer details before creating a link or PDF. The tool will not send untouched defaults."}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {showJobBasics ? "Hide" : jobBasicsReady ? "Edit" : "Add details"}
                      {showJobBasics ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {showJobBasics ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-4 border-t border-black/8 bg-white px-4 py-4">
                          <div>
                            <label className={labelClassName()} htmlFor="propertyName">
                              Property / customer
                            </label>
                            <input
                              id="propertyName"
                              className={fieldClassName()}
                              maxLength={textFieldLimits.propertyName}
                              placeholder="Canal Street Tacos"
                              {...form.register("propertyName")}
                            />
                          </div>
                          <div>
                            <label className={labelClassName()} htmlFor="siteCity">
                              Site / city
                            </label>
                            <input
                              id="siteCity"
                              className={fieldClassName()}
                              maxLength={textFieldLimits.siteCity}
                              placeholder="Glendale, CA"
                              {...form.register("siteCity")}
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className={labelClassName()} htmlFor="serviceDate">
                                Service date
                              </label>
                              <input
                                id="serviceDate"
                                type="date"
                                className={fieldClassName()}
                                {...form.register("serviceDate")}
                              />
                            </div>
                            <div>
                              <label className={labelClassName()} htmlFor="authorizedBy">
                                Authorized by
                              </label>
                              <input
                              id="authorizedBy"
                              className={fieldClassName()}
                              maxLength={textFieldLimits.authorizedBy}
                              placeholder="Manager on duty"
                              {...form.register("authorizedBy")}
                            />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="mt-4 rounded-[18px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={labelClassName()}>Next visit</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {selectedCadenceOption.label} window
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTimingEditor((current) => !current)}
                      className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      {showTimingEditor ? "Done" : "Change if needed"}
                    </button>
                  </div>
                  {showTimingEditor ? (
                    <SegmentedControl
                      type="single"
                      value={values.cadence}
                      onValueChange={(value) => {
                        if (axis1CadenceOptions.some((option) => option.value === value)) {
                          form.setValue("cadence", value as Axis1BuilderFormValues["cadence"], {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      className="mt-3 flex-wrap"
                    >
                      {axis1CadenceOptions.map((option) => (
                        <SegmentedControlItem key={option.value} value={option.value}>
                          {option.label}
                        </SegmentedControlItem>
                      ))}
                    </SegmentedControl>
                  ) : (
                    <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">
                      Default next window selected. Change only when this visit needs a different schedule.
                    </p>
                  )}
                  <div className="mt-3 hidden rounded-[16px] border border-accent/25 bg-accent/[0.08] px-4 py-3">
                    <p className={labelClassName()}>
                      Selected cadence - {selectedCadenceOption.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {selectedCadenceOption.copy}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-4 flex justify-end ${
                    hasJobOutcomeSelected &&
                    values.scenario === "clean" &&
                    !scopeNeedsWrittenRecordConfirmation
                      ? ""
                      : "hidden"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectBuilderStep("outputs")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white ${
                      canPreviewProofLink ? "bg-[#111315]" : "bg-[#f26a21]"
                    }`}
                  >
                    Continue to Outputs
                  </button>
                </div>
              </div>

              {builderStep === "review" &&
              hasJobOutcomeSelected &&
              values.scenario === "exception" &&
              showExceptionDetails ? (
                <div className="rounded-[22px] border border-black/8 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={labelClassName()}>Advanced details</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Default details are already set from your result choice. Change them only if the blocked area or follow-up action is wrong.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExceptionDetails((current) => !current)}
                        className="rounded-full border border-black/10 bg-[rgba(17,17,17,0.025)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {showExceptionDetails ? "Hide details" : "Change details"}
                      </button>
                      <button
                        type="button"
                        disabled={!hasJobOutcomeSelected}
                        onClick={() => selectBuilderStep("outputs")}
                        className={`hidden rounded-full bg-[#111315] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white md:inline-flex ${
                          !hasJobOutcomeSelected ? "cursor-not-allowed opacity-55" : ""
                        }`}
                      >
                      Open Outputs
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {showExceptionDetails ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                  <div className="mt-4 space-y-4">
                    {axis1ExceptionGroups.map((group) => {
                      const groupOptions = axis1ExceptionOptions.filter(
                        (option) => option.group === group.value,
                      );
                      const selectedOptions = groupOptions.filter((option) =>
                        values.exceptionKinds.includes(option.value),
                      );
                      const selectedCount = groupOptions.filter((option) =>
                        values.exceptionKinds.includes(option.value),
                      ).length;

                      return (
                        <div
                          key={group.value}
                          className="rounded-[18px] border border-black/8 bg-[rgba(17,17,17,0.02)] px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={labelClassName()}>{group.label}</p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {group.copy}
                              </p>
                            </div>
                            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              {selectedCount}/{groupOptions.length} selected
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {groupOptions.map((option) => {
                              const selected = values.exceptionKinds.includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    form.setValue(
                                      "exceptionKinds",
                                      toggleExceptionKind(values.exceptionKinds, option.value),
                                      { shouldDirty: true, shouldValidate: true },
                                    )
                                  }
                                  className={`rounded-full border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] transition ${
                                    selected
                                      ? "border-accent bg-accent text-white"
                                      : "border-black/10 bg-white text-foreground"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-3 rounded-[16px] border border-black/8 bg-white px-4 py-3">
                            <p className={labelClassName()}>Customer rule used</p>
                            <p className="mt-2 text-sm leading-6 text-foreground">
                              {selectedOptions.length > 0
                                ? selectedOptions.map((option) => option.copy).join(" ")
                                : "No item selected in this group."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClassName()} htmlFor="exceptionNote">
                        Short action note
                      </label>
                      <textarea
                        id="exceptionNote"
                        rows={3}
                        className={fieldClassName()}
                        maxLength={textFieldLimits.exceptionNote}
                        placeholder="Only if the default exception wording needs a tighter explanation."
                        {...form.register("exceptionNote")}
                      />
                      <CharacterCount
                        value={values.exceptionNote}
                        max={textFieldLimits.exceptionNote}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className={labelClassName()}>Condition response</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            This controls whether the customer note asks for review, monitor, or record-only language.
                          </p>
                        </div>
                      </div>
                      <SegmentedControl
                        type="single"
                        value={values.followUpMode}
                        onValueChange={(value) => {
                          if (axis1FollowUpOptions.some((option) => option.value === value)) {
                            form.setValue(
                              "followUpMode",
                              value as Axis1BuilderFormValues["followUpMode"],
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                          }
                        }}
                        className="mt-2 flex-wrap"
                      >
                        {axis1FollowUpOptions.map((option) => (
                          <SegmentedControlItem key={option.value} value={option.value}>
                            {option.label}
                          </SegmentedControlItem>
                        ))}
                      </SegmentedControl>
                      <div className="mt-3 rounded-[14px] border border-accent/25 bg-accent/[0.08] px-4 py-3">
                        <p className={labelClassName()}>
                          Selected response - {selectedFollowUpOption.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground">
                          {selectedFollowUpOption.copy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={labelClassName()} htmlFor="followUpNote">
                      Recorded condition note
                    </label>
                    <textarea
                      id="followUpNote"
                      rows={2}
                      className={fieldClassName()}
                      maxLength={textFieldLimits.followUpNote}
                      placeholder="Optional. Only use this if the default recorded-condition sentence needs a tighter note."
                      {...form.register("followUpNote")}
                    />
                    <CharacterCount
                      value={values.followUpNote}
                      max={textFieldLimits.followUpNote}
                    />
                  </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div
                    className={`mt-4 justify-end ${
                      scopeNeedsWrittenRecordConfirmation ? "hidden" : "flex"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectBuilderStep("outputs")}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white ${
                        canPreviewProofLink ? "bg-[#111315]" : "bg-[#f26a21]"
                      }`}
                    >
                      Continue to Outputs
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                className={`rounded-[22px] border border-black/8 bg-white px-4 py-4 shadow-[0_14px_40px_rgba(17,17,17,0.05)] ${
                  isOutputStep ? "" : "hidden"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className={labelClassName()}>Service report</p>
                    <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.035em] text-foreground">
                      Send the report, save the PDF, and follow up.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Service report link, PDF, revisit, quote, and next-service copy come from the same service record.
                    </p>
                  </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#b94d11]">
                      <Sparkles className="h-3.5 w-3.5" />
                    Outputs
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ["Ready", `${generatedOutputReadyCount}`],
                    ["Need review", `${generatedOutputReviewCount}`],
                    [
                      "Private checks",
                      `${closeoutEngine.vendorSendReadinessWarnings.length}`,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[16px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-2"
                    >
                      <p className={labelClassName()}>{label}</p>
                      <p className="mt-1 text-lg font-black leading-none text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPacketDetails((current) => !current)}
                  className="tool-action-btn tool-action-secondary tool-action-mini mt-3"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Record details
                  {showPacketDetails ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className={labelClassName()}>Customer-safe copy</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Customer lines stay calm; private checks remain inside this builder.
                    </p>
                  </div>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Optional edit
                  </span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-1 2xl:grid-cols-2">
                  {generatedCustomerLines.map((item) => {
                    const isEditing =
                      activeCustomerLineEditor === item.editor &&
                      activeCustomerLineEditorSurface === "report";

                    return (
                    <article
                      key={item.label}
                      className={`group min-w-0 rounded-[18px] border px-3 py-3 transition hover:border-[#f26a21]/24 hover:bg-[#fff7ef] hover:shadow-[0_14px_32px_rgba(17,19,21,0.07)] ${
                        isEditing
                          ? "border-[#f26a21]/35 bg-[#fff7ef]"
                          : "border-black/8 bg-[rgba(17,17,17,0.025)]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectCustomerLineEditor(item.editor, "report")}
                        className="block w-full text-left"
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm font-bold leading-5 text-foreground md:line-clamp-3">
                          {item.value}
                        </span>
                        <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                          {item.source}
                        </span>
                        <span className="tool-edit-chip mt-2">
                          <PencilLine className="h-3 w-3" />
                          {isEditing ? "Editing" : item.action}
                        </span>
                      </button>
                      {isEditing ? (
                        <div className="mt-3 border-t border-[#f0dfd1] pt-3">
                          {renderInlineCustomerLineEditor(item.editor, "reportCard")}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
                </div>

                <AnimatePresence initial={false}>
                  {showPacketDetails ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClassName()} htmlFor="systemName">
                            System / hood line
                          </label>
                          <input
                            id="systemName"
                            className={fieldClassName()}
                            maxLength={textFieldLimits.systemName}
                            {...form.register("systemName")}
                          />
                        </div>
                        <div>
                          <label className={labelClassName()} htmlFor="serviceWindow">
                            Service window
                          </label>
                          <input
                            id="serviceWindow"
                            className={fieldClassName()}
                            maxLength={textFieldLimits.serviceWindow}
                            {...form.register("serviceWindow")}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div
                id="field-photo-intake"
                className={`overflow-hidden rounded-[30px] border border-white/10 bg-[#101214] px-3.5 py-4 text-white shadow-[0_28px_70px_rgba(17,17,17,0.24)] md:rounded-[34px] md:px-5 md:py-5 ${
                  builderStep === "photos" ? "" : "hidden"
                } ${
                  isPhotoStep
                    ? "mt-2 min-h-[calc(100svh-96px)] border-white/12 bg-[radial-gradient(circle_at_18%_0%,rgba(255,180,137,0.12),transparent_30%),linear-gradient(180deg,#121416,#0d0f10)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:mt-3 md:px-6 md:py-6"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]">
                      Photos & notes
                    </p>
                    {builderStep === "photos" ? (
                      <h1
                        className="mt-2 text-2xl font-bold leading-[0.92] tracking-[-0.055em] text-white md:text-[2.45rem]"
                        data-axis-tool-page-heading
                      >
                        Create the restaurant-ready hood cleaning report.
                      </h1>
                    ) : (
                      <h2 className="mt-2 text-2xl font-bold leading-[0.92] tracking-[-0.055em] text-white md:text-[2.45rem]">
                        Create the restaurant-ready hood cleaning report.
                      </h2>
                    )}
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54 md:text-[14px] md:leading-6">
                      Add job photos if you have them. One short note is enough when the crew needs a clean report link and PDF for the restaurant.
                    </p>
                  </div>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] md:h-11 md:w-11">
                    <IconPhotoScan className="h-5 w-5 text-[#ffb489]" />
                  </div>
                </div>

                <div className="hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]">
                        Job result
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        Start here, then add photos if you have them.
                      </p>
                    </div>
                    <span className="rounded-full border border-white/12 bg-black/14 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/54">
                      {customerChoiceStatus}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 min-[430px]:grid-cols-3">
                    {customerShouldKnowOptions.map((option) => {
                      const pattern = option.pattern;
                      const selected =
                        hasJobOutcomeSelected && activeJobPatternId === pattern.id;
                      const recommended =
                        jobOutcomeRecommendation.pattern.id === pattern.id;

                      return (
                        <button
                          key={`photo-step-${option.label}`}
                          type="button"
                          onClick={() => applyJobPattern(pattern)}
                          className={`min-h-[62px] rounded-[18px] border px-3 py-2.5 text-left transition ${
                            selected
                              ? "border-[#ffb489]/55 bg-white text-[#111315]"
                              : "border-white/12 bg-black/14 text-white hover:bg-white/[0.09]"
                          }`}
                        >
                          <span
                            className={`block text-[10px] font-black uppercase tracking-[0.12em] ${
                              selected ? "text-[#bc3d1f]" : "text-[#ffb489]"
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="mt-1 block text-sm font-black leading-5">
                            {pattern.title}
                          </span>
                          <span
                            className={`mt-1 block text-[11px] font-semibold leading-4 ${
                              selected ? "text-[#111315]/56" : "text-white/48"
                            }`}
                          >
                            {selected
                              ? "Selected"
                              : recommended
                                ? "Suggested"
                                : "Pick if true"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <motion.label
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 28,
                  }}
                  className={`group relative mt-4 flex cursor-pointer items-center justify-between gap-3 overflow-hidden border border-dashed border-[#ffb489]/48 bg-[radial-gradient(circle_at_12%_0%,rgba(255,180,137,0.22),transparent_36%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.1),transparent_24%),rgba(255,255,255,0.06)] px-4 transition hover:border-[#ffb489]/70 hover:bg-white/[0.09] sm:mt-5 sm:gap-4 sm:px-5 ${
                    hasProofWorkStarted
                      ? "min-h-[104px] rounded-[24px] py-4 sm:min-h-[112px] sm:px-6 sm:py-4"
                      : "min-h-[176px] rounded-[26px] py-4 sm:min-h-[248px] sm:rounded-[32px] sm:px-8 sm:py-7 xl:min-h-[266px]"
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleBulkPhotoUpload(event.dataTransfer.files);
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb489]">
                      {hasProofWorkStarted ? "Add more" : "Job photos"}
                    </p>
                    <p
                      className={`mt-3 font-bold text-white ${
                        hasProofWorkStarted
                          ? "text-2xl leading-[0.98] tracking-[-0.04em] sm:text-3xl"
                          : "max-w-[14ch] text-[2rem] leading-[0.94] tracking-[-0.05em] sm:max-w-[11ch] sm:text-[3.55rem] sm:leading-[0.88] sm:tracking-[-0.07em]"
                      }`}
                    >
                      {hasProofWorkStarted ? "Add extra photos" : "Drop photos if you have them"}
                    </p>
                    <p className="mt-3 max-w-md text-xs leading-5 text-white/58 sm:mt-4 sm:text-sm sm:leading-6 md:text-[15px]">
                      {hasProofWorkStarted
                        ? "Drop only the missing or extra photos. The current report stays intact."
                        : "Before, after, fan, filter, access, label, and issue photos can all go in one batch."}
                    </p>
                    <div
                      className={`mt-4 flex flex-wrap gap-2 sm:mt-5 ${
                        hasProofWorkStarted ? "hidden" : ""
                      }`}
                    >
                      <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#111315] shadow-[0_14px_34px_rgba(0,0,0,0.26)]">
                        Choose photos
                      </span>
                      <Badge
                        variant="outline"
                        className="border-white/14 bg-white/[0.08] px-3 py-1 text-[11px] text-white/70"
                      >
                        Photos optional
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/14 bg-white/[0.08] px-3 py-1 text-[11px] text-white/70"
                      >
                        Saved with report
                      </Badge>
                    </div>
                  </div>
                  <div
                    className={`grid shrink-0 place-items-center bg-white text-[#111315] shadow-[0_22px_54px_rgba(0,0,0,0.34)] ${
                      hasProofWorkStarted
                        ? "h-12 w-12 rounded-[20px] sm:h-14 sm:w-14"
                        : "h-12 w-12 rounded-[20px] sm:h-20 sm:w-20 sm:rounded-[26px]"
                    }`}
                  >
                    <IconCameraPlus className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    data-photo-upload="bulk"
                    aria-label="Upload job photos"
                    className="sr-only"
                    onChange={(event) => {
                      void handleBulkPhotoUpload(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </motion.label>

                <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.055] px-4 py-3">
                  <label
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]"
                    htmlFor="quickCloseoutNote"
                  >
                    Optional note
                  </label>
                  <textarea
                    id="quickCloseoutNote"
                    rows={2}
                    className="mt-2 min-h-[92px] w-full resize-none rounded-[16px] border border-white/10 bg-black/18 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#ffb489]/55 focus:ring-2 focus:ring-[#ffb489]/15 sm:min-h-[72px]"
                    maxLength={textFieldLimits.followUpNote}
                    placeholder="Example: fan access blocked by locked roof hatch, or duct not part of this visit."
                    {...form.register("followUpNote")}
                  />
                </div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.055] px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]">
                        What was included?
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {activeVisitType.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/50">
                        {activeVisitType.copy}
                      </p>
                      <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
                        Leave standard unless this visit was filters-only, fan-only, access revisit, or condition-only.
                      </p>
                    </div>
                    <span className="rounded-full border border-white/12 bg-black/14 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/54">
                      This visit only
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 pb-1">
                    {visitTypePresets.map((preset) => {
                      const selected = preset.id === visitTypeId;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => updateVisitType(preset.id)}
                          className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition ${
                            selected
                              ? "border-white bg-white text-[#111315]"
                              : "border-white/12 bg-black/14 text-white/58 hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!hasProofWorkStarted ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <button
                      type="button"
                      onClick={proceedFromPhotoStep}
                      className="group flex min-h-[86px] items-center justify-between gap-4 rounded-[24px] border border-white/12 bg-white px-5 py-4 text-left text-[#111315] shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white/95"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#bc3d1f]">
                          Ready to review?
                        </span>
                        <span className="mt-1 block text-xl font-black tracking-[-0.045em]">
                          Review report
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-[#111315]/58">
                          Review the service summary, then fix only wrong or uncertain parts.
                        </span>
                      </span>
                      <IconArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5" />
                    </button>
                    <div className="grid min-h-[86px] content-center rounded-[24px] border border-white/10 bg-black/14 px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                        Next
                      </p>
                      <p className="mt-2 text-sm font-bold leading-5 text-white">
                        No photos is okay. The next screen creates a written record without claiming missing photos.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div
                  className="hidden"
                >
                  {fieldPhotoSlots
                    .filter((slot) => slot.id === "hood-before" || slot.id === "hood-after")
                    .map((slot) => {
                      const uploaded = uploadedFieldPhotos[slot.id];

                      return (
                        <motion.label
                          key={slot.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          transition={{
                            type: "spring",
                            stiffness: 360,
                            damping: 28,
                          }}
                          className={`group relative min-h-[112px] cursor-pointer overflow-hidden rounded-[20px] border px-4 py-4 transition sm:min-h-[138px] sm:rounded-[22px] sm:px-5 sm:py-5 ${
                            uploaded
                              ? "border-[#b9d4c6]/28 bg-[#b9d4c6]/10"
                              : "border-dashed border-[#ffb489]/34 bg-white/[0.05] hover:border-[#ffb489]/60 hover:bg-white/[0.075]"
                          }`}
                        >
                          {uploaded ? (
                            <div
                              className="absolute inset-0 bg-cover bg-center opacity-45 transition group-hover:opacity-55"
                              style={{ backgroundImage: `url(${uploaded.src})` }}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,18,20,0.18),rgba(16,18,20,0.86))]" />
                          <div className="relative z-10 flex h-full min-h-[102px] flex-col justify-between sm:min-h-[130px]">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]">
                                  {slot.shortLabel} photo
                                </p>
                                <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.015em] text-white sm:text-xl">
                                  {uploaded
                                    ? "Photo attached"
                                    : `Choose ${slot.shortLabel.toLowerCase()}`}
                                </p>
                              </div>
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-[#111315] sm:h-10 sm:w-10">
                                <IconCameraPlus className="h-5 w-5" />
                              </div>
                            </div>
                            <div>
                              <p className="truncate text-sm leading-6 text-white/58">
                                {uploaded
                                  ? uploaded.name
                                  : slot.id === "hood-before"
                                    ? "Best starting point if the crew captured a dirty-start photo."
                                    : "Best starting point if the crew captured a clean-finish photo."}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-white/12 bg-white/[0.08] px-3 py-1 text-[11px] text-white/66"
                                >
                                  {uploaded ? "Ready" : "Core"}
                                </Badge>
                                {uploaded ? (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      void handlePhotoUpload(slot.id, undefined, "manual");
                                    }}
                                    className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/66"
                                  >
                                    Clear
                                  </button>
                                ) : null}
                                <Badge
                                  variant="outline"
                                  className="border-white/12 bg-white/[0.08] px-3 py-1 text-[11px] text-white/66"
                                >
                                  Change later
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            aria-label={`Upload ${slot.shortLabel} photo`}
                            className="sr-only"
                            onChange={(event) => {
                              void handlePhotoUpload(
                                slot.id,
                                event.target.files?.[0],
                                "manual",
                              );
                              event.currentTarget.value = "";
                            }}
                          />
                        </motion.label>
                      );
                    })}
                </div>

                <div
                  className={`mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)] lg:items-stretch 2xl:grid-cols-1 md:mt-5 md:gap-4 ${
                    hasProofWorkStarted ? "" : "hidden"
                  }`}
                >
                  <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_rgba(0,0,0,0.2)]">
                    <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb489]">
                          Job photos
                        </p>
                        <p className="mt-2 text-2xl font-bold leading-[0.95] tracking-[-0.055em] text-white md:text-[2.35rem]">
                          {proofReadinessTitle}
                        </p>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
                          {proofReadinessCopy}
                        </p>
                      </div>
                      <div className="grid gap-2 md:w-[310px]">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            ["Confirmed", `${vendorConfirmedPhotoCount}`],
                            ["Extra saved", `${pendingPhotoAssistCount}`],
                            ["Extra", `${unplacedFieldPhotos.length}`],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-[18px] border border-white/10 bg-black/16 px-3 py-3 text-center"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">
                                {label}
                              </p>
                              <p className="mt-1 text-xl font-bold tracking-[-0.04em] text-white">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                        {hasSuggestedPhotoRoles ? (
                          <button
                            type="button"
                            onClick={() => confirmAutoPlacedPhotoRoles("review")}
                            className="h-10 rounded-full bg-white px-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#111315] shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
                          >
                            Accept AI attachments
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {shouldShowProofDetails &&
                    firstPendingPlacedPhotoSlot &&
                    firstPendingPlacedPhoto ? (
                      <div
                        data-photo-one-tap-review="true"
                        className="border-t border-white/8 bg-black/16 px-4 py-4 sm:px-5"
                      >
                        <div className="grid gap-3 rounded-[20px] border border-[#ffb489]/22 bg-[#ffb489]/10 p-3 md:grid-cols-[88px_minmax(0,1fr)_minmax(210px,260px)] md:items-center">
                          <div
                            className="h-24 overflow-hidden rounded-[16px] border border-white/12 bg-cover bg-center md:h-20"
                            style={{
                              backgroundImage: `url(${firstPendingPlacedPhoto.src})`,
                            }}
                            aria-label={`Suggested photo role: ${firstPendingPlacedPhoto.name}`}
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffcfb5]">
                              Optional photo attachment
                            </p>
                            <p className="mt-1 text-lg font-black leading-tight tracking-[-0.04em] text-white">
                              Use this as {firstPendingPlacedPhotoSlot.shortLabel}?
                            </p>
                            <p className="mt-2 text-xs leading-5 text-white/58">
                              {firstPendingPlacedPhoto.assistReason ??
                                firstPendingPlacedPhoto.matchLabel ??
                                "This photo was not assigned automatically. Use it only if it supports the report."}
                            </p>
                            <p className="mt-1 truncate text-[11px] font-semibold text-white/38">
                              {firstPendingPlacedPhoto.name}
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                confirmPhotoSuggestion(firstPendingPlacedPhotoSlot.id);
                                continueAfterPhotoDecisionIfReady();
                              }}
                              disabled={isPhotoAssistRunning}
                              className="h-10 rounded-full bg-white px-3 text-[10px] font-black uppercase tracking-[0.13em] text-[#111315] shadow-[0_12px_28px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-55"
                            >
                              {isPhotoAssistRunning
                                ? "Reading photo"
                                : `Use as ${firstPendingPlacedPhotoSlot.shortLabel}`}
                            </button>
                            <select
                              defaultValue=""
                              disabled={isPhotoAssistRunning}
                              onChange={(event) => {
                                const targetSlotId = event.target
                                  .value as FieldPhotoSlotId | "";

                                if (targetSlotId) {
                                  reassignPhoto(
                                    firstPendingPlacedPhotoSlot.id,
                                    targetSlotId,
                                  );
                                  continueAfterPhotoDecisionIfReady();
                                }

                                event.currentTarget.value = "";
                              }}
                              className="h-10 rounded-full border border-white/14 bg-white/[0.08] px-3 text-xs font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-55"
                              aria-label={`Change role for ${firstPendingPlacedPhoto.name}`}
                            >
                              <option value="" className="text-[#111315]">
                                Pick another role...
                              </option>
                              {fieldPhotoSlots.map((targetSlot) => (
                                <option
                                  key={targetSlot.id}
                                  value={targetSlot.id}
                                  disabled={targetSlot.id === firstPendingPlacedPhotoSlot.id}
                                  className="text-[#111315]"
                                >
                                  {targetSlot.shortLabel}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                rejectPhotoSuggestion(firstPendingPlacedPhotoSlot.id);
                                continueAfterPhotoDecisionIfReady();
                              }}
                              className="h-10 rounded-full border border-white/14 bg-white/[0.05] px-3 text-[10px] font-bold uppercase tracking-[0.13em] text-white/68 hover:bg-white/[0.09] hover:text-white"
                            >
                              Leave out of output
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : shouldShowProofDetails && firstPendingExtraPhoto ? (
                      <div
                        data-photo-one-tap-review="true"
                        className="border-t border-white/8 bg-black/16 px-4 py-4 sm:px-5"
                      >
                        <div className="grid gap-3 rounded-[20px] border border-[#ffb489]/22 bg-[#ffb489]/10 p-3 md:grid-cols-[88px_minmax(0,1fr)_minmax(210px,260px)] md:items-center">
                          <div
                            className="h-24 overflow-hidden rounded-[16px] border border-white/12 bg-cover bg-center md:h-20"
                            style={{
                              backgroundImage: `url(${firstPendingExtraPhoto.src})`,
                            }}
                            aria-label={`Photo waiting for review: ${firstPendingExtraPhoto.name}`}
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffcfb5]">
                              Optional photo attachment
                            </p>
                            <p className="mt-1 text-lg font-black leading-tight tracking-[-0.04em] text-white">
                              {firstPendingExtraSuggestedSlot
                                ? `Use this as ${firstPendingExtraSuggestedSlot.shortLabel}?`
                                : "Pick a role or leave it out."}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-white/58">
                              {firstPendingExtraPhoto.assistReason ??
                                firstPendingExtraPhoto.matchLabel ??
                                "This photo was not assigned automatically. It stays saved unless you attach it."}
                            </p>
                            <p className="mt-1 truncate text-[11px] font-semibold text-white/38">
                              {firstPendingExtraPhoto.name}
                            </p>
                          </div>
                          <div className="grid gap-2">
                            {firstPendingExtraSuggestedSlot ? (
                              <button
                                type="button"
                                onClick={() => {
                                  placeUnplacedPhoto(
                                    firstPendingExtraPhoto.id,
                                    firstPendingExtraSuggestedSlot.id,
                                  );
                                  continueAfterPhotoDecisionIfReady();
                                }}
                                disabled={isPhotoAssistRunning}
                                className="h-10 rounded-full bg-white px-3 text-[10px] font-black uppercase tracking-[0.13em] text-[#111315] shadow-[0_12px_28px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-55"
                              >
                                {isPhotoAssistRunning
                                  ? "Reading photo"
                                  : `Use as ${firstPendingExtraSuggestedSlot.shortLabel}`}
                              </button>
                            ) : null}
                            <select
                              defaultValue=""
                              disabled={isPhotoAssistRunning}
                              onChange={(event) => {
                                const targetSlotId = event.target
                                  .value as FieldPhotoSlotId | "";

                                if (targetSlotId) {
                                  placeUnplacedPhoto(
                                    firstPendingExtraPhoto.id,
                                    targetSlotId,
                                  );
                                  continueAfterPhotoDecisionIfReady();
                                }

                                event.currentTarget.value = "";
                              }}
                              className="h-10 rounded-full border border-white/14 bg-white/[0.08] px-3 text-xs font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-55"
                              aria-label={`Assign ${firstPendingExtraPhoto.name} to a photo role`}
                            >
                              <option value="" className="text-[#111315]">
                                {firstPendingExtraSuggestedSlot
                                  ? "Pick another role..."
                                  : "Choose role..."}
                              </option>
                              {fieldPhotoSlots.map((targetSlot) => (
                                <option
                                  key={targetSlot.id}
                                  value={targetSlot.id}
                                  className="text-[#111315]"
                                >
                                  {targetSlot.shortLabel}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                dismissUnplacedPhoto(firstPendingExtraPhoto.id);
                                continueAfterPhotoDecisionIfReady();
                              }}
                              className="h-10 rounded-full border border-white/14 bg-white/[0.05] px-3 text-[10px] font-bold uppercase tracking-[0.13em] text-white/68 hover:bg-white/[0.09] hover:text-white"
                            >
                              Leave out of output
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {uploadedPhotoSlots.length > 0 ? (
                      <div className="border-y border-white/8 bg-black/12 px-4 py-3 sm:px-5">
                        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {uploadedPhotoSlots.map((slot) => {
                            const uploaded = uploadedFieldPhotos[slot.id];

                            if (!uploaded) {
                              return null;
                            }

                            return (
                              <div
                                key={slot.id}
                                className="min-w-[132px] overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.045]"
                              >
                                <div
                                  className="h-20 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${uploaded.src})` }}
                                />
                                <div className="px-3 py-2">
                                  <p className="truncate text-xs font-bold text-white">
                                    {slot.shortLabel}
                                  </p>
                                  <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-white/42">
                                    {isVendorConfirmedPhoto(uploaded)
                                      ? isFastConfirmableSuggestedPhoto(uploaded)
                                        ? "AI attached"
                                        : "Vendor confirmed"
                                      : "Suggested"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {photoImportNotice ? (
                      <div
                        className={`mx-4 mt-3 rounded-[16px] border px-3 py-2 sm:mx-5 ${
                          photoImportNotice.tone === "error"
                            ? "border-[#ff8a70]/24 bg-[#bc3d1f]/14"
                            : photoImportNotice.tone === "warning"
                              ? "border-[#ffb489]/24 bg-[#ffb489]/10"
                              : "border-[#b9d4c6]/24 bg-[#b9d4c6]/10"
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold leading-5 ${
                            photoImportNotice.tone === "error"
                              ? "text-[#ffd2c7]"
                              : photoImportNotice.tone === "warning"
                                ? "text-[#ffcfb5]"
                                : "text-[#cfe9da]"
                          }`}
                        >
                          {photoImportNotice.message}
                        </p>
                      </div>
                    ) : null}
                    {hasProofWorkStarted ? (
                      <div className="mx-4 mt-3 rounded-[18px] border border-white/10 bg-black/14 px-3 py-3 sm:mx-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                              Photo Assist
                            </p>
                            <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-white">
                              {pendingPhotoAssistCount > 0
                                ? `${pendingPhotoAssistCount} photo(s) saved as extra photos`
                                : `${vendorConfirmedPhotoCount} vendor-confirmed photo role(s)`}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/52">
                              Gemini checks uploaded photos when the API is live. Local
                              hints are labeled as local; customer outputs never use
                              uncertain photos until you attach a role.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void runPhotoAssist()}
                            disabled={
                              isPhotoAssistRunning || pendingPhotoAssistCount === 0
                            }
                            title={
                              pendingPhotoAssistCount === 0
                                ? "All usable photo roles are already confirmed."
                                : "Read unconfirmed photos with Photo Assist."
                            }
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/14 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111315] disabled:cursor-not-allowed disabled:opacity-55"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {isPhotoAssistRunning ? "Checking" : "Run Photo Assist"}
                          </button>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {[
                            ["Extra saved", `${pendingPhotoAssistCount}`],
                            ["Used in report", `${vendorConfirmedPhotoCount}`],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-[14px] border border-white/10 bg-white/[0.045] px-3 py-2"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">
                                {label}
                              </p>
                              <p className="mt-1 text-lg font-bold tracking-[-0.04em] text-white">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                        {photoAssistNotice ? (
                          <div className="mt-3">
                            <p
                              className={`text-xs font-semibold leading-5 ${
                                photoAssistNotice.tone === "error"
                                  ? "text-[#ffd2c7]"
                                  : photoAssistNotice.tone === "success"
                                    ? "text-[#cfe9da]"
                                    : "text-[#ffcfb5]"
                              }`}
                            >
                              {photoAssistNotice.message}
                            </p>
                            {photoAssistNotice.meta ? (
                              <p className="mt-1 text-[11px] font-semibold leading-5 text-white/42">
                                {photoAssistNotice.meta}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {unplacedFieldPhotos.length > 0 ? (
                      <div
                        data-photo-review-queue="true"
                        className="mx-4 mt-3 rounded-[18px] border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 py-3 sm:mx-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffcfb5]">
                              Extra photos
                            </p>
                            <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-white">
                              {unplacedFieldPhotos.length} photo(s) saved, not claimed
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/56">
                              They are not hidden or deleted. Customer copy will not
                              mention them unless you attach a role.
                            </p>
                          </div>
                          <span className="rounded-full border border-[#ffb489]/24 bg-black/16 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ffcfb5]">
                            Saved, not claimed
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2">
                          {unplacedFieldPhotos.map((photo) => {
                            const suggestedSlot = photo.suggestedSlotId
                              ? fieldPhotoSlots.find(
                                  (slot) => slot.id === photo.suggestedSlotId,
                                )
                              : null;

                            return (
                              <div
                                key={photo.id}
                                data-unplaced-photo-row="true"
                                data-photo-name={photo.name}
                                className="grid gap-3 rounded-[16px] border border-white/10 bg-black/18 px-3 py-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start"
                              >
                                <div
                                  className="h-16 w-16 overflow-hidden rounded-[14px] border border-white/10 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${photo.src})` }}
                                  aria-label={`Photo waiting for review: ${photo.name}`}
                                />
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="max-w-full truncate text-sm font-bold text-white">
                                      {photo.name}
                                    </p>
                                    <span className="rounded-full border border-[#ffb489]/24 bg-[#ffb489]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ffcfb5]">
                                      {suggestedSlot
                                        ? `Suggested: ${suggestedSlot.shortLabel}`
                                        : "No safe role"}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-5 text-white/58">
                                    {photo.assistReason ??
                                      photo.matchLabel ??
                                      "The tool was not confident enough to assign this photo automatically."}
                                  </p>
                                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <select
                                      defaultValue=""
                                      onChange={(event) => {
                                        const targetSlotId = event.target
                                          .value as FieldPhotoSlotId | "";

                                        if (targetSlotId) {
                                          placeUnplacedPhoto(photo.id, targetSlotId);
                                        }

                                        event.currentTarget.value = "";
                                      }}
                                      className="h-10 min-w-0 rounded-full border border-white/12 bg-white px-3 text-xs font-semibold text-[#111315] outline-none sm:w-[220px]"
                                      aria-label={`Assign ${photo.name} to a photo role`}
                                    >
                                      <option value="">Assign role...</option>
                                      {fieldPhotoSlots.map((targetSlot) => (
                                        <option key={targetSlot.id} value={targetSlot.id}>
                                          {targetSlot.shortLabel}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => dismissUnplacedPhoto(photo.id)}
                                      className="h-10 rounded-full border border-white/12 bg-white/[0.05] px-3 text-xs font-bold uppercase tracking-[0.12em] text-white/68 hover:bg-white/[0.09] hover:text-white"
                                    >
                                      Leave out
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {hasSuggestedPhotoRoles ? (
                      <div className="mx-4 mt-3 rounded-[16px] border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 py-2 sm:mx-5">
                        <p className="text-xs font-semibold leading-5 text-[#ffcfb5]">
                          Clear photo attachments can support the report. You can still
                          correct a role before sending.
                        </p>
                      </div>
                    ) : null}
                    {hasBeforeOnly || hasAfterOnly ? (
                      <div className="mx-4 mt-3 rounded-[16px] border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 py-2 sm:mx-5">
                        <p className="text-xs font-semibold leading-5 text-[#ffcfb5]">
                          {hasAfterOnly
                            ? "After photo is present, but no before photo is attached. The report will stay as an after-photo service note unless you add or mark the missing before photo."
                            : "Before photo is present, but no after photo is attached. Add an after photo or mark it not captured before sending."}
                        </p>
                      </div>
                    ) : null}
                    <div className="mx-4 mt-3 rounded-[18px] border border-white/10 bg-black/14 px-3 py-3 sm:mx-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                            Next step
                          </p>
                          <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-white">
                            Confirm result before sending
                          </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="border-white/12 bg-white/[0.07] px-3 py-1 text-[10px] text-white/58"
                          >
                            {totalFieldPhotoCount > 0
                              ? `${vendorConfirmedPhotoCount} confirmed`
                              : "Written record"}
                          </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/54">
                        Photos are prepared. Outputs are finalized after the visit outcome is selected.
                      </p>
                    </div>
                    <div className="mx-4 mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08] sm:mx-5">
                      <motion.div
                        className="h-full rounded-full bg-[#ffb489]"
                        animate={{ width: `${proofProgressPercent}%` }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                    {shouldShowProofDetails ? (
                      <div className="mx-4 mt-4 flex flex-wrap gap-2 sm:mx-5">
                        {(missingRequiredSlots.length > 0
                          ? firstMissingSlots
                          : fieldPhotoSlots.filter((slot) => slot.required).slice(0, 4)
                        ).map((slot) => {
                          const uploaded = uploadedFieldPhotos[slot.id];
                          const resolution = photoSlotResolutions[slot.id];
                          const ready = Boolean(uploaded) || resolution !== "open";
                          const label = uploaded
                            ? "Photo"
                            : resolution === "not-captured"
                              ? "Not captured"
                              : resolution === "not-applicable"
                                ? "N/A"
                                : "Need";

                          return (
                            <Badge
                              key={slot.id}
                              variant="outline"
                              className={`px-2.5 py-1 text-[10px] ${
                                ready
                                  ? "border-[#b9d4c6]/36 bg-[#b9d4c6]/12 text-[#cfe9da]"
                                  : "border-[#ffb489]/28 bg-[#ffb489]/9 text-[#ffb489]"
                              }`}
                            >
                              {label} {slot.shortLabel}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : !hasProofWorkStarted ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                        {["Written record is okay", "Have photos? Upload", "Wrong match? Fix before sending"].map(
                          (item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-xs font-semibold text-white/58"
                            >
                              {item}
                            </div>
                          ),
                        )}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2 border-t border-white/8 bg-black/10 px-4 py-4 sm:px-5">
                      {!hasProofWorkStarted ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={proceedFromPhotoStep}
                          className="hidden rounded-full bg-white px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#111315] hover:bg-white/90 md:inline-flex"
                        >
                          Review written record
                        </Button>
                      ) : null}
                      {hasProofWorkStarted ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (shouldShowProofDetails) {
                              setShowProofDetails(false);
                              setShowAllPhotoSlots(false);
                              return;
                            }

                            setShowProofDetails(true);
                          }}
                          className="inline-flex rounded-full border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/66 hover:bg-white/[0.08] hover:text-white"
                        >
                          {shouldShowProofDetails ? "Hide review" : "Fix photo matches"}
                        </Button>
                      ) : null}
                      {shouldShowProofDetails ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllPhotoSlots((current) => !current)}
                          className="rounded-full border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/66 hover:bg-white/[0.08] hover:text-white"
                        >
                          {showAllPhotoSlots ? "Open only" : "All slots"}
                        </Button>
                      ) : null}
                      {hasBeforePhoto && hasAfterPhoto && shouldShowProofDetails ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => reassignPhoto("hood-before", "hood-after")}
                          className="rounded-full border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/66 hover:bg-white/[0.08] hover:text-white"
                        >
                          Swap before/after
                        </Button>
                      ) : null}
                      {hasAfterOnly && shouldShowProofDetails ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => reassignPhoto("hood-after", "hood-before")}
                          className="rounded-full border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/66 hover:bg-white/[0.08] hover:text-white"
                        >
                          This is before
                        </Button>
                      ) : null}
                      {hasAfterOnly && shouldShowProofDetails ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPhotoSlotResolution("hood-before", "not-captured")
                          }
                          className="rounded-full border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffcfb5] hover:bg-[#ffb489]/14 hover:text-[#ffcfb5]"
                        >
                          Mark before not captured
                        </Button>
                      ) : null}
                      {hasBeforeOnly && shouldShowProofDetails ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => reassignPhoto("hood-before", "hood-after")}
                          className="rounded-full border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/66 hover:bg-white/[0.08] hover:text-white"
                        >
                          This is after
                        </Button>
                      ) : null}
                      {hasBeforeOnly && shouldShowProofDetails ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPhotoSlotResolution("hood-after", "not-captured")
                          }
                          className="rounded-full border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffcfb5] hover:bg-[#ffb489]/14 hover:text-[#ffcfb5]"
                        >
                          Mark after not captured
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {uploadedPhotoSlots.length > 0 ? (
                  <div
                    className={`mt-5 rounded-[24px] border border-[#b9d4c6]/20 bg-[#b9d4c6]/8 px-5 py-5 ${
                      shouldShowProofDetails ? "hidden md:block" : "hidden"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#cfe9da]">
                          Mapped photos
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {uploadedPhotoSlots.length} photo(s) already placed
                        </p>
                      </div>
                      <span className="rounded-full border border-[#b9d4c6]/24 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#cfe9da]">
                        Collapsed
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {uploadedPhotoSlots.map((slot) => {
                        const uploaded = uploadedFieldPhotos[slot.id];

                        if (!uploaded) {
                          return null;
                        }

                        return (
                          <div
                            key={slot.id}
                            data-mapped-photo-slot={slot.id}
                            data-photo-confidence={uploaded.confidence}
                            className="grid gap-3 rounded-[18px] border border-white/10 bg-black/14 px-3 py-3 sm:grid-cols-[56px_minmax(0,1fr)_150px] sm:items-center"
                          >
                            <div
                              className="h-12 overflow-hidden rounded-[12px] border border-white/10 bg-cover bg-center"
                              style={{ backgroundImage: `url(${uploaded.src})` }}
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-white">{slot.label}</p>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                    !isVendorConfirmedPhoto(uploaded)
                                      ? "border-[#ffb489]/30 bg-[#ffb489]/10 text-[#ffcfb5]"
                                      : "border-[#b9d4c6]/30 bg-[#b9d4c6]/12 text-[#cfe9da]"
                                  }`}
                                >
                                  {isVendorConfirmedPhoto(uploaded)
                                    ? isFastConfirmableSuggestedPhoto(uploaded)
                                      ? "AI attached"
                                      : "Vendor confirmed"
                                    : "Saved, not claimed"}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-xs leading-5 text-white/48">
                                {uploaded.name} - {uploaded.matchLabel}
                              </p>
                            </div>
                            <select
                              value={slot.id}
                              onChange={(event) =>
                                reassignPhoto(slot.id, event.target.value as FieldPhotoSlotId)
                              }
                              className="w-full rounded-full border border-white/12 bg-white px-3 py-2 text-xs font-semibold text-[#111315] outline-none"
                            >
                              {fieldPhotoSlots.map((targetSlot) => (
                                <option key={targetSlot.id} value={targetSlot.id}>
                                  Move to {targetSlot.shortLabel}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {shouldShowProofDetails ? (
                  <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035]">
                  <div className="hidden grid-cols-[86px_minmax(0,1fr)_172px_220px] border-b border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/38 xl:grid 2xl:hidden">
                    <span>Photo</span>
                    <span>Slot</span>
                    <span>Status</span>
                    <span className="text-right">Action</span>
                  </div>
                  {openPhotoSlots.length === 0 ? (
                    <div className="px-4 py-5">
                      <p className="text-sm font-semibold text-white">
                        No open photo slots in the working view.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/52">
                        Use Mapped photos to reassign photos, or show all slots if you need
                        to replace a placed image.
                      </p>
                    </div>
                  ) : null}
                  {openPhotoSlots.map((slot) => {
                    const uploaded = uploadedFieldPhotos[slot.id];
                    const resolution = photoSlotResolutions[slot.id];
                    const slotStatus = uploaded
                      ? isVendorConfirmedPhoto(uploaded)
                        ? isFastConfirmableSuggestedPhoto(uploaded)
                          ? "AI attached"
                          : "Vendor confirmed"
                        : "Saved, not claimed"
                      : resolution === "not-captured"
                        ? "Not captured"
                      : resolution === "not-applicable"
                        ? "N/A"
                      : slot.required
                        ? "Missing"
                        : "Recommended";
                    const slotStatusClass = uploaded
                      ? !isVendorConfirmedPhoto(uploaded)
                        ? "border-[#ffb489]/30 bg-[#ffb489]/10 text-[#ffcfb5]"
                        : "border-[#b9d4c6]/35 bg-[#b9d4c6]/12 text-[#cfe9da]"
                      : resolution !== "open"
                        ? "border-white/18 bg-white/[0.08] text-white/58"
                        : slot.required
                          ? "border-[#ffb489]/30 bg-[#ffb489]/10 text-[#ffb489]"
                          : "border-white/12 bg-white/[0.04] text-white/48";
                    const slotResolved = Boolean(uploaded) || resolution !== "open";

                    return (
                      <div
                        key={slot.id}
                        className="grid gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 xl:grid-cols-[86px_minmax(0,1fr)_172px_220px] xl:items-center 2xl:grid-cols-1 2xl:items-start"
                      >
                        <div className="flex items-center gap-3 xl:block 2xl:flex">
                          <div
                            className="relative h-14 w-16 overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.06] xl:w-full 2xl:w-16"
                            style={{
                              backgroundImage: uploaded ? `url(${uploaded.src})` : undefined,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }}
                          >
                            {!uploaded ? (
                              <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.12em] text-white/34">
                                {slot.proofId}
                              </div>
                            ) : null}
                          </div>
                          <Badge
                            variant="outline"
                            className="border-white/12 bg-white/[0.04] text-[10px] text-white/45 xl:mt-2 2xl:mt-0"
                          >
                            {slot.required ? "Core" : "Recommended"}
                          </Badge>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {slotResolved ? (
                              <IconCircleCheck className="h-4 w-4 text-[#cfe9da]" />
                            ) : (
                              <IconCircleDashed className="h-4 w-4 text-[#ffb489]" />
                            )}
                            <p className="text-sm font-semibold leading-5 text-white">
                              {slot.label}
                            </p>
                          </div>
                          <p className="mt-1 truncate text-xs leading-5 text-white/52">
                            {uploaded
                              ? `${uploaded.name} - ${uploaded.matchLabel}`
                              : resolution === "not-captured"
                                ? "Marked not captured. The report will not show a sample image for this slot."
                                : resolution === "not-applicable"
                                  ? "Marked not applicable for this visit."
                              : slot.caption}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={`px-2.5 py-1 text-[10px] ${slotStatusClass}`}
                          >
                            {slotStatus}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 xl:justify-end 2xl:justify-start">
                          {uploaded && !isVendorConfirmedPhoto(uploaded) ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => confirmPhotoSuggestion(slot.id)}
                                className="rounded-full border border-[#b9d4c6]/28 bg-[#b9d4c6]/12 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#cfe9da] hover:bg-[#b9d4c6]/18 hover:text-[#cfe9da]"
                              >
                                Confirm
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => rejectPhotoSuggestion(slot.id)}
                                className="rounded-full border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffcfb5] hover:bg-[#ffb489]/14 hover:text-[#ffcfb5]"
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                          {uploaded ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                void handlePhotoUpload(slot.id, undefined, "manual");
                              }}
                              className="rounded-full border border-white/12 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/62 hover:bg-white/[0.08] hover:text-white"
                            >
                              Clear
                            </Button>
                          ) : null}
                          {!uploaded && resolution === "open" ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  setPhotoSlotResolution(slot.id, "not-captured")
                                }
                                className="rounded-full border border-white/12 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/62 hover:bg-white/[0.08] hover:text-white"
                              >
                                Not captured
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  setPhotoSlotResolution(slot.id, "not-applicable")
                                }
                                className="rounded-full border border-white/12 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/62 hover:bg-white/[0.08] hover:text-white"
                              >
                                N/A
                              </Button>
                            </>
                          ) : null}
                          {!uploaded && resolution !== "open" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => setPhotoSlotResolution(slot.id, "open")}
                              className="rounded-full border border-white/12 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/62 hover:bg-white/[0.08] hover:text-white"
                            >
                              Reopen
                            </Button>
                          ) : null}
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111315]">
                            {uploaded ? "Replace" : "Set photo"}
                            <IconArrowRight className="h-3.5 w-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              aria-label={`Upload ${slot.shortLabel} photo`}
                              className="sr-only"
                              onChange={(event) => {
                                void handlePhotoUpload(
                                  slot.id,
                                  event.target.files?.[0],
                                  "manual",
                                );
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                ) : null}

                <div className="mt-5 hidden rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <IconCircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb489]" />
                    <p className="text-xs leading-5 text-white/58">
                      {isCompanyPlan
                        ? "Company mode applies saved company info and saves hosted reports to history."
                        : "Free preview output has no company logo/contact and is limited. Use the company version for live delivery under your name."}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {hasProofWorkStarted ? (
                    <button
                      type="button"
                      onClick={() => setShowProofDetails((current) => !current)}
                      className="rounded-full border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/62"
                    >
                      {shouldShowProofDetails ? "Hide roles" : "Review photos"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={proceedFromPhotoStep}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#111315]"
                  >
                    {photoStepPrimaryLabel}
                  </button>
                </div>
              </div>

              <div
                className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${
                  isOutputStep ? "hidden" : "hidden"
                }`}
              >
                <button
                  type="button"
                  onClick={resetBuilder}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset quick mode
                </button>
                <Button
                  type="button"
                  onClick={() => requestFreeReportOutput("print-pdf")}
                  className="rounded-full bg-[#111315] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-[#111315]/90"
                >
                  Print / save PDF
                </Button>
                <Button
                  type="button"
                  onClick={() => requestFreeReportOutput("copy-link")}
                  className="rounded-full bg-[#f26a21] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-[#d95d1d]"
                >
                  <Copy className="h-4 w-4" />
                  Copy report link
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        <div
          className={`min-w-0 space-y-4 ${
            isOutputStep
              ? ""
              : "hidden"
          }`}
        >
          <Panel className="px-4 py-4 print:border-0 print:bg-white print:p-0 print:shadow-none md:px-5 md:py-5">
            <div className="pdf-print-hide flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={labelClassName()}>
                  {reportStatusLabel}
                </p>
                {isOutputStep ? (
                  <h1
                    className="mt-3 font-display text-[1.38rem] font-bold leading-[1.02] tracking-[-0.045em] text-foreground md:text-[1.55rem] md:leading-[0.96] md:tracking-[-0.06em]"
                    data-axis-tool-page-heading
                  >
                    {reportHeadingText}
                  </h1>
                ) : (
                  <h2 className="mt-3 font-display text-[1.38rem] font-bold leading-[1.02] tracking-[-0.045em] text-foreground md:text-[1.55rem] md:leading-[0.96] md:tracking-[-0.06em]">
                    {reportHeadingText}
                  </h2>
                )}
              </div>
              <div className="hidden rounded-[16px] border border-black/10 bg-[rgba(17,17,17,0.03)] px-4 py-3 md:block">
                <p className={labelClassName()}>What happens next</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {closeoutFormatLabel}:{" "}
                  {!closeoutEngine.canGeneratePacket
                    ? "pick a result before sending."
                    : !jobBasicsReady
                      ? `add ${jobBasicsMissingLabel} before creating the link or PDF.`
                    : sendReadinessBlockers.length > 0
                      ? sendReadinessBlockers[0]
                    : values.scenario === "clean"
                      ? "completed result, customer note, and next visit window."
                      : `${activeJobPattern.label.toLowerCase()} with follow-up action visible.`}
                </p>
              </div>
            </div>
            <div className="pdf-print-hide mt-4 hidden md:block">
              <motion.section
                layout
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="axis-proof-console"
              >
                <div className="axis-proof-console-header">
                  <div className="axis-proof-console-title">
                    <span className="axis-proof-console-mark">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="axis-proof-eyebrow">
                        {closeoutEngine.canGeneratePacket && jobBasicsReady
                          ? "Generated from selected result"
                          : !jobBasicsReady
                            ? "Waiting on customer details"
                          : "Waiting on result confirmation"}
                      </span>
                      <span className="axis-proof-title">
                        {closeoutEngine.canGeneratePacket && jobBasicsReady
                          ? "Customer report, PDF, and follow-up outputs generated"
                          : !jobBasicsReady
                            ? "Add job basics to create the report"
                          : "Select the job result to build the report"}
                      </span>
                      <span className="axis-proof-subtitle">
                        {closeoutEngine.canGeneratePacket && jobBasicsReady
                          ? "Service report link, PDF copy, revisit or quote copy, and next-service text are derived from this same vendor-confirmed service record."
                          : !jobBasicsReady
                            ? "Customer, site, date, reviewer, and system details must be real before a link or PDF is generated."
                          : "Outputs stay locked until the vendor confirms what happened. Photos can organize the record, but they do not decide the final claim."}
                      </span>
                    </span>
                  </div>
                  <div className="axis-proof-counts" aria-label="Output status">
                    <span>
                      <strong>{generatedOutputReadyCount}</strong>
                      ready
                    </span>
                    <span>
                      <strong>{generatedOutputReviewCount}</strong>
                      review
                    </span>
                    <span>
                      <strong>{closeoutEngine.vendorSendReadinessWarnings.length}</strong>
                      checks
                    </span>
                  </div>
                </div>

                <div className="axis-proof-actionbar">
                  <button
                    type="button"
                    disabled={!canPreviewProofLink}
                    onClick={() => {
                      setReportOutputMode("link");
                      requestFreeReportOutput("copy-link");
                    }}
                    className={`axis-proof-action axis-proof-action-primary ${
                      reportOutputMode === "link" ? "is-active" : ""
                    }`}
                  >
                    <span className="axis-proof-action-icon">
                      <Copy className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="axis-proof-action-label">
                          Copy report link
                      </span>
                      <span className="axis-proof-action-copy">
                        {canPreviewProofLink
                          ? "Service report link copy from this service record."
                          : previewProofLinkLabel}
                      </span>
                    </span>
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={!canPreviewProofLink}
                    onClick={() => {
                      setReportOutputMode("pdf");
                      requestFreeReportOutput("print-pdf");
                    }}
                    className={`axis-proof-action ${
                      reportOutputMode === "pdf" ? "is-active" : ""
                    }`}
                  >
                    <span className="axis-proof-action-icon">
                      <FileDown className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="axis-proof-action-label">
                        Save service report PDF
                      </span>
                      <span className="axis-proof-action-copy">
                        PDF record from the same service record.
                      </span>
                    </span>
                  </button>
                </div>

                <div className="axis-proof-console-grid">
                  <section
                    className="axis-proof-panel axis-proof-basis-panel"
                    style={{ display: "none" }}
                  >
                    <div className="axis-proof-panel-head">
                      <p className="axis-proof-panel-label">Record basis</p>
                      <p>{closeoutFormatLabel}</p>
                    </div>
                    <div className="axis-proof-basis-list">
                      {reportDiagnosticCards.map((item) => (
                        <div
                          key={item.label}
                          className={`axis-proof-basis-row ${
                            item.wideOnPhone ? "is-primary" : ""
                          }`}
                        >
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                          {item.helper ? <small>{item.helper}</small> : null}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="axis-proof-panel">
                    <div className="axis-proof-panel-head">
                      <p className="axis-proof-panel-label">Service areas</p>
                      <p>Change status here; every output updates from the same service record.</p>
                    </div>
                    {quickCloseoutNoteNeedsPlacement && quickCloseoutNoteSignal ? (
                      <div
                        data-quick-note-placement="outputs"
                        className="mb-3 rounded-[14px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-3 text-[#111315]"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#a94410]">
                          Vendor note needs placement
                        </p>
                        <p className="mt-1 text-xs font-bold leading-5">
                          {quickCloseoutNoteSignal.title}
                        </p>
                        <button
                          type="button"
                          onClick={applyQuickCloseoutNoteSignal}
                          className="mt-2 inline-flex h-9 items-center justify-center rounded-full bg-[#111315] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                        >
                          {quickCloseoutNoteSignal.areaId
                            ? quickCloseoutNoteSignal.actionLabel
                            : "Pick area below"}
                        </button>
                      </div>
                    ) : null}
                    <div className="grid gap-2">
                      {scopeLedgerRows
                        .filter((row) => row.status !== "not-in-scope")
                        .map((row) => {
                          const statusMeta = getScopeStatusMeta(row.status);
                          const statusOptions = buildScopeStatusOptions(row);

                          return (
                            <label
                              key={`report-${row.id}`}
                              className="grid gap-2 rounded-[14px] border border-black/8 bg-white/72 px-3 py-2.5 text-[#111315]"
                            >
                              <span className="flex items-start justify-between gap-2">
                                <span className="min-w-0">
                                  <span className="block text-xs font-bold">
                                    {row.label}
                                  </span>
                                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                    {row.evidence === "photo"
                                      ? `${row.photoCount} photo`
                                      : row.evidence === "written"
                                        ? "Written only"
                                        : row.evidence === "unclear"
                                          ? "Needs review"
                                          : "No output"}
                                  </span>
                                </span>
                                <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${statusMeta.className}`}
                                >
                                  {statusMeta.chip}
                                </span>
                              </span>
                              <select
                                value={row.status}
                                onChange={(event) =>
                                  updateScopeAreaStatus(
                                    row.id,
                                    event.target.value as ScopeStatus,
                                  )
                                }
                                className="h-9 rounded-[12px] border border-black/10 bg-white px-2.5 text-[11px] font-bold text-foreground outline-none focus:border-[#f26a21]/45 focus:ring-2 focus:ring-[#f26a21]/12"
                              >
                                {statusOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        })}
                    </div>
                  </section>

                  <section
                    className="axis-proof-panel axis-proof-ledger-panel"
                    style={builderStep === "outputs" ? { order: -2 } : undefined}
                  >
                    <div className="axis-proof-panel-head">
                      <p className="axis-proof-panel-label">Output items</p>
                      <p>One service record, multiple customer, PDF, revisit, quote, and next-service uses.</p>
                    </div>
                    <div className="axis-output-ledger">
                      {closeoutEngine.generatedOutputs.map((output) => {
                        const readinessMeta = generatedOutputReadinessMeta(output.readiness);

                        return (
                          <div
                            key={output.kind}
                            className="axis-output-row"
                            data-readiness={output.readiness}
                          >
                            <span className="axis-output-icon">
                              <GeneratedOutputIcon kind={output.kind} />
                            </span>
                            <span className="axis-output-copy">
                              <strong>{output.label}</strong>
                              {output.reason ? <small>{output.reason}</small> : null}
                              {output.copy ? (
                                <small className="axis-output-draft">{output.copy}</small>
                              ) : null}
                            </span>
                            <span
                              className={`axis-readiness-pill ${readinessMeta.className}`}
                            >
                              {readinessMeta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section
                    className="axis-proof-panel"
                    style={builderStep === "outputs" ? { order: -1 } : undefined}
                  >
                    <div className="axis-proof-panel-head">
                      <p className="axis-proof-panel-label">Next cleaning / follow-up</p>
                      <p>Turns the same service record into rebook, revisit, quote, or monitor action.</p>
                    </div>
                    <div className="axis-output-ledger">
                      {nextActionRows.map((item) => {
                        const readinessMeta = generatedOutputReadinessMeta(item.state);

                        return (
                          <div
                            key={item.label}
                            className="axis-output-row"
                            data-readiness={item.state}
                          >
                            <span className="axis-output-icon">
                              <CalendarClock className="h-4 w-4" />
                            </span>
                            <span className="axis-output-copy">
                              <strong>{item.label}</strong>
                              <small>{item.copy}</small>
                            </span>
                            <span
                              className={`axis-readiness-pill ${readinessMeta.className}`}
                            >
                              {readinessMeta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <aside
                    className="axis-proof-panel axis-proof-warning-rail"
                    style={{ display: "none" }}
                  >
                    <div className="axis-proof-panel-head">
                      <p className="axis-proof-panel-label">Private check</p>
                      <p>Private to the vendor; customer outputs use calm record language.</p>
                    </div>
                    <div className="axis-warning-lead">
                      <TriangleAlert className="h-4 w-4" />
                      <span>{engineWarningLabel}</span>
                    </div>
                    {closeoutEngine.vendorSendReadinessWarnings.length > 0 ? (
                      <div className="axis-warning-list">
                        {closeoutEngine.vendorSendReadinessWarnings.slice(0, 5).map((warning) => {
                          const warningMeta = vendorWarningMeta(warning.severity);

                          return (
                            <div
                              key={`${warning.kind}-${warning.proofAreaId ?? "record"}`}
                              className="axis-warning-row"
                            >
                              <div>
                                <strong>{warning.title}</strong>
                                <small>{warning.copy}</small>
                              </div>
                              <span
                                className={`axis-readiness-pill ${warningMeta.className}`}
                              >
                                {warningMeta.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </aside>
                </div>

                {!closeoutEngine.canGeneratePacket ? (
                  <div className="axis-proof-blocking-note">
                    {closeoutEngine.blockingReason}
                  </div>
                ) : null}
              </motion.section>
            </div>
            <motion.div
              layout
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`pdf-print-hide mt-3 flex flex-col overflow-hidden rounded-[22px] border px-3.5 py-3.5 md:hidden ${mobileReportStatusClass}`}
              data-mobile-report-ready
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-[14px] ${mobileReportIconClass}`}
                >
                  {reportNeedsPhotoReview ? (
                    <TriangleAlert className="h-4 w-4" />
                  ) : (
                    <IconCircleCheck className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
                    Service report
                  </p>
                  <h3 className="mt-1 text-base font-bold leading-tight tracking-[-0.03em]">
                    {mobileReportStatus.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 opacity-75">
                    {mobileReportStatus.copy}
                  </p>
                </div>
              </div>
              <div className="order-4 mt-3 rounded-[18px] border border-black/8 bg-white/78 p-3 text-[#111315]">
                <div className="flex items-center justify-between gap-3 px-1 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Area status
                  </p>
                  <span className="rounded-full bg-[#111315] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    Report
                  </span>
                </div>
                <div className="grid gap-2">
                  {scopeLedgerRows
                    .filter((row) => row.status !== "not-in-scope")
                    .slice(0, 5)
                    .map((row) => {
                      const statusMeta = getScopeStatusMeta(row.status);
                      const statusOptions = buildScopeStatusOptions(row);

                      return (
                        <label
                          key={`mobile-report-${row.id}`}
                          className="grid gap-2 rounded-[14px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-2.5"
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="min-w-0 text-xs font-bold text-foreground">
                              {row.shortLabel}
                            </span>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${statusMeta.className}`}
                            >
                              {statusMeta.chip}
                            </span>
                          </span>
                          <select
                            value={row.status}
                            onChange={(event) =>
                              updateScopeAreaStatus(
                                row.id,
                                event.target.value as ScopeStatus,
                              )
                            }
                            className="h-9 rounded-[12px] border border-black/10 bg-white px-2.5 text-[11px] font-bold text-foreground outline-none focus:border-[#f26a21]/45 focus:ring-2 focus:ring-[#f26a21]/12"
                          >
                            {statusOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    })}
                </div>
              </div>
              <div className="order-5 mt-3 rounded-[18px] border border-black/8 bg-white/78 p-3">
                <div className="flex items-center justify-between gap-3 px-1 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Customer-safe copy
                  </p>
                  <span className="rounded-full bg-[#111315] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    {reportOutputMode === "link" ? "Link" : "PDF"}
                  </span>
                </div>
                <div className="grid gap-2">
                  {generatedCustomerLines.slice(0, 3).map((item) => {
                    const isEditing =
                      activeCustomerLineEditor === item.editor &&
                      activeCustomerLineEditorSurface === "ready";

                    return (
                      <div key={item.label}>
                  <button
                    type="button"
                          onClick={() => selectCustomerLineEditor(item.editor, "ready")}
                    className="group w-full rounded-[16px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-2.5 text-left transition active:scale-[0.995]"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                              {item.label}
                      </span>
                      <span className="tool-edit-chip shrink-0">
                        <PencilLine className="h-3 w-3" />
                              {isEditing ? "Adjusting" : "Adjust"}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold leading-5 text-foreground">
                            {item.value}
                    </span>
                    <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/80">
                            {item.source}
                    </span>
                  </button>
                        {isEditing ? (
                          <div className="mt-2 rounded-[14px] border border-black/8 bg-white px-3 py-3">
                            {renderInlineCustomerLineEditor(item.editor, "ready")}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="order-2 mt-3 rounded-[18px] border border-black/8 bg-white/78 p-3">
                <div className="flex items-center justify-between gap-3 px-1 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Output items
                  </p>
                  <span className="rounded-full bg-[#111315] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    {generatedOutputReadyCount} ready
                  </span>
                </div>
                <div className="grid gap-2">
                  {closeoutEngine.generatedOutputs.map((output) => {
                    const readinessMeta = generatedOutputReadinessMeta(output.readiness);

                    return (
                      <div
                        key={output.kind}
                        className="axis-output-row rounded-[14px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-2"
                        data-readiness={output.readiness}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 text-xs font-bold text-foreground">
                            {output.label}
                          </span>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${readinessMeta.className}`}
                          >
                            {readinessMeta.label}
                          </span>
                        </div>
                        {output.copy ? (
                          <p className="mt-1.5 text-[11px] font-semibold leading-4 text-muted-foreground">
                            {output.copy}
                          </p>
                        ) : output.reason ? (
                          <p className="mt-1.5 text-[11px] font-semibold leading-4 text-muted-foreground">
                            {output.reason}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {closeoutEngine.vendorSendReadinessWarnings.length > 0 ? (
                  <p className="mt-2 rounded-[14px] border border-[#f26a21]/20 bg-[#fff7ef] px-3 py-2 text-[11px] font-semibold leading-4 text-[#a94410]">
                    {closeoutEngine.vendorSendReadinessWarnings[0].copy}
                  </p>
                ) : null}
              </div>
              <div className="order-3 mt-3 rounded-[18px] border border-black/8 bg-white/78 p-3">
                <div className="flex items-center justify-between gap-3 px-1 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Next actions
                  </p>
                  <span className="rounded-full bg-[#111315] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    Follow-up
                  </span>
                </div>
                <div className="grid gap-2">
                  {nextActionRows.map((item) => {
                    const readinessMeta = generatedOutputReadinessMeta(item.state);

                    return (
                      <div
                        key={`mobile-${item.label}`}
                        className="axis-output-row rounded-[14px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-2"
                        data-readiness={item.state}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-foreground">
                              {item.label}
                            </span>
                            <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                              {item.copy}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${readinessMeta.className}`}
                          >
                            {readinessMeta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <SegmentedControl
                type="single"
                value={reportOutputMode}
                onValueChange={(value) => {
                  if (value === "link" || value === "pdf") {
                    setReportOutputMode(value);
                  }
                }}
                className="tool-segmented-control order-6 mt-3 rounded-full bg-white/72"
              >
                <SegmentedControlItem value="link" className="tool-segmented-item rounded-full text-[11px]">
                  Report link
                </SegmentedControlItem>
                <SegmentedControlItem value="pdf" className="tool-segmented-item rounded-full text-[11px]">
                  Service report PDF
                </SegmentedControlItem>
              </SegmentedControl>
              <div className="order-7 mt-2.5 flex items-center justify-between gap-3">
                <p className="min-w-0 text-[11px] leading-4 opacity-70">
                  {reportOutputMode === "link"
                    ? isCompanyPlan
                      ? "Copy creates a branded service report link from this service record."
                      : "Copy creates an unbranded 7-day test report link from this service record."
                    : isCompanyPlan
                      ? "Company PDFs are clean copies without the free watermark."
                      : "Free builder PDFs are watermarked test copies."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (reportNeedsPhotoReview) {
                      openMobileSheet("photo-review");
                      return;
                    }

                    if (reportOutputMode === "link") {
                      requestFreeReportOutput("copy-link");
                      return;
                    }

                    openMobileSheet("report-actions");
                  }}
                  className="tool-action-btn tool-action-dark tool-action-mini shrink-0"
                >
                  {reportOutputMode === "pdf" ? (
                    <FileDown className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {mobileReportInlineActionLabel}
                </button>
              </div>
            </motion.div>
            <div
              className={`pdf-print-hide mt-4 hidden min-w-0 items-start gap-4 md:grid ${
                isOutputStep
                  ? ""
                  : "xl:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]"
              }`}
            >
              <div
                className={`rounded-[22px] border border-black/8 bg-[rgba(17,17,17,0.02)] px-4 py-4 ${
                  isOutputStep ? "hidden" : ""
                }`}
              >
                {isOutputStep ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className={labelClassName()}>{reportStatusLabel}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Review the service report link, then copy it or save the PDF.
                          The same customer-line edits update both link and PDF previews.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {activeJobPattern.label}
                        </span>
                        <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {values.cadence} days
                        </span>
                        {values.scenario === "exception" ? (
                          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {selectedAccessCount} access / {selectedConditionCount} condition
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {!showWordingEditor ? (
                      <div className="mt-4 overflow-hidden rounded-[20px] border border-[#f26a21]/18 bg-[#fff7ef]">
                        <div className="border-b border-[#f0dfd1] bg-white/55 px-4 py-3">
                          <p className={labelClassName()}>Service report link</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Built from your selected result. Send as-is, or edit one line.
                          </p>
                        </div>
                        <div className="grid gap-2 px-3 py-3">
                          {generatedCustomerLines.map((item) => {
                            const isEditing =
                              activeCustomerLineEditor === item.editor &&
                              activeCustomerLineEditorSurface === "ready";

                            return (
                            <article
                              key={item.label}
                              className={`group rounded-[18px] border px-3 py-3 transition hover:border-[#f26a21]/24 hover:bg-white hover:shadow-[0_14px_32px_rgba(17,19,21,0.08)] ${
                                isEditing
                                  ? "border-[#f26a21]/35 bg-white"
                                  : "border-transparent bg-white/78"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => selectCustomerLineEditor(item.editor, "ready")}
                                className="block w-full text-left"
                              >
                                <span className="flex items-start justify-between gap-3">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                    {item.label}
                                  </span>
                                  <span className="tool-edit-chip shrink-0">
                                    <PencilLine className="h-3 w-3" />
                                    {isEditing ? "Editing" : item.action}
                                  </span>
                                </span>
                                <span className="mt-1.5 block text-sm font-bold leading-5 text-foreground">
                                  {item.value}
                                </span>
                                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                                  {item.source}
                                </span>
                              </button>
                              {isEditing ? (
                                <div className="mt-3 border-t border-[#f0dfd1] pt-3">
                                  {renderInlineCustomerLineEditor(item.editor, "ready")}
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-[#f0dfd1] bg-white/62 px-4 py-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => requestFreeReportOutput("copy-link")}
                            className="tool-action-btn tool-action-primary tool-action-mini"
                          >
                            <Copy className="h-3.5 w-3.5" />
                      Copy report link
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => requestFreeReportOutput("print-pdf")}
                            className="tool-action-btn tool-action-dark tool-action-mini"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            Save PDF
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowWordingEditor(true)}
                            className="tool-action-btn tool-action-secondary tool-action-mini"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            Edit customer-safe copy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 rounded-[18px] border border-[#f26a21]/18 bg-[#fff7ef] px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={labelClassName()}>Edit customer line</p>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                Optional. Leave blank to keep the default line.
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowWordingEditor(false)}
                              className="tool-action-btn tool-action-secondary tool-action-mini"
                            >
                              <IconCircleCheck className="h-3.5 w-3.5" />
                              Done
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-4">
                      <div>
                        <label className={labelClassName()} htmlFor="previewSummaryOverride">
                          Result sentence
                        </label>
                        <textarea
                          id="previewSummaryOverride"
                          rows={2}
                          className={fieldClassName()}
                          maxLength={textFieldLimits.summaryOverride}
                          placeholder="Optional. Replaces the top result sentence."
                          {...form.register("summaryOverride")}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Shows in: Today&apos;s result.
                          </p>
                          <CharacterCount
                            value={values.summaryOverride}
                            max={textFieldLimits.summaryOverride}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClassName()} htmlFor="previewCustomerActionOverride">
                          Customer instruction
                        </label>
                        <textarea
                          id="previewCustomerActionOverride"
                          rows={2}
                          className={fieldClassName()}
                          maxLength={textFieldLimits.customerActionOverride}
                          placeholder="Optional. Replaces what the customer should do next."
                          {...form.register("customerActionOverride")}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Shows in: What to do next.
                          </p>
                          <CharacterCount
                            value={values.customerActionOverride}
                            max={textFieldLimits.customerActionOverride}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClassName()} htmlFor="previewFollowUpOverride">
                          Report status note
                        </label>
                        <textarea
                          id="previewFollowUpOverride"
                          rows={2}
                          className={fieldClassName()}
                          maxLength={textFieldLimits.followUpOverride}
                          placeholder="Optional. Replaces the condition or office-note sentence."
                          {...form.register("followUpOverride")}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Shows in: Report status / condition detail.
                          </p>
                          <CharacterCount
                            value={values.followUpOverride}
                            max={textFieldLimits.followUpOverride}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClassName()} htmlFor="previewRecordNoteOverride">
                          PDF copy note
                        </label>
                        <textarea
                          id="previewRecordNoteOverride"
                          rows={2}
                          className={fieldClassName()}
                          maxLength={textFieldLimits.recordNoteOverride}
                          placeholder="Optional. Replaces the record-note body under the service report PDF."
                          {...form.register("recordNoteOverride")}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Shows in: Record note.
                          </p>
                          <CharacterCount
                            value={values.recordNoteOverride}
                            max={textFieldLimits.recordNoteOverride}
                          />
                        </div>
                      </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div>
                    <p className={labelClassName()}>Live preview</p>
                    <h3 className="mt-2 font-display text-[1.35rem] font-bold leading-[0.95] tracking-[-0.055em] text-foreground">
                      Review first. Change only the customer lines.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Customer wording comes from the job facts. If one sentence
                      sounds wrong, edit the result, instruction, or recorded
                      note before printing.
                    </p>
                    <div className="mt-4 grid gap-2">
                      {[
                        ["Job", activeJobPattern.label],
                        [
                          "Photos",
                          `${uploadedProofCount} placed / ${unplacedFieldPhotos.length} extra`,
                        ],
                        ["Next", `${selectedCadenceOption.label} cadence`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 border-t border-black/8 py-2.5 text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => selectBuilderStep("outputs")}
                      className="mt-4 rounded-full bg-[#111315] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                    >
                      Edit customer wording
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden rounded-[22px] border border-black/8 bg-[rgba(17,17,17,0.02)] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={labelClassName()}>Service report link vs PDF</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Switch between the two outputs vendors need: a customer
                      service report link for the next action and a PDF copy for
                      archive, submission, or later requests.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => requestFreeReportOutput("copy-link")}
                      className="tool-action-btn tool-action-primary tool-action-mini"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy report link
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => requestFreeReportOutput("open-link")}
                      className="tool-action-btn tool-action-secondary tool-action-mini"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open link
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => requestFreeReportOutput("print-pdf")}
                      className="tool-action-btn tool-action-dark tool-action-mini"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Save PDF layout
                    </Button>
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Web link preview
                    </span>
                  </div>
                </div>
                <div className="mt-4 rounded-[18px] border border-black/8 bg-white px-4 py-4">
                  <div className="flex flex-col gap-4">
                    <SegmentedControl
                      type="single"
                      value={reportOutputMode}
                      onValueChange={(value) => {
                        if (value === "link" || value === "pdf") {
                          setReportOutputMode(value);
                        }
                      }}
                      className="tool-segmented-control rounded-full"
                    >
                      <SegmentedControlItem value="link" className="tool-segmented-item rounded-full text-xs">
                        Service report link
                      </SegmentedControlItem>
                      <SegmentedControlItem value="pdf" className="tool-segmented-item rounded-full text-xs">
                        Service report PDF
                      </SegmentedControlItem>
                    </SegmentedControl>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        [
                          "Service report link",
                          "Primary output",
                          "Web report - best for customer clarity, follow-up items, and reply.",
                        ],
                        [
                          "PDF / print",
                          "PDF copy",
                          "Formal service report PDF - best for archive, attachment, print, and outside record requests.",
                        ],
                      ].map(([label, value, copy]) => {
                        const isActive =
                          (label === "Service report link" && reportOutputMode === "link") ||
                          (label === "PDF / print" && reportOutputMode === "pdf");

                        return (
                        <button
                          type="button"
                          key={label}
                          onClick={() =>
                            setReportOutputMode(
                              label === "Service report link" ? "link" : "pdf",
                            )
                          }
                          className={`rounded-[18px] border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(17,19,21,0.08)] ${
                            isActive
                              ? "border-[#f26a21]/35 bg-[#fff7ef] shadow-[0_12px_26px_rgba(242,106,33,0.08)]"
                              : "border-black/8 bg-[#fbf8f3] hover:border-black/14"
                          }`}
                        >
                          <p className={labelClassName()}>{label}</p>
                          <p className="mt-1 text-sm font-bold tracking-[-0.03em] text-foreground">
                            {value}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {copy}
                          </p>
                        </button>
                        );
                      })}
                    </div>
                    <div className="rounded-[16px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className={labelClassName()}>
                            {isCompanyPlan ? "Company service report link" : "Free test link"}
                          </p>
                          <p className="mt-1 text-sm font-bold tracking-[-0.03em] text-foreground">
                            {isCompanyPlan
                              ? "Useful for sending the branded report and keeping it in history."
                              : "Useful for trying the report before a company version."}
                          </p>
                          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                            {isCompanyPlan
                              ? "This saves the current service report as a hosted branded link in account history."
                              : "This saves an unbranded 7-day test link with no company logo/contact."}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => requestFreeReportOutput("copy-link")}
                            className="tool-action-btn tool-action-primary tool-action-mini"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy link
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => requestFreeReportOutput("open-link")}
                            className="tool-action-btn tool-action-secondary tool-action-mini"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <p className={labelClassName()}>PDF detail options</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          These switches control the service report PDF only.
                          The service report link keeps the web layout.
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <SegmentedControl
                          type="single"
                          value={packetPresentationMode}
                          onValueChange={(value) => {
                            if (value === "short" || value === "standard") {
                              applyPacketPresentationMode(value);
                            }
                          }}
                          className="tool-segmented-control w-full rounded-full sm:w-[220px]"
                        >
                          <SegmentedControlItem
                            value="standard"
                            className="tool-segmented-item rounded-full text-xs"
                          >
                            Full PDF
                          </SegmentedControlItem>
                          <SegmentedControlItem
                            value="short"
                            className="tool-segmented-item rounded-full text-xs"
                          >
                            Short PDF
                          </SegmentedControlItem>
                        </SegmentedControl>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {packetSectionControls.map((section) => (
                        <label
                          key={section.key}
                          className="flex min-w-0 items-center justify-between gap-3 rounded-[16px] border border-black/8 bg-[#fbf8f3] px-3 py-2.5"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">
                              {section.label}
                            </span>
                            <span className="block text-[11px] leading-4 text-muted-foreground">
                              {section.copy}
                            </span>
                          </span>
                          <Switch
                            checked={packetSections[section.key]}
                            onCheckedChange={(checked) =>
                              togglePacketSection(section.key, checked)
                            }
                            aria-label={`Show ${section.label}`}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={useSimpleWording}
                        className="tool-action-btn tool-action-dark tool-action-mini"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Use shorter wording
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={restoreAutoWording}
                        className="tool-action-btn tool-action-secondary tool-action-mini"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore recommended copy
                      </Button>
                    </div>
                  </div>
                </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-5">
                  {[
                    [
                      "Record type",
                      closeoutEngine.recordFormat.label,
                    ],
                    [
                      "Record basis",
                      claimLevelLabel,
                    ],
                    [
                      "Photo coverage",
                      closeoutEngine.proofCoverage.shortLabel,
                    ],
                    [
                      "Primary action",
                      enginePrimaryCtaLabel,
                    ],
                    [
                      "Record note",
                      closeoutEngine.warnings.length > 0
                        ? `${closeoutEngine.warnings.length} note(s)`
                        : "No record note",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[16px] border border-black/8 bg-white px-4 py-3"
                    >
                      <p className={labelClassName()}>{label}</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 overflow-hidden rounded-[18px] border border-black/8 bg-white">
                  <div className="flex items-start justify-between gap-4 border-b border-black/8 px-4 py-3">
                    <div>
                      <p className={labelClassName()}>Photo placement</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Before/after is a quick start. Fix the final role here before sending.
                      </p>
                    </div>
                    <span className="rounded-full border border-black/10 bg-[#f6f1e8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Move to
                    </span>
                  </div>
                  <PhotoPlacementReview
                    uploadedPhotoSlots={uploadedPhotoSlots}
                    uploadedFieldPhotos={uploadedFieldPhotos}
                    unplacedPhotos={unplacedFieldPhotos}
                    onMove={reassignPhoto}
                    onPlaceExtra={placeUnplacedPhoto}
                    onConfirmSuggestion={confirmPhotoSuggestion}
                    onRejectSuggestion={rejectPhotoSuggestion}
                  />
                </div>
              </div>
            </div>
            <div
              className={`mt-4 min-w-0 rounded-[26px] border p-3 print:border-0 print:bg-white print:p-0 ${
                reportOutputMode === "pdf"
                  ? "border-black/10 bg-[#d8d0c7] md:p-5"
                  : "border-black/8 bg-[rgba(17,17,17,0.02)]"
              }`}
              data-output-preview={reportOutputMode}
            >
              <div className="pdf-print-hide mb-3 flex flex-col gap-3 rounded-[22px] border border-black/8 bg-white/90 px-3.5 py-3 shadow-[0_12px_34px_rgba(17,17,17,0.06)] md:flex-row md:items-center md:justify-between md:px-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={labelClassName()}>
                      {reportOutputMode === "link" ? "Service report link preview" : "Service report PDF preview"}
                    </p>
                    <span className="rounded-full border border-[#f26a21]/20 bg-[#fff7ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b94d11]">
                      {reportOutputMeta.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold tracking-[-0.035em] text-foreground">
                    {reportOutputMeta.title}
                  </p>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground md:max-w-xl">
                    {reportOutputMeta.copy}
                  </p>
                  <div className="mt-2 grid gap-1 text-[11px] font-semibold leading-4 text-muted-foreground">
                    <p>
                      <span className="text-foreground">Current mode:</span>{" "}
                      {productPolicy.brandingPolicy}; {productPolicy.linkPolicy};{" "}
                      {productPolicy.pdfPolicy}; {productPolicy.historyPolicy}.
                    </p>
                    <p>
                      <span className="text-foreground">
                        {isCompanyPlan ? "Company version:" : "Upgrade unlocks:"}
                      </span>{" "}
                      {isCompanyPlan
                        ? "saved branding, clean PDF, live report links while subscribed, and account history."
                        : "saved company details, clean PDF, live service report links while subscribed, and report history."}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isAuthenticated) {
                          selectProductPlan("company");
                          return;
                        }

                        requestPaidFeature("branding");
                      }}
                      className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#f26a21]/24 bg-[#fff7ef] px-3 text-[10px] font-black uppercase tracking-[0.13em] text-[#b94d11] transition hover:bg-[#ffe9d8]"
                    >
                      {isAuthenticated ? "Use saved company info" : "Add company info"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAuthenticated) {
                          window.location.href = "/dashboard";
                          return;
                        }

                        requestPaidFeature("history");
                      }}
                      className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[10px] font-black uppercase tracking-[0.13em] text-foreground transition hover:bg-[#fbf7ef]"
                    >
                      Report history
                    </button>
                  </div>
                </div>
                <SegmentedControl
                  type="single"
                  value={reportOutputMode}
                  onValueChange={(value) => {
                    if (value === "link" || value === "pdf") {
                      setReportOutputMode(value);
                    }
                  }}
                  className="tool-segmented-control shrink-0 rounded-full md:w-[280px]"
                >
                  <SegmentedControlItem value="link" className="tool-segmented-item rounded-full text-xs">
                    Report link
                  </SegmentedControlItem>
                  <SegmentedControlItem value="pdf" className="tool-segmented-item rounded-full text-xs">
                    Service report PDF
                  </SegmentedControlItem>
                </SegmentedControl>
              </div>
              {lastSavedReportLink ? (
                <div className="pdf-print-hide mb-3 rounded-[18px] border border-[#2c7a3f]/20 bg-[#f0f8ef] px-3.5 py-3 md:px-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={labelClassName()}>{lastSavedReportLinkLabel}</p>
                        <span className="rounded-full border border-[#2c7a3f]/20 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1f6330]">
                          Generated
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#1f6330]">
                        {lastSavedReportLinkCopy}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <a
                        href={lastSavedReportLink.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#111315] px-3 text-[10px] font-black uppercase tracking-[0.13em] text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open report
                      </a>
                      <button
                        type="button"
                        onClick={() => void copySavedReportUrl(lastSavedReportLink)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-3 text-[10px] font-black uppercase tracking-[0.13em] text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy again
                      </button>
                    </div>
                  </div>
                  <input
                    aria-label="Generated service report link"
                    readOnly
                    value={lastSavedReportLink.url}
                    onFocus={(event) => event.currentTarget.select()}
                    className="mt-3 h-10 w-full min-w-0 rounded-[14px] border border-[#2c7a3f]/18 bg-white px-3 font-mono text-[11px] font-semibold text-foreground outline-none"
                  />
                </div>
              ) : null}
              <div
                className={`min-w-0 border bg-white ${
                  reportOutputMode === "pdf"
                    ? "tool-pdf-paper-shell mx-auto w-fit max-w-full overflow-x-auto rounded-[18px] border-black/12 p-0 shadow-[0_28px_90px_rgba(17,17,17,0.22)]"
                    : "tool-link-preview-shell overflow-x-auto rounded-[24px] border-black/10 p-2 md:p-3"
                }`}
              >
                <div
                  className={
                    reportOutputMode === "pdf"
                      ? "tool-pdf-document-stage relative flex min-w-0 justify-center"
                      : "min-w-0"
                  }
                >
                  <Axis1PacketDocument
                    data={previewPacket}
                    className={
                      reportOutputMode === "pdf"
                        ? "tool-pdf-document-preview"
                        : "tool-link-document-preview"
                    }
                    variant="customer-report"
                    heroHeadingLevel="h2"
                    outputIntent={
                      reportOutputMode === "pdf"
                        ? "service-record"
                        : "customer-link"
                    }
                    watermarkLabel={
                      reportOutputMode === "pdf" && !isCompanyPlan
                        ? productPolicy.watermarkLabel
                        : undefined
                    }
                    presentationMode={activePreviewPresentationMode}
                    visibleSections={activePreviewSections}
                    editConfig={customerPreviewEditConfig}
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
      <Drawer
        open={mobileSheet !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMobileSheet(null);
          }
        }}
      >
        <DrawerContent className="md:hidden">
          {mobileSheet === "photo-review" ? (
            <>
              <DrawerHeader className="px-4 pb-2 pt-4">
                <DrawerTitle className="text-[1.45rem]">Job photos</DrawerTitle>
                <DrawerDescription className="text-xs leading-5">
                  Phone filenames are ignored. Attach uncertain photos only when they support this report.
                </DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 overflow-y-auto px-3 pb-3">
                <div className="overflow-hidden rounded-[22px] border border-black/8 bg-white">
                  <PhotoPlacementReview
                    uploadedPhotoSlots={uploadedPhotoSlots}
                    uploadedFieldPhotos={uploadedFieldPhotos}
                    unplacedPhotos={unplacedFieldPhotos}
                    onMove={reassignPhoto}
                    onPlaceExtra={placeUnplacedPhoto}
                    onConfirmSuggestion={confirmPhotoSuggestion}
                    onRejectSuggestion={rejectPhotoSuggestion}
                    mobileSheetMode
                  />
                </div>
              </div>
              <DrawerFooter className="px-4 py-3">
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="h-11 rounded-[16px] border border-black/10 bg-[#f6f1e8] text-[11px] font-bold uppercase tracking-[0.12em] text-foreground"
                  >
                    Close
                  </button>
                </DrawerClose>
                <button
                  type="button"
                  onClick={() => {
                    if (hasSuggestedPhotoRoles) {
                      confirmAutoPlacedPhotoRoles();
                      return;
                    }

                    setMobileSheet(null);
                    selectBuilderStep("outputs");
                  }}
                  className="h-11 rounded-[16px] bg-[#111315] text-[11px] font-bold uppercase tracking-[0.12em] text-white"
                >
                  {hasSuggestedPhotoRoles ? "Accept AI attachments" : previewProofLinkLabel}
                </button>
              </DrawerFooter>
            </>
          ) : null}

          {mobileSheet === "report-actions" ? (
            <>
              <DrawerHeader>
                <DrawerTitle>PDF / print options</DrawerTitle>
                <DrawerDescription>
                  The service report link is for delivery. Print / save creates the
                  service report PDF.
                </DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 overflow-y-auto px-4 pb-4">
                <div className="rounded-[22px] border border-black/8 bg-white px-4 py-4">
                  <p className={labelClassName()}>PDF detail level</p>
                  <SegmentedControl
                    type="single"
                    value={packetPresentationMode}
                    onValueChange={(value) => {
                      if (value === "short" || value === "standard") {
                        applyPacketPresentationMode(value);
                      }
                    }}
                    className="mt-3 w-full rounded-full"
                  >
                    <SegmentedControlItem value="standard" className="rounded-full text-xs">
                      Full PDF
                    </SegmentedControlItem>
                    <SegmentedControlItem value="short" className="rounded-full text-xs">
                      Short PDF
                    </SegmentedControlItem>
                  </SegmentedControl>
                  <div className="mt-3 rounded-[16px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-2.5">
                    <p className="text-xs leading-5 text-muted-foreground">
                      {isCompanyPlan
                        ? "Company mode saves this service report as a hosted branded link and account history record."
                        : "Free mode creates an unbranded 7-day test link. Browser-only fallback is used only if the API is unreachable."}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => requestFreeReportOutput("copy-link")}
                    className="tool-action-btn tool-action-primary h-11 px-3"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy report link
                  </button>
                  <button
                    type="button"
                    onClick={() => requestFreeReportOutput("open-link")}
                    className="tool-action-btn tool-action-secondary h-11 px-3"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open link
                  </button>
                </div>
                <div className="mt-3 grid gap-2">
                  {packetSectionControls.map((section) => (
                    <label
                      key={section.key}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-[18px] border border-black/8 bg-white px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          {section.label}
                        </span>
                        <span className="block text-xs leading-5 text-muted-foreground">
                          {section.copy}
                        </span>
                      </span>
                      <Switch
                        checked={packetSections[section.key]}
                        onCheckedChange={(checked) =>
                          togglePacketSection(section.key, checked)
                        }
                        aria-label={`Show ${section.label}`}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={useSimpleWording}
                    className="tool-action-btn tool-action-dark h-11 px-3"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Short copy
                  </button>
                  <button
                    type="button"
                    onClick={restoreAutoWording}
                    className="tool-action-btn tool-action-secondary h-11 px-3"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </button>
                </div>
              </div>
              <DrawerFooter>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSheet(null);
                    selectBuilderStep("photos");
                  }}
                  className="tool-action-btn tool-action-secondary h-12"
                >
                  Back to service photos
                </button>
                <button
                  type="button"
                  onClick={() => requestFreeReportOutput("print-pdf")}
                  className="tool-action-btn tool-action-primary h-12"
                >
                  <FileDown className="h-4 w-4" />
                  Save PDF
                </button>
              </DrawerFooter>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
      <AnimatePresence>
        {paidFeatureNotice ? (
          <motion.div
            className="pdf-print-hide fixed inset-0 z-50 grid place-items-end bg-[#111315]/42 px-3 py-3 backdrop-blur-sm sm:place-items-center sm:px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paid-feature-notice-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close paid feature notice"
              onClick={() => setPaidFeatureNotice(null)}
            />
            <motion.div
              initial={{ y: 22, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/14 bg-[#fbf8f3] p-4 shadow-[0_34px_100px_rgba(17,19,21,0.34)] sm:p-5"
            >
              <div className="rounded-[22px] border border-black/8 bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className={labelClassName()}>{paidFeatureMeta.eyebrow}</p>
                <h2
                  id="paid-feature-notice-title"
                  className="mt-2 font-display text-[1.85rem] font-bold leading-[0.92] tracking-[-0.065em] text-foreground sm:text-[2.25rem]"
                >
                  {paidFeatureMeta.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {paidFeatureMeta.copy}
                </p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  ["Free", "Unbranded 7-day link and watermarked PDF."],
                  [
                    "Account",
                    "Login identifies you, but company features still require a subscription.",
                  ],
                  [
                    "Company version",
                    "Saved company info, clean PDF, branded live service report links, and history.",
                  ],
                ].map(([label, copy]) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-black/8 bg-white px-4 py-3"
                  >
                    <p className={labelClassName()}>{label}</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-foreground">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setPaidFeatureNotice(null)}
                  className="h-11 rounded-[16px] border border-black/10 bg-[#f6f1e8] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground"
                >
                  Keep using free builder
                </button>
                <a
                  href={paidFeatureHref}
                  className="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#111315] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                >
                  {paidFeatureCtaLabel}
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {setupNoticeAction ? (
          <motion.div
            className="pdf-print-hide fixed inset-0 z-50 grid place-items-end bg-[#111315]/42 px-3 py-3 backdrop-blur-sm sm:place-items-center sm:px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="free-output-notice-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close output notice"
              onClick={() => setSetupNoticeAction(null)}
            />
            <motion.div
              initial={{ y: 22, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/14 bg-[#fbf8f3] p-4 shadow-[0_34px_100px_rgba(17,19,21,0.34)] sm:p-5"
            >
              <div className="rounded-[22px] border border-black/8 bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className={labelClassName()}>{setupNoticeMeta.eyebrow}</p>
                <h2
                  id="free-output-notice-title"
                  className="mt-2 font-display text-[1.85rem] font-bold leading-[0.92] tracking-[-0.065em] text-foreground sm:text-[2.25rem]"
                >
                  {setupNoticeMeta.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {setupNoticeMeta.copy}
                </p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[18px] border border-black/8 bg-white px-4 py-3">
                  <p className={labelClassName()}>Current output</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                    {isCompanyPlan
                      ? "This report link uses your company info and saves to account history. The PDF copy stays clean for restaurant inspection files."
                      : "Free builder output has no company logo/contact, stays watermarked, and saves as a 7-day test link when the API is available."}
                  </p>
                </div>
                <div className="rounded-[18px] border border-[#f26a21]/22 bg-[#fff7ef] px-4 py-3">
                  <p className={labelClassName()}>
                    {isCompanyPlan ? "Included with company" : "Company version adds"}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                    {isCompanyPlan
                      ? "Saved company info, live report links, clean PDFs, customer history, and next-service follow-up."
                      : "Logo, phone, clean PDF, live service report links while subscribed, saved photos, and customer history."}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={paidFeatureHref}
                  className="inline-flex h-11 items-center justify-center rounded-[16px] border border-black/10 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground"
                >
                  {paidFeatureCtaLabel}
                </a>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSetupNoticeAction(null)}
                    className="h-11 rounded-[16px] border border-black/10 bg-[#f6f1e8] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmFreeReportOutput()}
                    className="h-11 rounded-[16px] bg-[#111315] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                  >
                    {setupNoticeMeta.actionLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.div
        layout
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="pdf-print-hide fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-black/10 bg-white/94 p-2 shadow-[0_20px_70px_rgba(17,17,17,0.22)] backdrop-blur md:hidden"
        style={{
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="grid grid-cols-[0.82fr_1.18fr] gap-2">
          <button
            type="button"
            onClick={handleMobileSecondaryAction}
            className="tool-action-btn tool-action-secondary h-12 px-3 active:scale-[0.99]"
          >
            {isOutputStep ? (
              <Settings2 className="h-4 w-4" />
            ) : totalFieldPhotoCount === 0 ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Settings2 className="h-4 w-4" />
            )}
            {mobileSecondaryActionLabel}
          </button>
          <motion.button
            layout
            type="button"
            onClick={handleMobilePrimaryAction}
            whileTap={{ scale: 0.985 }}
            className={`tool-action-btn h-12 px-3 ${
              mobilePrimaryIsPrint ? "tool-action-primary" : "tool-action-dark"
            }`}
          >
            {mobilePrimaryIsPrint ? (
              <FileDown className="h-4 w-4" />
            ) : builderStep === "photos" ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="block text-center text-white">
              {mobilePrimaryActionLabel}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
