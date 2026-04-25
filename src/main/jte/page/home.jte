@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="border-b border-black/8 bg-white">
    <div class="shell grid min-h-[40rem] gap-14 py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div class="max-w-[31rem]">
            <p class="inline-flex border border-black/12 bg-[#fffdfa] px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-hood-accent-strong)]">
                Industrial-grade vendor system
            </p>
            <h1 class="mt-10 text-[3.85rem] font-[800] uppercase leading-[0.98] tracking-[-0.055em] text-[var(--color-hood-text)] md:text-[4.65rem]">
                Proof the service.
                <span class="block text-[var(--color-hood-accent-strong)]">Win the next account.</span>
            </h1>
            <p class="mt-7 max-w-[29rem] text-[1.08rem] leading-8 text-[var(--color-hood-text-muted)]">
                Replace handwritten grease reports. hood gives kitchen exhaust vendors
                customer-ready packet proof and local outbound dossiers built to open new accounts.
            </p>
            <div class="mt-10 flex flex-wrap gap-4">
                <a class="border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-8 py-[0.95rem] text-sm font-bold text-white transition hover:bg-[var(--color-hood-accent-strong)]" href="/start">Get Started</a>
                <a class="border border-black/14 bg-white px-8 py-[0.95rem] text-sm font-medium text-[var(--color-hood-text)] transition hover:border-black/28" href="/samples">View Sample Packet</a>
            </div>
        </div>
        <div class="relative h-[31rem] overflow-hidden border border-black/10 bg-[#f1ece4]">
            <img alt="Commercial kitchen exhaust hood" class="absolute inset-0 h-full w-full object-cover grayscale" src="/images/home-hero-kitchen.jpg">
            <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]"></div>
            <div class="absolute bottom-7 right-7 w-[15.5rem] border border-[#e5c4b5] bg-white p-5 shadow-[0_10px_22px_rgba(17,21,24,0.04)]">
                <div class="flex items-start justify-between gap-4 border-b border-black/7 pb-4">
                    <div>
                        <p class="text-sm text-black/60">Status Report</p>
                        <p class="mt-1 text-[1.2rem] font-semibold tracking-[-0.03em]">System Clear</p>
                    </div>
                    <span class="inline-flex h-5 w-5 items-center justify-center text-[var(--color-hood-accent-strong)]">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" fill="currentColor" r="8"></circle>
                            <path d="M6.6 10.1 8.8 12.2 13.4 7.7" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"></path>
                        </svg>
                    </span>
                </div>
                <div class="mt-4 grid gap-3 text-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-black/58">Axis 1</span>
                        <span class="font-medium text-[var(--color-hood-text)]">send-ready packet</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-black/58">Axis 2</span>
                        <span class="font-medium text-[var(--color-hood-text)]">10 live prospects</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-black/58">Surface</span>
                        <span class="font-medium text-[var(--color-hood-text)]">masked sample</span>
                    </div>
                </div>
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
