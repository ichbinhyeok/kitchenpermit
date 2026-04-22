@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell space-y-10 py-16 lg:py-20">
    <div class="space-y-4">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Starting-at pricing</p>
        <h1 class="text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em]">Commercial offers that match the actual MVP.</h1>
        <p class="max-w-3xl text-lg leading-8 text-[var(--color-hood-text-muted)]">
            Pricing is structured around setup, packets, and paid batches. Recurring delivery comes later, only after repeat usage evidence exists.
        </p>
    </div>
    <div class="grid gap-6 xl:grid-cols-4">
        @template.component.pricing-card(
            label = "Axis 1 setup",
            title = "Axis 1",
            price = "Starting at $149",
            summary = "Customer-facing packet setup for existing-service communication.",
            featured = false,
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Vendor profile and contact block</li>
                    <li>HTML canonical + PDF export</li>
                    <li>Rebook-ready packet structure</li>
                </ul>
            `
        )
        @template.component.pricing-card(
            label = "Axis 2 setup",
            title = "Axis 2",
            price = "Starting at $149",
            summary = "First-touch packet setup for the vendor-side sales motion.",
            featured = false,
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Packet framing for outreach</li>
                    <li>Masked public sample support</li>
                    <li>Batch-first motion support</li>
                </ul>
            `
        )
        @template.component.pricing-card(
            label = "Bundle",
            title = "Axis 1 + Axis 2",
            price = "Starting at $259",
            summary = "Both packet systems for vendors who need retention and new-sales surfaces together.",
            featured = true,
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Shared vendor brand layer</li>
                    <li>Packet pair for current and new business</li>
                    <li>Most efficient commercial entry point</li>
                </ul>
            `
        )
        @template.component.pricing-card(
            label = "Paid batch",
            title = "10 live opportunities",
            price = "Starting at $149",
            summary = "Deduped, Austin-first opportunity inventory with first-touch usage framing.",
            featured = false,
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Built from canonical opportunities</li>
                    <li>Masked sample stays public</li>
                    <li>Recurring only after repeat usage evidence</li>
                </ul>
            `
        )
    </div>
    <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6">
        <h2 class="text-2xl font-bold uppercase tracking-[-0.03em]">Commercial honesty notes</h2>
        <ul class="mt-4 grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
            <li>Axis 2 coverage should not be sold as live outside active metros.</li>
            <li>Public samples stay masked and must not give away the full paid list.</li>
            <li>Recurring delivery is quoted only after repeat purchase evidence exists.</li>
        </ul>
        <a class="mt-6 inline-flex rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" href="/start">Start the intake</a>
    </div>
</section>
`)
