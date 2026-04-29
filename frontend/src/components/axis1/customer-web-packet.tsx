"use client";

import { useEffect, useRef, useState } from "react";
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
  IconMail,
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
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

type CustomerWebPacketSectionVisibility = {
  photos: boolean;
  checklist: boolean;
  routeDetail: boolean;
  nextService: boolean;
};

type CustomerWebPacketProps = {
  data: Axis1PacketPreviewData;
  className?: string;
  presentationMode?: "standard" | "short";
  visibleSections?: Partial<CustomerWebPacketSectionVisibility>;
};

type ProofPhoto = Axis1PacketPreviewData["proofPhotos"][number];
type ComponentRow = Axis1PacketPreviewData["componentStatusRows"][number];
type RouteSegment = Axis1PacketPreviewData["routeSegments"][number];

const defaultSections: CustomerWebPacketSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function customerCopy(value: string) {
  return value
    .replace(/\boffice archive\b/gi, "service archive")
    .replace(/\boffice file\b/gi, "service file")
    .replace(/\boffice records\b/gi, "service records")
    .replaceAll("Open access item", "Blocked access area")
    .replaceAll("open access item", "blocked access area")
    .replaceAll("Open item", "Area needing action")
    .replaceAll("open item", "area needing action")
    .replaceAll("Exception shown", "Needs action")
    .replaceAll("Full raw archive", "Full service archive")
    .replaceAll("PDF packet", "PDF service record")
    .replaceAll("sample packet", "service visit")
    .replaceAll("Sample packet", "Service visit")
    .replaceAll("outside the customer packet", "outside this customer service link")
    .replaceAll("outside the Customer packet", "outside this customer service link")
    .replaceAll("customer packet", "customer service link")
    .replaceAll("Customer packet", "Customer service link")
    .replaceAll("Office note", "Record note")
    .replace(/\bproof\s+P-\d+(?:\s*(?:and|\/)\s*P-\d+)*\b/gi, "service photos")
    .replace(/\bP-\d+(?:\s*(?:and|\/)\s*P-\d+)*\b/g, "service photos")
    .replace(/\b[A-Z]{2}-\d+\b/g, "the service record");
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
  return /cleaned|reset|documented|closed|included|posted|retained|clear/i.test(status);
}

function proofLabel(value: string) {
  return value.replace(/\s*\/\s*/g, " + ");
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
      <p className="mt-2 text-2xl font-semibold leading-none tracking-[-0.045em] text-white">
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
        <dd className="mt-1 font-semibold">{photo.proofId}</dd>
      </div>
      <div>
        <dt className={cx("font-semibold uppercase tracking-[0.11em]", light ? "text-white/42" : "text-[#8d8379]")}>
          Area ref
        </dt>
        <dd className="mt-1 font-semibold">{photo.systemRef}</dd>
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
        priority={priority}
        quality={92}
        sizes="(min-width: 1024px) 900px, 100vw"
        className={cx("object-cover", imageClassName)}
        style={{ objectPosition: photo.position }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.30))]" />
      <ProofBadge photo={photo} />
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        <span className="rounded-full border border-white/20 bg-[#111315]/72 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/82 backdrop-blur">
          {photo.proofId}
        </span>
        <span className="rounded-full border border-white/16 bg-[#111315]/58 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/62 backdrop-blur">
          {photo.systemRef}
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

