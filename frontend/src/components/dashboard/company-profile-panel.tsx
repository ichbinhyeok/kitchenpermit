"use client";

import {
  type ChangeEvent,
  type HTMLInputTypeAttribute,
  useEffect,
  useState,
} from "react";
import {
  ChevronDown,
  ImageUp,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  defaultAxis1CompanyProfile,
  readAxis1CompanyProfile,
  saveAxis1CompanyProfile,
  type Axis1CompanyProfile,
} from "@/lib/axis1-company-profile";
import {
  loadAxis1AccountEntitlements,
  loadAxis1ServerCompanyProfile,
  saveAxis1ServerCompanyProfile,
} from "@/lib/axis1-server-storage";

const requiredProfileFields = [
  {
    key: "companyName",
    label: "Company name",
    helper: "Appears at the top of every restaurant report.",
    placeholder: "Acme Hood Cleaning",
    type: "text",
    inputMode: "text",
    maxLength: 90,
  },
  {
    key: "directLine",
    label: "Phone customers can call",
    helper: "Use a 10-digit phone number so call buttons work cleanly.",
    placeholder: "(213) 555-0196",
    type: "tel",
    inputMode: "tel",
    maxLength: 14,
  },
  {
    key: "dispatchEmail",
    label: "Reply email",
    helper: "Shown as the backup contact for questions or follow-up.",
    placeholder: "dispatch@acmehood.com",
    type: "email",
    inputMode: "email",
    maxLength: 120,
  },
  {
    key: "serviceArea",
    label: "Service area",
    helper: "Recommended format: metro or county | service focus.",
    placeholder: "Los Angeles County | Commercial kitchen hoods",
    type: "text",
    inputMode: "text",
    maxLength: 90,
  },
] as const satisfies ReadonlyArray<{
  key: keyof Axis1CompanyProfile;
  label: string;
  helper: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "tel" | "email";
  maxLength: number;
}>;

const optionalProfileFields = [
  {
    key: "certification",
    label: "License or credential",
    helper: "Optional line for a registration, license, or service reference.",
    placeholder: "NFPA 96 service documentation",
    type: "text",
    inputMode: "text",
    maxLength: 90,
  },
  {
    key: "afterHoursPhone",
    label: "After-hours phone",
    helper: "Optional emergency or night-dispatch line.",
    placeholder: "(213) 555-0197",
    type: "tel",
    inputMode: "tel",
    maxLength: 14,
  },
  {
    key: "technicianLabel",
    label: "Crew or technician",
    helper: "Optional crew name or generic technician label.",
    placeholder: "Night crew",
    type: "text",
    inputMode: "text",
    maxLength: 90,
  },
  {
    key: "brandInitials",
    label: "Report initials",
    helper: "Shown only if you do not upload a logo.",
    placeholder: "AH",
    type: "text",
    inputMode: "text",
    maxLength: 4,
  },
] as const satisfies ReadonlyArray<{
  key: keyof Axis1CompanyProfile;
  label: string;
  helper: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "tel" | "email";
  maxLength: number;
}>;

const reportColorChoices = [
  { label: "Orange", value: "#f26a21" },
  { label: "Black", value: "#111315" },
  { label: "Green", value: "#176b5d" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Red", value: "#b42318" },
] as const;
const maxLogoBytes = 400 * 1024;

function inputClassName(locked: boolean, invalid = false) {
  return `mt-2 min-h-[46px] w-full border px-3 text-sm font-bold outline-none transition placeholder:text-[#8b8178] focus:ring-4 ${
    locked
      ? "bg-[#f0e7dc] text-[#75695f] opacity-75"
      : invalid
        ? "border-[#9a4b35]/50 bg-[#fff7f3] text-[#111315] focus:border-[#9a4b35] focus:ring-[#9a4b35]/10"
        : "border-black/10 bg-white text-[#111315] focus:border-[#f26a21]/42 focus:ring-[#f26a21]/10"
  }`;
}

function normalizeColorInput(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toLowerCase() : value;
}

function isDefaultProfile(profile: Axis1CompanyProfile) {
  return (
    profile.companyName === defaultAxis1CompanyProfile.companyName &&
    profile.directLine === defaultAxis1CompanyProfile.directLine &&
    profile.dispatchEmail === defaultAxis1CompanyProfile.dispatchEmail &&
    profile.serviceArea === defaultAxis1CompanyProfile.serviceArea &&
    !profile.logoUrl
  );
}

function needsProfileReview(profile: Axis1CompanyProfile) {
  const directLineDigits = profile.directLine.replace(/\D/g, "");
  const afterHoursDigits = profile.afterHoursPhone.replace(/\D/g, "");

  return (
    isDefaultProfile(profile) ||
    profile.directLine === "Customer phone" ||
    directLineDigits.length !== 10 ||
    (afterHoursDigits.length > 0 && afterHoursDigits.length !== 10) ||
    profile.serviceArea.toLowerCase().startsWith("service area /")
  );
}

function formatUsPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isPhoneField(key: keyof Axis1CompanyProfile) {
  return key === "directLine" || key === "afterHoursPhone";
}

function isIncompletePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length > 0 && digits.length < 10;
}

