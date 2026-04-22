@import owner.hood.web.common.PageMeta
@import owner.hood.application.axis1.Axis1JobForm
@import owner.hood.domain.vendor.VendorOrganization
@param PageMeta page
@param Axis1JobForm form
@param VendorOrganization vendor

@template.layout.workflow(page = page, content = @`
<section class="shell">
    <div class="mx-auto max-w-5xl rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <div class="space-y-4">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 1 / job entry</p>
            <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Create service completion packet input</h1>
            <p class="text-sm leading-7 text-[var(--color-hood-text-muted)]">Vendor: <strong>${vendor.getDisplayName()}</strong></p>
        </div>
        <form class="mt-8 grid gap-6" method="post" action="/ops/axis-1/jobs/new">
            <input type="hidden" name="vendorId" value="${form.getVendorId() == null ? "" : form.getVendorId().toString()}">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Customer name</label><input class="input input-bordered w-full" type="text" name="customerName" value="${form.getCustomerName() == null ? "" : form.getCustomerName()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Site name</label><input class="input input-bordered w-full" type="text" name="siteName" value="${form.getSiteName() == null ? "" : form.getSiteName()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Site address</label><input class="input input-bordered w-full" type="text" name="siteAddress" value="${form.getSiteAddress() == null ? "" : form.getSiteAddress()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Service date</label><input class="input input-bordered w-full" type="date" name="serviceDate" value="${form.getServiceDate() == null ? "" : form.getServiceDate().toString()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Crew label</label><input class="input input-bordered w-full" type="text" name="crewLabel" value="${form.getCrewLabel() == null ? "" : form.getCrewLabel()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Next recommended service</label><input class="input input-bordered w-full" type="date" name="nextRecommendedServiceDate" value="${form.getNextRecommendedServiceDate() == null ? "" : form.getNextRecommendedServiceDate().toString()}"></div>
            </div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Service summary</label><textarea class="textarea textarea-bordered min-h-28 w-full" name="serviceSummary">${form.getServiceSummary() == null ? "" : form.getServiceSummary()}</textarea></div>
            <div class="grid gap-6 md:grid-cols-[1fr_220px]">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Finding summary</label><textarea class="textarea textarea-bordered min-h-24 w-full" name="findingSummary">${form.getFindingSummary() == null ? "" : form.getFindingSummary()}</textarea></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Severity</label><select class="select select-bordered w-full" name="findingSeverity">
                    @if ("INFO".equals(form.getFindingSeverity()))
                        <option value="INFO" selected>INFO</option>
                    @else
                        <option value="INFO">INFO</option>
                    @endif
                    @if ("LOW".equals(form.getFindingSeverity()))
                        <option value="LOW" selected>LOW</option>
                    @else
                        <option value="LOW">LOW</option>
                    @endif
                    @if ("MEDIUM".equals(form.getFindingSeverity()))
                        <option value="MEDIUM" selected>MEDIUM</option>
                    @else
                        <option value="MEDIUM">MEDIUM</option>
                    @endif
                    @if ("HIGH".equals(form.getFindingSeverity()))
                        <option value="HIGH" selected>HIGH</option>
                    @else
                        <option value="HIGH">HIGH</option>
                    @endif
                </select></div>
            </div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Recommended action</label><textarea class="textarea textarea-bordered min-h-24 w-full" name="recommendedAction">${form.getRecommendedAction() == null ? "" : form.getRecommendedAction()}</textarea></div>
            <div class="flex justify-end gap-4 border-t border-[var(--color-hood-border)] pt-6">
                <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/vendors/${vendor.getId().toString()}">Back</a>
                <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Render packet</button>
            </div>
        </form>
    </div>
</section>
`)
