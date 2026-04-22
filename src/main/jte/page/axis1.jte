@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell space-y-10 py-16 lg:py-20">
    <div class="space-y-4">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 1 / existing customer packet</p>
        <h1 class="max-w-5xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em]">Service completion briefs that customers can actually read.</h1>
        <p class="max-w-3xl text-lg leading-8 text-[var(--color-hood-text-muted)]">
            Axis 1 turns service activity into a product-grade customer-facing brief. It exists to improve trust, reduce confusion, and create cleaner rebook conversations.
        </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
        @template.component.panel(
            eyebrow = "Why it matters",
            title = "The old way makes a vendor look smaller than they are.",
            description = "If the result of a job is loose photos, technician shorthand, or a vague invoice note, the customer sees less value and fewer next-step reasons.",
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Raw notes do not carry trust</li>
                    <li>Findings get lost</li>
                    <li>Follow-up work becomes harder to explain</li>
                </ul>
            `
        )
        @template.component.panel(
            eyebrow = "What goes inside",
            title = "Scope, evidence, findings, next action, CTA",
            description = "Axis 1 is not a pretty PDF wrapper. It is a disciplined service packet with visible operator value.",
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Service summary and what was performed</li>
                    <li>Before or after evidence and visible condition calls</li>
                    <li>Deficiencies, access issues, and next recommended service timing</li>
                </ul>
            `
        )
    </div>

    <section class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
        <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Sample excerpt</p>
                <h2 class="mt-4 text-3xl font-bold uppercase tracking-[-0.03em]">Send-ready structure</h2>
                <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    This is the surface that needs to feel worth money. The customer should understand what happened, what matters, and what to do next.
                </p>
            </div>
            <div class="grid gap-4">
                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Inspection summary</p>
                    <p class="mt-3 font-semibold">Crew completed kitchen exhaust cleaning and removed visible grease accumulation from the primary line and hood body.</p>
                </div>
                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Finding</p>
                    <p class="mt-3 font-semibold">Secondary access panel remains difficult to reach and should be addressed before the next visit.</p>
                </div>
                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Next action</p>
                    <p class="mt-3 font-semibold">Recommended service window: 90 days. Reply to book the next slot or request an access correction review.</p>
                </div>
            </div>
        </div>
    </section>
</section>
`)
