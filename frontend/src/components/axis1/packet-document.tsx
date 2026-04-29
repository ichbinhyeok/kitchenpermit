import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconClockFilled,
  IconShieldCheckFilled,
  type Icon,
} from "@tabler/icons-react";
import { CustomerWebPacket } from "@/components/axis1/customer-web-packet";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

type Axis1PacketDocumentProps = {
  data: Axis1PacketPreviewData;
  className?: string;
  variant?: "vendor-sample" | "customer-report";
  outputIntent?: "customer-link" | "service-record";
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
    <p className="text-[10px] font-semibold uppercase tracking-[0.105em] text-[#d95c1c]">
      {children}
    </p>
  );
}

function statusMeta(status: string) {
  if (
    status === "Cleaned" ||
    status === "Reset" ||
    status === "Removed + reset" ||
    status === "Reachable cleaned" ||
    status === "Access clear" ||
    status === "Documented" ||
    status === "Closed" ||
    status === "Uploaded" ||
    status === "Included" ||
    status === "Posted" ||
    status === "Retained"
  ) {
    return {
      Icon: IconCircleCheckFilled,
      classes: "border-[#b8d7c7] bg-[#f1f8f4] text-[#1f6248]",
    };
  }

  if (
    /blocked|needs|review|partial|open|exception|not captured/i.test(status)
  ) {
    return {
      Icon: IconAlertTriangleFilled,
      classes: "border-[#efc0a4] bg-[#fff4ec] text-[#a9431f]",
    };
  }

  return {
    Icon: IconShieldCheckFilled,
    classes: "border-[#d8d2ca] bg-white/80 text-[#5f574f]",
  };
}

function StatusMark({ status }: { status: string }) {
  const { Icon, classes } = statusMeta(status);

  return (
    <span
      className={cx(
        "inline-flex w-fit self-start justify-self-start whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[-0.015em]",
        classes,
      )}
    >
      <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
      {status}
    </span>
  );
}

function proofRefLabel(value: string) {
  return value.replace(/\s*\/\s*/g, " + ");
}

