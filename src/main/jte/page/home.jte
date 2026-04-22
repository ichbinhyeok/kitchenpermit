@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell grid gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
    <div class="space-y-8">
        <div class="space-y-4">
            <p class="inline-flex rounded-full border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">
                Industrial packets. Real revenue.
            </p>
            <h1 class="max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-[var(--color-hood-text)] md:text-7xl">
                Sharpen Service Delivery.
                <span class="text-[var(--color-hood-accent-strong)]">Win More Accounts.</span>
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-[var(--color-hood-text-muted)]">
                hood gives commercial kitchen exhaust vendors two independent revenue tools:
                customer-facing service completion packets and trigger-led sales lists with first-touch packet support.
            </p>
        </div>
        <div class="flex flex-wrap gap-4">
            <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[var(--color-hood-accent-strong)]" href="/start">Start a Project</a>
            <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-hood-text)]" href="/samples">View Sample Packets</a>
        </div>
    </div>
    <div class="grid gap-5">
        <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[#111518] p-6 text-white">
            <div class="flex items-center justify-between">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[#f7b68d]">Axis 1 / packet surface</p>
                @template.component.status-chip(label = "send-ready", tone = "success")
            </div>
            <div class="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
                <p class="text-sm uppercase tracking-[0.12em] text-[#d0c7bb]">Service Completion Brief</p>
                <p class="mt-3 text-3xl font-bold">Proof of work, findings, and next service guidance.</p>
                <div class="mt-6 grid gap-3 text-sm text-[#d0c7bb]">
                    <div class="rounded-lg border border-white/10 px-4 py-3">Before / after evidence</div>
                    <div class="rounded-lg border border-white/10 px-4 py-3">Customer-visible findings</div>
                    <div class="rounded-lg border border-white/10 px-4 py-3">Rebook and follow-up CTA</div>
                </div>
            </div>
        </div>
        <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6">
            <div class="flex items-center justify-between">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 2 / list surface</p>
                @template.component.status-chip(label = "Austin live", tone = "default")
            </div>
            <div class="mt-6 overflow-hidden rounded-xl border border-[var(--color-hood-border)]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-[var(--color-hood-surface-muted)] font-semibold uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                    <tr>
                        <th class="px-4 py-3">Trigger</th>
                        <th class="px-4 py-3">Metro</th>
                        <th class="px-4 py-3">Fit</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="border-t border-[var(--color-hood-border)] bg-[var(--color-hood-surface)]">
                        <td class="px-4 py-3">Restaurant remodel</td>
                        <td class="px-4 py-3">Austin</td>
                        <td class="px-4 py-3 text-[var(--color-hood-accent-strong)]">High</td>
                    </tr>
                    <tr class="border-t border-[var(--color-hood-border)] bg-[var(--color-hood-surface)]">
                        <td class="px-4 py-3">Finish-out</td>
                        <td class="px-4 py-3">Austin</td>
                        <td class="px-4 py-3">Medium</td>
                    </tr>
                    <tr class="border-t border-[var(--color-hood-border)] bg-[var(--color-hood-surface)]">
                        <td class="px-4 py-3">Change of use</td>
                        <td class="px-4 py-3">Austin</td>
                        <td class="px-4 py-3">High</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>

<section class="shell space-y-6 py-8 lg:py-12">
    <h2 class="text-3xl font-bold uppercase tracking-[-0.03em]">Where the product makes money</h2>
    <div class="grid gap-6 lg:grid-cols-2">
        @template.component.panel(
            eyebrow = "Axis 1",
            title = "Service packets that make a vendor look sharper",
            description = "Axis 1 converts loose technician notes into a customer-facing deliverable that improves trust, follow-up acceptance, and rebook discipline.",
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Customer-facing summary instead of raw notes</li>
                    <li>Visible findings, inaccessible areas, and next action guidance</li>
                    <li>HTML canonical with PDF export for immediate delivery</li>
                </ul>
            `
        )
        @template.component.panel(
            eyebrow = "Axis 2",
            title = "Sales lists that are built on live triggers, not stale directories",
            description = "Axis 2 sells a deduped opportunity list plus the first-touch packet needed to move that list into outreach.",
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Deduped canonical opportunities, not raw source rows</li>
                    <li>Masked public sample, paid batch of 10 live prospects</li>
                    <li>Austin-first fulfillment with Texas multi-metro outbound logic</li>
                </ul>
            `
        )
    </div>
</section>

<section class="shell grid gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
    <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Packet preview</p>
        <h2 class="mt-4 text-3xl font-bold uppercase tracking-[-0.03em]">The packet is the product.</h2>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-hood-text-muted)]">
            The strongest trust surface in hood is not a dashboard. It is the document a vendor can send to a customer or use to open a conversation.
        </p>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                <p class="font-semibold uppercase tracking-[0.08em]">Axis 1 packet</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">Service summary, findings, evidence, next service guidance.</p>
            </div>
            <div class="rounded-lg border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                <p class="font-semibold uppercase tracking-[0.08em]">Axis 2 packet</p>
                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">Trigger note, fit explanation, contact ladder, first-touch framing.</p>
            </div>
        </div>
        <a class="mt-6 inline-flex rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/samples">See samples</a>
    </div>
    <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[#111518] p-6 text-white">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[#f7b68d]">Commercial snapshot</p>
        <div class="mt-6 grid gap-4">
            <div class="rounded-lg border border-white/10 p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[#d0c7bb]">Axis 1 setup</p>
                <p class="mt-2 text-3xl font-bold">$149</p>
                <p class="mt-2 text-sm text-[#d0c7bb]">Starting at. Built for paid delivery, not brochure theater.</p>
            </div>
            <div class="rounded-lg border border-white/10 p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[#d0c7bb]">Axis 2 batch of 10</p>
                <p class="mt-2 text-3xl font-bold">$149</p>
                <p class="mt-2 text-sm text-[#d0c7bb]">Starting at. Live opportunity batch after masking stays on the public sample.</p>
            </div>
        </div>
    </div>
</section>
`)
