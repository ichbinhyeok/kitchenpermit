"use client";

import { useEffect, useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  FileDown,
  GripVertical,
  PencilLine,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  Axis1PacketDocument,
  type Axis1PacketDocumentSectionVisibility,
} from "@/components/axis1/packet-document";
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
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
} from "@/lib/axis1-closeout-engine";
import {
  axis1FieldPhotoSlots as fieldPhotoSlots,
  buildAxis1PacketDataWithFieldPhotos,
  emptyAxis1FieldPhotoState,
  emptyAxis1PhotoSlotResolutions,
  getAxis1AdaptiveRecordMeta,
  type Axis1FieldPhotoConfidence as FieldPhotoConfidence,
  type Axis1FieldPhotoSlotId as FieldPhotoSlotId,
  type Axis1PhotoSlotResolution as PhotoSlotResolution,
  type Axis1UploadedFieldPhoto as UploadedFieldPhoto,
} from "@/lib/axis1-field-photos";
import { saveAxis1LocalPacket } from "@/lib/axis1-local-packet-store";

const jobPatternPresets = [
  {
    id: "clean-close",
    label: "Everything was completed",
    title: "No open item",
    copy: "Completed. Send proof and next visit window.",
    scenario: "clean",
    exceptionKinds: [],
    followUpMode: "none",
  },
  {
    id: "blocked-access",
    label: "Something was blocked",
    title: "Cleaned reachable areas",
    copy: "Some area was blocked or inaccessible.",
    scenario: "exception",
    exceptionKinds: ["blocked-storage"],
    followUpMode: "monitor",
  },
  {
    id: "condition-review",
    label: "Something needs review",
    title: "Completed, but flag it",
    copy: "Done, but one condition should stay visible.",
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

type BuilderStep = "job" | "photos" | "report";
type MobileSheetView = "photo-review" | "report-actions";
type PacketPresentationMode = "standard" | "short";
type ReportOutputMode = "link" | "pdf";
type SetupNoticeAction = "copy-link" | "open-link" | "print-pdf";
type CustomerLineEditor =
  | "result"
  | "open-item"
  | "action"
  | "photo-record"
  | "timing";
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
const maxPhotoImportBytes = 40 * 1024 * 1024;
const maxBulkPhotoImportCount = 16;
const smallPhotoFallbackBytes = 5 * 1024 * 1024;

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

function createLocalPhotoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  mobilePickerMode = false,
}: {
  slot: FieldPhotoSlot;
  uploaded: UploadedFieldPhoto;
  onMove: (fromSlotId: FieldPhotoSlotId, toSlotId: FieldPhotoSlotId) => void;
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
              uploaded.confidence === "order"
                ? "border-[#ff6b1a]/24 bg-[#fff0e4] text-[#b94d11]"
                : "border-black/10 bg-[#f6f1e8] text-muted-foreground"
            }`}
          >
            {uploaded.confidence === "keyword"
              ? "Filename match"
              : uploaded.confidence === "order"
                ? "Review order"
                : "Manual"}
          </span>
        </div>
        <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
          {uploaded.name}
        </p>
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
            {photo.reason === "duplicate" ? "Same-label extra" : "Overflow"}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {photo.suggestedSlotId
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
  mobileSheetMode = false,
}: {
  uploadedPhotoSlots: FieldPhotoSlot[];
  uploadedFieldPhotos: UploadedFieldPhotoState;
  unplacedPhotos: UnplacedFieldPhoto[];
  onMove: (fromSlotId: FieldPhotoSlotId, toSlotId: FieldPhotoSlotId) => void;
  onPlaceExtra: (photoId: string, toSlotId: FieldPhotoSlotId) => void;
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
    (slot) => uploadedFieldPhotos[slot.id]?.confidence === "order",
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
        <p className="text-sm font-semibold text-foreground">No photos attached yet.</p>
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
                Before / after are core; the rest are recommended proof slots.
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
            {orderMatchedCount} phone-style photo(s) were placed by upload order only.
            Review the role before sending the proof packet.
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
    label: "Photos",
    title: "Drop photos",
    copy: "Upload all job photos or continue without them.",
  },
  {
    value: "job",
    label: "Result",
    title: "Confirm result",
    copy: "Pick the visit outcome and next action.",
  },
  {
    value: "report",
    label: "Send",
    title: "Send packet",
    copy: "Copy the customer link or save the PDF.",
  },
] as const satisfies ReadonlyArray<{
  value: BuilderStep;
  label: string;
  title: string;
  copy: string;
}>;

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
    copy: "Customer-visible photo proof.",
  },
  {
    key: "checklist",
    label: "Proof checklist",
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
      reason: "Only image files can be used in the proof packet.",
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

export function PacketBuilder() {
  const form = useForm<Axis1BuilderFormValues>({
    resolver: zodResolver(axis1BuilderSchema),
    defaultValues: axis1BuilderDefaults,
    mode: "onChange",
  });
  const watched = useWatch({
    control: form.control,
  });
  const values = {
    ...axis1BuilderDefaults,
    ...watched,
  } as Axis1BuilderFormValues;
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
  const [photoSlotResolutions, setPhotoSlotResolutions] =
    useState<Record<FieldPhotoSlotId, PhotoSlotResolution>>(
      emptyPhotoSlotResolutions,
    );
  const [builderStep, setBuilderStep] = useState<BuilderStep>("photos");
  const [packetPresentationMode, setPacketPresentationMode] =
    useState<PacketPresentationMode>("short");
  const [reportOutputMode, setReportOutputMode] =
    useState<ReportOutputMode>("link");
  const [packetSections, setPacketSections] =
    useState<Axis1PacketDocumentSectionVisibility>(shortPacketSections);
  const [showPacketDetails, setShowPacketDetails] = useState(false);
  const [showJobBasics, setShowJobBasics] = useState(false);
  const [showExceptionDetails, setShowExceptionDetails] = useState(false);
  const [showAllPhotoSlots, setShowAllPhotoSlots] = useState(false);
  const [showProofDetails, setShowProofDetails] = useState(false);
  const [showWordingEditor, setShowWordingEditor] = useState(false);
  const [activeCustomerLineEditor, setActiveCustomerLineEditor] =
    useState<CustomerLineEditor>("result");
  const [hasJobOutcomeSelected, setHasJobOutcomeSelected] = useState(false);
  const [photoImportNotice, setPhotoImportNotice] =
    useState<PhotoImportNotice | null>(null);
  const [mobileSheet, setMobileSheet] = useState<MobileSheetView | null>(null);
  const [setupNoticeAction, setSetupNoticeAction] =
    useState<SetupNoticeAction | null>(null);
  const [showToolMenu, setShowToolMenu] = useState(false);
  const isPhotoStep = builderStep === "photos";

  useEffect(() => {
    const requestedStep = new URLSearchParams(window.location.search).get("step");

    if (
      requestedStep === "job" ||
      requestedStep === "photos" ||
      requestedStep === "report"
    ) {
      const frame = window.requestAnimationFrame(() => {
        const resolvedStep = requestedStep === "report" ? "job" : requestedStep;
        setBuilderStep(resolvedStep);
        if (resolvedStep !== requestedStep) {
          const url = new URL(window.location.href);
          url.searchParams.set("step", resolvedStep);
          window.history.replaceState({}, "", url);
        }
        if (window.matchMedia("(max-width: 767px)").matches) {
          document
            .getElementById("packet-builder-workspace")
            ?.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  const previewData = buildAxis1NeutralPacketData(values);
  const uploadedProofCount = fieldPhotoSlots.filter(
    (slot) => uploadedFieldPhotos[slot.id],
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
      (uploadedFieldPhotos[slot.id] || photoSlotResolutions[slot.id] !== "open"),
  ).length;
  const missingRequiredSlots = fieldPhotoSlots.filter(
    (slot) =>
      slot.required &&
      !uploadedFieldPhotos[slot.id] &&
      photoSlotResolutions[slot.id] === "open",
  );
  const uploadedPhotoSlots = fieldPhotoSlots.filter(
    (slot) => uploadedFieldPhotos[slot.id],
  );
  const orderMatchedPhotoCount = uploadedPhotoSlots.filter(
    (slot) => uploadedFieldPhotos[slot.id]?.confidence === "order",
  ).length;
  const hasOrderMatchedPhotos = orderMatchedPhotoCount > 0;
  const hasProofWorkStarted = totalFieldPhotoCount > 0 || skippedPhotoSlotCount > 0;
  const shouldShowProofDetails = showProofDetails || showAllPhotoSlots;
  const hasBeforePhoto = Boolean(uploadedFieldPhotos["hood-before"]);
  const hasAfterPhoto = Boolean(uploadedFieldPhotos["hood-after"]);
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
    hasOrderMatchedPhotos
      ? `${orderMatchedPhotoCount} photo role(s) need review`
      : hasAfterOnly
        ? "After-only record is ready"
        : hasBeforeOnly
          ? "Before-only photo needs closeout"
      : missingRequiredSlots.length === 0
      ? `${uploadedProofCount} photos sorted`
      : totalFieldPhotoCount === 0
        ? "Drop photos, or continue without them"
        : `${missingRequiredSlots.length} core photo(s) still open`;
  const proofReadinessCopy =
    hasOrderMatchedPhotos
      ? "These were placed by order, not reliable labels. Review before sending."
      : hasAfterOnly
        ? "No before photo is attached. The packet will avoid a false before/after comparison."
        : hasBeforeOnly
          ? "No after photo is attached. Add one, or mark it not captured before continuing."
      : missingRequiredSlots.length === 0
      ? "Core photos are ready. Continue to result, or add only helpful extras."
      : totalFieldPhotoCount === 0
        ? "No photos is acceptable. The output becomes a written service record."
        : unplacedFieldPhotos.length > 0
          ? `${unplacedFieldPhotos.length} extra photo(s) waiting for a role.`
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
  const closeoutEngine = evaluateAxis1Closeout({
    values,
    outcomeSelected: hasJobOutcomeSelected,
    uploadedFieldPhotos,
    unplacedPhotoCount: unplacedFieldPhotos.length,
    photoSlotResolutions,
  });
  const adaptiveRecord = getAxis1AdaptiveRecordMeta({
    uploadedFieldPhotos,
    photoSlotResolutions,
    extraPhotoCount: unplacedFieldPhotos.length,
    hasAccessIssue: selectedAccessCount > 0,
  });
  const closeoutFormatLabel =
    !closeoutEngine.canGeneratePacket
      ? "Waiting for selected result"
      : adaptiveRecord.recordType === "access_issue_record"
      ? "Ready as customer action record"
      : adaptiveRecord.recordType === "service_closeout_record"
        ? "Ready as written service record"
        : adaptiveRecord.recordType === "after_cleaning_record"
          ? "Ready as after-photo record"
          : adaptiveRecord.recordType === "photo_supported_service_record"
            ? "Ready as photo-supported record"
            : "Ready as photo proof packet";
  const reportNeedsPhotoReview = hasOrderMatchedPhotos || unplacedFieldPhotos.length > 0;
  const mobileReportStatus =
    !closeoutEngine.canGeneratePacket
      ? {
          tone: "partial",
          title: "Pick the result first",
          copy: closeoutEngine.blockingReason ?? "No packet is generated from sample defaults.",
        }
      : reportNeedsPhotoReview
      ? {
          tone: "review",
          title: "Check photo roles before sending",
          copy: "Placed by upload order only. Confirm roles before saving.",
        }
      : totalFieldPhotoCount === 0
        ? {
            tone: "neutral",
            title: "Ready without photos",
            copy: "The packet can explain the visit. Add photos only if the crew captured them.",
          }
        : missingRequiredSlots.length > 0
          ? {
              tone: "partial",
              title: "Sendable with partial proof",
              copy: "Open slots stay out unless attached or intentionally marked.",
            }
          : {
              tone: "ready",
              title: "Ready to send",
              copy: "Job result, proof, note, and next window are lined up.",
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
    ? "Review photo roles"
    : totalFieldPhotoCount === 0
      ? "Add photos"
      : "PDF options";
  const builderStepIndex = Math.max(
    0,
    builderSteps.findIndex((step) => step.value === builderStep),
  );
  const mobilePrimaryActionLabel =
    builderStep === "photos"
      ? "Confirm result"
    : builderStep === "job"
        ? hasJobOutcomeSelected
          ? "Preview packet"
          : "Pick result first"
        : reportOutputMode === "link"
          ? "Copy link"
          : "Save PDF";
  const mobileSecondaryActionLabel =
    builderStep === "photos"
        ? hasProofWorkStarted
          ? "Review photos"
          : "Sample"
      : builderStep === "job"
        ? "Back to photos"
        : reportNeedsPhotoReview
          ? "Review photos"
          : "Options";
  const mobileStepCaption =
    builderStep === "photos"
        ? totalFieldPhotoCount > 0
          ? `${totalFieldPhotoCount} photo(s)`
          : "Core if captured"
      : builderStep === "job"
        ? hasJobOutcomeSelected
          ? activeJobPattern.label
          : "Result required"
        : values.customerActionOverride?.trim()
          ? "Custom copy"
          : "Generated copy";
  const mobileStepHint =
    builderStep === "photos"
        ? hasOrderMatchedPhotos
          ? "Review phone-order photo matches."
        : totalFieldPhotoCount > 0
            ? "Photos are attached. Review if needed."
            : "No photos is acceptable."
      : builderStep === "job"
        ? hasJobOutcomeSelected
          ? "Confirm the service result and next timing."
          : "Choose what actually happened before a packet can be generated."
        : reportOutputMode === "link"
          ? "Check the customer link view, then copy or save PDF."
          : "Check the service record PDF before saving.";
  const photoStepPrimaryLabel = hasOrderMatchedPhotos
    ? shouldShowProofDetails
      ? "Confirm roles"
      : "Review matches"
    : hasBeforeOnly || hasAfterOnly
      ? shouldShowProofDetails
        ? "Continue with partial proof"
        : "Review missing core"
    : totalFieldPhotoCount === 0
      ? "No photos today"
      : "Next: confirm result";
  const mobilePrimaryIsPrint = builderStep === "report" && reportOutputMode === "pdf";
  const reportOutputMeta =
    reportOutputMode === "link"
      ? {
          label: "Customer proof link preview",
          title: "Premium customer handoff",
          copy: "Best for texting or emailing after the visit. It reduces confusion, shows open items, and gives the customer one clear reply path.",
          badge: "Primary output",
        }
      : {
          label: "Service record PDF preview",
          title: "Archive and request-ready record",
          copy: "Best for saving, attaching, printing, or answering later record requests. It is formatted as a service record, not a web page screenshot.",
          badge: "Record output",
        };
  const activePreviewPresentationMode =
    reportOutputMode === "pdf" ? packetPresentationMode : "standard";
  const activePreviewSections =
    reportOutputMode === "pdf" ? packetSections : standardPacketSections;
  const setupNoticeMeta =
    setupNoticeAction === "print-pdf"
      ? {
          eyebrow: "Before saving PDF",
          title: "Free PDFs stay neutral.",
          actionLabel: "Continue to PDF",
          copy: "This PDF will not show your logo, phone number, dispatch email, customer reply CTA, saved history, or hosted photo delivery.",
        }
      : setupNoticeAction === "open-link"
        ? {
            eyebrow: "Before opening link",
            title: "Free local links stay neutral.",
            actionLabel: "Continue to link",
            copy: "This local test link includes the current photos in this browser only. Cross-device customer delivery still needs hosted storage and branded setup.",
          }
        : {
            eyebrow: "Before copying link",
            title: "Free local links stay neutral.",
            actionLabel: "Continue and copy",
            copy: "This local test link includes the current photos in this browser only. Cross-device customer delivery still needs hosted storage and branded setup.",
          };
  const previewPacket = applyAxis1CloseoutEngineToPacket(
    buildAxis1PacketDataWithFieldPhotos(
      previewData,
      uploadedFieldPhotos,
      photoSlotResolutions,
    ),
    closeoutEngine,
  );
  const generatedCustomerLines = [
    {
      label: "Today's result",
      value: previewPacket.summaryCards[0]?.copy ?? previewPacket.packetHeader.copy,
      source: values.summaryOverride?.trim() ? "Edited wording" : "Generated from selected result",
      action: "Edit wording",
      editor: "result" as const,
      onClick: () => setActiveCustomerLineEditor("result"),
    },
    {
      label: values.scenario === "exception" ? "Open item" : "Closeout status",
      value:
        previewPacket.summaryCards[1]?.copy ??
        previewPacket.deficiencyRows[0]?.issue ??
        "No open access item recorded.",
      source: values.scenario === "exception" ? "Shown to avoid confusion" : "Shown as closed",
      action: "Edit result",
      editor: "open-item" as const,
      onClick: () => setActiveCustomerLineEditor("open-item"),
    },
    {
      label: "Customer action",
      value:
        findPacketRowValue(
          previewPacket.customerClose.actionItems,
          "Reply or action",
          previewPacket.customerClose.copy,
        ) || previewPacket.customerClose.copy,
      source: values.customerActionOverride?.trim()
        ? "Edited instruction"
        : "Generated from selected next step",
      action: "Edit wording",
      editor: "action" as const,
      onClick: () => setActiveCustomerLineEditor("action"),
    },
    {
      label: "Photo / record basis",
      value:
        findPacketRowValue(
          previewPacket.proofPolicyRows,
          "Record basis",
          adaptiveRecord.meta.customerCopy,
        ) || adaptiveRecord.meta.customerCopy,
      source:
        totalFieldPhotoCount > 0
          ? `${uploadedProofCount} attached photo(s)`
          : "No-photo closeout",
      action: "Edit photos",
      editor: "photo-record" as const,
      onClick: () => setActiveCustomerLineEditor("photo-record"),
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
      onClick: () => setActiveCustomerLineEditor("timing"),
    },
  ];

  function resetBuilder() {
    form.reset(axis1BuilderDefaults);
    setHasJobOutcomeSelected(false);
    setUploadedFieldPhotos(emptyFieldPhotoState());
    setUnplacedFieldPhotos([]);
    setPhotoSlotResolutions(emptyPhotoSlotResolutions());
    setPacketPresentationMode("short");
    setPacketSections(shortPacketSections);
    selectBuilderStep("photos");
    setShowPacketDetails(false);
    setShowAllPhotoSlots(false);
    setShowProofDetails(false);
    setPhotoImportNotice(null);
    setMobileSheet(null);
    setShowWordingEditor(false);
    setActiveCustomerLineEditor("result");
    toast("Builder reset", {
      description: "The sample report is back to the default visit.",
    });
  }

  function selectBuilderStep(step: BuilderStep) {
    toast.dismiss();

    if (step === "report" && !hasJobOutcomeSelected) {
      toast.error("Pick today's result first.", {
        description: "The tool will not create a packet from untouched sample defaults.",
      });
      step = "job";
    }

    setBuilderStep(step);
    setMobileSheet(null);

    const url = new URL(window.location.href);
    url.searchParams.set("step", step);
    window.history.replaceState({}, "", url);

    if (isMobileViewport()) {
      window.requestAnimationFrame(() => {
        document
          .getElementById("packet-builder-workspace")
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
  }

  function handleMobilePrimaryAction() {
    if (builderStep === "photos") {
      selectBuilderStep("job");
      return;
    }

    if (builderStep === "job") {
      if (!hasJobOutcomeSelected) {
        toast.error("Pick today's result first.");
        return;
      }
      selectBuilderStep("report");
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
        description: "The tool will not create a link or PDF from untouched sample defaults.",
      });
      selectBuilderStep("job");
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
      await copyLocalReportLink();
      return;
    }

    if (action === "open-link") {
      const shareUrl = saveCurrentLocalReportUrl();

      if (shareUrl) {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }

      return;
    }

    if (action === "print-pdf") {
      window.setTimeout(printCustomerReport, 160);
    }
  }

  function saveCurrentLocalReportUrl() {
    const result = saveAxis1LocalPacket({
      values,
      uploadedFieldPhotos,
      photoSlotResolutions,
      presentationMode: packetPresentationMode,
      visibleSections: packetSections,
    });

    if (!result.ok) {
      toast.error("Could not save local packet", {
        description: result.error,
      });
      return null;
    }

    return new URL(result.href, window.location.origin).toString();
  }

  async function copyLocalReportLink() {
    const shareUrl = saveCurrentLocalReportUrl();

    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Local photo link copied", {
        description:
          "Photos are included for this browser QA pass. Hosted storage is still required for real customer delivery.",
      });
    } catch {
      toast.error("Could not copy automatically", {
        description: "Open the local packet link and copy the browser address.",
      });
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

  function handleMobileSecondaryAction() {
    if (builderStep === "photos") {
      if (hasProofWorkStarted) {
        openMobileSheet("photo-review");
        return;
      }

      window.location.assign("/samples/axis-1");
      return;
    }

    if (builderStep === "job") {
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
        "Service was completed today. No open item was recorded.",
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
        description: "The report now uses the compact customer copy.",
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
      "Open item stays on the report for follow-up.",
      { shouldDirty: true, shouldValidate: true },
    );
    toast.success("Short wording applied", {
      description: "The report now uses the compact customer copy.",
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
    toast("Recommended copy restored", {
      description: "The report is back to the generated wording.",
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
        src: result.src,
        name: file.name,
        source,
        confidence: "manual",
        matchLabel: "Manually placed",
      },
    }));
    setPhotoSlotResolution(slotId, "open");
    setPhotoImportNotice(
      result.wasNormalized
        ? {
            tone: "success",
            message: "Photo prepared for mobile PDF output.",
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
        ? `${slot.shortLabel} is ready for the proof packet.`
        : "Photo is ready for the proof packet.",
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
            : "No empty role available",
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
    const loadedExtraPhotos: UnplacedFieldPhoto[] = loadedExtras.flatMap((item) =>
      item.src
        ? [
            {
              ...item,
              src: item.src,
            },
          ]
        : [],
    );

    setUploadedFieldPhotos((current) => {
      const next = { ...current };

      loaded.forEach((item) => {
        if (item.src) {
          next[item.slotId] = {
            src: item.src,
            name: item.name,
            source: "bulk",
            confidence: item.confidence,
            matchLabel: item.matchLabel,
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
    if (isMobileViewport()) {
      setShowProofDetails(false);
      setShowAllPhotoSlots(false);
    } else {
      setShowProofDetails(true);
    }
    const loadedPhotoCount = loaded.filter((item) => item.src).length;
    const failedPhotoCount =
      loaded.filter((item) => item.error).length +
      loadedExtras.filter((item) => item.error).length +
      skippedNonImageCount +
      truncatedCount;
    const normalizedPhotoCount =
      loaded.filter((item) => item.src && item.wasNormalized).length +
      loadedExtras.filter((item) => item.src && item.wasNormalized).length;
    const orderReviewCount = loaded.filter(
      (item) => item.src && item.confidence === "order",
    ).length;
    const noticeMessage =
      failedPhotoCount > 0
        ? `${failedPhotoCount} photo/file(s) were skipped. Use JPEG/PNG if a field photo is missing.`
        : normalizedPhotoCount > 0
          ? `${normalizedPhotoCount} photo(s) were prepared for mobile PDF output.`
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
      toast.warning(`${failedPhotoCount} photo/file(s) skipped`, {
        description: "Use JPEG/PNG if a field photo is missing from the report.",
      });
    } else if (orderReviewCount > 0) {
      toast.warning(`${orderReviewCount} photo match(es) need review`, {
        description: "Phone filenames were placed by upload order.",
      });
    } else {
      toast.success(`${loadedPhotoCount} photo(s) added`, {
        description:
          loadedExtraPhotos.length > 0
            ? `${loadedExtraPhotos.length} extra photo(s) kept for review.`
            : "Filename matches were applied automatically.",
      });
    }
  }

  function applyJobPattern(pattern: (typeof jobPatternPresets)[number]) {
    setHasJobOutcomeSelected(true);
    form.setValue("scenario", pattern.scenario, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("exceptionKinds", [...pattern.exceptionKinds], {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("followUpMode", pattern.followUpMode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("exceptionNote", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("followUpNote", "", {
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
        },
        [fromSlotId]: toPhoto
          ? {
              ...toPhoto,
              confidence: "manual",
              matchLabel: `Moved to ${fromSlot.shortLabel}`,
            }
          : null,
      };
    });
    setPhotoSlotResolutions((current) => ({
      ...current,
      [fromSlotId]: "open",
      [toSlotId]: "open",
    }));
    const targetSlot = fieldPhotoSlots.find((slot) => slot.id === toSlotId);
    toast.success("Photo moved", {
      description: targetSlot
        ? `Now assigned to ${targetSlot.shortLabel}.`
        : "Photo role was updated.",
    });
  }

  function confirmAutoPlacedPhotoRoles(nextStep: BuilderStep = "report") {
    setUploadedFieldPhotos((current) => {
      let changed = false;
      const next = { ...current };

      fieldPhotoSlots.forEach((slot) => {
        const photo = current[slot.id];

        if (photo?.confidence === "order") {
          changed = true;
          next[slot.id] = {
            ...photo,
            confidence: "manual",
            matchLabel: "Role confirmed",
          };
        }
      });

      return changed ? next : current;
    });
    selectBuilderStep(nextStep);
  }

  function proceedFromPhotoStep() {
    if (hasOrderMatchedPhotos && !shouldShowProofDetails) {
      setShowProofDetails(true);
      return;
    }

    if (hasOrderMatchedPhotos) {
      confirmAutoPlacedPhotoRoles("job");
      return;
    }

    if ((hasBeforeOnly || hasAfterOnly) && !shouldShowProofDetails) {
      setShowProofDetails(true);
      return;
    }

    selectBuilderStep("job");
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
        src: photo.src,
        name: photo.name,
        source: photo.source,
        confidence: "manual",
        matchLabel: `Moved to ${targetSlot.shortLabel}`,
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
            },
          ]
        : []),
    ]);
    setPhotoSlotResolution(toSlotId, "open");
    toast.success("Extra photo placed", {
      description: `Assigned to ${targetSlot.shortLabel}.`,
    });
  }

  return (
    <section
      id="packet-builder-workspace"
      className={
        isPhotoStep
          ? "min-h-svh scroll-mt-0 bg-[#101214] px-3 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white sm:px-4 md:px-5 md:py-5 md:pb-8"
        : "workspace-shell scroll-mt-[5.75rem] pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:scroll-mt-0 md:pt-5 md:pb-20"
      }
    >
      {(
        <div className="pdf-print-hide h-[82px] sm:h-[86px]">
          <div
            className="fixed left-3 right-3 top-3 z-50 mx-auto flex min-h-[58px] max-w-[1180px] items-center gap-2 rounded-full border border-white/10 bg-[#171a1d]/94 p-1.5 shadow-[0_14px_46px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:left-4 sm:right-4 sm:top-4 sm:min-h-[62px]"
            data-axis-tool-header
          >
            <div className="flex min-w-0 shrink-0 items-center gap-2 px-1">
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black tracking-[-0.06em] text-[#111315]"
                data-axis-tool-brand-icon
              >
                H
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-black uppercase tracking-[-0.05em] text-white">
                  Hood
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                  Builder
                </p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-black/18 p-1">
              {builderSteps.map((step, index) => {
                const stepMetric =
                  step.value === "job"
                    ? values.scenario === "clean"
                      ? "Clean"
                      : "Exception"
                    : step.value === "photos"
                      ? totalFieldPhotoCount > 0
                        ? `${totalFieldPhotoCount} photos`
                        : "Core 2"
                      : totalFieldPhotoCount > 0
                        ? `${uploadedProofCount} placed`
                        : "Ready";
                const selected = builderStep === step.value;

                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => selectBuilderStep(step.value)}
                    className={`group flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-center transition-all duration-200 sm:h-11 sm:justify-between sm:px-3 ${
                      selected
                        ? "bg-white text-[#111315] shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
                        : "bg-transparent text-white/38 opacity-70 hover:bg-white/[0.055] hover:text-white/70 hover:opacity-100"
                    }`}
                    data-axis-tool-step
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                        selected
                          ? "bg-[#111315] text-white"
                          : "bg-white/[0.08] text-white/42"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`min-w-0 truncate text-[11px] font-black uppercase tracking-[0.08em] ${
                        selected ? "inline" : "hidden sm:inline"
                      }`}
                    >
                      {step.label}
                    </span>
                    {selected ? (
                      <span className="hidden whitespace-nowrap rounded-full border border-black/10 bg-[#111315]/5 px-2 py-0.5 text-[10px] font-bold text-[#111315]/58 md:inline-flex">
                        {stepMetric}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowToolMenu((current) => !current)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.065] px-3 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.09] sm:h-11"
              >
                Menu
                <ChevronDown
                  className={`h-3.5 w-3.5 transition ${
                    showToolMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showToolMenu ? (
                <div className="absolute right-0 top-12 z-[70] w-44 overflow-hidden rounded-[18px] border border-white/10 bg-[#202326] p-1 shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
                  {[
                    ["/samples/axis-1", "Sample"],
                    ["/axis-1", "Product"],
                    ["/start", "Setup"],
                  ].map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      onClick={() => setShowToolMenu(false)}
                      className="block rounded-[14px] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/68 hover:bg-white/[0.07] hover:text-white"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      <div
        className={`grid min-w-0 gap-5 ${
          builderStep === "report"
            ? "xl:grid-cols-[minmax(0,0.78fr)_minmax(540px,1.22fr)]"
            : isPhotoStep
              ? "mx-auto w-full max-w-[1180px]"
              : "mx-auto w-full max-w-[980px]"
        }`}
      >
        <div
          className={`min-w-0 space-y-5 ${
            builderStep === "report" ? "order-2 md:order-none" : ""
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
                Hood closeout
              </p>
              <h2 className={`mt-2 hidden font-display text-[1.2rem] font-bold leading-[0.96] tracking-[-0.055em] text-foreground md:block md:text-[1.38rem] ${builderStep === "photos" ? "sr-only" : ""}`}>
                Make the customer packet.
              </h2>
              <p className={`mt-2 hidden text-xs leading-5 text-muted-foreground md:block ${builderStep === "photos" ? "sr-only" : ""}`}>
                Drop today&apos;s photos, confirm what happened, then copy the
                customer link or save the PDF.
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
                    Auto
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
                    const stepMetric =
                      step.value === "job"
                        ? values.scenario === "clean"
                          ? "Clean"
                          : "Exception"
                        : step.value === "photos"
                          ? totalFieldPhotoCount > 0
                            ? `${totalFieldPhotoCount} photos`
                            : "Core 2"
                          : totalFieldPhotoCount > 0
                            ? `${uploadedProofCount} placed`
                            : "Ready";

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
                          <span className={`truncate text-[9px] font-bold uppercase tracking-[0.11em] text-muted-foreground group-data-[state=active]:text-[#ffb489] md:text-[10px] md:tracking-[0.14em] ${
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
                        <span className="mt-1 truncate text-[13px] font-bold leading-4 tracking-[-0.03em]">
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
                    Free preview now. Branding, saved history, and delivery unlock in setup.
                  </span>
                </div>
              </motion.div>
            </div>

            <form className="mt-3 space-y-3">
              <div
                className={`rounded-[22px] border border-black/8 bg-white px-3.5 py-4 md:px-4 ${
                  builderStep === "job" ? "" : "hidden"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={labelClassName()}>Result</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Pick what happened today. The packet writes the customer language.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Sparkles className="hidden h-4 w-4 text-accent sm:block" />
                    <button
                      type="button"
                      onClick={() => selectBuilderStep("report")}
                      className="tool-action-btn tool-action-dark tool-action-mini hidden md:inline-flex"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Send preview
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] border border-black/8 bg-[#111315] px-4 py-4 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ffb489]">
                        What happened?
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/62">
                        Choose one. You can still edit details below.
                      </p>
                    </div>
                    <span className="rounded-full border border-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                      Auto wording
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {jobPatternPresets.map((pattern) => {
                      const selected =
                        hasJobOutcomeSelected && activeJobPatternId === pattern.id;

                      return (
                        <motion.button
                          key={pattern.id}
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.985 }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 30,
                          }}
                          onClick={() => applyJobPattern(pattern)}
                          className={`rounded-[18px] border px-4 py-3 text-left transition md:min-h-[128px] ${
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
                                {pattern.label}
                              </p>
                              <p className="mt-1 text-sm font-bold tracking-[-0.02em]">
                                {pattern.title}
                              </p>
                              <p
                                className={`mt-2 hidden text-xs leading-5 md:block ${
                                  selected ? "text-[#5f574f]" : "text-white/55"
                                }`}
                              >
                                {pattern.copy}
                              </p>
                            </div>
                            {selected ? (
                              <span className="rounded-full bg-[#f26a21] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                                Active
                              </span>
                            ) : null}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[18px] border border-[#f26a21]/18 bg-[#fff7ef]">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0dfd1] bg-white/55 px-4 py-3">
                    <div className="min-w-0">
                      <p className={labelClassName()}>
                        {hasJobOutcomeSelected ? "Customer draft" : "Customer draft locked"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {hasJobOutcomeSelected
                          ? "This is what the packet is writing from your selections."
                          : "Pick what happened before the tool writes customer-facing result language."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectBuilderStep("report")}
                      disabled={!hasJobOutcomeSelected}
                      className="rounded-full bg-[#111315] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Full preview
                    </button>
                  </div>
                  {hasJobOutcomeSelected ? (
                    <div className="grid gap-2 p-3 md:grid-cols-3">
                      {generatedCustomerLines.slice(0, 3).map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className="rounded-[15px] border border-black/8 bg-white/72 px-3 py-3 text-left transition hover:border-[#f26a21]/24 hover:bg-white"
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="mt-1.5 block text-sm font-bold leading-5 text-foreground">
                            {item.value}
                          </span>
                          <span className="mt-2 inline-flex rounded-full border border-black/10 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            {item.action}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="rounded-[15px] border border-dashed border-black/15 bg-white/68 px-3 py-3 text-sm font-semibold leading-6 text-muted-foreground">
                        No result, open item, or next-action sentence has been generated yet.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-[18px] border border-black/8 bg-[rgba(17,17,17,0.025)]">
                  <button
                    type="button"
                    onClick={() => setShowJobBasics((current) => !current)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className={labelClassName()}>Job basics</p>
                      <p className="mt-1 truncate text-sm font-semibold text-foreground">
                        {values.propertyName || "Customer"} -{" "}
                        {values.serviceDate || "Today"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {showJobBasics ? "Hide" : "Edit"}
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
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Change only if needed
                    </span>
                  </div>
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
                    hasJobOutcomeSelected && values.scenario === "clean" ? "" : "hidden"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectBuilderStep("report")}
                    className="rounded-full bg-[#111315] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    Preview packet
                  </button>
                </div>
              </div>

              {builderStep === "job" &&
              hasJobOutcomeSelected &&
              values.scenario === "exception" ? (
                <div className="rounded-[22px] border border-black/8 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={labelClassName()}>Open item defaults</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {selectedAccessCount} access / {selectedConditionCount} condition selected. Defaults are ready.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExceptionDetails((current) => !current)}
                        className="rounded-full border border-black/10 bg-[rgba(17,17,17,0.025)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {showExceptionDetails ? "Hide details" : "Edit details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => selectBuilderStep("report")}
                        className="hidden rounded-full bg-[#111315] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white md:inline-flex"
                      >
                        Send preview
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
                            <p className={labelClassName()}>Selected logic</p>
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
                        Short open-item note
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
                            This controls whether the report asks for review, monitor, or record-only language.
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

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => selectBuilderStep("report")}
                      className="rounded-full bg-[#111315] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                    >
                      Preview packet
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                className={`rounded-[22px] border border-black/8 bg-white px-4 py-4 shadow-[0_14px_40px_rgba(17,17,17,0.05)] ${
                  builderStep === "report" ? "" : "hidden"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className={labelClassName()}>Customer lines</p>
                    <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.035em] text-foreground">
                      Exact wording going into the packet.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Use these cards only when the auto-written line needs a field correction.
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#b94d11]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto-written
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPacketDetails((current) => !current)}
                  className="tool-action-btn tool-action-secondary tool-action-mini mt-3"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Advanced details
                  {showPacketDetails ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="mt-4 grid gap-2 md:grid-cols-1 2xl:grid-cols-2">
                  {generatedCustomerLines.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className={`group min-w-0 rounded-[18px] border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#f26a21]/24 hover:bg-[#fff7ef] hover:shadow-[0_14px_32px_rgba(17,19,21,0.07)] ${
                        activeCustomerLineEditor === item.editor
                          ? "border-[#f26a21]/35 bg-[#fff7ef]"
                          : "border-black/8 bg-[rgba(17,17,17,0.025)]"
                      }`}
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
                        {item.action}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 overflow-hidden rounded-[20px] border border-[#f26a21]/18 bg-[#fff7ef]">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0dfd1] bg-white/55 px-4 py-3">
                    <div className="min-w-0">
                      <p className={labelClassName()}>Edit here</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Changes update the customer preview below without leaving this step.
                      </p>
                    </div>
                    <span className="rounded-full border border-[#f26a21]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b94d11]">
                      {generatedCustomerLines.find(
                        (item) => item.editor === activeCustomerLineEditor,
                      )?.label ?? "Selected line"}
                    </span>
                  </div>

                  <div className="grid gap-4 px-4 py-4">
                    {activeCustomerLineEditor === "result" ? (
                      <div>
                        <label className={labelClassName()} htmlFor="quickSummaryOverride">
                          Today&apos;s result sentence
                        </label>
                        <textarea
                          id="quickSummaryOverride"
                          rows={3}
                          className={fieldClassName()}
                          maxLength={textFieldLimits.summaryOverride}
                          placeholder={previewPacket.summaryCards[0]?.copy}
                          {...form.register("summaryOverride")}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Leave blank to use the generated result sentence.
                          </p>
                          <CharacterCount
                            value={values.summaryOverride}
                            max={textFieldLimits.summaryOverride}
                          />
                        </div>
                      </div>
                    ) : null}

                    {activeCustomerLineEditor === "open-item" ? (
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
                            <label className={labelClassName()} htmlFor="quickExceptionNote">
                              Open-item note
                            </label>
                            <textarea
                              id="quickExceptionNote"
                              rows={2}
                              className={fieldClassName()}
                              maxLength={textFieldLimits.exceptionNote}
                              placeholder="Optional. Tighten the blocked / inaccessible explanation."
                              {...form.register("exceptionNote")}
                            />
                            <CharacterCount
                              value={values.exceptionNote}
                              max={textFieldLimits.exceptionNote}
                            />
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    {activeCustomerLineEditor === "action" ? (
                      <div>
                        <label className={labelClassName()} htmlFor="quickCustomerActionOverride">
                          Customer instruction
                        </label>
                        <textarea
                          id="quickCustomerActionOverride"
                          rows={3}
                          className={fieldClassName()}
                          maxLength={textFieldLimits.customerActionOverride}
                          placeholder={findPacketRowValue(
                            previewPacket.customerClose.actionItems,
                            "Reply or action",
                            previewPacket.customerClose.copy,
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
                    ) : null}

                    {activeCustomerLineEditor === "photo-record" ? (
                      <div className="rounded-[16px] border border-black/8 bg-white/70 px-4 py-4">
                        <p className={labelClassName()}>Photo record</p>
                        <p className="mt-2 text-sm font-bold leading-5 text-foreground">
                          {adaptiveRecord.meta.builderTitle}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {adaptiveRecord.meta.builderCopy}
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
                    ) : null}

                    {activeCustomerLineEditor === "timing" ? (
                      <div>
                        <p className={labelClassName()}>Next service timing</p>
                        <SegmentedControl
                          type="single"
                          value={values.cadence}
                          onValueChange={(value) => {
                            if (
                              axis1CadenceOptions.some(
                                (option) => option.value === value,
                              )
                            ) {
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
                            <SegmentedControlItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SegmentedControlItem>
                          ))}
                        </SegmentedControl>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {selectedCadenceOption.copy}
                        </p>
                      </div>
                    ) : null}
                  </div>
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
                      Closeout start
                    </p>
                    <h3 className="mt-2 text-2xl font-bold leading-[0.92] tracking-[-0.055em] text-white md:text-[2.45rem]">
                      Start the closeout.
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54 md:text-[14px] md:leading-6">
                      Add photos if the crew captured them, or continue with a
                      written service record.
                    </p>
                  </div>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] md:h-11 md:w-11">
                    <IconPhotoScan className="h-5 w-5 text-[#ffb489]" />
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
                  className={`group relative mt-5 flex cursor-pointer items-center justify-between gap-4 overflow-hidden border border-dashed border-[#ffb489]/48 bg-[radial-gradient(circle_at_12%_0%,rgba(255,180,137,0.22),transparent_36%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.1),transparent_24%),rgba(255,255,255,0.06)] px-5 transition hover:border-[#ffb489]/70 hover:bg-white/[0.09] ${
                    hasProofWorkStarted
                      ? "min-h-[104px] rounded-[24px] py-4 sm:min-h-[112px] sm:px-6 sm:py-4"
                      : "min-h-[220px] rounded-[32px] py-5 sm:min-h-[248px] sm:px-8 sm:py-7 xl:min-h-[266px]"
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleBulkPhotoUpload(event.dataTransfer.files);
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb489]">
                      {hasProofWorkStarted ? "Add more" : "Main action"}
                    </p>
                    <p
                      className={`mt-3 font-bold text-white ${
                        hasProofWorkStarted
                          ? "text-2xl leading-[0.98] tracking-[-0.04em] sm:text-3xl"
                          : "max-w-[11ch] text-[2.45rem] leading-[0.88] tracking-[-0.07em] sm:text-[3.55rem]"
                      }`}
                    >
                      {hasProofWorkStarted ? "Add extra photos" : "Drop photos if you have them"}
                    </p>
                    <p className="mt-4 max-w-md text-sm leading-6 text-white/58 md:text-[15px]">
                      {hasProofWorkStarted
                        ? "Drop only the missing or extra photos. The current packet stays intact."
                        : "Before, after, fan, filter, access, label, and issue photos can all go in one batch."}
                    </p>
                    <div
                      className={`mt-5 flex flex-wrap gap-2 ${
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
                        Sort later if needed
                      </Badge>
                    </div>
                  </div>
                  <div
                    className={`grid shrink-0 place-items-center bg-white text-[#111315] shadow-[0_22px_54px_rgba(0,0,0,0.34)] ${
                      hasProofWorkStarted
                        ? "h-12 w-12 rounded-[20px] sm:h-14 sm:w-14"
                        : "h-16 w-16 rounded-[26px] sm:h-20 sm:w-20"
                    }`}
                  >
                    <IconCameraPlus className="h-8 w-8" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    data-photo-upload="bulk"
                    className="sr-only"
                    onChange={(event) => {
                      void handleBulkPhotoUpload(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </motion.label>

                {!hasProofWorkStarted ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <button
                      type="button"
                      onClick={() => selectBuilderStep("job")}
                      className="group flex min-h-[86px] items-center justify-between gap-4 rounded-[24px] border border-white/12 bg-white px-5 py-4 text-left text-[#111315] shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white/95"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#bc3d1f]">
                          No photos?
                        </span>
                        <span className="mt-1 block text-xl font-black tracking-[-0.045em]">
                          Continue anyway
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-[#111315]/58">
                          Build a written service record first.
                        </span>
                      </span>
                      <IconArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5" />
                    </button>
                    <div className="grid min-h-[86px] content-center rounded-[24px] border border-white/10 bg-black/14 px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                        Next
                      </p>
                      <p className="mt-2 text-sm font-bold leading-5 text-white">
                        Pick the result, then copy the customer link or save the PDF.
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
                          Auto-sort result
                        </p>
                        <p className="mt-2 text-2xl font-bold leading-[0.95] tracking-[-0.055em] text-white md:text-[2.35rem]">
                          {proofReadinessTitle}
                        </p>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
                          {proofReadinessCopy}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 md:w-[310px]">
                        {[
                          ["Placed", `${uploadedProofCount}`],
                          ["Extra", `${unplacedFieldPhotos.length}`],
                          ["Core", `${requiredProofReadyCount}/${requiredProofCount}`],
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
                    </div>
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
                                    {uploaded.confidence === "keyword"
                                      ? "High match"
                                      : uploaded.confidence === "order"
                                        ? "Review"
                                        : "Manual"}
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
                    {hasOrderMatchedPhotos ? (
                      <div className="mx-4 mt-3 rounded-[16px] border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 py-2 sm:mx-5">
                        <p className="text-xs font-semibold leading-5 text-[#ffcfb5]">
                          Generic phone filenames detected. We sorted them by
                          upload order, not by visual content.
                        </p>
                      </div>
                    ) : null}
                    {hasBeforeOnly || hasAfterOnly ? (
                      <div className="mx-4 mt-3 rounded-[16px] border border-[#ffb489]/24 bg-[#ffb489]/10 px-3 py-2 sm:mx-5">
                        <p className="text-xs font-semibold leading-5 text-[#ffcfb5]">
                          {hasAfterOnly
                            ? "After photo is present, but no before photo is attached. The packet will stay as an after-photo service record unless you add or mark the missing before photo."
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
                          {adaptiveRecord.coverage.totalPhotos > 0
                            ? `${adaptiveRecord.coverage.placedPhotos} placed`
                            : "Written closeout"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/54">
                        Photo roles are prepared. The customer-facing packet is finalized after the visit outcome is selected.
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
                        {["No photos? Continue", "Have photos? Upload", "Wrong match? Fix later"].map(
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
                          onClick={() => selectBuilderStep("report")}
                          className="hidden rounded-full bg-white px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#111315] hover:bg-white/90 md:inline-flex"
                        >
                          Continue without photos
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
                          className="hidden rounded-full border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/66 hover:bg-white/[0.08] hover:text-white md:inline-flex"
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
                          Mapped proof
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
                                    uploaded.confidence === "order"
                                      ? "border-[#ffb489]/30 bg-[#ffb489]/10 text-[#ffcfb5]"
                                      : "border-[#b9d4c6]/30 bg-[#b9d4c6]/12 text-[#cfe9da]"
                                  }`}
                                >
                                  {uploaded.confidence === "keyword"
                                    ? "High match"
                                    : uploaded.confidence === "order"
                                      ? "Review order"
                                      : "Manual"}
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
                    <span>Proof</span>
                    <span>Slot</span>
                    <span>Status</span>
                    <span className="text-right">Action</span>
                  </div>
                  {openPhotoSlots.length === 0 ? (
                    <div className="px-4 py-5">
                      <p className="text-sm font-semibold text-white">
                        No open proof slots in the working view.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/52">
                        Use Mapped proof to reassign photos, or show all slots if you need
                        to replace a placed image.
                      </p>
                    </div>
                  ) : null}
                  {openPhotoSlots.map((slot) => {
                    const uploaded = uploadedFieldPhotos[slot.id];
                    const resolution = photoSlotResolutions[slot.id];
                    const slotStatus = uploaded
                      ? uploaded.confidence === "manual"
                        ? "Manual"
                        : uploaded.confidence === "keyword"
                          ? "High match"
                          : "Review order"
                      : resolution === "not-captured"
                        ? "Not captured"
                      : resolution === "not-applicable"
                        ? "N/A"
                      : slot.required
                        ? "Missing"
                        : "Recommended";
                    const slotStatusClass = uploaded
                      ? uploaded.confidence === "order"
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
                      Photos stay local in this free preview. Real storage, branded
                      delivery, saved history, and cross-browser retrieval are paid
                      operating features.
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
                  builderStep === "report" ? "hidden" : "hidden"
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
                  Copy local link
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        <div
          className={`min-w-0 space-y-4 ${
            builderStep === "report"
              ? "order-1 md:order-none"
              : "hidden"
          }`}
        >
          <Panel className="px-4 py-4 print:border-0 print:bg-white print:p-0 print:shadow-none md:px-5 md:py-5">
            <div className="pdf-print-hide flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={labelClassName()}>
                  {closeoutEngine.canGeneratePacket ? "Ready to send" : "Result required"}
                </p>
                <h2 className="mt-3 font-display text-[1.38rem] font-bold leading-[1.02] tracking-[-0.045em] text-foreground md:text-[1.55rem] md:leading-[0.96] md:tracking-[-0.06em]">
                  <span className="md:hidden">
                    {closeoutEngine.canGeneratePacket
                      ? "Choose the output."
                      : "Pick what happened."}
                  </span>
                  <span className="hidden md:inline">
                    {closeoutEngine.canGeneratePacket
                      ? "Send the link or save the record."
                      : "Choose a job result before output."}
                  </span>
                </h2>
              </div>
              <div className="hidden rounded-[16px] border border-black/10 bg-[rgba(17,17,17,0.03)] px-4 py-3 md:block">
                <p className={labelClassName()}>Current report mode</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {closeoutFormatLabel}:{" "}
                  {!closeoutEngine.canGeneratePacket
                    ? "no customer link or PDF should be generated yet."
                    : values.scenario === "clean"
                      ? "completed result, customer note, and next visit window."
                      : `${activeJobPattern.label.toLowerCase()} with customer action visible.`}
                </p>
              </div>
            </div>
            <div className="pdf-print-hide mt-4 rounded-[24px] border border-black/8 bg-[#111315] p-3 text-white shadow-[0_18px_56px_rgba(17,19,21,0.18)]">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.055] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-[#f26a21] text-white shadow-[0_12px_26px_rgba(242,106,33,0.26)]">
                      <IconCircleCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb489]">
                        {closeoutEngine.canGeneratePacket
                          ? "Draft from selected result"
                          : "No output yet"}
                      </p>
                      <h3 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-white">
                        {closeoutEngine.canGeneratePacket
                          ? "Ready after the crew picks what happened."
                          : "Pick what happened before generating output."}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-white/58">
                        {closeoutEngine.canGeneratePacket
                          ? "This is generated from the selected job outcome and written service notes, not photo AI."
                          : "The tool will not create a link or PDF from untouched sample defaults."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      [
                        "Result",
                        closeoutEngine.primaryStatusLabel,
                      ],
                      [
                        "Photos",
                        closeoutEngine.basisLabel,
                      ],
                      ["Next", `${selectedCadenceOption.label}`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[14px] border border-white/10 bg-black/18 px-3 py-2"
                      >
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/38">
                          {label}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-white/86">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    disabled={!closeoutEngine.canGeneratePacket}
                    onClick={() => {
                      setReportOutputMode("link");
                      requestFreeReportOutput("copy-link");
                    }}
                    className={`tool-output-card group text-left ${
                      reportOutputMode === "link" ? "is-active" : ""
                    } ${
                      !closeoutEngine.canGeneratePacket
                        ? "cursor-not-allowed opacity-55"
                        : ""
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#b94d11]">
                          Customer
                        </span>
                        <span className="mt-2 block text-xl font-black leading-none tracking-[-0.055em] text-[#111315]">
                          Send customer link
                        </span>
                      </span>
                      <span className="tool-output-icon bg-[#f26a21] text-white">
                        <Copy className="h-5 w-5" />
                      </span>
                    </span>
                    <span className="mt-4 block text-sm leading-5 text-[#5f574f]">
                      Best for text or email. Customer sees what was done, what is open, and what to do next.
                    </span>
                    <span className="tool-output-cta mt-4">
                      Copy link
                      <IconArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={!closeoutEngine.canGeneratePacket}
                    onClick={() => {
                      setReportOutputMode("pdf");
                      requestFreeReportOutput("print-pdf");
                    }}
                    className={`tool-output-card group text-left ${
                      reportOutputMode === "pdf" ? "is-active" : ""
                    } ${
                      !closeoutEngine.canGeneratePacket
                        ? "cursor-not-allowed opacity-55"
                        : ""
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f574f]">
                          Record
                        </span>
                        <span className="mt-2 block text-xl font-black leading-none tracking-[-0.055em] text-[#111315]">
                          Save record PDF
                        </span>
                      </span>
                      <span className="tool-output-icon bg-[#111315] text-white">
                        <FileDown className="h-5 w-5" />
                      </span>
                    </span>
                    <span className="mt-4 block text-sm leading-5 text-[#5f574f]">
                      Best for archive, landlord, corporate, insurance, or later proof requests.
                    </span>
                    <span className="tool-output-cta mt-4">
                      Save PDF
                      <IconArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/10 bg-white/[0.055] px-3 py-2.5">
                <p className="min-w-0 text-xs leading-5 text-white/56">
                  {closeoutEngine.canGeneratePacket
                    ? "Need changes? Edit the exact customer lines. Advanced PDF sections stay under options."
                    : closeoutEngine.blockingReason}
                </p>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWordingEditor((current) => !current)}
                    className="tool-action-btn tool-action-secondary tool-action-mini"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    {showWordingEditor ? "Hide edits" : "Edit wording"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReportOutputMode("pdf");
                      setShowPacketDetails((current) => !current);
                    }}
                    className="tool-action-btn tool-action-quiet tool-action-mini hidden md:inline-flex"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    PDF options
                  </button>
                </div>
              </div>
            </div>
            <motion.div
              layout
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`pdf-print-hide mt-3 overflow-hidden rounded-[22px] border px-3.5 py-3.5 md:hidden ${mobileReportStatusClass}`}
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
                    Proof link check
                  </p>
                  <h3 className="mt-1 text-base font-bold leading-tight tracking-[-0.03em]">
                    {mobileReportStatus.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 opacity-75">
                    {mobileReportStatus.copy}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-[18px] border border-black/8 bg-white/78 p-3">
                <div className="flex items-center justify-between gap-3 px-1 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Ready wording
                  </p>
                  <span className="rounded-full bg-[#111315] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    {reportOutputMode === "link" ? "Link" : "PDF"}
                  </span>
                </div>
                  <button
                    type="button"
                    onClick={() => setActiveCustomerLineEditor("result")}
                    className="group w-full rounded-[16px] border border-black/8 bg-[rgba(17,17,17,0.025)] px-3 py-2.5 text-left transition active:scale-[0.995]"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                        Today&apos;s result
                      </span>
                      <span className="tool-edit-chip shrink-0">
                        <PencilLine className="h-3 w-3" />
                        Edit
                      </span>
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold leading-5 text-foreground">
                      {generatedCustomerLines[0]?.value}
                    </span>
                    <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/80">
                      Other lines are included in the preview below.
                    </span>
                  </button>
              </div>
              <SegmentedControl
                type="single"
                value={reportOutputMode}
                onValueChange={(value) => {
                  if (value === "link" || value === "pdf") {
                    setReportOutputMode(value);
                  }
                }}
                className="tool-segmented-control mt-3 rounded-full bg-white/72"
              >
                <SegmentedControlItem value="link" className="tool-segmented-item rounded-full text-[11px]">
                  Link view
                </SegmentedControlItem>
                <SegmentedControlItem value="pdf" className="tool-segmented-item rounded-full text-[11px]">
                  Record PDF
                </SegmentedControlItem>
              </SegmentedControl>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <p className="min-w-0 text-[11px] leading-4 opacity-70">
                  {reportOutputMode === "link"
                    ? "Copy opens an unbranded local report with the current photos in this browser."
                    : "This is the service record for save/print."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (reportNeedsPhotoReview) {
                      openMobileSheet("photo-review");
                      return;
                    }

                    if (totalFieldPhotoCount === 0) {
                      selectBuilderStep("photos");
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
                  {totalFieldPhotoCount === 0 ? (
                    <Plus className="h-3.5 w-3.5" />
                  ) : reportOutputMode === "pdf" ? (
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
                builderStep === "report"
                  ? ""
                  : "xl:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]"
              }`}
            >
              <div
                className={`rounded-[22px] border border-black/8 bg-[rgba(17,17,17,0.02)] px-4 py-4 ${
                  builderStep === "report" ? "hidden" : ""
                }`}
              >
                {builderStep === "report" ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className={labelClassName()}>Ready to send</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Review the customer link, then copy it or save the PDF.
                          Edit wording only when the recommended copy feels off.
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
                          <p className={labelClassName()}>Generated customer packet</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            These are the exact customer-facing lines to check before sending.
                          </p>
                        </div>
                        <div className="grid gap-2 px-3 py-3">
                          {generatedCustomerLines.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={item.onClick}
                              className="group rounded-[18px] border border-transparent bg-white/78 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#f26a21]/24 hover:bg-white hover:shadow-[0_14px_32px_rgba(17,19,21,0.08)]"
                            >
                              <span className="flex items-start justify-between gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                  {item.label}
                                </span>
                                <span className="tool-edit-chip shrink-0">
                                  <PencilLine className="h-3 w-3" />
                                  {item.action}
                                </span>
                              </span>
                              <span className="mt-1.5 block text-sm font-bold leading-5 text-foreground">
                                {item.value}
                              </span>
                              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                                {item.source}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-[#f0dfd1] bg-white/62 px-4 py-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => requestFreeReportOutput("copy-link")}
                            className="tool-action-btn tool-action-primary tool-action-mini"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy customer link
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
                            Edit wording
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 rounded-[18px] border border-[#f26a21]/18 bg-[#fff7ef] px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={labelClassName()}>Wording override</p>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                Change only these lines when needed. Everything else stays structured.
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
                          Recorded note
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
                            Shows in: Recorded note / closeout detail.
                          </p>
                          <CharacterCount
                            value={values.followUpOverride}
                            max={textFieldLimits.followUpOverride}
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
                      Review first. Change only the customer-facing lines.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      The report writes the wording from the job facts. If one
                      sentence sounds wrong, edit the result, instruction, or
                      recorded note before printing.
                    </p>
                    <div className="mt-4 grid gap-2">
                      {[
                        ["Job", activeJobPattern.label],
                        [
                          "Proof",
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
                      onClick={() => selectBuilderStep("report")}
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
                    <p className={labelClassName()}>Customer link vs PDF</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Switch between the two outputs vendors need: a premium
                      proof link for customer understanding and a service record
                      PDF for archive or later requests.
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
                      Copy local link
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
                        Proof link
                      </SegmentedControlItem>
                      <SegmentedControlItem value="pdf" className="tool-segmented-item rounded-full text-xs">
                        Record PDF
                      </SegmentedControlItem>
                    </SegmentedControl>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        [
                          "Customer link",
                          "Primary output",
                          "Premium web handoff - best for customer clarity, trust, open-item action, and rebook reply.",
                        ],
                        [
                          "PDF / print",
                          "Record output",
                          "Formal service record - best for archive, attachment, print, and later customer requests.",
                        ],
                      ].map(([label, value, copy]) => {
                        const isActive =
                          (label === "Customer link" && reportOutputMode === "link") ||
                          (label === "PDF / print" && reportOutputMode === "pdf");

                        return (
                        <button
                          type="button"
                          key={label}
                          onClick={() =>
                            setReportOutputMode(
                              label === "Customer link" ? "link" : "pdf",
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
                          <p className={labelClassName()}>Free share link</p>
                          <p className="mt-1 text-sm font-bold tracking-[-0.03em] text-foreground">
                            Noindex, unbranded, local photo test.
                          </p>
                          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                            This link stores the current packet and photos in
                            this browser for QA. Hosted storage is still needed
                            before cross-device customer delivery.
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
                          These switches control the service record PDF only.
                          The customer proof link keeps the premium web layout.
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
                            Full report
                          </SegmentedControlItem>
                          <SegmentedControlItem
                            value="short"
                            className="tool-segmented-item rounded-full text-xs"
                          >
                            Short report
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
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {[
                    [
                      "Result",
                      values.scenario === "clean"
                        ? "Standard close-out copy"
                        : values.exceptionKinds.length > 1
                          ? `${values.exceptionKinds.length} recorded exceptions`
                          : "1 recorded exception",
                    ],
                    [
                      "Customer action",
                      values.customerActionOverride?.trim()
                        ? "Manual wording applied"
                        : "Auto-written from selections",
                    ],
                    [
                      "Recorded note",
                      values.followUpOverride?.trim() || values.followUpNote?.trim()
                        ? "Manual note active"
                        : "Default recorded note",
                    ],
                    [
                      "Field proof",
                      hasOrderMatchedPhotos
                        ? `${uploadedProofCount} placed / ${orderMatchedPhotoCount} review`
                        : totalFieldPhotoCount > 0
                        ? `${uploadedProofCount} placed / ${unplacedFieldPhotos.length} extra`
                        : "No photos attached",
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
                      {reportOutputMode === "link" ? "Customer preview" : "PDF preview"}
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
                    Link view
                  </SegmentedControlItem>
                  <SegmentedControlItem value="pdf" className="tool-segmented-item rounded-full text-xs">
                    Record PDF
                  </SegmentedControlItem>
                </SegmentedControl>
              </div>
              <div
                className={`min-w-0 border bg-white ${
                  reportOutputMode === "pdf"
                    ? "tool-pdf-paper-shell mx-auto w-fit max-w-full overflow-x-auto rounded-[18px] border-black/12 p-0 shadow-[0_28px_90px_rgba(17,17,17,0.22)]"
                    : "overflow-x-hidden rounded-[24px] border-black/10 p-2 md:p-3"
                }`}
              >
                <div
                  className={
                    reportOutputMode === "pdf"
                      ? "tool-pdf-document-stage flex min-w-0 justify-center"
                      : "min-w-0"
                  }
                >
                  <Axis1PacketDocument
                    data={previewPacket}
                    className={
                      reportOutputMode === "pdf"
                        ? "tool-pdf-document-preview"
                        : undefined
                    }
                    variant="customer-report"
                    outputIntent={
                      reportOutputMode === "pdf"
                        ? "service-record"
                        : "customer-link"
                    }
                    presentationMode={activePreviewPresentationMode}
                    visibleSections={activePreviewSections}
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
                <DrawerTitle className="text-[1.45rem]">Review photo roles</DrawerTitle>
                <DrawerDescription className="text-xs leading-5">
                  Phone uploads are sorted by order. Change only the wrong roles.
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
                    if (hasOrderMatchedPhotos) {
                      confirmAutoPlacedPhotoRoles();
                      return;
                    }

                    setMobileSheet(null);
                    selectBuilderStep("report");
                  }}
                  className="h-11 rounded-[16px] bg-[#111315] text-[11px] font-bold uppercase tracking-[0.12em] text-white"
                >
                  {hasOrderMatchedPhotos ? "Confirm roles" : "Preview packet"}
                </button>
              </DrawerFooter>
            </>
          ) : null}

          {mobileSheet === "report-actions" ? (
            <>
              <DrawerHeader>
                <DrawerTitle>PDF / print options</DrawerTitle>
                <DrawerDescription>
                  The proof link is the customer handoff. Print / save creates a
                  service record PDF.
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
                      Full report
                    </SegmentedControlItem>
                    <SegmentedControlItem value="short" className="rounded-full text-xs">
                      Short report
                    </SegmentedControlItem>
                  </SegmentedControl>
                  <div className="mt-3 rounded-[16px] border border-[#f26a21]/18 bg-[#fff7ef] px-3 py-2.5">
                    <p className="text-xs leading-5 text-muted-foreground">
                      Free local links are noindex and unbranded. They include
                      photos in this browser for QA; hosted storage is still
                      required for real customer delivery.
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
                    Copy local link
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
                  Back to photos
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
              aria-label="Close setup notice"
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
                  <p className={labelClassName()}>Free output</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                    Neutral customer packet, local preview, no placeholder contact blocks.
                  </p>
                </div>
                <div className="rounded-[18px] border border-[#f26a21]/22 bg-[#fff7ef] px-4 py-3">
                  <p className={labelClassName()}>Setup adds</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                    Logo, phone, dispatch email, reply CTA, saved photos, and history.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href="/start"
                  className="inline-flex h-11 items-center justify-center rounded-[16px] border border-black/10 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground"
                >
                  Request setup
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
        className={`pdf-print-hide fixed inset-x-3 bottom-3 z-40 border border-black/10 bg-white/94 shadow-[0_20px_70px_rgba(17,17,17,0.22)] backdrop-blur md:hidden ${
          isPhotoStep ? "hidden" : ""
        } ${
          builderStep === "report" ? "rounded-[24px] p-2" : "rounded-[26px] p-2.5"
        }`}
        style={{
          paddingBottom:
            builderStep === "report"
              ? "calc(0.5rem + env(safe-area-inset-bottom))"
              : "calc(0.625rem + env(safe-area-inset-bottom))",
        }}
      >
        {builderStep === "report" ? null : (
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Step {builderStepIndex + 1} of {builderSteps.length}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={builderStep}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                    {mobileStepCaption}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                    {mobileStepHint}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex shrink-0 gap-1">
              {builderSteps.map((step, index) => (
                <motion.span
                  key={step.value}
                  layout
                  className={`h-1.5 rounded-full transition-all ${
                    index === builderStepIndex
                      ? "w-6 bg-[#111315]"
                      : index < builderStepIndex
                        ? "w-2 bg-[#f26a21]"
                        : "w-2 bg-black/14"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-[0.82fr_1.18fr] gap-2">
          <button
            type="button"
            onClick={handleMobileSecondaryAction}
            className="tool-action-btn tool-action-secondary h-12 px-3 active:scale-[0.99]"
          >
            {builderStep === "report" ? (
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
