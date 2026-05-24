import type { Axis1LocalPacketSaveInput } from "@/lib/axis1-local-packet-store";
import {
  normalizeAxis1CompanyProfile,
  type Axis1CompanyProfile,
} from "@/lib/axis1-company-profile";
import { fetchApi } from "@/lib/api";
import type { Axis1ProductPlan } from "@/lib/axis1-product-policy";

export type Axis1ServerReportRecord = {
  id: string;
  publicId: string;
  href: string;
  toolHref: string;
  productPlan: Axis1ProductPlan;
  title: string;
  customerName: string;
  siteName: string;
  serviceDate?: string | null;
  nextServiceDate?: string | null;
  hasOpenItems?: boolean;
  historyStatus?: {
    code:
      | "open_access"
      | "quote_review"
      | "monitor_condition"
      | "next_service"
      | "written_record"
      | "record_only";
    label: string;
    tone: "action" | "review" | "scheduled" | "record" | "neutral";
  };
  customerAction?: string;
  engagement?: {
    publicViewCount: number;
    firstViewedAt?: string | null;
    lastViewedAt?: string | null;
    pdfSaveClickCount: number;
    lastPdfSaveClickedAt?: string | null;
    customerConfirmed: boolean;
    customerConfirmedAt?: string | null;
    customerConfirmedBy?: string | null;
  };
  viewer?: {
    ownerPreview: boolean;
  };
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  payload?: Partial<Axis1LocalPacketSaveInput>;
  assetStorage?: {
    driver: string;
    mode: string;
    externalObjectStorageReady: boolean;
    inlinePhotoCount?: number;
    target?: string;
  };
  pdfExport?: {
    driver: string;
    mode: string;
    serverDownloadReady: boolean;
    currentAction: string;
    externalProviderTarget: string;
    downloadHref?: string;
    fileName?: string;
    contentType?: string;
    generatedAt?: string;
  };
  retention?: {
    expiresAt?: string | null;
    status: "active" | "expired";
    policy: string;
  };
};

export type Axis1AccountEntitlements = {
  authenticated: boolean;
  emailVerified: boolean;
  emailVerificationRequired: boolean;
  companyAccess: boolean;
  billingProvider: string;
  billingStatus: string;
  accessSource: string;
  enabledFeatures: string[];
};

async function readJsonResponse<T>(response: Response) {
  if (!response.ok) {
    throw new Error(`Service report storage request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loadAxis1ServerCompanyProfile() {
  const response = await fetchApi("/api/account/company-profile", {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return normalizeAxis1CompanyProfile(
    await readJsonResponse<Partial<Axis1CompanyProfile>>(response),
  );
}

export async function saveAxis1ServerCompanyProfile(
  profile: Axis1CompanyProfile,
) {
  const response = await fetchApi("/api/account/company-profile", {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  return normalizeAxis1CompanyProfile(
    await readJsonResponse<Partial<Axis1CompanyProfile>>(response),
  );
}

export async function loadAxis1AccountEntitlements() {
  const response = await fetchApi("/api/account/entitlements", {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return readJsonResponse<Axis1AccountEntitlements>(response);
}

export async function saveAxis1ServerReport(input: Axis1LocalPacketSaveInput) {
  const response = await fetchApi("/api/axis1/reports", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJsonResponse<Axis1ServerReportRecord>(response);
}

export async function loadAxis1ServerReport(
  publicId: string,
  options?: { preview?: boolean },
) {
  const suffix = options?.preview ? "?preview=1" : "";
  const response = await fetchApi(
    `/api/axis1/reports/public/${encodeURIComponent(publicId)}${suffix}`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return readJsonResponse<Axis1ServerReportRecord>(response);
}

export async function recordAxis1ServerReportPdfSave(
  publicId: string,
  options?: { preview?: boolean },
) {
  const suffix = options?.preview ? "?preview=1" : "";
  const response = await fetchApi(
    `/api/axis1/reports/public/${encodeURIComponent(publicId)}/events/pdf-save${suffix}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return readJsonResponse<NonNullable<Axis1ServerReportRecord["engagement"]>>(
    response,
  );
}

export async function confirmAxis1ServerReportReceived(
  publicId: string,
  options?: { preview?: boolean },
) {
  const suffix = options?.preview ? "?preview=1" : "";
  const response = await fetchApi(
    `/api/axis1/reports/public/${encodeURIComponent(publicId)}/confirm${suffix}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirmedBy: "Customer" }),
    },
  );

  return readJsonResponse<NonNullable<Axis1ServerReportRecord["engagement"]>>(
    response,
  );
}

export async function loadAxis1ServerReportForBuilder(publicId: string) {
  const response = await fetchApi(
    `/api/axis1/reports/${encodeURIComponent(publicId)}/builder`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return readJsonResponse<Axis1ServerReportRecord>(response);
}

export async function loadAxis1ServerReportHistory() {
  const response = await fetchApi("/api/axis1/reports/history", {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return readJsonResponse<Axis1ServerReportRecord[]>(response);
}

export async function deleteAxis1ServerReport(publicId: string) {
  const response = await fetchApi(
    `/api/axis1/reports/${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Service report delete failed with ${response.status}`);
  }
}
