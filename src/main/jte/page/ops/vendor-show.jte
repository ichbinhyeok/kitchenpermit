@import owner.hood.web.common.PageMeta
@import owner.hood.domain.vendor.VendorOrganization
@import owner.hood.domain.vendor.VendorSetupProfile
@param PageMeta page
@param VendorOrganization vendor
@param VendorSetupProfile setup

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
        <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="space-y-3">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Vendor detail</p>
                <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">${vendor.getDisplayName()}</h1>
                <p class="text-sm leading-7 text-[var(--color-hood-text-muted)]">${setup.getServiceOfferings()}</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" href="/ops/axis-1/jobs/new?vendorId=${vendor.getId().toString()}">Create Axis 1 job</a>
                <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/axis-2/batches/new?vendorId=${vendor.getId().toString()}">Create Axis 2 batch</a>
            </div>
        </div>
        <div class="mt-8 grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Primary contact</p>
                <p class="mt-3 font-semibold">${setup.getPrimaryContactName()}</p>
                <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">${setup.getReplyEmail()} / ${setup.getPhone()}</p>
            </div>
            <div class="rounded-lg border border-[var(--color-hood-border)] p-4">
                <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Service area</p>
                <p class="mt-3 font-semibold">${setup.getServiceAreaText()}</p>
            </div>
        </div>
    </div>
</section>
`)
