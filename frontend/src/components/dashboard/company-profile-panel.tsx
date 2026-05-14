"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  ImageUp,
  Pencil,
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
  },
  {
    key: "directLine",
    label: "Phone customers can call",
    helper: "Used for the report contact line and call action.",
  },
  {
    key: "dispatchEmail",
    label: "Reply email",
    helper: "Shown as the backup contact for questions or follow-up.",
  },
  {
    key: "serviceArea",
    label: "Service area",
    helper: "City or region shown below the company name.",
  },
] as const satisfies ReadonlyArray<{
  key: keyof Axis1CompanyProfile;
  label: string;
  helper: string;
}>;

const optionalProfileFields = [
  {
    key: "certification",
    label: "License or credential",
    helper: "Optional line for a registration, license, or service reference.",
  },
  {
    key: "afterHoursPhone",
    label: "After-hours phone",
    helper: "Optional emergency or night-dispatch line.",
  },
  {
    key: "technicianLabel",
    label: "Crew or technician",
    helper: "Optional crew name or generic technician label.",
  },
  {
    key: "brandInitials",
    label: "Report initials",
    helper: "Shown only if you do not upload a logo.",
  },
] as const satisfies ReadonlyArray<{
  key: keyof Axis1CompanyProfile;
  label: string;
  helper: string;
}>;

const reportColorChoices = [
  { label: "Orange", value: "#f26a21" },
  { label: "Black", value: "#111315" },
  { label: "Green", value: "#176b5d" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Red", value: "#b42318" },
] as const;
const maxLogoBytes = 400 * 1024;

function inputClassName(locked: boolean) {
  return `mt-2 h-11 w-full rounded-[16px] border border-black/10 px-3 text-sm font-bold outline-none transition placeholder:text-[#8b8178] focus:border-[#f26a21]/42 focus:ring-4 focus:ring-[#f26a21]/10 ${
    locked
      ? "bg-[#f0e7dc] text-[#75695f] opacity-75"
      : "bg-white text-[#111315]"
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
      setShowProfileEditor(isDefaultProfile(localProfile));

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
        setShowProfileEditor(isDefaultProfile(nextProfile));
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
    setDraft((current) => ({
      ...current,
      [key]: value,
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

  return (
    <div
      id="company-profile"
      className="rounded-[32px] border border-black/8 bg-[#fbf7ef] p-5 shadow-[0_24px_80px_rgba(26,20,16,0.10)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#7b6f65]">
            Company profile
          </p>
          <h2 className="mt-3 font-display text-[2.4rem] font-bold leading-[0.9] tracking-[-0.07em]">
            {storageState === "loading"
              ? "Checking company access."
              : profileLocked
              ? "Company profile locked."
              : "Company info for every report."}
          </h2>
        </div>
        <Building2 className="h-6 w-6 shrink-0 text-[#f26a21]" />
      </div>

      {!profileLocked && !showProfileEditor ? (
        <div className="mt-5 rounded-[24px] border border-black/8 bg-white/82 p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] text-sm font-black text-white"
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
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black tracking-[-0.03em] text-[#111315]">
                {saved.companyName}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#75695f]">
                Restaurants see this company name, logo/initials, report color,
                phone, and reply email on the link and PDF.
              </p>
              <div
                className="mt-3 h-1.5 rounded-full"
                style={{ backgroundColor: previewBrandColor }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileEditor(true)}
            className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[11px] font-black uppercase tracking-[0.13em] text-[#111315] transition hover:bg-[#fbf7ef]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit company info
          </button>
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
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#111315] px-4 text-[11px] font-black uppercase tracking-[0.13em] text-white transition hover:bg-[#26211d]"
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
                    className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[11px] font-black uppercase tracking-[0.13em] text-[#111315] transition hover:bg-[#fbf7ef] ${
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
                      className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#5f574f] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
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
                    className="flex min-h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#111315] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
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
        {requiredProfileFields.map((field) => (
          <label key={field.key} className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
              {field.label}
            </span>
            <input
              value={String(draft[field.key] ?? "")}
              onChange={(event) => updateField(field.key, event.target.value)}
              disabled={profileReadOnly}
              aria-disabled={profileReadOnly}
              className={inputClassName(profileReadOnly)}
              maxLength={90}
            />
            <span className="mt-1.5 block text-[11px] font-semibold leading-4 text-[#75695f]">
              {field.helper}
            </span>
          </label>
        ))}
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
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7b6f65]">
                  {field.label}
                </span>
                <input
                  value={String(draft[field.key] ?? "")}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  disabled={profileReadOnly}
                  aria-disabled={profileReadOnly}
                  className={inputClassName(profileReadOnly)}
                  maxLength={field.key === "brandInitials" ? 4 : 90}
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[11px] font-black uppercase tracking-[0.13em] text-[#111315] transition hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-45"
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-5 text-[11px] font-black uppercase tracking-[0.13em] text-white transition hover:bg-[#dd5b17] disabled:cursor-not-allowed disabled:opacity-45"
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
