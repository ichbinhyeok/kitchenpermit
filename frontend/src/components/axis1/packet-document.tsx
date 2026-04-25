import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

type Axis1PacketDocumentProps = {
  data: Axis1PacketPreviewData;
  className?: string;
  variant?: "vendor-sample" | "customer-report";
  presentationMode?: "standard" | "short";
  visibleSections?: Partial<Axis1PacketDocumentSectionVisibility>;
};

type Row = readonly [string, string];

export type Axis1PacketDocumentSectionVisibility = {
  photos: boolean;
  checklist: boolean;
  routeDetail: boolean;
  nextService: boolean;
};

const defaultSectionVisibility: Axis1PacketDocumentSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function customerFacingCopy(value: string) {
  return value
    .replace(/\boffice archive\b/gi, "service archive")
    .replace(/\boffice file\b/gi, "service file")
    .replace(/\boffice records\b/gi, "service records")
    .replaceAll("Exception shown", "Open item")
    .replaceAll("Full raw archive", "Full service archive")
    .replaceAll("PDF packet", "PDF service report")
    .replaceAll("sample packet", "service visit")
    .replaceAll("Sample packet", "Service visit")
    .replaceAll("customer packet", "customer report")
    .replaceAll("Customer packet", "Customer report")
    .replaceAll("packet", "report")
    .replaceAll("Packet", "Report")
    .replaceAll("Packet coverage", "Report coverage")
    .replaceAll("Office note", "Record note");
}

function mapRows(rows: readonly Row[], transform: (value: string) => string) {
  return rows.map(([label, value]) => [transform(label), transform(value)] as const);
}

function mapScopeRows(
  rows: Axis1PacketPreviewData["scopeRows"],
  transform: (value: string) => string,
) {
  return rows.map(
    ([area, status, note]) => [transform(area), status, transform(note)] as const,
  );
}

function mapComponentStatusRows(
  rows: Axis1PacketPreviewData["componentStatusRows"],
  transform: (value: string) => string,
) {
  return rows.map((row) => ({
    ...row,
    component: transform(row.component),
    note: transform(row.note),
  }));
}

function mapPhotoCoverageRows(
  rows: Axis1PacketPreviewData["photoCoverageRows"],
  transform: (value: string) => string,
) {
  return rows.map((row) => ({
    ...row,
    item: transform(row.item),
    proof: transform(row.proof),
    status: transform(row.status),
  }));
}

function statusClasses(status: string) {
  if (
    status === "Cleaned" ||
    status === "Reset" ||
    status === "Reachable cleaned" ||
    status === "Access clear" ||
    status === "Closed"
  ) {
    return "border-[#b9d4c6] bg-[#eef7f2] text-[#1e6045]";
  }

  if (
    status === "Access blocked" ||
    status === "Needs reply" ||
    status === "Review" ||
    status === "Partial"
  ) {
    return "border-[#f3c0a2] bg-[#fff0e7] text-[#bc3d1f]";
  }

  return "border-[#d8d2ca] bg-[#f5f2ee] text-[#423c36]";
}

function proofToneClasses(tone: Axis1PacketPreviewData["proofPhotos"][number]["tone"]) {
  if (tone === "after") {
    return {
      label: "border-[#b9d4c6] bg-[#eef7f2] text-[#1e6045]",
      filter: "brightness(1.05) contrast(1.06) saturate(0.88)",
      overlay: "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,17,17,0.14))]",
    };
  }

  if (tone === "issue") {
    return {
      label: "border-[#f3c0a2] bg-[#fff0e7] text-[#bc3d1f]",
      filter: "brightness(0.9) contrast(1.14) saturate(0.76)",
      overlay: "bg-[linear-gradient(135deg,rgba(242,106,33,0.12),transparent_40%,rgba(17,17,17,0.22))]",
    };
  }

  if (tone === "record") {
    return {
      label: "border-[#d8d2ca] bg-white text-[#423c36]",
      filter: "brightness(0.98) contrast(1.08) saturate(0.76)",
      overlay: "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,17,17,0.2))]",
    };
  }

  return {
    label: "border-[#d8b5a8] bg-[#fff5ee] text-[#8f2d19]",
    filter: "brightness(0.76) contrast(1.14) saturate(0.68)",
    overlay: "bg-[linear-gradient(180deg,rgba(17,17,17,0.06),rgba(17,17,17,0.32))]",
  };
}