function ProofRef({ value }: { value: string }) {
  return (
    <span className="inline-flex max-w-full justify-self-start whitespace-nowrap rounded-full border border-[#ded7cf] bg-white/70 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-[#7d746a]">
      {proofRefLabel(value)}
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
          className="pdf-document-card grid gap-3 py-4 text-sm sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_auto] sm:items-start"
          style={{ breakInside: "avoid" }}
        >
          <div className="min-w-0">
            <p className="font-bold tracking-[-0.02em] text-[#151515]">{row.component}</p>
            <div className="mt-2">
              <ProofRef value={row.proof} />
            </div>
          </div>
          <p className="min-w-0 text-sm leading-6 text-[#6f665d]">{row.note}</p>
          <StatusMark status={row.status} />
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
          className="grid gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
        >
          <p className="font-semibold tracking-[-0.01em] text-[#151515]">{row.item}</p>
          <ProofRef value={row.proof} />
          <StatusMark status={row.status} />
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

function getRecordValue(rows: readonly Row[], labels: string[], fallback = "") {
  return (
    rows.find(([label]) =>
      labels.some((target) => label.toLowerCase() === target.toLowerCase()),
    )?.[1] ?? fallback
  );
}

function getPrimaryOpenItem(data: Axis1PacketPreviewData) {
  if (data.scenario !== "exception") {
    return null;
  }

  return (
    data.deficiencyRows.find((row) =>
      /access|blocked|inaccessible|not-serviced|not cleaned|exception/i.test(
        `${row.location} ${row.issue} ${row.notice}`,
      ),
    ) ??
    null
  );
}

function ServiceEvidenceRecord({
  data,
  transform,
}: {
  data: Axis1PacketPreviewData;
  transform: (value: string) => string;
}) {
  const primaryOpenItem = getPrimaryOpenItem(data);
  const serviceDate = getRecordValue(data.packetHeader.quickFacts, ["Service date"], "Service date recorded");
  const location = getRecordValue(data.packetHeader.quickFacts, ["Location"], "Location recorded");
  const reportId =
    getRecordValue(data.packetHeader.quickFacts, ["Report ID"], "") ||
    getRecordValue(data.serviceRecordRows, ["Report ID"], "HDS-MASKED-0414");
  const nextWindow = getRecordValue(data.frequencyRows, ["Next service window"], "Next service window recorded");
  const entireSystemAccessible = primaryOpenItem ? "No - blocked access recorded" : "Yes";
  const entireSystemCleaned = primaryOpenItem ? "No - excluded area documented" : "Yes";
  const status = primaryOpenItem ? "Completed with documented exception" : "Completed";
  const serviceNotice =
    getRecordValue(data.closeoutRows, ["Label / notice ref"], "") ||
    getRecordValue(data.closeoutRows, ["Service label"], "Service label recorded");

  const recordRows = [
    ["Property / customer", data.packetHeader.title],
    ["Service date", serviceDate],
    ["Location", location],
    ["System serviced", "Commercial kitchen exhaust system path"],
    ["Report ID", reportId],
    ["Service result", status],
  ] as const;

  const inspectionRows = [
    ["Document type", "Service Evidence Record"],
    ["Outcome classification", primaryOpenItem ? "Case B - completed with exception" : "Case A - completed / no exception"],
    ["Areas cleaned", "Accessible hood, filters, plenum, and reachable duct path"],
    ["Entire system accessible", entireSystemAccessible],
    ["Entire system cleaned", entireSystemCleaned],
    ["Deficiencies / exceptions", primaryOpenItem ? transform(primaryOpenItem.issue) : "None recorded"],
    ["Areas not cleaned / excluded", primaryOpenItem ? "Included - see inaccessible area record" : "No inaccessible area recorded"],
    ["Before / after photo evidence", data.proofPhotos.length > 0 ? `Included - ${data.proofPhotos.length} photos` : "No photos attached"],
    ["Service label / notice", serviceNotice],
    ["Record maintained on premises", "Customer to retain with kitchen exhaust service records"],
    ["Owner / vendor copy retained", "Customer copy and vendor archive retained"],
    ["Recommended cleaning frequency", nextWindow],
  ] as const;

  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-white px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start">
        <div
          className="service-evidence-card min-w-0 rounded-[24px] border border-[#d8d0c7] bg-[#fbfaf7] px-5 py-5"
          style={{ breakInside: "avoid" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionKicker>Service evidence record</SectionKicker>
              <h3 className="mt-3 font-display text-[1.95rem] font-bold leading-[0.92] tracking-[-0.06em] text-[#151515] sm:text-[2.55rem]">
                Kitchen exhaust cleaning service evidence record.
              </h3>
            </div>
            <span className="rounded-full border border-[#f3c0a2] bg-[#fff0e7] px-3 py-1.5 text-xs font-semibold text-[#a9431f]">
              {primaryOpenItem ? "Access item recorded" : "Closed"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#5f574f]">
            Prepared as a vendor-issued service evidence record for customer
            files, manager review, landlord, insurance, or
            documentation requests. It records service company identity, person
            performing the work, service date, proof references, accessibility status,
            areas cleaned, areas not cleaned or excluded, deficiencies, service label
            reference, and retained-copy details. It does not replace an AHJ inspection,
            fire-system service, approval, or full code compliance certification.
          </p>
          <div className="mt-5">
            <DenseLedger rows={recordRows.map(([label, value]) => [label, transform(value)] as const)} />
          </div>
        </div>

        <div
          className="service-evidence-card min-w-0 rounded-[24px] border border-[#ded7cf] bg-[#f5f1ea] px-5 py-5"
          style={{ breakInside: "avoid" }}
        >
          <SectionKicker>Report sheet fields</SectionKicker>
          <h3 className="mt-3 font-display text-[1.55rem] font-bold leading-[0.96] tracking-[-0.055em] text-[#151515]">
            Accessibility and scope are explicit.
          </h3>
          <div className="mt-5">
            <DenseLedger rows={inspectionRows} />
          </div>
          <div className="mt-5 grid gap-4 border-t border-[#ded7cf] pt-5 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8178]">
                Technician
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#151515]">
                {data.vendor.technician}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8178]">
                Company credential
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#151515]">
                {data.vendor.certification || "Credential not supplied"}
              </p>
            </div>
          </div>
          <div className="mt-5 border-t border-[#ded7cf] pt-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8178]">
              Prepared by / signature
            </p>
            <div className="mt-5 h-px w-full bg-[#bfb4a8]" />
            <p className="mt-2 text-xs leading-5 text-[#746b62]">
              {data.vendor.preparedBy || data.vendor.name} - electronically prepared service record
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceEvidenceControls({
  data,
  transform,
}: {
  data: Axis1PacketPreviewData;
  transform: (value: string) => string;
}) {
  const primaryOpenItem = getPrimaryOpenItem(data);
  const reportId =
    getRecordValue(data.packetHeader.quickFacts, ["Report ID"], "") ||
    getRecordValue(data.serviceRecordRows, ["Report ID"], "HDS-MASKED-0414");
  const serviceDate = getRecordValue(data.packetHeader.quickFacts, ["Service date"], "Service date recorded");
  const location = getRecordValue(data.packetHeader.quickFacts, ["Location"], "Location recorded");
  const serviceNotice =
    getRecordValue(data.closeoutRows, ["Label / notice ref"], "") ||
    getRecordValue(data.closeoutRows, ["Service label"], "Service label recorded");
  const labelPosted =
    getRecordValue(data.closeoutRows, ["Label posted"], "") ||
    getRecordValue(data.operationalChecks, ["Service label / notice status"], "Recorded");
  const nextDue = getRecordValue(data.closeoutRows, ["Next due"], "Next due recorded");

  const documentControlRows = [
    ["Report ID", reportId],
    ["Prepared date", serviceDate],
    ["Service date", serviceDate],
    ["Servicing company", data.vendor.name],
    ["Person performing work", data.vendor.technician],
    ["Vendor archive ref", "Vendor archive retained"],
    ["Customer copy", "PDF service evidence record"],
    ["Original photo archive", "Retained by vendor"],
    ["Service label / sticker ref", serviceNotice],
  ] as const;

  const propertyRows = [
    ["Customer / property", data.packetHeader.title],
    ["Service location", location],
    ["Store / unit ID", getRecordValue(data.systemIdentityRows, ["System ID"], "Not supplied")],
    ["Suite / area", getRecordValue(data.systemIdentityRows, ["Line served"], "Main cookline")],
    ["Property manager", "Not supplied"],
    ["Internal / claim ref", "Not supplied"],
  ] as const;

  const submissionUseRows = [
    ["Suitable for", "Customer records; manager review; landlord, insurance, or documentation requests"],
    ["Not suitable for", "Official inspection; code compliance certification; AHJ approval; fire suppression service"],
    ["Evidence basis", "Vendor-provided service facts, route status, and photo evidence"],
    ["Limitation", "Blocked or inaccessible areas are excluded until access is provided"],
    ["Premises copy", "Maintain this record with kitchen exhaust service records"],
  ] as const;

  const labelRows = [
    ["Label / sticker reference", serviceNotice],
    ["Label status", labelPosted],
    ["Posted location", "Kitchen area / serviced hood system"],
    ["Date cleaned", serviceDate],
    ["Next due", nextDue],
  ] as const;

  const excludedRows = primaryOpenItem
    ? ([
        ["Area", transform(primaryOpenItem.location)],
        ["Reason", transform(primaryOpenItem.issue)],
        ["Status", primaryOpenItem.status],
        ["Required action", transform(primaryOpenItem.ownerAction)],
        ["Revisit condition", "After access is clear and customer replies"],
      ] as const)
    : ([
        ["Area", "None recorded"],
        ["Reason", "No inaccessible area recorded"],
        ["Status", "Closed"],
        ["Required action", "Retain record and confirm next service window"],
        ["Revisit condition", "Routine service window only"],
      ] as const);
  const requiredFormatRows = [
    ["Identity", "Servicing company, person performing work, customer, location, date, report ID"],
    ["NFPA 96 fields", "Date cleaned, company, worker, areas not cleaned, deficiencies, label ref"],
    ["Evidence", "Areas cleaned, photo refs, retained archive, technician credential"],
    ["Limits", "Not AHJ approval, not code certification, not fire-system service"],
  ] as const;

  return (
    <section className="pdf-document-section service-evidence-controls border-b border-[#ded7cf] bg-white px-4 py-6 sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-6 rounded-[18px] border border-[#ded7cf] bg-[#fbfaf7] px-4 py-4">
        <SectionKicker>Evidence-record format check</SectionKicker>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {requiredFormatRows.map(([label, value]) => (
            <div key={label} className="min-w-0 border-t border-[#e7e0d8] pt-3 first:border-t-0 md:border-l md:border-t-0 md:pl-3 md:first:border-l-0 md:first:pt-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b8178]">
                {label}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#151515]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="service-record-control-grid grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionKicker>Document control</SectionKicker>
          <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-[1] tracking-[-0.04em] text-[#151515]">
            Record identifiers and retained copies.
          </h3>
          <div className="mt-4">
            <DenseLedger rows={documentControlRows} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionKicker>Customer / property fields</SectionKicker>
          <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-[1] tracking-[-0.04em] text-[#151515]">
            Fields used for outside record requests.
          </h3>
          <div className="mt-4">
            <DenseLedger rows={propertyRows.map(([label, value]) => [label, transform(value)] as const)} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionKicker>Submission use</SectionKicker>
          <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-[1] tracking-[-0.04em] text-[#151515]">
            What this record can and cannot support.
          </h3>
          <div className="mt-4">
            <DenseLedger rows={submissionUseRows} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionKicker>Service label / sticker</SectionKicker>
          <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-[1] tracking-[-0.04em] text-[#151515]">
            Field label details tied to the service record.
          </h3>
          <div className="mt-4">
            <DenseLedger rows={labelRows.map(([label, value]) => [label, transform(value)] as const)} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionKicker>Excluded areas</SectionKicker>
          <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-[1] tracking-[-0.04em] text-[#151515]">
            Any area outside the completed scope.
          </h3>
          <div className="mt-4">
            <DenseLedger rows={excludedRows} />
          </div>
        </div>
      </div>
    </section>
  );
}

function OutputRoleBlock({
  customerFacing,
  serviceRecord,
}: {
  customerFacing: boolean;
  serviceRecord: boolean;
}) {
  const recordName = customerFacing ? "report" : "packet";
  const title = serviceRecord
    ? `Use this ${recordName} as service evidence for records requests.`
    : customerFacing
      ? "Keep this link with your kitchen exhaust service records."
      : "Send this link when the customer needs to understand the visit.";
  const copy = serviceRecord
    ? `This ${recordName} summarizes the service date, work scope, photo evidence, inaccessible or not-serviced areas, findings, and next recommended service window for customer files, manager review, insurance, landlord, or documentation requests.`
    : customerFacing
      ? "This link shows the cleaned scope, open items, proof photos, and next action without requiring another explanation call."
      : `This ${recordName} shows what was cleaned, what stayed open, what the photos prove, and what the customer should do next without waiting for another explanation call.`;
  const chips = serviceRecord
    ? ["Service record cover", "Report sheet fields", "Photo evidence appendix"]
    : customerFacing
      ? ["Cleaned scope", "Open item visible", "Next action"]
      : ["Readable in one pass", "Open item visible", "Reply path included"];

  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-white/72 px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <div className="min-w-0">
          <SectionKicker>
            {serviceRecord
              ? customerFacing
                ? "Service record PDF"
                : "Service record packet"
              : customerFacing
                ? "Customer proof link"
                : "Customer-ready proof packet"}
          </SectionKicker>
          <h3 className="mt-3 font-display text-[1.78rem] font-bold leading-[0.95] tracking-[-0.055em] text-[#151515] sm:text-[2.25rem]">
            {title}
          </h3>
        </div>
        <div className="min-w-0">
          <p className="text-sm leading-7 text-[#5f574f]">{copy}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {chips.map((item) => (
              <div
                key={item}
                className="rounded-[16px] border border-[#ded7cf] bg-[#fbfaf7] px-3 py-3 text-xs font-semibold leading-5 text-[#423c36]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function findActionValue(
  rows: readonly Row[],
  patterns: RegExp[],
  fallbackIndex = 0,
) {
  return (
    rows.find(([label]) => patterns.some((pattern) => pattern.test(label))) ??
    rows[fallbackIndex] ??
    null
  );
}

function CustomerProofSnapshot({
  data,
  transform,
}: {
  data: Axis1PacketPreviewData;
  transform: (value: string) => string;
}) {
  const primaryOpenItem = data.deficiencyRows[0] ?? null;
  const primaryAction = findActionValue(data.customerClose.actionItems, [
    /access action/i,
    /reply needed/i,
    /reply or action/i,
    /customer action/i,
  ]);
  const nextWindow = findActionValue(data.customerClose.actionItems, [
    /next visit window/i,
  ]);
  const openTitle =
    data.scenario === "exception" && primaryOpenItem
      ? transform(primaryOpenItem.issue)
      : "No open access item recorded.";
  const openCopy =
    data.scenario === "exception" && primaryOpenItem
      ? transform(primaryOpenItem.ownerAction)
      : "Accessible service areas were closed and the next service window is ready to confirm.";
  const actionTitle = transform(data.customerClose.title);
  const actionCopy = primaryAction
    ? transform(primaryAction[1])
    : transform(data.customerClose.copy);
  const nextWindowTitle = nextWindow
    ? transform(nextWindow[1])
    : transform(data.summaryCards[2]?.title ?? "Next service window is recorded.");

  const rows = [
    {
      label: "Completed today",
      title: transform(data.summaryCards[0]?.title ?? "Accessible work completed."),
      copy: transform(data.summaryCards[0]?.copy ?? data.packetHeader.copy),
      icon: IconCircleCheckFilled,
      tone: "success",
    },
    {
      label: data.scenario === "exception" ? "Not completed" : "Open item",
      title: openTitle,
      copy: openCopy,
      icon: data.scenario === "exception" ? IconAlertTriangleFilled : IconCircleCheckFilled,
      tone: data.scenario === "exception" ? "issue" : "success",
    },
    {
      label: "Customer action",
      title: actionTitle,
      copy: actionCopy,
      icon: IconShieldCheckFilled,
      tone: "action",
    },
    {
      label: "Next service window",
      title: nextWindowTitle,
      copy:
        "Reply to confirm this service window or ask for a different date while the visit is still fresh.",
      icon: IconClockFilled,
      tone: "next",
    },
  ] satisfies ReadonlyArray<{
    label: string;
    title: string;
    copy: string;
    icon: Icon;
    tone: "success" | "issue" | "action" | "next";
  }>;

  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-[#fbfaf7] px-4 py-6 sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-5 max-w-3xl">
        <SectionKicker>Customer proof summary</SectionKicker>
        <h3 className="mt-3 font-display text-[1.9rem] font-bold leading-[0.94] tracking-[-0.06em] text-[#151515] sm:text-[2.55rem]">
          What happened today and what to do next.
        </h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <article
              key={row.label}
              className={cx(
                "pdf-document-card rounded-[18px] border bg-white px-4 py-4 shadow-[0_12px_28px_rgba(17,17,17,0.045)]",
                row.tone === "success" &&
                  "border-[#d6e6dc] [box-shadow:inset_3px_0_0_#4f9b75,0_12px_28px_rgba(17,17,17,0.045)]",
                row.tone === "issue" &&
                  "border-[#f1c9b2] [box-shadow:inset_3px_0_0_#d65b2a,0_12px_28px_rgba(17,17,17,0.045)]",
                row.tone === "action" &&
                  "border-[#ead2c1] [box-shadow:inset_3px_0_0_#c96934,0_12px_28px_rgba(17,17,17,0.045)]",
                row.tone === "next" &&
                  "border-[#ded7cf] [box-shadow:inset_3px_0_0_#766b60,0_12px_28px_rgba(17,17,17,0.045)]",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cx(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    row.tone === "success" && "bg-[#eef7f2] text-[#2f7a58]",
                    row.tone === "issue" && "bg-[#fff0e7] text-[#c64c24]",
                    row.tone === "action" && "bg-[#fff7ef] text-[#9a441c]",
                    row.tone === "next" && "bg-[#f1eee9] text-[#625950]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b8178]">
                    {row.label}
                  </p>
                  <p className="mt-2 text-[1.05rem] font-semibold leading-tight tracking-[-0.035em] text-[#151515]">
                    {row.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f665d]">{row.copy}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function findRouteSegment(
  segments: Axis1PacketPreviewData["routeSegments"],
  code: string,
) {
  return segments.find((segment) => segment.code === code) ?? null;
}

function CustomerExhaustPathBlock({
  data,
  transform,
}: {
  data: Axis1PacketPreviewData;
  transform: (value: string) => string;
}) {
  const hood = findRouteSegment(data.routeSegments, "HD-01");
  const filters = findRouteSegment(data.routeSegments, "FL-01");
  const plenum = findRouteSegment(data.routeSegments, "PL-01");
  const ductAccess = findRouteSegment(data.routeSegments, "DK-02");
  const fan = findRouteSegment(data.routeSegments, "RF-01");
  const grease = findRouteSegment(data.routeSegments, "GC-01");
  const ductStatusSegment =
    ductAccess && /blocked|inaccessible|not/i.test(ductAccess.status)
      ? ductAccess
      : plenum;

  const zones = [
    hood && {
      label: "01",
      title: "Hood canopy",
      status: hood.status,
      note: hood.note,
      proof: "P-01 / P-02",
      icon: CheckCircle2,
    },
    filters && {
      label: "02",
      title: "Filters + tracks",
      status: filters.status,
      note: filters.note,
      proof: "P-03",
      icon: ShieldCheck,
    },
    ductStatusSegment && {
      label: "03",
      title: "Plenum / duct access",
      status: ductStatusSegment.status,
      note: ductStatusSegment.note,
      proof: "P-04",
      icon: /blocked|inaccessible|not/i.test(ductStatusSegment.status)
        ? AlertTriangle
        : ShieldCheck,
    },
    fan && {
      label: "04",
      title: "Fan / roof discharge",
      status: fan.status,
      note: fan.note,
      proof: "P-05",
      icon: /review|blocked/i.test(fan.status) ? AlertTriangle : ShieldCheck,
    },
    grease && {
      label: "05",
      title: "Grease path",
      status: grease.status,
      note: grease.note,
      proof: "P-06",
      icon: /review|blocked/i.test(grease.status) ? AlertTriangle : ShieldCheck,
    },
  ].filter(Boolean) as Array<{
    label: string;
    title: string;
    status: string;
    note: string;
    proof: string;
    icon: LucideIcon;
  }>;

  if (zones.length === 0) {
    return null;
  }

  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-[#142131] px-4 py-6 text-white sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <SectionKicker>Exhaust system path</SectionKicker>
          <h3 className="mt-3 font-display text-[1.85rem] font-bold leading-[0.94] tracking-[-0.06em] sm:text-[2.35rem]">
            Not just the hood. The visit follows the grease exhaust line.
          </h3>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-white/66 lg:justify-self-end">
          The customer can see the cleaned hood line, filter reset, accessible duct path,
          roof discharge record, and grease path note. Anything blocked stays visible
          instead of being implied as finished.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.045]">
        {zones.map((zone) => {
          const Icon = zone.icon;
          const needsAttention = /blocked|review|inaccessible|not/i.test(zone.status);

          return (
            <div
              key={zone.label}
              className={cx(
                "grid min-w-0 gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[42px_minmax(0,1fr)_auto] sm:items-start sm:px-5",
                needsAttention
                  ? "bg-[#2b1a12]/70"
                  : "bg-white/[0.015]",
              )}
            >
              <span
                className={cx(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                  needsAttention
                    ? "border-[#ffb489]/35 bg-[#ffb489]/12 text-[#ffb489]"
                    : "border-white/12 bg-white/8 text-white/72",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white/38">
                    {zone.label}
                  </span>
                  <span className="text-base font-semibold leading-tight tracking-[-0.03em] text-white">
                    {transform(zone.title)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{transform(zone.note)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span
                  className={cx(
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                    needsAttention
                      ? "border-[#ffb489]/40 bg-[#ffb489]/10 text-[#ffb489]"
                      : "border-[#b9d4c6]/30 bg-[#b9d4c6]/10 text-[#bfe6cf]",
                  )}
                >
                  {zone.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-white/42">
                  {proofRefLabel(zone.proof)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CustomerKeyProofPhotos({
  photos,
  transform,
}: {
  photos: Axis1PacketPreviewData["proofPhotos"];
  transform: (value: string) => string;
}) {
  const keyPhotos = photos
    .filter((photo) => ["before", "after", "issue"].includes(photo.tone))
    .slice(0, 3);

  if (keyPhotos.length === 0) {
    return null;
  }

  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-white px-4 py-6 sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <SectionKicker>Key proof photos</SectionKicker>
          <h3 className="mt-3 font-display text-[1.75rem] font-bold leading-[0.95] tracking-[-0.055em] text-[#151515] sm:text-[2.2rem]">
            The main before, after, and open-item proof.
          </h3>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#746b62]">
          Full photo evidence is still listed below. These are the photos a customer
          should understand first.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {keyPhotos.map((photo) => {
          const tone = proofToneClasses(photo.tone);

          return (
            <figure key={photo.proofId} className="min-w-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#111315]">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 768px) 30vw, 100vw"
                  className="object-cover"
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
                    {customerPhotoLabel(photo)}
                  </span>
                  <span className="rounded-full border border-white/16 bg-[#111315]/65 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/72 backdrop-blur">
                    {photo.proofId}
                  </span>
                </div>
              </div>
              <figcaption className="pt-3">
                <p className="text-sm font-bold tracking-[-0.02em] text-[#151515]">
                  {transform(photo.title)}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#746b62]">
                  {transform(photo.caption)}
                </p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function CustomerReplyPathBlock({ data }: { data: Axis1PacketPreviewData }) {
  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-[#fbfaf7] px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:items-center">
        <div className="min-w-0">
          <SectionKicker>Reply path</SectionKicker>
          <h3 className="mt-3 font-display text-[1.55rem] font-bold leading-[0.95] tracking-[-0.055em] text-[#151515] sm:text-[1.95rem]">
            Reply here to clarify an open item or schedule follow-up.
          </h3>
        </div>
        <ContactStrip data={data} />
      </div>
    </section>
  );
}

function OpenServiceItemBlock({
  data,
  transform,
  serviceRecord,
}: {
  data: Axis1PacketPreviewData;
  transform: (value: string) => string;
  serviceRecord: boolean;
}) {
  if (data.scenario !== "exception" || data.deficiencyRows.length === 0) {
    return null;
  }

  const primaryOpenItem = data.deficiencyRows[0];
  const isAccessItem =
    /access|not cleaned|inaccessible|blocked/i.test(data.callout.eyebrow) ||
    /access|duct/i.test(primaryOpenItem.location);

  return (
    <section className="pdf-document-section border-b border-[#ded7cf] bg-[#fff5ee] px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="min-w-0">
          <SectionKicker>
            {isAccessItem
              ? "Inaccessible / not-serviced areas"
              : "Recorded condition to review"}
          </SectionKicker>
          <h3 className="mt-3 font-display text-[1.78rem] font-bold leading-[0.95] tracking-[-0.055em] text-[#151515] sm:text-[2.25rem]">
            {isAccessItem
              ? serviceRecord
                ? "Open area is excluded from the completed scope."
                : "Open area is not represented as complete."
              : "Recorded condition stays visible after the visit."}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#746b62]">
            {serviceRecord
              ? "The record separates completed work from inaccessible or not-serviced areas so a later reader does not mistake the full system as completed."
              : "The customer sees what stayed open, why it stayed open, and what action is needed instead of assuming the full system was completed."}
          </p>
        </div>
        <div className="min-w-0 rounded-[20px] border border-[#f3c0a2] bg-white/72 px-4 py-4">
          <DenseLedger
            rows={[
              ["Area", transform(primaryOpenItem.location)],
              ["Status", primaryOpenItem.status],
              ["Reason", transform(primaryOpenItem.issue)],
              ["Customer action", transform(primaryOpenItem.ownerAction)],
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PhotoEvidence({
  photos,
  customerFacing = false,
  compact = false,
}: {
  photos: Axis1PacketPreviewData["proofPhotos"];
  customerFacing?: boolean;
  compact?: boolean;
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
              !compact && index === 0 && "sm:col-span-2",
            )}
            style={{ breakInside: "avoid" }}
          >
            <div
              className={cx(
                "relative overflow-hidden bg-[#111315]",
                !compact && index === 0
                  ? "aspect-[16/8.4] rounded-[22px]"
                  : "aspect-[4/3] rounded-[18px]",
              )}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes={
                  !compact && index === 0
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
                !compact && index === 0 && "sm:grid-cols-[minmax(0,1fr)_auto]",
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
                  !compact && index === 0 && "sm:text-right",
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
  outputIntent = "customer-link",
  presentationMode = "standard",
  visibleSections,
}: Axis1PacketDocumentProps) {
  const isCustomerReport = variant === "customer-report";
  const isServiceRecord = outputIntent === "service-record";
  if (isCustomerReport && !isServiceRecord) {
    return (
      <CustomerWebPacket
        data={data}
        className={className}
        presentationMode={presentationMode}
        visibleSections={visibleSections}
      />
    );
  }

  const copy = isCustomerReport ? customerFacingCopy : (value: string) => value;
  const sections = {
    ...defaultSectionVisibility,
    ...visibleSections,
  };
  const isShort = presentationMode === "short";
  const documentState =
    data.scenario === "exception"
      ? "Open item visible"
      : "Customer-ready closeout";
  const documentReportId =
    getRecordValue(data.packetHeader.quickFacts, ["Report ID"], "") ||
    getRecordValue(data.serviceRecordRows, ["Report ID"], "HDS-MASKED-0414");
  const systemIdentityRows = mapRows(data.systemIdentityRows, copy);
  const serviceRecordRows = mapRows(data.serviceRecordRows, copy);
  const proofPolicyRows = mapRows(data.proofPolicyRows, copy);
  const componentStatusRows = mapComponentStatusRows(data.componentStatusRows, copy);
  const photoCoverageRows = mapPhotoCoverageRows(data.photoCoverageRows, copy);
  const scopeRows = mapScopeRows(data.scopeRows, copy);
  const operationalChecks = mapRows(data.operationalChecks, copy);
  const frequencyRows = mapRows(data.frequencyRows, copy);
  const closeoutRows = mapRows(data.closeoutRows, copy);
  const serviceRecordCloseoutRows = closeoutRows.filter(([label]) =>
    [
      "Service label type",
      "Label / notice ref",
      "Label posted",
      "Areas represented as cleaned",
      "Prepared by technician",
      "Technician credential",
      "Dispatch",
      "Approved on site",
      "On-site record",
      "Delivery record",
      "Record retention",
      "Next due",
    ].includes(label),
  );
  const finalCloseoutRows = isServiceRecord ? serviceRecordCloseoutRows : closeoutRows;
  const acknowledgementRows = mapRows(data.acknowledgementRows, copy);
  const printAcknowledgementRows = acknowledgementRows.filter(([label]) =>
    ["Site contact", "Customer action", "Record location"].includes(label),
  );
  const customerCloseActionItems = mapRows(data.customerClose.actionItems, copy);
  const hasVendorContact =
    data.vendor.directLine.trim().length > 0 ||
    data.vendor.dispatch.trim().length > 0 ||
    data.vendor.certification.trim().length > 0 ||
    data.vendor.afterHours.trim().length > 0;
  const hasProofPhotos = data.proofPhotos.length > 0;
  const showPhotoCoverage =
    sections.checklist && (!isCustomerReport || hasProofPhotos);
  const showPhotoEvidence =
    sections.photos && (!isCustomerReport || hasProofPhotos);
  const showRouteEvidence = false;
  const showStatusSection =
    sections.routeDetail || showPhotoCoverage || sections.nextService;
  const showEvidenceSection = showRouteEvidence || showPhotoEvidence;
  const showCoreSection = !isServiceRecord && !isShort;
  const compactStatusSection = !sections.routeDetail && !showPhotoCoverage;
  const compactWorkSection = !sections.routeDetail;
  const componentStatusTitle = isCustomerReport
    ? "What was handled, what stayed open."
    : "The usual vendor checklist becomes a clean customer record.";
  const componentStatusCopy = isCustomerReport
    ? "Use this list to see which parts of the exhaust system were cleaned, documented, or left for follow-up."
    : "This is the premium-company layer: component status, proof reference, and customer-readable notes in one place.";
  const photoCoverageTitle = isCustomerReport
    ? "Photo proof attached."
    : "Photos, label, and archive are accounted for.";
  const photoEvidenceTitle = isCustomerReport
    ? "Photos are organized as proof."
    : "Photos are evidence, not a dump.";
  const serviceRecordProofPhotos = [
    data.proofPhotos.find((photo) => photo.tone === "before"),
    data.proofPhotos.find((photo) => photo.tone === "after"),
    data.proofPhotos.find((photo) => photo.tone === "issue"),
  ].filter(Boolean) as Axis1PacketPreviewData["proofPhotos"];

  return (
    <article
      data-report-id={documentReportId}
      className={cx(
        "pdf-document packet-doc-root relative overflow-hidden break-words rounded-[24px] border border-[#d8d0c7] bg-[#fbfaf7] text-[#151515] shadow-[0_28px_80px_rgba(17,17,17,0.11)] [overflow-wrap:anywhere] print:rounded-none print:border-0 print:bg-white print:shadow-none sm:rounded-[30px]",
        isServiceRecord && "service-record-doc",
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
              <SectionKicker>
                {isServiceRecord ? "Service record" : "Customer proof"}
              </SectionKicker>
              <h2 className="mt-3 font-display text-[2.05rem] font-bold leading-[0.92] tracking-[-0.065em] text-[#151515] sm:text-[3.65rem]">
                {data.packetHeader.title}
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5f574f]">
                {isShort
                  ? copy(data.summaryCards[0]?.copy ?? data.packetHeader.copy)
                  : copy(data.packetHeader.copy)}
              </p>
              {!isServiceRecord ? (
                <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                  <span className="rounded-full border border-[#ded7cf] bg-white/75 px-2.5 py-1 text-[11px] font-medium text-[#5f574f]">
                    {data.packetHeader.quickFacts[0]?.[1] ?? "Service visit"}
                  </span>
                  <StatusMark status={documentState} />
                </div>
              ) : null}
            </div>
          </div>

          <aside
            className={cx(
              "min-w-0 border-t border-[#ded7cf] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0",
              !isServiceRecord && "hidden lg:block",
            )}
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#ded7cf] bg-white/75 px-2.5 py-1 text-[11px] font-medium text-[#5f574f]">
                {isCustomerReport
                  ? isServiceRecord
                    ? "Service record PDF"
                    : "Customer proof link"
                  : data.vendor.brandingApplied
                    ? "Branded vendor version"
                    : "Public sample shell"}
              </span>
              <StatusMark status={documentState} />
            </div>
            <div className="mt-5">
              <DataLedger rows={data.packetHeader.quickFacts} />
            </div>
          </aside>
        </div>

        {hasVendorContact && isServiceRecord ? (
          <div className="mt-8">
            <ContactStrip data={data} />
          </div>
        ) : null}
      </header>

      {isServiceRecord ? (
        <>
          <ServiceEvidenceRecord data={data} transform={copy} />
          <ServiceEvidenceControls data={data} transform={copy} />
        </>
      ) : (
        <>
          <CustomerProofSnapshot data={data} transform={copy} />
          <CustomerExhaustPathBlock data={data} transform={copy} />
          <CustomerKeyProofPhotos photos={data.proofPhotos} transform={copy} />
        </>
      )}

      {!isServiceRecord ? (
        <OutputRoleBlock
          customerFacing={isCustomerReport}
          serviceRecord={isServiceRecord}
        />
      ) : null}

      {!isServiceRecord && hasVendorContact ? <CustomerReplyPathBlock data={data} /> : null}

      {!isServiceRecord ? (
        <OpenServiceItemBlock
          data={data}
          transform={copy}
          serviceRecord={isServiceRecord}
        />
      ) : null}

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
              <SectionKicker>{isCustomerReport ? "Service scope" : "Component status"}</SectionKicker>
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
                  <SectionKicker>{isCustomerReport ? "Proof attached" : "Proof coverage"}</SectionKicker>
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
        <section
          className={cx(
            "pdf-document-section packet-two-col packet-evidence-section grid gap-8 border-b border-[#ded7cf] px-4 py-7 sm:px-8 sm:py-8 lg:px-10",
            showRouteEvidence
              ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              : "lg:grid-cols-1",
          )}
        >
          {showRouteEvidence ? (
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
                  photos={isServiceRecord ? serviceRecordProofPhotos : data.proofPhotos}
                  customerFacing={isCustomerReport}
                  compact={isServiceRecord}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isServiceRecord ? (
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
      ) : null}

      <section className="pdf-document-section packet-final-section grid gap-8 px-4 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:px-10">
        {!isServiceRecord ? (
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
        ) : null}

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
                <SectionKicker>
                  {hasVendorContact ? "Service label and contact" : "Service label and record"}
                </SectionKicker>
                <h3 className="mt-3 font-display text-[1.62rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[1.9rem]">
                  Signoff details stay attached.
                </h3>
              </div>
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#f26a21]" />
            </div>
            <div className="mt-5">
              <DenseLedger rows={finalCloseoutRows} />
            </div>
            <div className="mt-5 border-t border-[#ded7cf] pt-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f26a21]">
                Not included in this service report
              </p>
              <p className="mt-2 text-sm leading-6 text-[#746b62]">{copy(data.scopeNote)}</p>
            </div>
            <div className="packet-print-ack mt-5 hidden border-t border-[#ded7cf] pt-4 print:block">
              <SectionKicker>Customer file note</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-[#746b62]">
                Customer copy retained with the service evidence record.
              </p>
              <div className="mt-4">
                <DenseLedger rows={printAcknowledgementRows} />
              </div>
            </div>
          </div>

          <div className="pdf-document-card packet-ack-card rounded-[24px] border border-[#ded7cf] bg-white/72 px-5 py-5 print:hidden">
            <SectionKicker>Customer file note</SectionKicker>
            <h3 className="mt-3 font-display text-[1.62rem] font-bold leading-[0.95] tracking-[-0.055em] sm:text-[1.9rem]">
              The handoff has a record trail.
            </h3>
            <div className="mt-5">
              <DenseLedger rows={acknowledgementRows} />
            </div>
          </div>
        </div>
      </section>
      {!isServiceRecord ? (
        <footer className="pdf-document-section service-record-footer border-t border-[#ded7cf] bg-[#f5f1ea] px-4 py-5 sm:px-8 lg:px-10">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b8178]">
            Service evidence limitations
          </p>
          <p className="mt-2 max-w-4xl text-xs leading-6 text-[#746b62]">
            This {isCustomerReport ? "report" : "packet"} is a customer-facing
            service communication and documentation aid prepared from vendor-provided
            job information. It does not certify code compliance, replace an official
            inspection or fire-system service, or guarantee approval by any authority
            having jurisdiction. Blocked, inaccessible, concealed, or not-serviced
            areas are excluded until access is provided and follow-up service is completed.
          </p>
        </footer>
      ) : null}
    </article>
  );
}
