@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell space-y-10 py-16 lg:py-20">
    <div class="space-y-4">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Sample surfaces</p>
        <h1 class="text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em]">Preview the packet surfaces.</h1>
        <p class="max-w-3xl text-lg leading-8 text-[var(--color-hood-text-muted)]">
            Samples stay masked on public pages. The goal is to show shape, seriousness, and deliverable quality without giving away the paid inventory.
        </p>
    </div>
    <div class="grid gap-6 lg:grid-cols-2">
        @template.component.panel(
            eyebrow = "Axis 1 sample",
            title = "Service Completion Brief",
            description = "Customer-facing packet with service summary, findings, evidence, and next action guidance.",
            body = @`
                <a class="inline-flex rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/samples/axis-1">Open Axis 1 sample</a>
            `
        )
        @template.component.panel(
            eyebrow = "Axis 2 sample",
            title = "Sales List + First-Touch Packet",
            description = "Masked trigger-led opportunity sample plus the first-touch framing used to turn it into outbound.",
            body = @`
                <a class="inline-flex rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/samples/axis-2">Open Axis 2 sample</a>
            `
        )
    </div>
</section>
`)
