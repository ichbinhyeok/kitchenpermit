@param String label
@param String tone

@if ("alert".equals(tone))
    <span class="inline-flex items-center rounded-full border border-[#d7a08a] bg-[#fff1eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-hood-alert)]">${label}</span>
@elseif ("success".equals(tone))
    <span class="inline-flex items-center rounded-full border border-[#93bea7] bg-[#eef8f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-hood-success)]">${label}</span>
@else
    <span class="inline-flex items-center rounded-full border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${label}</span>
@endif