function ServicePhotoSetRail({ photos }: { photos: readonly ProofPhoto[] }) {
  const visiblePhotos = photos.slice(0, 6);

  return (
    <section className="packet-photo-set-rail">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#ffb489]">
            Full visit photo set
          </p>
          <p className="mt-1 text-sm leading-6 text-white/58">
            The large before/after is the main comparison. All {photos.length} service photos stay available here.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/72">
          {photos.length} photos
        </span>
      </div>

      <div className="packet-photo-set-scroll mt-4">
        {visiblePhotos.map((photo) => (
          <figure key={photo.proofId} className="packet-photo-set-thumb">
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[18px] bg-[#181818]">
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="160px"
                quality={92}
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

function ResultLine({
  label,
  title,
  copy,
  tone,
}: {
  label: string;
  title: string;
  copy: string;
  tone: "success" | "open" | "action" | "record";
}) {
  const Icon =
    tone === "open"
      ? IconAlertTriangleFilled
      : tone === "action"
        ? IconShieldCheckFilled
        : tone === "record"
          ? IconFileText
          : IconCircleCheckFilled;

  return (
    <article className="packet-result-line min-w-0 border-t border-[#ded6cc] py-5 first:border-t-0 sm:px-5">
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
    <div className="packet-data-line grid gap-1 border-t border-[#ded6cc] py-3 text-sm first:border-t-0 sm:grid-cols-[0.42fr_0.58fr] sm:gap-5">
      <dt className="text-[#796f65]">{label}</dt>
      <dd className="font-medium leading-6 text-[#171717] sm:text-right">{customerCopy(value)}</dd>
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

  return (
    <section className="packet-spine-section hidden border-b border-[#ded6cc] bg-[#f4ece1] px-5 py-10 sm:px-8 lg:block lg:px-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <SectionLabel>Service path</SectionLabel>
          <h2 className="font-display mt-3 max-w-xl text-[2.55rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#111315] sm:text-[4rem]">
            One exhaust path, clearly recorded.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#665b50]">
            This service path follows the exhaust line from hood canopy to grease containment, keeping cleaned work, blocked access, and retained records in one customer-readable handoff.
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
                  Select a checkpoint to see its status and proof photo.
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
                Work represented in this customer link
              </p>
              <p className="text-xs text-white/42">{completedWork.length} close-out actions retained</p>
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
  scopeNote,
}: {
  scopeNote: string;
}) {
  const covered = [
    "Hood canopy + filters",
    "Reachable plenum / duct path",
    "Fan, roof discharge + grease path",
  ];

  return (
    <div className="packet-system-coverage mt-7 hidden rounded-[24px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur-xl lg:block">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#ffb489]">
        Covered system path
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {covered.map((item) => (
          <span
            key={item}
            className="packet-system-chip inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80"
          >
            {item}
          </span>
        ))}
      </div>
      <p className="mt-3 max-w-2xl text-xs leading-6 text-white/54">
        {customerCopy(scopeNote)}
      </p>
    </div>
  );
}

function MobileProofCommand({
  data,
  proofPhotos,
  customerNextStep,
  primaryCtaLabel,
  pdfServiceRecordHref,
  accessRevisitWindow,
  nextServiceWindow,
  hasOpenAccessItem,
  hasVendorEmail,
  hasVendorPhone,
}: {
  data: Axis1PacketPreviewData;
  proofPhotos: ProofPhoto[];
  customerNextStep: string;
  primaryCtaLabel: string;
  pdfServiceRecordHref: string;
  accessRevisitWindow: string;
  nextServiceWindow: string;
  hasOpenAccessItem: boolean;
  hasVendorEmail: boolean;
  hasVendorPhone: boolean;
}) {
  const mobileCtaLabel = hasOpenAccessItem ? "Reply" : "Confirm";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="packet-mobile-command pdf-print-hide mt-5 lg:hidden">
      <div className="packet-mobile-command-shell">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/42">
              Quick actions
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              Reply, view photos, or save the record.
            </p>
          </div>
          <span className="rounded-full border border-[#ff9b63]/30 bg-[#ff6b1a]/12 px-2.5 py-1 text-[11px] font-semibold text-[#ffb489]">
            {hasOpenAccessItem ? "Action needed" : "Ready"}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
          {hasVendorEmail ? (
            <a
              href={`mailto:${data.vendor.dispatch}`}
              className="packet-mobile-primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#ff6b1a] px-4 text-sm font-semibold text-white"
            >
              <IconMail className="h-4 w-4" />
              <span>{mobileCtaLabel}</span>
            </a>
          ) : null}

          <button
            type="button"
            onPointerDown={() => setIsDrawerOpen(true)}
            onClick={() => setIsDrawerOpen(true)}
            className="packet-mobile-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white"
          >
            <IconPhoto className="h-4 w-4" />
            Photos
          </button>

          <Drawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            shouldScaleBackground={false}
          >
            <DrawerContent className="packet-mobile-proof-drawer bg-[#101214] text-white">
              <DrawerHeader className="px-5 pb-2 pt-5">
                <DrawerTitle className="text-white">Photos and service record</DrawerTitle>
                <DrawerDescription className="text-white/58">
                  Blocked access, before/after photos, and the PDF record stay separated.
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
                        <span>PDF record</span>
                        <strong>Available for files</strong>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="photos">
                  <div className="packet-mobile-photo-strip">
                    {proofPhotos.map((photo) => (
                      <figure
                        key={photo.proofId}
                        className="packet-mobile-photo-card"
                      >
                        <ProofImage
                          photo={photo}
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
                    <h3>Keep the PDF service record.</h3>
                    <p>
                      The PDF is the file version for managers, insurance, or inspection-related documentation requests. It does not replace an official inspection.
                    </p>
                    <a href={pdfServiceRecordHref} download>
                      Download PDF service record
                    </a>
                  </div>
                </TabsContent>
              </Tabs>

              <DrawerFooter className="border-white/10 bg-[#101214] px-5 py-4">
                {hasVendorEmail ? (
                  <a
                    href={`mailto:${data.vendor.dispatch}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-[18px] bg-white px-4 text-sm font-semibold text-[#111315]"
                  >
                    {primaryCtaLabel}
                  </a>
                ) : null}
                {hasVendorPhone ? (
                  <a
                    href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-[16px] border border-white/12 bg-white/7 px-4 text-sm font-semibold text-white"
                  >
                    Call vendor
                  </a>
                ) : null}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <a
            href={pdfServiceRecordHref}
            download
            className="packet-mobile-secondary-action inline-flex min-h-12 items-center justify-center rounded-[18px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white"
            aria-label="Download PDF service record"
          >
            <IconFileText className="h-4 w-4" />
          </a>
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
    <div className="packet-scope-column min-w-0 border-t border-[#ded6cc] p-5 first:border-t-0 lg:border-l lg:border-t-0 lg:first:border-l-0">
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
              {row.proof ? "Photo evidence attached" : "Status recorded"}
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
  presentationMode = "standard",
  visibleSections,
}: CustomerWebPacketProps) {
  const [showMobileDock, setShowMobileDock] = useState(false);
  const sections = { ...defaultSections, ...visibleSections };
  const isShort = presentationMode === "short";
  const openItems = data.componentStatusRows.filter((row) => isPrimaryOpenStatus(row.status));
  const notIncludedAreas = openItems.length;
  const completedAreas = data.componentStatusRows.filter((row) => isCompletedStatus(row.status)).length;
  const primaryOpenItem =
    data.deficiencyRows.find((row) => isOpenStatus(row.status)) ?? data.deficiencyRows[0];
  const nextServiceWindow =
    findActionValue(data.customerClose.actionItems, [/next routine service/i, /next visit window/i]) ??
    getRowValue(data.frequencyRows, ["Next service window"]) ??
    "Next window recorded";
  const hasOpenAccessItem = openItems.length > 0 && Boolean(primaryOpenItem);
  const accessRevisitWindow =
    findActionValue(data.customerClose.actionItems, [/access revisit/i]) ??
    (hasOpenAccessItem ? "After rear duct access is cleared" : "No access revisit needed");
  const serviceDate =
    getRowValue(data.packetHeader.quickFacts, ["Service date"]) ?? "Service date recorded";
  const resultSubcopy =
    customerCopy(data.packetHeader.copy);
  const beforePhoto = data.proofPhotos.find((photo) => photo.tone === "before") ?? data.proofPhotos[0];
  const afterPhoto =
    data.proofPhotos.find((photo) => photo.tone === "after") ?? data.proofPhotos[1] ?? beforePhoto;
  const issuePhoto = data.proofPhotos.find((photo) => photo.tone === "issue");
  const canCompareBeforeAfter =
    beforePhoto && afterPhoto ? isMatchedBeforeAfterPair(beforePhoto, afterPhoto) : false;
  const customerNextStep =
    hasOpenAccessItem
      ? "Move stored equipment away from the rear duct access panel. Reply when access is clear so the vendor can confirm the revisit."
      : customerCopy(data.customerClose.title);
  const mobileCustomerNextStep =
    hasOpenAccessItem
      ? "Clear rear duct access, then reply."
      : customerCopy(data.customerClose.title);
  const actionAreaHeadline = `${openItems.length} area${openItems.length > 1 ? "s" : ""} ${
    openItems.length > 1 ? "need" : "needs"
  } your action`;
  const serviceOutcomeLabel =
    openItems.length > 0 ? actionAreaHeadline : "Ready for records";
  const primaryCtaLabel =
    hasOpenAccessItem ? "Reply after clearing access" : "Confirm next service window";
  const nextMetricValue = hasOpenAccessItem ? "Clear + reply" : shortDate(nextServiceWindow);
  const serviceResultLabel = serviceDate.toLowerCase().includes("recorded")
    ? "Service result"
    : `${shortDate(serviceDate)} service result`;
  const pdfServiceRecordHref = "/downloads/axis1-branded-sample-packet.pdf";
  const keyPhotoIds = [beforePhoto, afterPhoto, issuePhoto]
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
  const hasVendorPhone = data.vendor.directLine.trim().length > 0;
  const hasVendorEmail = data.vendor.dispatch.trim().length > 0;

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

  return (
    <article
      className={cx(
        "customer-web-packet packet-shell overflow-hidden bg-[#f7f1e9] text-[#111315] shadow-[0_36px_110px_rgba(17,17,17,0.1)] print:rounded-none print:border-0 print:shadow-none",
        className,
      )}
    >
      <section className="packet-hero-shell relative min-h-[740px] overflow-hidden bg-[#0f141b] text-white sm:min-h-[760px] lg:min-h-[720px]">
        {afterPhoto ? (
          <Image
            src={afterPhoto.src}
            alt=""
            fill
            priority
            sizes="1080px"
            className="object-cover opacity-50"
            style={{ objectPosition: afterPhoto.position }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,155,99,0.18),transparent_28%),linear-gradient(90deg,rgba(15,20,27,0.97)_0%,rgba(15,20,27,0.88)_44%,rgba(15,20,27,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0f141b] to-transparent" />

        <div className="relative grid min-h-[740px] content-between gap-8 px-5 py-6 sm:min-h-[760px] sm:px-8 sm:py-8 lg:min-h-[720px] lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.72fr)] lg:px-10 lg:py-10">
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="packet-vendor-mark flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white text-[#121821] shadow-[0_18px_46px_rgba(0,0,0,0.28)]">
                  {data.vendor.logoUrl ? (
                    <Image
                      src={data.vendor.logoUrl}
                      alt={`${data.vendor.name} logo`}
                      width={52}
                      height={52}
                      className="h-full w-full object-contain p-1.5"
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
                    openItems.length > 0
                      ? "border-[#ffb489]/40 bg-[#ffb489]/13 text-[#ffb489]"
                      : "border-[#b6d8c5]/35 bg-[#b6d8c5]/13 text-[#bfe8d0]",
                  )}
                >
                  {openItems.length > 0 ? (
                    <IconAlertTriangleFilled className="h-3.5 w-3.5" />
                  ) : (
                    <IconCircleCheckFilled className="h-3.5 w-3.5" />
                  )}
                  {serviceOutcomeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex max-w-3xl flex-col justify-end pb-2 lg:pb-5">
            <SectionLabel light>Customer service link</SectionLabel>
            <h1 className="font-display mt-5 max-w-4xl text-[2.62rem] font-semibold leading-[0.9] tracking-[-0.075em] text-white min-[390px]:text-[2.86rem] sm:text-[5.3rem] lg:text-[6rem]">
              {openItems.length > 0 ? (
                <>
                  Service completed.
                  <br />
                  <span className="text-[#ff7a1a]">
                    {" "}{actionAreaHeadline}.
                  </span>
                </>
              ) : (
                "Service completed"
              )}
            </h1>
            <p className="mt-5 hidden max-w-2xl text-base leading-7 text-white/72 sm:block">
              {resultSubcopy}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/68 sm:hidden">
              Accessible work is recorded. The blocked access area is separated from completed work.
            </p>

            <div className="mt-4 grid overflow-hidden rounded-[22px] border border-white/13 bg-white/[0.075] backdrop-blur-xl sm:grid-cols-4">
              {[
                ["Completed", String(completedAreas)],
                ["Customer action", String(openItems.length)],
                ["Not included", String(notIncludedAreas)],
                ["Next", nextMetricValue],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 border-t border-white/12 px-4 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/42">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold leading-tight tracking-[-0.035em] text-white sm:text-xl">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="packet-hero-next-step mt-4 rounded-[22px] border border-[#ffb489]/24 bg-[#ff6b1a]/10 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#ffb489]">
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
            <MobileProofCommand
              data={data}
              proofPhotos={mobileProofPhotos}
              customerNextStep={mobileCustomerNextStep}
              primaryCtaLabel={primaryCtaLabel}
              pdfServiceRecordHref={pdfServiceRecordHref}
              accessRevisitWindow={accessRevisitWindow}
              nextServiceWindow={nextServiceWindow}
              hasOpenAccessItem={hasOpenAccessItem}
              hasVendorEmail={hasVendorEmail}
              hasVendorPhone={hasVendorPhone}
            />
            <SystemCoverageBanner scopeNote={data.scopeNote} />
            <div className="mt-8 hidden flex-col gap-3 sm:flex-row lg:flex">
              {hasVendorEmail ? (
                <Button
                  asChild
                  className="packet-primary-cta min-h-12 rounded-[14px] bg-[#ff6b1a] px-6 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(255,107,26,0.22)] hover:bg-[#ff7a2f]"
                >
                  <a href={`mailto:${data.vendor.dispatch}`}>
                    <IconMail className="h-4 w-4" />
                    {primaryCtaLabel}
                  </a>
                </Button>
              ) : null}
              <Button
                asChild
                variant="outline"
                className="packet-secondary-cta min-h-12 rounded-[14px] border-white/16 bg-white/6 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
              >
                <a href={pdfServiceRecordHref} download>
                  <IconFileText className="h-4 w-4" />
                  Download PDF record
                </a>
              </Button>
              {hasVendorPhone ? (
                <Button
                  asChild
                  variant="outline"
                  className="packet-secondary-cta min-h-12 rounded-[14px] border-white/16 bg-white/6 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
                >
                  <a href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}>
                    <IconPhone className="h-4 w-4" />
                    Call vendor
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

        <div className="hidden self-center lg:block">
            {issuePhoto ? (
              <div className="packet-glass-card overflow-hidden rounded-[30px] border border-white/13 bg-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#ffb489]">
                      Customer action needed
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.045em]">
                      Blocked access photo + next action
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#ffb489]/30 bg-[#ff6b1a]/13 px-3 py-1.5 text-xs font-semibold text-[#ffc29d]">
                    Not included
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
                        Clear rear duct access, then reply.
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/58">
                        This section is separated from completed work until access is clear.
                      </p>
                    </div>

                    <dl className="grid gap-2">
                      {[
                        ["Not completed", "Rear duct access"],
                        ["Reason", "Stored equipment blocked panel"],
                        ["Next", "Clear + reply"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="grid grid-cols-[0.42fr_0.58fr] gap-3 rounded-[16px] border border-white/10 bg-white/[0.055] px-3 py-2.5"
                        >
                          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/38">
                            {label}
                          </dt>
                          <dd className="text-right text-xs font-semibold leading-5 text-white/78">
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
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <div className="packet-metric-strip grid grid-cols-2 border-y border-white/14 bg-white/[0.025] py-1 backdrop-blur-xl sm:grid-cols-4">
              <Metric label="Completed" value={completedAreas} />
              <Metric label="Customer action" value={openItems.length} />
              <Metric label="Not included" value={notIncludedAreas} />
              <Metric label="Next" value={nextMetricValue} />
            </div>
          </div>
        </div>
      </section>

      <section className="packet-result-section grid gap-9 border-b border-[#ded6cc] bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10 lg:py-14">
        <div className="max-w-xl">
          <SectionLabel>{serviceResultLabel}</SectionLabel>
          <h2 className="font-display mt-3 text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.07em] sm:text-[4.1rem]">
            Here&apos;s the bottom line.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#6d645b]">
            The handoff separates completed work from blocked access so the customer can understand the visit without calling the office.
          </p>
        </div>

        <div className="packet-result-list grid min-w-0 overflow-hidden rounded-[30px] border border-[#ded6cc] bg-white/72 sm:grid-cols-2 xl:grid-cols-4">
          <ResultLine
            label="Completed this visit"
            title={customerCopy(data.summaryCards[0]?.title ?? "Accessible service areas were completed.")}
            copy={customerCopy(data.summaryCards[0]?.copy ?? data.packetHeader.copy)}
            tone="success"
          />
          <ResultLine
            label={openItems.length > 0 ? "Needs customer action" : "No blocked area"}
            title={
              openItems.length > 0
                ? customerCopy(primaryOpenItem?.issue ?? "A blocked area needs customer action.")
                : "No blocked area remained at close-out."
            }
            copy={
              openItems.length > 0
                ? customerCopy(primaryOpenItem?.ownerAction ?? "Review the blocked area and reply for follow-up.")
                : "The service can be kept with kitchen exhaust maintenance records."
            }
            tone={openItems.length > 0 ? "open" : "success"}
          />
          <ResultLine
            label="Customer action"
            title={customerNextStep}
            copy={
              hasOpenAccessItem
                ? "The vendor will confirm the access revisit before scheduling. Routine service stays separate."
                : customerCopy(data.customerClose.copy)
            }
            tone="action"
          />
          <ResultLine
            label="Record note"
            title="Keep the PDF service record with kitchen exhaust files."
            copy="The PDF service record is for manager, insurance, or documentation requests. It is not an official inspection, fire-system service, code compliance certificate, or AHJ approval."
            tone="record"
          />
        </div>
      </section>

      <ExhaustProofSpine
        routeSegments={data.routeSegments}
        proofPhotos={data.proofPhotos}
        proofPolicyRows={data.proofPolicyRows}
        completedWork={data.completedWork}
        scopeNote={data.scopeNote}
      />

      {sections.photos && beforePhoto && afterPhoto ? (
        <section
          id="proof-story"
          className="packet-proof-section border-b border-[#ded6cc] bg-[#111111] px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-16"
        >
          <div className="grid gap-10 lg:grid-cols-[0.52fr_1fr] lg:items-start">
            <motion.div
              className="order-1 lg:sticky lg:top-8 lg:order-1"
              initial={false}
            >
              <SectionLabel light>Service photos from this visit</SectionLabel>
              <h2 className="font-display mt-3 max-w-xl text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.07em] sm:text-[4.1rem]">
                The photos show what changed.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/62">
                {canCompareBeforeAfter
                    ? "First review the blocked rear duct access. Then compare the completed hood area before and after service."
                  : "First review the blocked rear duct access. Then review the completed service photos."}
              </p>
              <ol className="packet-proof-steps mt-8 hidden border-l border-white/12 pl-5 lg:block">
                {[
                  [
                    "01",
                    "Review blocked access",
                    "The blocked rear duct access is shown first so it cannot be confused with completed work.",
                  ],
                  [
                    "02",
                    canCompareBeforeAfter ? "Compare before and after" : "Review completed photos",
                    canCompareBeforeAfter
                      ? "The hood photos show visible change in the completed area."
                      : "Completed service photos stay grouped without forcing a false matched comparison.",
                  ],
                  ["03", "Keep the record", "The PDF service record stays available for files and documentation requests."],
                ].map(([step, title, copy]) => (
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
                  <ProofImage photo={issuePhoto} className="aspect-[1.12/1] rounded-none lg:aspect-auto" />
                  <figcaption className="flex flex-col justify-center p-6 sm:p-8">
                    <SectionLabel light>Blocked access photo</SectionLabel>
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
                {canCompareBeforeAfter ? (
                  <>
                    <BeforeAfterCompare beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <ProofCaption photo={beforePhoto} light />
                      <ProofCaption photo={afterPhoto} light />
                    </div>
                    <ServicePhotoSetRail photos={data.proofPhotos} />
                  </>
                ) : (
                  <>
                    <ProofPairCards beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
                    <ServicePhotoSetRail photos={data.proofPhotos} />
                  </>
                )}
              </motion.div>

            </div>
          </div>
        </section>
      ) : null}

      {openItems.length > 0 && primaryOpenItem ? (
        <section className="packet-open-section border-b border-[#ead8ca] bg-[#fff8f1] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <SectionLabel>Blocked area</SectionLabel>
                <h2 className="font-display mt-3 text-[2.45rem] font-semibold leading-[0.96] tracking-[-0.07em] sm:text-[3.7rem]">
                  This area was not completed because access was blocked.
                </h2>
              </div>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#6b5f55]">
                Completed work and blocked access are separated, so this visit is not mistaken for full-access service.
              </p>
            </div>

            <Card className="packet-open-card gap-0 overflow-hidden rounded-[32px] border-[#edbd9f] bg-white py-0 shadow-[0_28px_80px_rgba(145,72,31,0.14)]">
              <CardHeader className="border-b border-[#ead8ca] px-6 py-6">
                <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a85a32]">
                  Customer action
                </CardDescription>
                <CardTitle className="mt-2 text-[1.9rem] leading-[0.98] tracking-[-0.055em] sm:text-[2.55rem]">
                  {customerCopy(primaryOpenItem.ownerAction)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <dl className="divide-y divide-[#ead8ca]">
                  <DataLine label="Area" value={cleanComponentLabel(primaryOpenItem.location)} />
                  <DataLine label="Status" value="Not included in completed scope" />
                  <DataLine label="Reason" value={primaryOpenItem.issue} />
                  <DataLine label="Follow-up" value={primaryOpenItem.status} />
                </dl>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {sections.checklist ? (
        <section className="packet-scope-section border-b border-[#ded6cc] bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-8 grid gap-4 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
            <div>
              <SectionLabel>Scope at a glance</SectionLabel>
              <h2 className="font-display mt-3 text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.07em] sm:text-[3.35rem]">
                What the service covered.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#6d645b] lg:justify-self-end">
              The customer-facing version keeps completed work, customer action, and recorded review items separated so the next reply stays simple.
            </p>
          </div>
          <div className="packet-scope-board grid overflow-hidden rounded-[28px] border border-[#ded6cc] bg-white lg:grid-cols-3">
            <ScopeGroup label="Completed" rows={scopeGroups.Completed} />
            <ScopeGroup label="Customer action" rows={scopeGroups["Customer action"]} />
            <ScopeGroup label="Recorded for review" rows={scopeGroups["Recorded for review"]} />
          </div>
        </section>
      ) : null}

      <section
        id="record"
        className="packet-record-section grid gap-5 border-b border-[#ded6cc] bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-14"
      >
        <Card className="packet-record-card gap-0 rounded-[28px] border-0 bg-[#111315] py-0 text-white shadow-[0_28px_80px_rgba(17,17,17,0.18)]">
          <CardHeader className="px-6 py-6">
            <IconFileText className="h-7 w-7 text-[#ff9b63]" />
            <CardTitle className="mt-6 text-[2.35rem] leading-[0.92] tracking-[-0.075em]">
              Keep this record.
            </CardTitle>
            <CardDescription className="mt-4 text-sm leading-7 text-white/68">
              Keep this record with your kitchen exhaust maintenance files. It includes the service date, cleaned scope, service photos, blocked or not-completed areas, and recommended next service window.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Separator className="mb-5 bg-white/12" />
            <p className="text-sm leading-7 text-white/62">
              A PDF service record is available for files, manager review, insurance, or documentation requests. It does not replace an official inspection, fire-system service, code compliance certificate, or AHJ approval.
            </p>
            <Button
              asChild
              className="packet-service-record-link mt-5 min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-[#111315] hover:bg-[#f4eee6]"
            >
              <a href={pdfServiceRecordHref} download>
                <IconFileText className="h-4 w-4" />
                Download PDF service record
              </a>
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
                  ? "Clear the blocked access area, then reply. The vendor will confirm the access revisit before scheduling. The routine service window stays separate."
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
                {hasVendorEmail ? (
                  <Button
                    asChild
                    className="min-h-11 rounded-full bg-[#111315] px-5 text-sm font-semibold text-white"
                  >
                    <a href={`mailto:${data.vendor.dispatch}`}>{primaryCtaLabel}</a>
                  </Button>
                ) : null}
                {hasVendorPhone ? (
                  <Button
                    asChild
                    variant="outline"
                    className="min-h-11 rounded-full border-[#d9d0c5] bg-white px-5 text-sm font-semibold text-[#111315]"
                  >
                    <a href={`tel:${data.vendor.directLine.replace(/[^+\d]/g, "")}`}>
                      Call {data.vendor.name}
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
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.6fr_1fr] lg:items-end">
            <div>
              <SectionLabel light>Additional photo evidence</SectionLabel>
              <h2 className="font-display mt-3 text-[2.45rem] font-semibold leading-[0.96] tracking-[-0.07em] sm:text-[3.55rem]">
                More photos, kept out of the way.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/58 lg:justify-self-end">
              The customer gets the main photos first. Supporting photos stay available below without turning the handoff into a photo dump.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
          <div className="mb-8 grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
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
          <div className="packet-findings-board grid overflow-hidden rounded-[28px] border border-[#ded6cc] bg-white lg:grid-cols-3">
            {data.deficiencyRows.map((row, index) => (
              <article
                key={`${row.location}-${index}`}
                className="packet-finding-card min-w-0 border-t border-[#ded6cc] p-5 first:border-t-0 lg:border-l lg:border-t-0 lg:first:border-l-0"
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
                  Scope ledger
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
                  Close-out record
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

      <footer className="packet-footer bg-[#111315] px-5 py-6 text-white sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2 text-[#ff9b63]">
            <IconFlame className="h-5 w-5" />
            <span className="text-sm font-semibold">{data.vendor.name}</span>
          </div>
          <p className="max-w-3xl text-xs leading-6 text-white/52">
            This packet is a customer-facing service communication and documentation aid prepared from vendor-provided job information. It does not certify code compliance, replace an official inspection or fire-system service, or guarantee approval by any authority having jurisdiction.
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
      >
        <div className="grid grid-cols-[1fr_auto] gap-1">
          {hasVendorEmail ? (
            <a
              href={`mailto:${data.vendor.dispatch}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[18px] bg-white px-3 text-xs font-semibold text-[#111315]"
            >
              <IconMail className="h-4 w-4" />
              {hasOpenAccessItem ? "Reply" : "Confirm"}
            </a>
          ) : null}
          <a
            href={pdfServiceRecordHref}
            download
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[18px] border border-white/12 bg-white/9 px-3 text-xs font-semibold text-white"
          >
            <IconFileText className="h-4 w-4" />
            PDF
          </a>
        </div>
      </div>
    </article>
  );
}
