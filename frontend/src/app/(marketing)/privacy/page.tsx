import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}.`,
};

const sections = [
  {
    title: "Information We Collect",
    copy:
      "We collect account information, company profile details, billing status information, report content, uploaded service photos, and technical information needed to operate and secure the product.",
  },
  {
    title: "How We Use Information",
    copy:
      "We use information to provide report builder features, host customer report links, generate PDF-ready records, maintain report history, process support requests, prevent abuse, and manage subscriptions.",
  },
  {
    title: "Payment Data",
    copy:
      "Payments are processed by our payment provider. We do not store full card numbers or sensitive card authentication details on our servers.",
  },
  {
    title: "Report Photos and Service Report Links",
    copy:
      "Uploaded photos and report data are used to create customer-facing report links and records. Users are responsible for ensuring they have the right to upload and share this information.",
  },
  {
    title: "Service Providers",
    copy:
      "We may use infrastructure, database, object storage, analytics, email, and payment providers to operate the service. These providers process information only as needed to deliver their services to us.",
  },
  {
    title: "Retention",
    copy:
      "Free report links may expire after a limited period. Paid account records may be retained while the account or subscription is active, unless deletion is requested or required by law.",
  },
  {
    title: "Contact",
    copy: `Privacy questions can be sent to ${siteConfig.supportEmail}.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-shell py-16 text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
        Legal
      </p>
      <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.92] tracking-[-0.065em] md:text-7xl">
        Privacy Policy
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        Last updated: May 13, 2026. This policy explains how {siteConfig.name}{" "}
        handles information for its SaaS report builder and hosted report links.
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
