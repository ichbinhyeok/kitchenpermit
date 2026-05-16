import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Terms of Service",
  description: `Terms of service for ${siteConfig.name}.`,
  path: "/terms",
});

const terms = [
  {
    title: "1. Service",
    copy:
      `${siteConfig.name} provides software that helps kitchen exhaust and hood cleaning companies create customer-facing service report links and PDF-ready records. We do not provide hood cleaning, inspection, repair, or field services.`,
  },
  {
    title: "2. Accounts and Access",
    copy:
      "Some features may require an account and an active subscription. You are responsible for keeping account credentials secure and for the accuracy of company, job, photo, and report information entered into the product.",
  },
  {
    title: "3. Customer Reports",
    copy:
      "Reports are generated from information supplied by users. You are responsible for reviewing reports before sending them to customers, inspectors, or other third parties. The product does not replace professional judgment, code compliance review, or legal advice.",
  },
  {
    title: "4. Subscriptions",
    copy:
      "Paid subscriptions are billed through our payment provider. Subscription access may continue while payment remains active and may be limited, suspended, or cancelled if payment fails or the subscription is cancelled.",
  },
  {
    title: "5. Acceptable Use",
    copy:
      `You may not use ${siteConfig.name} to upload unlawful content, infringing content, malware, deceptive reports, or content that violates third-party rights. We may remove content or restrict access when necessary to protect the service, customers, or legal compliance.`,
  },
  {
    title: "6. Availability",
    copy:
      "We aim to keep the service reliable, but we do not guarantee uninterrupted access. Features may change as the product evolves.",
  },
  {
    title: "7. Limitation of Liability",
    copy:
      `To the maximum extent permitted by law, ${siteConfig.name} is provided as-is and we are not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service.`,
  },
  {
    title: "8. Contact",
    copy: `Questions about these terms can be sent to ${siteConfig.supportEmail}.`,
  },
];

export default function TermsPage() {
  return (
    <div className="container-shell py-16 text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
        Legal
      </p>
      <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.92] tracking-[-0.065em] md:text-7xl">
        Terms of Service
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        Last updated: May 13, 2026. These terms describe the rules for using
        {siteConfig.name} and its paid subscription features.
      </p>

      <div className="mt-12 divide-y divide-border rounded-[34px] border border-border bg-white/80 px-5 md:px-8">
        {terms.map((section) => (
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
