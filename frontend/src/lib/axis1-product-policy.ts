export type Axis1ProductPlan = "free" | "company";

export const AXIS1_FREE_LINK_LIFESPAN_DAYS = 7;
export const AXIS1_COMPANY_MONTHLY_PRICE = "$79/mo";
export const AXIS1_COMPANY_LAUNCH_PRICE = "$79/mo";
export const AXIS1_DESIGN_HELP_STARTING_PRICE = "$249";

export type Axis1ProductPlanPolicy = {
  id: Axis1ProductPlan;
  label: string;
  shortLabel: string;
  statusLabel: string;
  outputLabel: string;
  linkPolicy: string;
  pdfPolicy: string;
  historyPolicy: string;
  brandingPolicy: string;
  ctaLabel: string;
  ctaHref: string;
  isPaid: boolean;
  watermarkLabel?: string;
  linkLifespanDays?: number;
};

export const axis1ProductPlanPolicies: Record<
  Axis1ProductPlan,
  Axis1ProductPlanPolicy
> = {
  free: {
    id: "free",
    label: "Free builder",
    shortLabel: "Free",
    statusLabel: "No login",
    outputLabel: "Test output",
    linkPolicy: "7-day test link",
    pdfPolicy: "Watermarked PDF",
    historyPolicy: "No report history",
    brandingPolicy: "No company logo/contact",
    ctaLabel: "Start company version",
    ctaHref: "/company-version",
    isPaid: false,
    watermarkLabel: "Free builder",
    linkLifespanDays: AXIS1_FREE_LINK_LIFESPAN_DAYS,
  },
  company: {
    id: "company",
    label: "Company version",
    shortLabel: "Company",
    statusLabel: "Login required",
    outputLabel: "Branded customer-ready output",
    linkPolicy: "Live restaurant report links while subscribed",
    pdfPolicy: "Clean PDF, no watermark",
    historyPolicy: "Customer history and follow-up reminders",
    brandingPolicy: "Saved logo, report color, and contact details",
    ctaLabel: "Open dashboard",
    ctaHref: "/dashboard",
    isPaid: true,
  },
};

export function normalizeAxis1ProductPlan(value: string | null | undefined) {
  return value === "company" ? "company" : "free";
}

export function getAxis1ProductPlanPolicy(plan: Axis1ProductPlan) {
  return axis1ProductPlanPolicies[plan];
}

export function getAxis1PlanSearchValue(plan: Axis1ProductPlan) {
  return plan === "company" ? "company" : "free";
}

export function getAxis1FreeLinkExpiresAt(createdAt: string) {
  const createdAtMs = new Date(createdAt).getTime();

  if (!Number.isFinite(createdAtMs)) {
    return null;
  }

  const expiresAt = new Date(createdAtMs);
  expiresAt.setDate(expiresAt.getDate() + AXIS1_FREE_LINK_LIFESPAN_DAYS);
  return expiresAt.toISOString();
}

export function isAxis1FreeLinkExpired(
  createdAt: string,
  now: Date = new Date(),
) {
  const expiresAt = getAxis1FreeLinkExpiresAt(createdAt);

  if (!expiresAt) {
    return false;
  }

  return now.getTime() > new Date(expiresAt).getTime();
}
