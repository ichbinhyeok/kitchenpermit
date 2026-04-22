@import owner.hood.web.common.PageMeta
@import owner.hood.domain.vendor.VendorOrganization
@param PageMeta page
@param java.util.List<VendorOrganization> vendors

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Ops / vendors</p>
            <h1 class="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">Vendor setup index</h1>
        </div>
        <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" href="/ops/vendors/new">New vendor</a>
    </div>
    <div class="overflow-hidden rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)]">
        <table class="w-full text-left text-sm">
            <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
            <tr>
                <th class="px-4 py-3">Vendor</th>
                <th class="px-4 py-3">Metro</th>
                <th class="px-4 py-3">Status</th>
            </tr>
            </thead>
            <tbody>
            @for (VendorOrganization vendor : vendors)
                <tr class="border-t border-[var(--color-hood-border)]">
                    <td class="px-4 py-3"><a class="font-semibold" href="/ops/vendors/${vendor.getId().toString()}">${vendor.getDisplayName()}</a></td>
                    <td class="px-4 py-3">${vendor.getPrimaryMetro()}</td>
                    <td class="px-4 py-3">${vendor.getStatus()}</td>
                </tr>
            @endfor
            @if (vendors.isEmpty())
                <tr class="border-t border-[var(--color-hood-border)]">
                    <td class="px-4 py-8 text-[var(--color-hood-text-muted)]" colspan="3">No vendors yet. Create the first vendor setup to unlock the Axis 1 path.</td>
                </tr>
            @endif
            </tbody>
        </table>
    </div>
</section>
`)
