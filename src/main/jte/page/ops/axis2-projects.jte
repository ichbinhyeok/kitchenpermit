@import owner.hood.web.common.PageMeta
@import owner.hood.application.axis2.Axis2ProjectListItemView
@import owner.hood.domain.vendor.VendorOrganization
@param PageMeta page
@param java.util.List<Axis2ProjectListItemView> projects
@param java.util.List<VendorOrganization> vendors

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 2 / canonical projects</p>
            <h1 class="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">Austin paid inventory board</h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-hood-text-muted)]">Only high-confidence Austin inventory should graduate into a paid batch. The list is the hook. The packet operationalizes it.</p>
        </div>
        <div class="flex flex-wrap gap-3">
            <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/axis-2/signals/import">Import signal</a>
            <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" href="/ops/axis-2/batches/new">Build batch</a>
        </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Stored projects</p>
            <p class="mt-3 text-3xl font-bold">${projects.size()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Batch-ready vendors</p>
            <p class="mt-3 text-3xl font-bold">${vendors.size()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Locked rule</p>
            <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">Austin-first inventory only. Other metros can be stored, but not sold as live paid stock in MVP.</p>
        </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)]">
        <table class="w-full text-left text-sm">
            <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
            <tr>
                <th class="px-4 py-3">Project</th>
                <th class="px-4 py-3">Trigger</th>
                <th class="px-4 py-3">Score</th>
                <th class="px-4 py-3">Contact</th>
                <th class="px-4 py-3">Status</th>
            </tr>
            </thead>
            <tbody>
            @for (Axis2ProjectListItemView project : projects)
                <tr class="border-t border-[var(--color-hood-border)] align-top">
                    <td class="px-4 py-4">
                        <p class="font-semibold">${project.businessName()}</p>
                        <p class="mt-1 text-[var(--color-hood-text-muted)]">${project.streetAddress()}</p>
                        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${project.cityName()}</p>
                    </td>
                    <td class="px-4 py-4">
                        <p class="font-semibold">${project.triggerType()}</p>
                        <p class="mt-1 text-[var(--color-hood-text-muted)]">${project.sourceLabel()}</p>
                        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${project.lastSeenTriggerDateText()}</p>
                    </td>
                    <td class="px-4 py-4 text-lg font-bold">${project.finalScore()}</td>
                    <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${project.topContactLine()}</td>
                    <td class="px-4 py-4">
                        @template.component.status-chip(label = project.eligibilityStatus(), tone = "ACTIVE".equals(project.eligibilityStatus()) ? "success" : ("REVIEW".equals(project.eligibilityStatus()) ? "default" : "alert"))
                    </td>
                </tr>
            @endfor
            @if (projects.isEmpty())
                <tr class="border-t border-[var(--color-hood-border)]">
                    <td class="px-4 py-8 text-[var(--color-hood-text-muted)]" colspan="5">No signals stored yet. Start with Austin remodel, finish-out, or change-of-use sources.</td>
                </tr>
            @endif
            </tbody>
        </table>
    </div>
</section>
`)
