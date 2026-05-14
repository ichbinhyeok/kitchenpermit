import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

const companyProfileStorageKey = "hood.axis1.company-profile.v1";
const companyProfileChangeEvent = "axis1:company-profile";

export type Axis1CompanyProfile = {
  companyName: string;
  serviceArea: string;
  directLine: string;
  dispatchEmail: string;
  afterHoursPhone: string;
  certification: string;
  technicianLabel: string;
  brandInitials: string;
  logoUrl?: string;
  brandColor?: string;
  updatedAt?: string;
};

export const defaultAxis1CompanyProfile: Axis1CompanyProfile = {
  companyName: "Acme Hood Cleaning",
  serviceArea: "Austin, TX | kitchen exhaust service",
  directLine: "(555) 014-2201",
  dispatchEmail: "dispatch@acmehood.example",
  afterHoursPhone: "(555) 014-2209",
  certification: "Service license / certification",
  technicianLabel: "Technician / crew",
  brandInitials: "AC",
  logoUrl: "",
  brandColor: "#f26a21",
};

let cachedRaw: string | null | undefined;
let cachedProfile: Axis1CompanyProfile = defaultAxis1CompanyProfile;

function storageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function clean(value: unknown, fallback: string, maxLength = 80) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function initialsFromName(name: string) {
  const initials = name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || defaultAxis1CompanyProfile.brandInitials;
}

function cleanLogoUrl(value: unknown) {
  if (typeof value !== "string") {
    return defaultAxis1CompanyProfile.logoUrl;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return defaultAxis1CompanyProfile.logoUrl;
  }

  const isSupportedDataUrl =
    /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(
      trimmed,
    );

  return isSupportedDataUrl && trimmed.length <= 700_000
    ? trimmed
    : defaultAxis1CompanyProfile.logoUrl;
}

function cleanBrandColor(value: unknown) {
  if (typeof value !== "string") {
    return defaultAxis1CompanyProfile.brandColor;
  }

  const color = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toLowerCase();
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    const [, r, g, b] = color.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return defaultAxis1CompanyProfile.brandColor;
}

export function normalizeAxis1CompanyProfile(
  value: Partial<Axis1CompanyProfile>,
): Axis1CompanyProfile {
  const companyName = clean(
    value.companyName,
    defaultAxis1CompanyProfile.companyName,
    72,
  );
  const brandInitials = clean(
    value.brandInitials,
    initialsFromName(companyName),
    4,
  )
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 3);

  return {
    companyName,
    serviceArea: clean(
      value.serviceArea,
      defaultAxis1CompanyProfile.serviceArea,
      90,
    ),
    directLine: clean(
      value.directLine,
      defaultAxis1CompanyProfile.directLine,
      32,
    ),
    dispatchEmail: clean(
      value.dispatchEmail,
      defaultAxis1CompanyProfile.dispatchEmail,
      80,
    ),
    afterHoursPhone: clean(
      value.afterHoursPhone,
      defaultAxis1CompanyProfile.afterHoursPhone,
      32,
    ),
    certification: clean(
      value.certification,
      defaultAxis1CompanyProfile.certification,
      72,
    ),
    technicianLabel: clean(
      value.technicianLabel,
      defaultAxis1CompanyProfile.technicianLabel,
      56,
    ),
    brandInitials: brandInitials || initialsFromName(companyName),
    logoUrl: cleanLogoUrl(value.logoUrl),
    brandColor: cleanBrandColor(value.brandColor),
    updatedAt: value.updatedAt,
  };
}

export function readAxis1CompanyProfile() {
  if (!storageAvailable()) {
    return defaultAxis1CompanyProfile;
  }

  const raw = window.localStorage.getItem(companyProfileStorageKey);

  if (raw === cachedRaw) {
    return cachedProfile;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedProfile = defaultAxis1CompanyProfile;
    return cachedProfile;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Axis1CompanyProfile>;
    cachedProfile = normalizeAxis1CompanyProfile(parsed);
    return cachedProfile;
  } catch {
    cachedProfile = defaultAxis1CompanyProfile;
    return cachedProfile;
  }
}

export function saveAxis1CompanyProfile(
  value: Partial<Axis1CompanyProfile>,
) {
  const profile = normalizeAxis1CompanyProfile({
    ...value,
    updatedAt: new Date().toISOString(),
  });

  if (!storageAvailable()) {
    return profile;
  }

  const raw = JSON.stringify(profile);
  window.localStorage.setItem(companyProfileStorageKey, raw);
  cachedRaw = raw;
  cachedProfile = profile;
  window.dispatchEvent(new Event(companyProfileChangeEvent));
  return profile;
}

export function subscribeAxis1CompanyProfile(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === companyProfileStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(companyProfileChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(companyProfileChangeEvent, onStoreChange);
  };
}

function replaceRows(
  rows: readonly [string, string][],
  replacements: Record<string, string>,
) {
  return rows.map(([label, value]) => [
    label,
    replacements[label] ?? value,
  ]) as [string, string][];
}

export function applyAxis1CompanyProfileToPacketData(
  data: Axis1PacketPreviewData,
  profile: Axis1CompanyProfile,
): Axis1PacketPreviewData {
  const normalizedProfile = normalizeAxis1CompanyProfile(profile);
  const preparedBy = `${normalizedProfile.companyName} | ${normalizedProfile.technicianLabel}`;
  const rowReplacements = {
    Technician: normalizedProfile.technicianLabel,
    Credential: normalizedProfile.certification,
    Dispatch: normalizedProfile.dispatchEmail,
    "After-hours": normalizedProfile.afterHoursPhone,
    "Follow-up contact": normalizedProfile.dispatchEmail,
    "Prepared by technician": preparedBy,
    "Technician credential": normalizedProfile.certification,
    "Servicing company": normalizedProfile.companyName,
    "Service provider": normalizedProfile.companyName,
  };

  return {
    ...data,
    branding: "applied",
    vendor: {
      ...data.vendor,
      ...(normalizedProfile.brandColor
        ? { brandColor: normalizedProfile.brandColor }
        : {}),
      name: normalizedProfile.companyName,
      initials: normalizedProfile.brandInitials,
      logoUrl: normalizedProfile.logoUrl || undefined,
      office: normalizedProfile.serviceArea,
      directLine: normalizedProfile.directLine,
      dispatch: normalizedProfile.dispatchEmail,
      certification: normalizedProfile.certification,
      technician: normalizedProfile.technicianLabel,
      afterHours: normalizedProfile.afterHoursPhone,
      reviewPrompt: normalizedProfile.dispatchEmail,
      preparedBy,
      previewBlurb:
        "Saved company profile applied: customer sees the vendor name, service area, phone, dispatch email, and credential in the report.",
      brandingApplied: true,
    },
    packetHeader: {
      ...data.packetHeader,
      archiveNote:
        "Customer receives the branded service report link/PDF. Full image archive and raw technician detail stay retained in the company record.",
    },
    serviceRecordRows: replaceRows(data.serviceRecordRows, rowReplacements),
    closeoutRows: replaceRows(data.closeoutRows, rowReplacements),
  };
}