export function CompanyProfilePanel() {
  const [draft, setDraft] = useState<Axis1CompanyProfile>(
    defaultAxis1CompanyProfile,
  );
  const [saved, setSaved] = useState<Axis1CompanyProfile>(
    defaultAxis1CompanyProfile,
  );
  const [storageState, setStorageState] = useState<
    "loading" | "server" | "local" | "saving" | "locked" | "error"
  >("loading");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProfile() {
      const localProfile = readAxis1CompanyProfile();

      if (cancelled) {
        return;
      }

      setDraft(localProfile);
      setSaved(localProfile);
      setShowProfileEditor(needsProfileReview(localProfile));

      try {
        const entitlements = await loadAxis1AccountEntitlements();

        if (cancelled) {
          return;
        }

        if (!entitlements.companyAccess) {
          setStorageState("locked");
          return;
        }

        const profile = await loadAxis1ServerCompanyProfile();

        if (cancelled) {
          return;
        }

        const nextProfile = saveAxis1CompanyProfile(profile);
        setDraft(nextProfile);
        setSaved(nextProfile);
        setShowProfileEditor(needsProfileReview(nextProfile));
        setStorageState("server");
      } catch {
        if (!cancelled) {
          setStorageState("local");
        }
      }
    }

    void hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(key: keyof Axis1CompanyProfile, value: string) {
    const nextValue = isPhoneField(key)
      ? formatUsPhoneInput(value)
      : key === "brandInitials"
        ? value.toUpperCase().slice(0, 4)
        : value;

    setDraft((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  function updateLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.warning("Use a PNG, JPG, or WebP logo");
      return;
    }

    if (file.size > maxLogoBytes) {
      toast.warning("Logo file is too large", {
        description: "Use a smaller file under 400 KB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("logoUrl", reader.result);
      }
    };
    reader.onerror = () => {
      toast.warning("Could not read logo file");
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    if (storageState === "locked") {
      toast.warning("Company subscription required", {
        description: "Saved logo, report color, and contact info are part of the company version.",
      });
      return;
    }

    if (draft.directLine.replace(/\D/g, "").length !== 10) {
      toast.warning("Use a 10-digit customer phone", {
        description: "This keeps the call action on the restaurant report reliable.",
      });
      return;
    }

    setStorageState("saving");
    const nextProfile = saveAxis1CompanyProfile(draft);

    try {
      const serverProfile = await saveAxis1ServerCompanyProfile(nextProfile);
      const syncedProfile = saveAxis1CompanyProfile(serverProfile);
      setDraft(syncedProfile);
      setSaved(syncedProfile);
      setShowProfileEditor(false);
      setStorageState("server");
      toast.success("Company profile saved to account", {
        description: "Company mode will use this logo, report color, and contact info.",
      });
    } catch {
      setDraft(nextProfile);
      setSaved(nextProfile);
      setShowProfileEditor(false);
      setStorageState("error");
      toast.warning("Saved in this browser only", {
        description: "Try again or contact support if account sync keeps failing.",
      });
    }
  }

  async function resetProfile() {
    if (storageState === "locked") {
      toast.warning("Company subscription required", {
        description: "Saved logo, report color, and contact info are part of the company version.",
      });
      return;
    }

    setStorageState("saving");
    const nextProfile = saveAxis1CompanyProfile(defaultAxis1CompanyProfile);

    try {
      const serverProfile = await saveAxis1ServerCompanyProfile(nextProfile);
      const syncedProfile = saveAxis1CompanyProfile(serverProfile);
      setDraft(syncedProfile);
      setSaved(syncedProfile);
      setShowProfileEditor(true);
      setStorageState("server");
      toast("Company profile reset", {
        description: "The account profile is back to the default sample company.",
      });
    } catch {
      setDraft(nextProfile);
      setSaved(nextProfile);
      setShowProfileEditor(true);
      setStorageState("error");
      toast("Company profile reset locally", {
        description: "The server profile was not reachable.",
      });
    }
  }

  const savedRows = [
    ["Company", saved.companyName],
    ["Contact", `${saved.directLine} / ${saved.dispatchEmail}`],
    ["Report color", saved.brandColor || defaultAxis1CompanyProfile.brandColor],
    ["Credential", saved.certification],
  ] as const;
  const profileLocked = storageState === "locked";
  const profileReadOnly = profileLocked || storageState === "loading";
  const draftBrandColor =
    draft.brandColor || defaultAxis1CompanyProfile.brandColor || "#f26a21";
  const previewBrandColor = /^#[0-9A-Fa-f]{6}$/.test(draftBrandColor)
    ? draftBrandColor
    : defaultAxis1CompanyProfile.brandColor || "#f26a21";
  const profileNeedsReview = needsProfileReview(saved);

  return (
    <div
      id="company-profile"
      className="scroll-mt-4 border-b border-black/10 bg-[#fffaf2] px-4 py-3 sm:scroll-mt-6 sm:px-5"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] text-sm font-black text-white shadow-[0_12px_28px_rgba(17,19,21,0.12)]"
            style={{ backgroundColor: previewBrandColor }}
          >
            {saved.logoUrl ? (
              <span
                aria-hidden="true"
                className="h-full w-full bg-white bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${saved.logoUrl})` }}
              />
            ) : (
              saved.brandInitials
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#7b6f65]">
                Company profile
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                  profileLocked
                    ? "border-[#f26a21]/24 bg-[#fff7ef] text-[#9a3412]"
                    : profileNeedsReview
                      ? "border-[#f26a21]/24 bg-[#fff7ef] text-[#9a3412]"
                      : "border-[#1f7a4d]/22 bg-[#eff8f1] text-[#1f7a4d]"
                }`}
              >
                {storageState === "loading"
                  ? "Checking"
                  : profileLocked
                    ? "Locked"
                    : profileNeedsReview
                      ? "Needs review"
                      : "Ready"}
              </span>
            </div>
            <h2 className="mt-1 break-words text-xl font-black tracking-[-0.04em]">
              {storageState === "loading"
                ? "Checking company access."
                : profileLocked
                  ? "Company profile locked."
                  : saved.companyName}
            </h2>
            <p className="mt-1 max-w-4xl text-xs font-semibold leading-5 text-[#6f665e]">
              {profileLocked
                ? "Saved logo, report color, phone, and reply email unlock with the company version."
                : profileNeedsReview
                  ? "Set the company name, phone, service area, logo or initials, and report color before sending paid records."
                  : `${saved.directLine} / ${saved.dispatchEmail} / ${saved.serviceArea}`}
            </p>
            {!profileLocked ? (
              <div
                className="mt-2 h-1.5 w-full max-w-[420px] rounded-full"
                style={{ backgroundColor: previewBrandColor }}
              />
            ) : null}
          </div>
        </div>

        {!profileLocked ? (
          <button
            type="button"
            onClick={() => setShowProfileEditor((current) => !current)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[11px] font-black uppercase text-[#111315] shadow-[0_8px_24px_rgba(17,19,21,0.06)] transition hover:bg-[#fbf7ef]"
          >
            <Pencil className="h-3.5 w-3.5" />
            {showProfileEditor
              ? "Close editor"
              : profileNeedsReview
                ? "Set company info"
                : "Edit company info"}
          </button>
        ) : null}
      </div>

      {!profileLocked ? (
        <div className="mt-3 grid gap-2 border-t border-black/10 pt-3 text-xs font-semibold text-[#5f574f] md:grid-cols-3">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-[#1f7a4d]" />
            Phone format: (213) 555-0196
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#1f7a4d]" />
            Area format: Los Angeles County | Hood cleaning
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1f7a4d]" />
            Appears on customer link and PDF
          </div>
        </div>
      ) : null}

      {profileLocked ? (
        <div className="mt-5 rounded-[22px] border border-[#f26a21]/20 bg-white/82 px-4 py-4">
          <p className="text-sm font-black leading-6 text-[#111315]">
            Company profile locked until the company version is active.
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#6f665e]">
            Free and logged-in trial accounts can test the builder, but saved
            logo, report color, phone, and reply email only sync after
            subscription access is active.
          </p>
          <a
            href="/company-version"
            className="mt-4 inline-flex min-h-10 items-center justify-center bg-[#111315] px-4 text-[11px] font-black uppercase text-white transition hover:bg-[#26211d]"
          >
            Start company version
          </a>
        </div>
      ) : null}

      {!profileLocked && showProfileEditor ? (
        <>
      <div className="mt-5 grid gap-3 rounded-[22px] border border-black/8 bg-white/82 px-4 py-4">
        <div className="space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
              Logo and report color
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-[#5f574f]">
              The report color is just the accent line and button color on the
              restaurant link/PDF. Pick the color closest to your truck, logo,
              or website.
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
                Company logo
              </span>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-black/10 bg-[#fbf7ef]"
                  style={{
                    backgroundColor: draft.logoUrl ? "#fbf7ef" : previewBrandColor,
                  }}
                >
                  {draft.logoUrl ? (
                    <span
                      aria-label={`${draft.companyName} logo preview`}
                      role="img"
                      className="h-full w-full bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${draft.logoUrl})` }}
                    />
                  ) : (
                    <span
                      className="text-sm font-black text-white"
                      style={{ color: "#fff" }}
                    >
                      {draft.brandInitials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <label
                    className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-black/10 bg-white px-4 text-[11px] font-black uppercase text-[#111315] transition hover:bg-[#fbf7ef] ${
                      profileReadOnly
                        ? "pointer-events-none cursor-not-allowed opacity-45"
                        : ""
                    }`}
                  >
                    <ImageUp className="h-3.5 w-3.5" />
                    Upload logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={profileReadOnly}
                      aria-disabled={profileReadOnly}
                      onChange={updateLogo}
                      className="sr-only"
                    />
                  </label>
                  {draft.logoUrl ? (
                    <button
                      type="button"
                      onClick={() => updateField("logoUrl", "")}
                      disabled={profileReadOnly}
                      className="ml-2 inline-flex h-10 w-10 items-center justify-center border border-black/10 bg-white text-[#5f574f] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
                      aria-label="Remove logo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  <p className="mt-2 text-[11px] font-semibold leading-4 text-[#75695f]">
                    Appears on the restaurant link and PDF. PNG, JPG, or WebP
                    under 400 KB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
                Report color
              </span>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-[#75695f]">
                This does not change the whole app. It only marks your customer
                report with one company color.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {reportColorChoices.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateField("brandColor", color.value)}
                    disabled={profileReadOnly}
                    aria-label={`Use ${color.label} as the report color`}
                    className="flex min-h-10 items-center gap-2 border border-black/10 bg-white px-3 text-[11px] font-black uppercase text-[#111315] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
                    style={{
                      boxShadow:
                        previewBrandColor === color.value
                          ? "0 0 0 3px rgba(242,106,33,0.24)"
                          : undefined,
                    }}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.label}
                  </button>
                ))}
              </div>
              <details className="mt-3 rounded-[18px] border border-black/8 bg-[#fbf7ef] px-3 py-3">
                <summary className="cursor-pointer text-[11px] font-black uppercase tracking-[0.12em] text-[#75695f]">
                  Custom color
                </summary>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="color"
                    value={previewBrandColor}
                    onChange={(event) =>
                      updateField("brandColor", event.target.value)
                    }
                    disabled={profileReadOnly}
                    aria-disabled={profileReadOnly}
                    className="h-11 w-12 rounded-[14px] border border-black/10 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-45"
                  />
                  <input
                    value={draftBrandColor}
                    onChange={(event) =>
                      updateField("brandColor", normalizeColorInput(event.target.value))
                    }
                    disabled={profileReadOnly}
                    aria-disabled={profileReadOnly}
                    className={inputClassName(profileReadOnly)}
                    maxLength={7}
                    aria-label="Custom report color"
                  />
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-[#fbf7ef] p-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
            Restaurant report preview
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] text-sm font-black text-white"
              style={{ backgroundColor: previewBrandColor }}
            >
              {draft.logoUrl ? (
                <span
                  aria-hidden="true"
                  className="h-full w-full bg-white bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${draft.logoUrl})` }}
                />
              ) : (
                draft.brandInitials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-[-0.025em] text-[#111315]">
                {draft.companyName}
              </p>
              <p className="truncate text-xs font-semibold text-[#6f665e]">
                {draft.serviceArea}
              </p>
            </div>
          </div>
          <div
            className="mt-4 h-1.5 rounded-full"
            style={{ backgroundColor: previewBrandColor }}
          />
          <div className="mt-4 grid gap-2 text-xs font-semibold text-[#5f574f]">
            <p>Service report prepared by {draft.technicianLabel}</p>
            <p>{draft.directLine}</p>
            <p>{draft.dispatchEmail}</p>
            <p className="text-[#111315]">{draft.certification}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {requiredProfileFields.map((field) => {
          const value = String(draft[field.key] ?? "");
          const phoneInvalid =
            field.key === "directLine" && isIncompletePhone(value);

          return (
            <label key={field.key} className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7b6f65]">
                {field.label}
              </span>
              <input
                type={field.type ?? "text"}
                inputMode={field.inputMode}
                value={value}
                onChange={(event) => updateField(field.key, event.target.value)}
                disabled={profileReadOnly}
                aria-disabled={profileReadOnly}
                aria-invalid={phoneInvalid ? true : undefined}
                placeholder={field.placeholder}
                className={inputClassName(profileReadOnly, phoneInvalid)}
                maxLength={field.maxLength}
              />
              <span
                className={`mt-1.5 block text-[11px] font-semibold leading-4 ${
                  phoneInvalid ? "text-[#9a4b35]" : "text-[#75695f]"
                }`}
              >
                {phoneInvalid
                  ? "Enter 10 digits so the report call action can dial correctly."
                  : field.helper}
              </span>
              {field.key === "serviceArea" ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "Los Angeles County | Commercial kitchen hoods",
                    "Orange County | Restaurant hood service",
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => updateField("serviceArea", sample)}
                      disabled={profileReadOnly}
                      className="border border-black/10 bg-white px-2 py-1 text-[10px] font-black uppercase text-[#5f574f] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              ) : null}
            </label>
          );
        })}
      </div>

      <div className="mt-4 rounded-[22px] border border-black/8 bg-white/70 px-4 py-3">
        <button
          type="button"
          onClick={() => setShowOptionalFields((current) => !current)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
              Optional report details
            </span>
            <span className="mt-1 block text-sm font-semibold leading-5 text-[#5f574f]">
              Add license, after-hours, crew, or fallback initials only if they
              help the customer recognize the report.
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#f26a21] transition ${
              showOptionalFields ? "rotate-180" : ""
            }`}
          />
        </button>
        {showOptionalFields ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {optionalProfileFields.map((field) => (
              <label key={field.key} className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7b6f65]">
                  {field.label}
                </span>
                <input
                  type={field.type ?? "text"}
                  inputMode={field.inputMode}
                  value={String(draft[field.key] ?? "")}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  disabled={profileReadOnly}
                  aria-disabled={profileReadOnly}
                  aria-invalid={
                    field.key === "afterHoursPhone" &&
                    isIncompletePhone(String(draft[field.key] ?? ""))
                      ? true
                      : undefined
                  }
                  placeholder={field.placeholder}
                  className={inputClassName(
                    profileReadOnly,
                    field.key === "afterHoursPhone" &&
                      isIncompletePhone(String(draft[field.key] ?? "")),
                  )}
                  maxLength={field.maxLength}
                />
                <span className="mt-1.5 block text-[11px] font-semibold leading-4 text-[#75695f]">
                  {field.helper}
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 rounded-[22px] border border-black/8 bg-white/82 px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#f26a21]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
              Saved state
            </p>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#5f574f]">
            {storageState === "server"
              ? "The builder uses this company name, logo, report color, phone, and email in company mode."
              : storageState === "loading"
              ? "Checking account access before profile changes are enabled."
              : storageState === "saving"
              ? "Saving the account profile..."
              : "The builder is using the browser copy until account sync is reachable."}
          </p>
        </div>
        <div className="divide-y divide-black/8 border-y border-black/8">
          {savedRows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-2 py-2.5 text-sm sm:grid-cols-[0.32fr_0.68fr]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8b8178]">
                {label}
              </p>
              <p className="font-black tracking-[-0.025em]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={resetProfile}
          disabled={
            storageState === "saving" ||
            storageState === "loading"
          }
          className="inline-flex h-11 items-center justify-center gap-2 border border-black/10 bg-white px-4 text-[11px] font-black uppercase text-[#111315] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={saveProfile}
          disabled={
            storageState === "saving" ||
            storageState === "loading"
          }
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#f26a21] px-5 text-[11px] font-black uppercase text-white transition hover:bg-[#dd5b17] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Save className="h-3.5 w-3.5" />
          Save company profile
        </button>
      </div>
        </>
      ) : null}
    </div>
  );
}
