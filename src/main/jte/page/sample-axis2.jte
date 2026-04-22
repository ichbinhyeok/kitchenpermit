@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell space-y-8 py-16 lg:py-20">
    <div class="space-y-3">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Masked sample / Axis 2</p>
        <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">List and first-touch preview</h1>
    </div>
    <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="relative overflow-hidden rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6">
            <div class="pointer-events-none absolute inset-x-6 top-10 rotate-[-12deg] border border-dashed border-[var(--color-hood-border-strong)] py-2 text-center text-xs font-semibold uppercase tracking-[0.5em] text-[var(--color-hood-text-muted)] opacity-35">Masked sample</div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Masked list row</p>
            <div class="mt-6 overflow-hidden rounded-lg border border-[var(--color-hood-border)]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                    <tr>
                        <th class="px-4 py-3">Business</th>
                        <th class="px-4 py-3">Trigger</th>
                        <th class="px-4 py-3">Freshness</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-4 py-3">Masked Austin operator</td>
                        <td class="px-4 py-3">Remodel</td>
                        <td class="px-4 py-3">7 days</td>
                    </tr>
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-4 py-3">Masked Austin opening</td>
                        <td class="px-4 py-3">Finish-out</td>
                        <td class="px-4 py-3">4 days</td>
                    </tr>
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-4 py-3">Masked Austin change-of-use</td>
                        <td class="px-4 py-3">Change of use</td>
                        <td class="px-4 py-3">9 days</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="relative overflow-hidden rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6">
            <div class="pointer-events-none absolute inset-x-6 top-10 rotate-[10deg] border border-dashed border-[var(--color-hood-border-strong)] py-2 text-center text-xs font-semibold uppercase tracking-[0.5em] text-[var(--color-hood-text-muted)] opacity-35">Masked sample</div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">First-touch packet excerpt</p>
            <div class="mt-6 grid gap-4">
                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Why this was surfaced</p>
                    <p class="mt-3 font-semibold">Public permit activity suggests a live hood-related timing window tied to an active food-service project.</p>
                </div>
                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Suggested opening angle</p>
                    <p class="mt-3 font-semibold">Lead with readiness and timing, not a generic service description.</p>
                </div>
                <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Protected fields</p>
                    <p class="mt-3 font-semibold">Direct contact path and complete personalization remain behind the paid batch.</p>
                </div>
            </div>
        </div>
    </div>
</section>
`)
