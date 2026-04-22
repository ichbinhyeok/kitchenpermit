@import gg.jte.Content
@param String label
@param String title
@param String price
@param String summary
@param boolean featured
@param Content body

<section class="flex h-full flex-col rounded-xl border ${featured ? "border-[var(--color-hood-accent)] bg-white" : "border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)]"} p-6">
    <div class="space-y-3">
        <p class="font-mono text-xs uppercase tracking-[0.18em] ${featured ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"}">${label}</p>
        <h3 class="text-3xl font-bold leading-tight">${title}</h3>
        <p class="text-4xl font-extrabold text-[var(--color-hood-text)]">${price}</p>
        <p class="text-sm leading-7 text-[var(--color-hood-text-muted)]">${summary}</p>
    </div>
    <div class="mt-6 grow">
        ${body}
    </div>
</section>
