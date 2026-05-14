import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund policy for hood subscriptions.",
};

const sections = [
  {
    title: "Subscription Refunds",
    copy:
      "If you believe a charge was made in error, contact us within 14 days of the charge. Refunds are reviewed case by case based on account activity, product access, and the nature of the request.",
  },
  {
    title: "Cancellations",
    copy:
      "You may cancel a subscription to stop future renewals. Cancellation does not automatically refund prior subscription periods that have already been billed.",
  },
  {
    title: "Free Builder",
    copy:
      "The free builder is available for evaluation without payment and does not create a paid billing relationship.",
  },
  {
    title: "Design Help",
    copy:
      "Optional design help or custom setup work may have separate terms based on the scope confirmed before work begins.",
  },
  {
    title: "How to Request Help",
    copy: `Send refund or billing questions to ${siteConfig.supportEmail} with your account email and charge details.`,
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="container-shell py-16 text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
        Legal
      </p>
      <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.92] tracking-[-0.065em] md:text-7xl">
        Refund Policy
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        Last updated: May 13, 2026. This policy explains how subscription
        cancellations and refund requests are handled.
      </p>

      <div className="mt-12 divide-y divide-border rounded-[34px] border border-border bg-white/80 px-5 md:px-8">
        {sections.map((section) => (
          <section key={section.title} className="py-7">
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">
              {section.title}
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
              {section.copy}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
