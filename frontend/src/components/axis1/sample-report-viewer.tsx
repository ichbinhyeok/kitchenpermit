"use client";

import Image from "next/image";
import Link from "@/components/navigation/static-link";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowRight, FileText, LinkIcon } from "lucide-react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

type SampleReportViewerProps = {
  data: Axis1PacketPreviewData;
};

type ViewerMode = "link" | "pdf";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isSampleActionTarget(target: HTMLElement) {
  const link = target.closest("a");

  if (link) {
    const href = link.getAttribute("href") ?? "";

    return (
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.classList.contains("packet-primary-cta") ||
      link.classList.contains("packet-mobile-primary-action") ||
      link.classList.contains("packet-mobile-secondary-action") ||
      link.classList.contains("packet-service-record-link")
    );
  }

  const button = target.closest("button");

  if (!button) {
    return false;
  }

  const buttonText = button.textContent ?? "";

  return (
    button.classList.contains("packet-primary-cta") ||
    button.classList.contains("packet-mobile-primary-action") ||
    button.classList.contains("packet-mobile-secondary-action") ||
    button.classList.contains("packet-service-record-link") ||
    /reply|call|pdf copy|save pdf|open pdf|confirm|request/i.test(buttonText)
  );
}

function ActionLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "border-[#f26a21] bg-[#f26a21] text-white hover:bg-[#dd5b17]"
      : tone === "light"
        ? "border-white/14 bg-white/7 text-white hover:bg-white/12"
        : "border-[#111315] bg-[#111315] text-white hover:bg-[#20262d]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold transition ${toneClass}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </Link>
  );
}

