@import gg.jte.Content
@param String eyebrow
@param String title
@param String description
@param Content body

<section class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6 shadow-[0_1px_2px_rgba(17,21,24,0.03)]">
    <div class="space-y-3">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">${eyebrow}</p>
        <div class="space-y-2">
            <h3 class="text-2xl font-bold leading-tight">${title}</h3>
            <p class="max-w-2xl text-sm leading-7 text-[var(--color-hood-text-muted)]">${description}</p>
        </div>
    </div>
    <div class="mt-6">
        ${body}
    </div>
</section>
