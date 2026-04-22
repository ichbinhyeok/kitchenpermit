@import owner.hood.web.common.PageMeta
@import owner.hood.application.axis2.Axis2PacketView
@import owner.hood.application.axis2.Axis2PacketItemView
@param PageMeta page
@param Axis2PacketView packet
@param String siteName

@template.layout.packet(page = page, content = @`
<section class="packet-shell py-8 lg:py-12">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] px-5 py-4">
        <div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Token delivery / Axis 2</p>
            <h1 class="mt-2 text-2xl font-bold uppercase tracking-[-0.03em]">${packet.vendorBrandName()} Opportunity Batch</h1>
        </div>
        <div class="flex flex-wrap gap-3">
            @template.component.status-chip(label = "sales-ready", tone = "success")
            @if (packet.listExportPath() != null)
                <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="${packet.listExportPath()}">Export CSV</a>
            @endif
            <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/deliver/packet/${packet.token()}/pdf">Open PDF</a>
        </div>
    </div>

    <article class="space-y-6 rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <section class="grid gap-6 border-b border-[var(--color-hood-border)] pb-8 md:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">List-first packet</p>
                <div>
                    <h2 class="text-4xl font-black uppercase tracking-[-0.04em]">${packet.batchTypeLabel()}</h2>
                    <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${packet.packetIntro()}</p>
                </div>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-5">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Vendor routing</p>
                <p class="mt-3 font-semibold">${packet.vendorPrimaryContactName()}</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">${packet.vendorReplyEmail()}</p>
                <p class="text-sm text-[var(--color-hood-text-muted)]">${packet.vendorPhone()}</p>
                <p class="mt-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">Metro scope: ${packet.targetMetroScope()} / Rows: ${packet.actualSize()}</p>
            </div>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Opportunity count</p>
                <p class="mt-3 text-3xl font-bold">${packet.actualSize()}</p>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Commercial mode</p>
                <p class="mt-3 font-semibold">Batch-first</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">Sample -> paid batch -> repeat -> quoted recurring delivery</p>
            </div>
            <div class="rounded-xl border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Outbound note</p>
                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">Smartlead sends the email. hood owns the list quality loop, the packet logic, and the result-analysis loop after sending.</p>
            </div>
        </section>

        <section class="rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Vendor CTA block</p>
            <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${packet.vendorCtaBlock()}</p>
        </section>

        <section class="space-y-4">
            <div>
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Live rows</p>
                <h3 class="mt-2 text-2xl font-bold uppercase tracking-[-0.03em]">Opportunity dossier</h3>
            </div>
            <div class="grid gap-4">
                @for (Axis2PacketItemView item : packet.items())
                    <div class="rounded-xl border border-[var(--color-hood-border)] p-6">
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Row ${item.rankOrder()}</p>
                                <h4 class="mt-2 text-xl font-bold uppercase tracking-[-0.02em]">${item.businessName()}</h4>
                                <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.streetAddress()} / ${item.cityName()} / ${item.metroLabel()}</p>
                            </div>
                            @template.component.status-chip(label = "score " + item.finalScore(), tone = item.finalScore() >= 75 ? "success" : "default")
                        </div>

                        <div class="mt-5 grid gap-3">
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">1. What this row is</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">Canonical opportunity row from ${item.sourceName()} / ${item.triggerType()} / ${item.triggerDateText()}.</p>
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">2. Why the lead was surfaced</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.whySurfaced()}</p>
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">3. Trigger summary</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.triggerSummary()}</p>
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">4. Why this matters for hood service</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.hoodRelevanceNote()}</p>
                            </div>
                            <div class="grid gap-3 md:grid-cols-2">
                                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">5. Suggested first email opener</p>
                                    <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.suggestedEmailOpener()}</p>
                                </div>
                                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">6. Suggested first call opener</p>
                                    <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.suggestedCallOpener()}</p>
                                </div>
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">7. Suggested vendor angle</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.vendorAngleNote()}</p>
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">8. First-service or pre-opening prep checklist</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.prepChecklist()}</p>
                            </div>
                            <div class="grid gap-3 md:grid-cols-2">
                                <div class="rounded-lg border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Contact ladder</p>
                                    <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.contactLadder()}</p>
                                </div>
                                <div class="rounded-lg border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Exclusion or risk note</p>
                                    <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.riskNote()}</p>
                                </div>
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Source evidence</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.sourceExcerpt()}</p>
                                @if (item.sourceUrl() != null)
                                    <a class="mt-3 inline-flex text-sm font-semibold text-[var(--color-hood-accent-strong)]" href="${item.sourceUrl()}">Open source</a>
                                @endif
                            </div>
                            <div class="rounded-lg border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">9. Vendor CTA block</p>
                                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">${item.vendorCta()}</p>
                            </div>
                        </div>
                    </div>
                @endfor
            </div>
        </section>
    </article>
</section>
`)
