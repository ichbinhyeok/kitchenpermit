@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName

@template.layout.site(page = page, content = @`
<section class="shell space-y-10 py-16 lg:py-20">
    <div class="space-y-4">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 2 / new sales</p>
        <h1 class="max-w-5xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em]">A live opportunity list, not generic lead gen.</h1>
        <p class="max-w-3xl text-lg leading-8 text-[var(--color-hood-text-muted)]">
            Axis 2 combines a deduped list of trigger-led opportunities with a first-touch packet that helps a hood vendor explain why the lead matters right now.
        </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
        @template.component.panel(
            eyebrow = "Main hook",
            title = "The list gets bought first.",
            description = "Vendors buy the opportunity because it can move revenue. The packet matters because it helps that opportunity become outreach instead of another spreadsheet row.",
            body = @`
                <ul class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Restaurant remodel and finish-out focus</li>
                    <li>Canonical project dedupe before delivery</li>
                    <li>Public sample stays masked, paid batch stays useful</li>
                </ul>
            `
        )
        @template.component.panel(
            eyebrow = "Commercial rule",
            title = "Batch-first before recurring.",
            description = "Axis 2 is validated as a batch product first. Recurring delivery opens only after repeat usage evidence exists.",
            body = @`
                <ol class="grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <li>Free masked sample</li>
                    <li>Paid batch of 10 deduped live opportunities</li>
                    <li>Repeat purchase before recurring quote</li>
                </ol>
            `
        )
    </div>

    <section class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
        <div class="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">List sample</p>
                <div class="overflow-hidden rounded-lg border border-[var(--color-hood-border)]">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                        <tr>
                            <th class="px-4 py-3">Business</th>
                            <th class="px-4 py-3">Trigger</th>
                            <th class="px-4 py-3">Metro</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="border-t border-[var(--color-hood-border)]">
                            <td class="px-4 py-3">Masked restaurant group</td>
                            <td class="px-4 py-3">Remodel</td>
                            <td class="px-4 py-3">Austin</td>
                        </tr>
                        <tr class="border-t border-[var(--color-hood-border)]">
                            <td class="px-4 py-3">Masked cafe operator</td>
                            <td class="px-4 py-3">Finish-out</td>
                            <td class="px-4 py-3">Austin</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">First-touch packet excerpt</p>
                <div class="grid gap-4">
                    <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Why now</p>
                        <p class="mt-3 font-semibold">Recent permit and food-service activation signals suggest a live hood-related decision window.</p>
                    </div>
                    <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">First opener</p>
                        <p class="mt-3 font-semibold">Reach out with a timing-aware operations angle, not a generic “we clean hoods” email.</p>
                    </div>
                    <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Prep note</p>
                        <p class="mt-3 font-semibold">Use the packet to frame readiness, inspection timing, and avoidable startup friction.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</section>
`)
