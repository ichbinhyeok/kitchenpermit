import { siteConfig } from "@/lib/site";

export type StartRequestDraft = {
  companyName?: string;
  contactName?: string;
  email?: string;
  productInterest?: string;
  serviceArea?: string;
};

function firstNonBlank(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export function buildEmailDraftUrl(draft: StartRequestDraft) {
  const productInterest = firstNonBlank(draft.productInterest, "Project");
  const companyName = firstNonBlank(draft.companyName, "Not provided");
  const contactName = firstNonBlank(draft.contactName, "Not provided");
  const email = firstNonBlank(draft.email, "Not provided");
  const serviceArea = firstNonBlank(draft.serviceArea, "Not provided");

  const subject = `${productInterest} request - ${companyName}`;
  const body = [
    "Kitchen Permit team,",
    "",
    `I want to discuss ${productInterest}.`,
    "",
    `Company: ${companyName}`,
    `Primary contact: ${contactName}`,
    `Email: ${email}`,
    `Service area: ${serviceArea}`,
    "",
    "Notes:",
  ].join("\r\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${siteConfig.supportEmail}?${params.toString().replaceAll("+", "%20")}`;
}

export function readQueryValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}