function ActionButton({
  children,
  onClick,
  tone = "dark",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "dark" | "light" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "border-[#f26a21] bg-[#f26a21] text-white hover:bg-[#dd5b17]"
      : tone === "light"
        ? "border-white/14 bg-white/7 text-white hover:bg-white/12"
        : "border-[#111315] bg-[#111315] text-white hover:bg-[#20262d]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold transition ${toneClass}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

function ViewerButton({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition",
        active
          ? "border-[#f26a21] bg-[#f26a21] text-white"
          : "border-white/12 bg-white/[0.055] text-white/52 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-white/10 py-3 first:border-t-0 sm:grid-cols-[0.36fr_0.64fr] sm:gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">
        {label}
      </p>
      <p className="text-sm font-bold leading-6 text-white">{value}</p>
    </div>
  );
}

function HeroActionButton({
  children,
  onClick,
  tone = "accent",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "accent" | "quiet";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition",
        tone === "accent"
          ? "bg-[#f26a21] text-white shadow-[0_18px_52px_rgba(242,106,33,0.30)] hover:bg-[#dd5b17]"
          : "border border-white/14 bg-white/[0.055] text-white hover:bg-white/[0.09]",
      )}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

function EditedArtifactHero({
  data,
  onOpenMode,
}: {
  data: Axis1PacketPreviewData;
  onOpenMode: (mode: ViewerMode) => void;
}) {
  const issuePhoto =
    data.proofPhotos.find((photo) => photo.tone === "issue") ??
    data.proofPhotos.find((photo) => photo.tone === "after") ??
    data.proofPhotos[0];

  return (
    <section className="relative isolate overflow-hidden bg-[#080a0c] px-3 pb-8 pt-4 text-white sm:px-5 lg:pb-12">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#080a0c_0%,#11161b_58%,#080a0c_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:linear-gradient(180deg,black,transparent_76%)]" />

      <div className="mx-auto grid min-h-[calc(100svh-110px)] w-[min(1240px,100%)] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-2xl pt-2 lg:pt-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ffb27c]">
            Sample report
          </p>
          <h1 className="mt-4 max-w-[10.5ch] text-[2.65rem] font-black leading-[1.02] tracking-normal sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.8rem]">
            See the branded service report a restaurant receives.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/68 sm:text-lg">
            This is the link and PDF a restaurant can save after service, with the result, photos, open items, and next action in one place.
          </p>
          <div className="mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
            <div className="rounded-[20px] border border-white/12 bg-white/[0.055] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffb27c]">
                Restaurant view
              </p>
              <p className="mt-2 text-sm font-bold leading-5 text-white/72">
                Opens result, photos, and next action.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/12 bg-white/[0.055] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffb27c]">
                Service PDF
              </p>
              <p className="mt-2 text-sm font-bold leading-5 text-white/72">
                Saves a copy with service records.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <HeroActionButton onClick={() => onOpenMode("link")}>
              Open restaurant view
            </HeroActionButton>
            <HeroActionButton tone="quiet" onClick={() => onOpenMode("pdf")}>
              See PDF copy
            </HeroActionButton>
            <Link
              href="/company-version"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/14 bg-white text-[#111315] px-5 text-sm font-black transition hover:bg-[#f7efe4]"
            >
              Use this under my company name
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[560px] lg:min-h-[680px]">
          <div className="absolute left-[2%] top-[5%] w-[88%] rotate-[-3deg] rounded-[34px] border border-white/14 bg-[#f7efe4] p-4 text-[#111315] shadow-[0_34px_110px_rgba(0,0,0,0.44)] sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#111315] text-sm font-black text-[#ffb27c]">
                  HL
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">Summit Hood Service Co.</p>
                  <p className="mt-1 text-xs font-semibold text-[#665c53]">Sent to Sample Restaurant Group</p>
                </div>
              </div>
              <span className="rounded-full border border-[#d7c8b8] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#665c53]">
                Apr 24
              </span>
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8581e]">
              Result
            </p>
            <h2 className="mt-2 text-[2.65rem] font-black leading-[0.88] tracking-[-0.07em] sm:text-[4.3rem]">
              Reachable work completed.
            </h2>
            <div className="mt-5 rounded-[24px] bg-[#111315] p-4 text-white">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffb27c]">
                Open item
              </p>
              <p className="mt-2 text-2xl font-black leading-tight text-[#ff8a3d]">
                1 area needs customer action.
              </p>
            </div>
          </div>

          {issuePhoto ? (
            <div className="absolute bottom-[15%] left-[0%] w-[58%] rotate-[4deg] overflow-hidden rounded-[30px] border border-white/16 bg-[#111315] shadow-[0_32px_100px_rgba(0,0,0,0.42)]">
              <div className="relative aspect-[0.94/1]">
                <Image
                  src={issuePhoto.src}
                  alt={issuePhoto.title}
                  fill
                  sizes="(min-width: 1024px) 380px, 60vw"
                  className="object-cover"
                  style={{ objectPosition: issuePhoto.position }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.64))]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#ffb27c]">
                    Field photos
                  </p>
                  <h3 className="mt-2 text-2xl font-black leading-[0.95] tracking-[-0.05em] text-white">
                    Photos support the record.
                  </h3>
                </div>
              </div>
            </div>
          ) : null}

          <div className="absolute bottom-[2%] right-[1%] w-[56%] rotate-[-5deg] rounded-[28px] border border-black/10 bg-white p-4 text-[#111315] shadow-[0_32px_100px_rgba(0,0,0,0.38)]">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8581e]">
                Customer record copy
              </p>
              <FileText className="h-4 w-4 text-[#c8581e]" />
            </div>
            <h3 className="mt-4 text-2xl font-black leading-[0.92] tracking-[-0.06em]">
              Service record PDF.
            </h3>
            <div className="mt-4 space-y-2">
              {["Service date", "Customer action", "Photos"].map((label) => (
                <div key={label} className="grid grid-cols-[0.48fr_0.52fr] gap-2 border-t border-black/10 pt-2 text-[10px]">
                  <span className="font-semibold text-[#75695f]">{label}</span>
                  <span className="font-black text-[#111315]">Included</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-full bg-[#fff2e8] px-3 py-2 text-[11px] font-black text-[#a8461d]">
              Save it with service records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewerChrome({
  mode,
  onModeChange,
}: {
  mode: ViewerMode;
  onModeChange: (mode: ViewerMode) => void;
}) {
  const displayUrl =
    mode === "pdf"
      ? "kitchenpermit.com/p/summit/service-record.pdf"
      : "kitchenpermit.com/p/summit/restaurant-view";

  return (
    <div className="grid gap-3 border-b border-white/10 bg-[#111519] px-3 py-3 text-white sm:px-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f26a21]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/22" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/14" />
        </div>
        <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-black/24 px-3">
          {mode === "pdf" ? (
            <FileText className="h-3.5 w-3.5 shrink-0 text-[#ffb27c]" />
          ) : (
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-[#ffb27c]" />
          )}
          <p className="truncate font-mono text-[11px] font-bold text-white/72">
            {displayUrl}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <ViewerButton active={mode === "link"} onClick={() => onModeChange("link")}>
          Restaurant view
        </ViewerButton>
        <ViewerButton active={mode === "pdf"} onClick={() => onModeChange("pdf")}>
          Service PDF
        </ViewerButton>
      </div>
    </div>
  );
}

function PdfPreview({ data }: { data: Axis1PacketPreviewData }) {
  return (
    <div className="bg-[#cfc7bb] p-3 text-[#151515] sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1020px] rounded-[28px] border border-black/10 bg-[#efe8df] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_28px_110px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between gap-3 rounded-t-[20px] border border-b-0 border-black/10 bg-[#f7f1e9] px-4 py-3 print:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#c8581e]" />
            <p className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#665c53]">
              Saved service record
            </p>
          </div>
          <p className="hidden text-[11px] font-semibold text-[#665c53]/72 sm:block">
            PDF page 1 of 1
          </p>
        </div>
        <div className="mx-auto max-w-[920px] overflow-hidden border border-black/12 bg-white text-[#151515] shadow-[0_22px_70px_rgba(0,0,0,0.24)]">
          <Axis1PacketDocument
            data={data}
            variant="customer-report"
            outputIntent="service-record"
          />
        </div>
        <p className="px-2 pt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#7d7166]">
          Formatted for manager files, service folders, and documentation requests
        </p>
      </div>
    </div>
  );
}

function SampleActionNotice({
  open,
  onClose,
  onViewPdf,
}: {
  open: boolean;
  onClose: () => void;
  onViewPdf: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[180] grid place-items-center bg-[#080a0c]/74 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-action-notice-title"
    >
      <div className="w-full max-w-[440px] rounded-[30px] border border-white/12 bg-[#f7efe4] p-5 text-[#111315] shadow-[0_32px_110px_rgba(0,0,0,0.42)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c8581e]">
          Public sample
        </p>
        <h2
          id="sample-action-notice-title"
          className="mt-3 text-[2rem] font-black leading-[0.92] tracking-[-0.07em]"
        >
          Live records can take action. This sample does not send anything.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#665c53]">
          In a real customer record, this button would open the vendor&apos;s reply,
          call, or PDF flow. This public sample only shows what the restaurant
          receives, so no email, call, or submission is triggered.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#111315] px-4 text-sm font-black text-white"
          >
            Continue viewing
          </button>
          <button
            type="button"
            onClick={onViewPdf}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-black text-[#111315]"
          >
            See PDF copy
          </button>
        </div>
      </div>
    </div>
  );
}

export function SampleReportViewer({ data }: SampleReportViewerProps) {
  const [mode, setMode] = useState<ViewerMode>("link");
  const [sampleActionNoticeOpen, setSampleActionNoticeOpen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  function scrollViewerIntoView(behavior: ScrollBehavior = "smooth") {
    viewerRef.current?.scrollIntoView({ behavior, block: "start" });
  }

  useEffect(() => {
    function syncModeFromHash() {
      const hashMode =
        window.location.hash === "#pdf-copy"
          ? "pdf"
          : window.location.hash === "#customer-link"
            ? "link"
            : null;

      if (hashMode) {
        setMode(hashMode);
        requestAnimationFrame(() => scrollViewerIntoView("auto"));
      }
    }

    syncModeFromHash();
    window.addEventListener("hashchange", syncModeFromHash);

    return () => {
      window.removeEventListener("hashchange", syncModeFromHash);
    };
  }, []);

  function handleModeChange(nextMode: ViewerMode) {
    setMode(nextMode);

    const hash = nextMode === "pdf" ? "#pdf-copy" : "#customer-link";
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${hash}`,
    );
  }

  function openViewerMode(nextMode: ViewerMode) {
    handleModeChange(nextMode);
    requestAnimationFrame(() => {
      scrollViewerIntoView("smooth");
    });
    window.setTimeout(() => scrollViewerIntoView("smooth"), 120);
  }

  function handleSampleOutputClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (!(target instanceof HTMLElement) || !isSampleActionTarget(target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setSampleActionNoticeOpen(true);
  }

  return (
    <div className="bg-[#090b0d] pb-10 text-white">
      <EditedArtifactHero data={data} onOpenMode={openViewerMode} />
      <section className="px-3 pb-5 pt-3 sm:px-5">
        <div className="mx-auto w-[min(1240px,100%)]">
          <div className="mb-4 grid gap-3 border-y border-white/10 py-4 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffb27c]">
              Sample restaurant view
            </p>
            <p className="max-w-3xl text-sm font-semibold leading-7 text-white/64 lg:justify-self-end">
              Below is the sample report a restaurant would receive: the view they open, plus the PDF they save with customer files.
            </p>
          </div>
          <div
            ref={viewerRef}
            data-sample-viewer
            className="scroll-mt-24 overflow-hidden rounded-[34px] border border-white/12 bg-[#0f1317] shadow-[0_34px_130px_rgba(0,0,0,0.42)]"
          >
            <ViewerChrome mode={mode} onModeChange={handleModeChange} />
            {mode === "pdf" ? (
              <div onClickCapture={handleSampleOutputClick}>
                <PdfPreview data={data} />
              </div>
            ) : (
              <div
                className="bg-[#e4dbcf] text-[#151515]"
                onClickCapture={handleSampleOutputClick}
              >
                <Axis1PacketDocument data={data} variant="customer-report" />
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]">
            <div className="rounded-[28px] border border-white/10 bg-[#14181d] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.24)] sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#ffb27c]">
                What this sample is
              </p>
              <h1 className="mt-3 max-w-4xl text-[clamp(2rem,6vw,4.6rem)] font-black leading-[0.88] tracking-[-0.075em]">
                A branded service report, exactly as the restaurant would receive it.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                The company name, logo, contact, link, and PDF are sample company details.
                The customer-facing report is above.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ActionLink href="/p/sample-blocked-access" tone="accent">
                  Open full restaurant view
                </ActionLink>
                <ActionButton onClick={() => openViewerMode("pdf")} tone="light">
                  Show PDF copy
                </ActionButton>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#111519] p-4 text-white shadow-[0_22px_80px_rgba(0,0,0,0.22)] sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/38">
                Link envelope
              </p>
              <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
                <FieldLine label="From" value="Summit Hood Service Co." />
                <FieldLine label="To" value="Sample Restaurant Group" />
                <FieldLine label="Opened for" value="Kitchen exhaust cleaning record" />
                <FieldLine label="Keep" value="Restaurant view + PDF copy" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <SampleActionNotice
        open={sampleActionNoticeOpen}
        onClose={() => setSampleActionNoticeOpen(false)}
        onViewPdf={() => {
          setSampleActionNoticeOpen(false);
          openViewerMode("pdf");
        }}
      />
    </div>
  );
}
