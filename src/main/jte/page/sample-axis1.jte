@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell space-y-8 py-16 lg:py-20">
    <div class="space-y-3">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Masked sample / Axis 1</p>
        <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Service packet preview</h1>
    </div>
    <div class="relative overflow-hidden rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
        <div class="pointer-events-none absolute inset-x-8 top-12 rotate-[-10deg] border border-dashed border-[var(--color-hood-border-strong)] py-2 text-center text-xs font-semibold uppercase tracking-[0.5em] text-[var(--color-hood-text-muted)] opacity-35">Masked sample</div>
        <div class="flex items-center justify-between">
            <div>
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Service Completion Brief</p>
                <h2 class="mt-3 text-3xl font-bold">Masked customer-facing packet</h2>
            </div>
            @template.component.status-chip(label = "sample", tone = "default")
        </div>
        <div class="mt-8 grid gap-4">
            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Summary</p>
                <p class="mt-3 font-semibold">Crew completed hood and line cleaning, documented inaccessible secondary access, and flagged one follow-up correction item.</p>
            </div>
            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Finding</p>
                <p class="mt-3 font-semibold">Access panel remains obstructed. Recommend access correction before next service cycle.</p>
            </div>
            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Next step</p>
                <p class="mt-3 font-semibold">Recommended next service in 90 days. Reply to book or request corrective review.</p>
            </div>
        </div>
    </div>
</section>
`)
