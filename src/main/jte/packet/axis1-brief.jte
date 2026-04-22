@import owner.hood.web.common.PageMeta
@import owner.hood.application.axis1.Axis1BriefView
@import owner.hood.application.axis1.Axis1BriefFindingView
@param PageMeta page
@param Axis1BriefView brief
@param String siteName

@template.layout.packet(page = page, content = @`
<section class="packet-shell py-8 lg:py-12">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] px-5 py-4">
        <div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Token delivery / Axis 1</p>
            <h1 class="mt-2 text-2xl font-bold uppercase tracking-[-0.03em]">${brief.vendorBrandName()} Service Completion Brief</h1>
        </div>
        <div class="flex gap-3">
            @template.component.status-chip(label = "send-ready", tone = "success")
            <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/deliver/packet/${brief.token()}/pdf">Open PDF</a>
        </div>
    </div>

    <article class="space-y-6 rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <section class="grid gap-6 border-b border-[var(--color-hood-border)] pb-8 md:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Vendor packet</p>
                <div>
                    <h2 class="text-4xl font-black uppercase tracking-[-0.04em]">${brief.vendorBrandName()}</h2>
                    <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${brief.vendorServiceOfferings()}</p>
                </div>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-5">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Contact</p>
                <p class="mt-3 font-semibold">${brief.vendorPrimaryContactName()}</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">${brief.vendorReplyEmail()}</p>
                <p class="text-sm text-[var(--color-hood-text-muted)]">${brief.vendorPhone()}</p>
                <p class="mt-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">${brief.vendorServiceAreaText()}</p>
            </div>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Customer</p>
                <p class="mt-3 font-semibold">${brief.customerName()}</p>
                <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">${brief.siteName()}</p>
                <p class="text-sm text-[var(--color-hood-text-muted)]">${brief.siteAddress()}</p>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Service date</p>
                <p class="mt-3 font-semibold">${brief.serviceDateText()}</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">Crew: ${brief.crewLabel() == null || brief.crewLabel().isBlank() ? "Not supplied" : brief.crewLabel()}</p>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Next recommended service</p>
                <p class="mt-3 font-semibold">${brief.nextRecommendedServiceDateText()}</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">${brief.vendorCtaText()}</p>
            </div>
        </section>

        <section class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface-muted)] p-6">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Service summary</p>
            <p class="mt-4 text-base leading-8 text-[var(--color-hood-text)]">${brief.serviceSummary()}</p>
        </section>

        <section class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Findings</p>
                    <h3 class="mt-2 text-2xl font-bold uppercase tracking-[-0.03em]">Customer-visible follow-up guidance</h3>
                </div>
                @template.component.status-chip(label = brief.findings().isEmpty() ? "clear" : "action", tone = brief.findings().isEmpty() ? "success" : "alert")
            </div>
            @if (brief.findings().isEmpty())
                <div class="rounded-xl border border-[var(--color-hood-border)] p-5 text-sm leading-7 text-[var(--color-hood-text-muted)]">No findings were recorded on this packet path.</div>
            @else
                <div class="grid gap-4">
                    @for (Axis1BriefFindingView finding : brief.findings())
                        <div class="rounded-xl border border-[var(--color-hood-border)] p-5">
                            <div class="flex items-center justify-between gap-4">
                                <p class="font-semibold uppercase tracking-[0.08em]">${finding.summary()}</p>
                                @template.component.status-chip(label = finding.severity(), tone = "HIGH".equals(finding.severity()) || "MEDIUM".equals(finding.severity()) ? "alert" : "default")
                            </div>
                            @if (finding.recommendedAction() != null && !finding.recommendedAction().isBlank())
                                <p class="mt-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">${finding.recommendedAction()}</p>
                            @endif
                        </div>
                    @endfor
                </div>
            @endif
        </section>

        <section class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-[var(--color-hood-border)] p-5">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Certifications</p>
                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${brief.certificationsBlurb() == null || brief.certificationsBlurb().isBlank() ? "Certification language can be customized during vendor setup." : brief.certificationsBlurb()}</p>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] p-5">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Insurance</p>
                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${brief.insuranceBlurb() == null || brief.insuranceBlurb().isBlank() ? "Insurance language can be customized during vendor setup." : brief.insuranceBlurb()}</p>
            </div>
        </section>
    </article>
</section>
`)
