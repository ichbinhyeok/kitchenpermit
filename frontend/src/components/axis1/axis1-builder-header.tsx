"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu as MenuIcon } from "lucide-react";

export type Axis1BuilderHeaderStep<TStep extends string> = {
  value: TStep;
  label: string;
  navLabel: string;
};

type Axis1BuilderHeaderProps<TStep extends string> = {
  activeStep: TStep;
  getStepMetric: (step: TStep) => string;
  onSelectStep: (step: TStep) => void;
  steps: ReadonlyArray<Axis1BuilderHeaderStep<TStep>>;
};

export function Axis1BuilderHeader<TStep extends string>({
  activeStep,
  getStepMetric,
  onSelectStep,
  steps,
}: Axis1BuilderHeaderProps<TStep>) {
  const [showToolMenu, setShowToolMenu] = useState(false);

  useEffect(() => {
    if (!showToolMenu) {
      return;
    }

    function handleToolMenuKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowToolMenu(false);
      }
    }

    document.addEventListener("keydown", handleToolMenuKeyDown);

    return () => {
      document.removeEventListener("keydown", handleToolMenuKeyDown);
    };
  }, [showToolMenu]);

  const handleSelectStep = (step: TStep) => {
    setShowToolMenu(false);
    onSelectStep(step);
  };

  return (
    <div className="pdf-print-hide relative z-[120] mx-auto w-full max-w-[1180px] overflow-visible pb-3">
      <div
        className="relative flex min-h-[54px] items-center gap-2 overflow-visible rounded-full border border-white/10 bg-[#171a1d]/94 p-1.5 shadow-[0_14px_46px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:min-h-[58px]"
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
              Closeout
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-black/18 p-1">
          {steps.map((step, index) => {
            const stepMetric = getStepMetric(step.value);
            const selected = activeStep === step.value;

            return (
              <button
                key={step.value}
                type="button"
                onClick={() => handleSelectStep(step.value)}
                aria-label={step.label}
                className={`group flex h-10 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-center transition-all duration-200 sm:h-11 sm:flex-row sm:justify-between sm:gap-1.5 sm:px-3 ${
                  selected
                    ? "bg-white text-[#111315] shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
                    : "bg-transparent text-white/38 opacity-70 hover:bg-white/[0.055] hover:text-white/70 hover:opacity-100"
                }`}
                data-axis-tool-step
              >
                <span
                  className={`hidden h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black min-[360px]:grid ${
                    selected
                      ? "bg-[#111315] text-white"
                      : "bg-white/[0.08] text-white/42"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.06em] sm:text-[11px] sm:tracking-[0.08em]">
                  <span className="lg:hidden">{step.navLabel}</span>
                  <span className="hidden lg:inline">{step.label}</span>
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
            onPointerDown={(event) => {
              event.stopPropagation();
              setShowToolMenu((current) => !current);
            }}
            onClick={(event) => {
              if (event.detail !== 0) {
                return;
              }

              setShowToolMenu((current) => !current);
            }}
            aria-label="Open tool menu"
            aria-expanded={showToolMenu}
            className="inline-flex h-10 w-10 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.065] text-[11px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/[0.09] sm:h-11 sm:w-auto sm:px-3 sm:tracking-[0.12em]"
          >
            <MenuIcon className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Menu</span>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 transition sm:block ${
                showToolMenu ? "rotate-180" : ""
              }`}
            />
          </button>
          {showToolMenu ? (
            <div
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              className="absolute right-0 top-12 z-[160] w-44 overflow-hidden rounded-[18px] border border-white/10 bg-[#202326] p-1 shadow-[0_22px_70px_rgba(0,0,0,0.38)]"
            >
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
  );
}