function customerPhotoLabel(photo: Axis1PacketPreviewData["proofPhotos"][number]) {
  switch (photo.systemRef) {
    case "HD-01":
      return photo.label === "Before" ? "Before cleaning" : "After cleaning";
    case "FL-01":
      return "Filters reset";
    case "DK-02":
      return "Duct access";
    case "RF-01":
      return "Rooftop fan";
    case "GC-01":
      return "Grease path";
    default:
      return photo.label;
  }
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f26a21]">
      {children}
    </p>
  );
}

function StatusMark({ status }: { status: string }) {
  return (
    <span
      className={cx(
        "inline-flex w-fit self-start justify-self-start whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[-0.01em]",
        statusClasses(status),
      )}
    >
      {status}
    </span>
  );
}

function DataLedger({ rows }: { rows: readonly Row[] }) {
  return (
    <dl className="divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 py-3 text-sm sm:grid-cols-[0.45fr_0.55fr] sm:gap-5"
        >
          <dt className="text-[#746b62]">{label}</dt>
          <dd className="break-words font-medium leading-6 text-[#151515] sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DenseLedger({ rows }: { rows: readonly Row[] }) {
  return (
    <dl className="divide-y divide-[#e7e0d8]">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 py-2.5 text-sm sm:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] sm:gap-5"
        >
          <dt className="min-w-0 text-[#746b62]">{label}</dt>
          <dd className="min-w-0 break-words font-semibold leading-6 text-[#151515] sm:text-right">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ComponentStatusMatrix({
  rows,
}: {
  rows: Axis1PacketPreviewData["componentStatusRows"];
}) {
  return (
    <div className="divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
      {rows.map((row) => (
        <div
          key={row.component}
          className="pdf-document-card grid gap-3 py-4 text-sm lg:grid-cols-[minmax(0,1.05fr)_auto_76px_minmax(0,1.05fr)] lg:items-start"
          style={{ breakInside: "avoid" }}
        >
          <div className="min-w-0">
            <p className="font-bold tracking-[-0.02em] text-[#151515]">{row.component}</p>
            <p className="mt-1 text-sm leading-6 text-[#746b62] lg:hidden">{row.note}</p>
          </div>
          <StatusMark status={row.status} />
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178] lg:text-right">
            {row.proof}
          </p>
          <p className="hidden min-w-0 text-sm leading-6 text-[#746b62] lg:block">{row.note}</p>
        </div>
      ))}
    </div>
  );
}

function PhotoCoverageChecklist({
  rows,
}: {
  rows: Axis1PacketPreviewData["photoCoverageRows"];
}) {
  return (
    <div className="divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
      {rows.map((row) => (
        <div
          key={row.item}
          className="grid gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_72px_auto] sm:items-center"
        >
          <p className="font-semibold tracking-[-0.01em] text-[#151515]">{row.item}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178] sm:text-right">
            {row.proof}
          </p>
          <span
            className={cx(
              "inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold",
              row.status === "Uploaded"
                ? "border-[#b9d4c6] bg-[#eef7f2] text-[#1e6045]"
                : row.status === "Exception shown" ||
                    row.status === "Open item" ||
                    row.status === "Not captured"
                ? "border-[#f3c0a2] bg-[#fff0e7] text-[#bc3d1f]"
                : row.status === "N/A" || row.status === "Not attached"
                ? "border-[#d8d2ca] bg-[#f5f2ee] text-[#746b62]"
                : "border-[#d8d2ca] bg-white text-[#423c36]",
            )}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ContactStrip({ data }: { data: Axis1PacketPreviewData }) {
  const rows = ([
    ["Direct line", data.vendor.directLine],
    ["Dispatch", data.vendor.dispatch],
    ["Credential", data.vendor.certification],
    ["After-hours", data.vendor.afterHours],
  ] as const).filter(([, value]) => value.trim().length > 0);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="packet-contact-grid grid border-y border-[#ded7cf] sm:grid-cols-2 xl:grid-cols-4">
      {rows.map(([label, value], index) => (
        <div
          key={label}
          className={cx(
            "min-w-0 px-0 py-4 sm:px-5",
            index > 0 && "border-t border-[#e7e0d8] sm:border-l sm:border-t-0",
            index === 2 && "sm:border-t xl:border-t-0",
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178]">
            {label}
          </p>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-[#151515]">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SummaryBand({
  data,
  transform = (value: string) => value,
}: {
  data: Axis1PacketPreviewData;
  transform?: (value: string) => string;
}) {
  const icons = [
    CheckCircle2,
    data.scenario === "exception" ? AlertTriangle : ShieldCheck,
    Clock3,
  ];

  return (
    <section className="pdf-document-section bg-[#111315] text-white">
      <div className="packet-summary-grid grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        {data.summaryCards.map((card, index) => {
          const Icon = icons[index] ?? CheckCircle2;

          return (
            <div key={card.label} className="min-w-0 p-4 sm:p-5 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#ffb489]">
                  {transform(card.label)}
                </p>
                <Icon className="h-4 w-4 shrink-0 text-[#ffb489]" strokeWidth={2.1} />
              </div>
              <p className="packet-summary-title mt-4 break-words text-[1.22rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[1.35rem]">
                {transform(card.title)}
              </p>
              <p className="mt-3 break-words text-sm leading-6 text-white/68">
                {transform(card.copy)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PhotoEvidence({
  photos,
  customerFacing = false,
}: {
  photos: Axis1PacketPreviewData["proofPhotos"];
  customerFacing?: boolean;
}) {
  if (photos.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-[#d8d2ca] bg-white px-5 py-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178]">
          Field photos
        </p>
        <p className="mt-2 text-lg font-bold tracking-[-0.04em] text-[#151515]">
          No field photos attached
        </p>
        <p className="mt-2 text-sm leading-6 text-[#746b62]">
          This report can still be sent without photos. Add before / after images
          only when the crew captured them.
        </p>
      </div>
    );
  }

  return (
    <div className="packet-photo-grid grid gap-5 sm:grid-cols-2">
      {photos.map((photo, index) => {
        const tone = proofToneClasses(photo.tone);
        const label = customerFacing ? customerPhotoLabel(photo) : photo.label;

        return (
          <figure
            key={photo.proofId}
            className={cx(
              "pdf-document-card min-w-0 border-t border-[#ded7cf] pt-4",
              index === 0 && "sm:col-span-2",
            )}
            style={{ breakInside: "avoid" }}
          >
            <div
              className={cx(
                "relative overflow-hidden bg-[#111315]",
                index === 0
                  ? "aspect-[16/8.4] rounded-[22px]"
                  : "aspect-[4/3] rounded-[18px]",
              )}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes={
                  index === 0
                    ? "(min-width: 1024px) 48vw, 100vw"
                    : "(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 100vw"
                }
                className="object-cover"
                loading="eager"
                style={{
                  filter: tone.filter,
                  objectPosition: photo.position,
                }}
              />
              <div className={cx("absolute inset-0", tone.overlay)} />
              <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                <span
                  className={cx(
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                    tone.label,
                  )}
                >
                  {label}
                </span>
                <span className="rounded-full border border-white/16 bg-[#111315]/65 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/72 backdrop-blur">
                  {photo.proofId}
                </span>
              </div>
              {!customerFacing ? (
                <span className="absolute bottom-3 left-3 rounded-full border border-white/16 bg-[#111315]/65 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/72 backdrop-blur">
                  {photo.systemRef}
                </span>
              ) : null}
            </div>
            <figcaption
              className={cx(
                "grid gap-2 pt-3",
                index === 0 && "sm:grid-cols-[minmax(0,1fr)_auto]",
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-[-0.02em] text-[#151515]">
                  {photo.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#746b62]">{photo.caption}</p>
              </div>
              <p
                className={cx(
                  "font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178]",
                  index === 0 && "sm:text-right",
                )}
              >
                {photo.proofRole}
              </p>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export function Axis1PacketDocument({
  data,
  className,
  variant = "vendor-sample",
  presentationMode = "standard",
  visibleSections,
}: Axis1PacketDocumentProps) {
  const isCustomerReport = variant === "customer-report";
  const copy = isCustomerReport ? customerFacingCopy : (value: string) => value;
  const sections = {
    ...defaultSectionVisibility,
    ...visibleSections,
  };
  const isShort = presentationMode === "short";
  const documentState =
    data.scenario === "exception"
      ? "Open access item included"
      : "Customer-ready closeout";
  const systemIdentityRows = mapRows(data.systemIdentityRows, copy);
  const serviceRecordRows = mapRows(data.serviceRecordRows, copy);
  const proofPolicyRows = mapRows(data.proofPolicyRows, copy);
  const componentStatusRows = mapComponentStatusRows(data.componentStatusRows, copy);
  const photoCoverageRows = mapPhotoCoverageRows(data.photoCoverageRows, copy);
  const scopeRows = mapScopeRows(data.scopeRows, copy);
  const operationalChecks = mapRows(data.operationalChecks, copy);
  const frequencyRows = mapRows(data.frequencyRows, copy);
  const closeoutRows = mapRows(data.closeoutRows, copy);
  const acknowledgementRows = mapRows(data.acknowledgementRows, copy);
  const printAcknowledgementRows = acknowledgementRows.filter(([label]) =>
    ["Site contact", "Customer action", "Record location"].includes(label),
  );
  const customerCloseActionItems = mapRows(data.customerClose.actionItems, copy);
  const hasProofPhotos = data.proofPhotos.length > 0;
  const showPhotoCoverage =
    sections.checklist && (!isCustomerReport || hasProofPhotos);
  const showPhotoEvidence =
    sections.photos && (!isCustomerReport || hasProofPhotos);
  const showStatusSection =
    sections.routeDetail || showPhotoCoverage || sections.nextService;
  const showEvidenceSection = sections.routeDetail || showPhotoEvidence;
  const showCoreSection = !isShort;
  const compactStatusSection = !sections.routeDetail && !showPhotoCoverage;
  const compactWorkSection = !sections.routeDetail;
  const componentStatusTitle = isCustomerReport
    ? "Service status is easy to verify."
    : "The usual vendor checklist becomes a clean customer record.";
  const componentStatusCopy = isCustomerReport
    ? "Each line keeps the status, proof reference, and customer-readable note together."
    : "This is the premium-company layer: component status, proof reference, and customer-readable notes in one place.";
  const photoCoverageTitle = isCustomerReport
    ? "Attached photos and records are accounted for."
    : "Photos, label, and archive are accounted for.";
  const photoEvidenceTitle = isCustomerReport
    ? "Photos are organized as proof."
    : "Photos are evidence, not a dump.";

  return (
    <article
      className={cx(
        "pdf-document packet-doc-root relative overflow-hidden break-words rounded-[24px] border border-[#d8d0c7] bg-[#fbfaf7] text-[#151515] shadow-[0_28px_80px_rgba(17,17,17,0.11)] [overflow-wrap:anywhere] print:rounded-none print:border-0 print:bg-white print:shadow-none sm:rounded-[30px]",
        className,
      )}
    >
      <header className="pdf-document-section px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="packet-header-grid grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#111315] font-display text-xl font-bold text-[#ffb489] sm:h-13 sm:w-13 sm:rounded-[17px] sm:text-2xl">
                {data.vendor.logoUrl ? (
                  <Image
                    src={data.vendor.logoUrl}
                    alt={`${data.vendor.name} logo`}
                    width={52}
                    height={52}
                    className="h-full w-full rounded-[16px] object-contain p-1.5"
                    priority={false}
                  />
                ) : (
                  data.vendor.initials
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display text-[1.55rem] font-bold leading-[0.98] tracking-[-0.06em] text-[#151515] sm:text-[2.35rem]">
                  {data.vendor.name}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#746b62]">
                  {data.vendor.brandingApplied || isCustomerReport
                    ? data.vendor.office
                    : "Public sample shell. Brand, dispatch, and certification appear in paid setup."}
                </p>
              </div>
            </div>

            <div className="mt-7 max-w-3xl sm:mt-9">
              <SectionKicker>Service report</SectionKicker>
              <h2 className="mt-3 font-display text-[2.05rem] font-bold leading-[0.92] tracking-[-0.065em] text-[#151515] sm:text-[3.65rem]">
                {data.packetHeader.title}
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5f574f]">
                {isShort
                  ? copy(data.summaryCards[0]?.copy ?? data.packetHeader.copy)
                  : copy(data.packetHeader.copy)}
              </p>
            </div>
          </div>

          <aside className="min-w-0 border-t border-[#ded7cf] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#ded7cf] bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#5f574f]">
                {isCustomerReport
                  ? "Customer service report"
                  : data.vendor.brandingApplied
                    ? "Branded vendor version"
                    : "Public sample shell"}
              </span>
              <span
                className={cx(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold",
                  data.scenario === "exception"
                    ? "border-[#f3c0a2] bg-[#fff0e7] text-[#bc3d1f]"
                    : "border-[#b9d4c6] bg-[#eef7f2] text-[#1e6045]",
                )}
              >
                {documentState}
              </span>
            </div>
            <div className="mt-5">
              <DataLedger rows={data.packetHeader.quickFacts} />
            </div>
          </aside>
        </div>

        {data.vendor.directLine.trim() ||
        data.vendor.dispatch.trim() ||
        data.vendor.certification.trim() ||
        data.vendor.afterHours.trim() ? (
          <div className="mt-8">
            <ContactStrip data={data} />
          </div>
        ) : null}
      </header>

      <SummaryBand data={data} transform={copy} />

      {showCoreSection ? (
      <section className="pdf-document-section packet-two-col packet-core-section grid gap-7 border-b border-[#ded7cf] px-4 py-6 sm:px-8 sm:py-7 lg:grid-cols-2 lg:px-10">
        <div className="min-w-0">
          <SectionKicker>Location and system</SectionKicker>
          <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
            One restaurant system, one clean record.
          </h3>
          <div className="mt-5">
            <DataLedger rows={systemIdentityRows} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionKicker>Today&apos;s service</SectionKicker>
          <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
            Visit facts stay visible.
          </h3>
          <div className="mt-5">
            <DataLedger rows={serviceRecordRows} />
          </div>
        </div>
      </section>
      ) : null}

      {showStatusSection ? (
        <section
          className={cx(
            "pdf-document-section packet-two-col packet-status-section grid gap-8 border-b border-[#ded7cf] bg-[#f5f1ea] px-4 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:px-10",
            compactStatusSection && "packet-status-section-compact lg:grid-cols-1",
          )}
        >
          {sections.routeDetail ? (
            <div className="min-w-0">
              <SectionKicker>Component status matrix</SectionKicker>
              <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
                {componentStatusTitle}
              </h3>
              {!isShort ? (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#746b62]">
                  {componentStatusCopy}
                </p>
              ) : null}
              <div className="mt-6">
                <ComponentStatusMatrix rows={componentStatusRows} />
              </div>
            </div>
          ) : null}

          {showPhotoCoverage || sections.nextService ? (
            <div className="min-w-0">
              {showPhotoCoverage ? (
                <>
                  <SectionKicker>Proof coverage</SectionKicker>
                  <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
                    {photoCoverageTitle}
                  </h3>
                  <div className="mt-5">
                    <PhotoCoverageChecklist rows={photoCoverageRows} />
                  </div>
                </>
              ) : null}
              {sections.nextService ? (
                <div className={showPhotoCoverage ? "mt-7" : ""}>
                  <SectionKicker>Frequency basis</SectionKicker>
                  <div className="mt-4">
                    <DenseLedger rows={frequencyRows} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {showEvidenceSection ? (
        <section className="pdf-document-section packet-two-col packet-evidence-section grid gap-8 border-b border-[#ded7cf] px-4 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-10">
          {sections.routeDetail ? (
            <div className="min-w-0">
              <SectionKicker>Inspection route</SectionKicker>
              <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
                The report follows the exhaust line.
              </h3>
              <div className="mt-6 divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
                {data.routeSegments.map((segment) => (
                  <div
                    key={segment.code}
                    className="pdf-document-card grid gap-3 py-4 sm:grid-cols-[70px_minmax(0,1fr)_auto] sm:items-start"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178]">
                      {segment.code}
                    </p>
                    <div className="min-w-0">
                      <p className="text-sm font-bold tracking-[-0.02em]">
                        {copy(segment.title)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#746b62]">
                        {copy(segment.note)}
                      </p>
                    </div>
                    <StatusMark status={segment.status} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {showPhotoEvidence ? (
            <div className="min-w-0">
              <SectionKicker>Photo evidence</SectionKicker>
              <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
                {photoEvidenceTitle}
              </h3>
              {!isShort ? (
                <>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#746b62]">
                    {copy(data.packetHeader.archiveNote)}
                  </p>
                  <div className="mt-5">
                    <DenseLedger rows={proofPolicyRows} />
                  </div>
                </>
              ) : null}
              <div className="mt-6">
                <PhotoEvidence
                  photos={data.proofPhotos}
                  customerFacing={isCustomerReport}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section
        className={cx(
          "pdf-document-section packet-two-col packet-work-section grid gap-8 border-b border-[#ded7cf] px-4 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:px-10",
          compactWorkSection && "packet-work-section-compact lg:grid-cols-1",
        )}
      >
        {sections.routeDetail ? (
        <div className="min-w-0">
          <SectionKicker>What was cleaned</SectionKicker>
          <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
            Cleaned areas and exceptions are not mixed.
          </h3>
          <div className="mt-6 divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
            {scopeRows.map(([area, status, note]) => (
              <div
                key={area}
                className="pdf-document-card grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-[-0.02em]">{area}</p>
                  <p className="mt-1 text-sm leading-6 text-[#746b62]">{note}</p>
                </div>
                <StatusMark status={status} />
              </div>
            ))}
          </div>
        </div>
        ) : null}

        <div className="min-w-0 space-y-7">
          <div>
            <SectionKicker>Work finished today</SectionKicker>
            <div className="mt-4 divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
              {data.completedWork.map((item) => (
                <div key={item} className="grid grid-cols-[14px_minmax(0,1fr)] gap-3 py-3">
                  <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#f26a21]" />
                  <p className="text-sm leading-6 text-[#151515]">{copy(item)}</p>
                </div>
              ))}
            </div>
          </div>

          {sections.routeDetail ? (
          <div>
            <SectionKicker>Service checks on record</SectionKicker>
            <div className="mt-4">
              <DenseLedger rows={operationalChecks} />
            </div>
          </div>
          ) : null}

          <div
            className={cx(
              "pdf-document-card packet-work-callout rounded-[22px] border px-5 py-5",
              data.scenario === "exception" && "pdf-print-hide",
              data.callout.tone === "issue"
                ? "border-[#f3c0a2] bg-[#fff0e7]"
                : "border-[#b9d4c6] bg-[#eef7f2]",
            )}
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <SectionKicker>{data.callout.eyebrow}</SectionKicker>
                <h3 className="mt-3 font-display text-[1.62rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[1.85rem]">
                  {data.callout.title}
                </h3>
              </div>
              {data.callout.tone === "issue" ? (
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#bc3d1f]" />
              ) : (
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#1e6045]" />
              )}
            </div>
            <p className="mt-3 text-sm leading-7 text-[#5f574f]">{copy(data.callout.copy)}</p>
          </div>
        </div>
      </section>

      <section className="pdf-document-section packet-final-section grid gap-8 px-4 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:px-10">
        <div className="min-w-0">
          <SectionKicker>{data.notesSection.label}</SectionKicker>
          <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
            {data.notesSection.title}
          </h3>
          <div className="mt-6 divide-y divide-[#e7e0d8] border-y border-[#ded7cf]">
            {data.deficiencyRows.map((row, index) => (
              <div
                key={`${row.location}-${index}`}
                className="pdf-document-card grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto]"
                style={{ breakInside: "avoid" }}
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178]">
                    {row.location}
                  </p>
                  <div className="mt-4 grid gap-4">
                    {[
                      ["What we found", row.issue],
                      ["Why it matters", row.whyItMatters],
                      ["What you need to do", row.ownerAction],
                      ["Office note", row.notice],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8178]">
                          {copy(label)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#151515]">{copy(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <StatusMark status={row.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="packet-final-sidebar min-w-0 space-y-6">
          {sections.nextService ? (
          <div className="pdf-document-card packet-customer-close rounded-[24px] bg-[#111315] px-5 py-5 text-white print:hidden">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ffb489]">
                  What to do next
                </p>
                <h3 className="mt-3 font-display text-[1.72rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[2rem]">
                  {data.customerClose.title}
                </h3>
              </div>
              {data.scenario === "exception" ? (
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#ffb489]" />
              ) : (
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#ffb489]" />
              )}
            </div>
            <p className="mt-4 text-sm leading-7 text-white/68">{copy(data.customerClose.copy)}</p>
            <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {customerCloseActionItems.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 py-3 text-sm sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {label}
                  </dt>
                  <dd className="break-words font-semibold leading-6 text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          ) : null}

          {sections.nextService ? (
          <div className="packet-print-customer-close hidden rounded-[16px] border border-[#ded7cf] bg-white px-4 py-4 print:hidden">
            <SectionKicker>What to do next</SectionKicker>
            <h3 className="mt-3 font-display text-[1.8rem] font-bold leading-[0.95] tracking-[-0.055em]">
              {data.customerClose.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#746b62]">{copy(data.customerClose.copy)}</p>
            <div className="mt-4">
              <DenseLedger rows={customerCloseActionItems} />
            </div>
          </div>
          ) : null}

          <div className="pdf-document-card packet-signoff-card rounded-[24px] border border-[#ded7cf] bg-white/72 px-5 py-5">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <SectionKicker>Service label and contact</SectionKicker>
                <h3 className="mt-3 font-display text-[1.62rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[1.9rem]">
                  Signoff details stay attached.
                </h3>
              </div>
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#f26a21]" />
            </div>
            <div className="mt-5">
              <DenseLedger rows={closeoutRows} />
            </div>
            <div className="mt-5 border-t border-[#ded7cf] pt-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f26a21]">
                Not included in this service report
              </p>
              <p className="mt-2 text-sm leading-6 text-[#746b62]">{copy(data.scopeNote)}</p>
            </div>
            <div className="packet-print-ack mt-5 hidden border-t border-[#ded7cf] pt-4 print:block">
              <SectionKicker>Customer acknowledgement</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-[#746b62]">
                Core handoff record retained with the customer service report.
              </p>
              <div className="mt-4">
                <DenseLedger rows={printAcknowledgementRows} />
              </div>
            </div>
          </div>

          <div className="pdf-document-card packet-ack-card rounded-[24px] border border-[#ded7cf] bg-white/72 px-5 py-5 print:hidden">
            <SectionKicker>Customer acknowledgement</SectionKicker>
            <h3 className="mt-3 font-display text-[1.62rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[1.9rem]">
              The handoff has a record trail.
            </h3>
            <div className="mt-5">
              <DenseLedger rows={acknowledgementRows} />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
