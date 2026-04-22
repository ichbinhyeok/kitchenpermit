@import owner.hood.web.common.PageMeta
@import owner.hood.application.outbound.VendorProspectForm
@import owner.hood.domain.outbound.VendorProspect
@param PageMeta page
@param VendorProspectForm form
@param java.util.List<VendorProspect> prospects

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Outbound / vendor prospects</p>
                <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Source B2B vendor targets</h1>
                <p class="text-sm leading-7 text-[var(--color-hood-text-muted)]">Smartlead will send. hood owns who goes in, how the list is framed, and what quality bar makes a prospect worth contacting.</p>
            </div>
            <form class="mt-8 grid gap-5" method="post" action="/ops/outbound/prospects">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Display name</label><input class="input input-bordered w-full" type="text" name="displayName" value="${form.getDisplayName() == null ? "" : form.getDisplayName()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Website</label><input class="input input-bordered w-full" type="text" name="websiteUrl" value="${form.getWebsiteUrl() == null ? "" : form.getWebsiteUrl()}"></div>
                <div class="grid gap-5 md:grid-cols-2">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Primary metro</label><input class="input input-bordered w-full" type="text" name="primaryMetro" value="${form.getPrimaryMetro() == null ? "" : form.getPrimaryMetro()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Metro scope</label><input class="input input-bordered w-full" type="text" name="metroScope" value="${form.getMetroScope() == null ? "" : form.getMetroScope()}"></div>
                </div>
                <div class="grid gap-5 md:grid-cols-2">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Service area overlap</label><input class="input input-bordered w-full" type="text" name="serviceAreaOverlapStatus" value="${form.getServiceAreaOverlapStatus() == null ? "" : form.getServiceAreaOverlapStatus()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Segmentation</label><input class="input input-bordered w-full" type="text" name="segmentationLabel" value="${form.getSegmentationLabel() == null ? "" : form.getSegmentationLabel()}"></div>
                </div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Service area text</label><textarea class="textarea textarea-bordered min-h-24 w-full" name="serviceAreaText">${form.getServiceAreaText() == null ? "" : form.getServiceAreaText()}</textarea></div>
                <div class="grid gap-5 md:grid-cols-3">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Size band</label><input class="input input-bordered w-full" type="text" name="sizeBand" value="${form.getSizeBand() == null ? "" : form.getSizeBand()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Ownership style</label><input class="input input-bordered w-full" type="text" name="ownershipStyle" value="${form.getOwnershipStyle() == null ? "" : form.getOwnershipStyle()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Documentation maturity</label><input class="input input-bordered w-full" type="text" name="documentationMaturity" value="${form.getDocumentationMaturity() == null ? "" : form.getDocumentationMaturity()}"></div>
                </div>
                <div class="grid gap-5 md:grid-cols-3">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Primary offer axis</label><input class="input input-bordered w-full" type="text" name="primaryOfferAxis" value="${form.getPrimaryOfferAxis() == null ? "" : form.getPrimaryOfferAxis()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Axis 1 fit</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="axis1AngleFit" value="${form.getAxis1AngleFit()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Axis 2 fit</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="axis2AngleFit" value="${form.getAxis2AngleFit()}"></div>
                </div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Owner contact status</label><input class="input input-bordered w-full" type="text" name="ownerContactStatus" value="${form.getOwnerContactStatus() == null ? "" : form.getOwnerContactStatus()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Source URL</label><input class="input input-bordered w-full" type="text" name="sourceUrl" value="${form.getSourceUrl() == null ? "" : form.getSourceUrl()}"></div>
                <div class="grid gap-5 md:grid-cols-3">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact name</label><input class="input input-bordered w-full" type="text" name="contactName" value="${form.getContactName() == null ? "" : form.getContactName()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Role title</label><input class="input input-bordered w-full" type="text" name="roleTitle" value="${form.getRoleTitle() == null ? "" : form.getRoleTitle()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact confidence</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="contactConfidence" value="${form.getContactConfidence()}"></div>
                </div>
                <div class="grid gap-5 md:grid-cols-3">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Email</label><input class="input input-bordered w-full" type="text" name="email" value="${form.getEmail() == null ? "" : form.getEmail()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Phone</label><input class="input input-bordered w-full" type="text" name="phone" value="${form.getPhone() == null ? "" : form.getPhone()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact source URL</label><input class="input input-bordered w-full" type="text" name="contactSourceUrl" value="${form.getContactSourceUrl() == null ? "" : form.getContactSourceUrl()}"></div>
                </div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Notes</label><textarea class="textarea textarea-bordered min-h-24 w-full" name="notes">${form.getNotes() == null ? "" : form.getNotes()}</textarea></div>
                <div class="flex justify-end border-t border-[var(--color-hood-border)] pt-5">
                    <a class="mr-auto rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/outbound/prospects/export.csv">Export Smartlead CSV</a>
                    <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Save prospect</button>
                </div>
            </form>
        </div>

        <div class="overflow-hidden rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)]">
            <div class="border-b border-[var(--color-hood-border)] px-6 py-5">
                <p class="font-semibold uppercase tracking-[0.08em]">Current outbound pool</p>
            </div>
            <table class="w-full text-left text-sm">
                <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                <tr>
                    <th class="px-4 py-3">Vendor</th>
                    <th class="px-4 py-3">Angle</th>
                    <th class="px-4 py-3">Owner path</th>
                    <th class="px-4 py-3">Source</th>
                </tr>
                </thead>
                <tbody>
                @for (VendorProspect prospect : prospects)
                    <tr class="border-t border-[var(--color-hood-border)] align-top">
                        <td class="px-4 py-4">
                            <p class="font-semibold">${prospect.getDisplayName()}</p>
                            <p class="mt-1 text-[var(--color-hood-text-muted)]">${prospect.getPrimaryMetro()} / ${prospect.getMetroScope()}</p>
                            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${prospect.getSegmentationLabel()} / ${prospect.getServiceAreaOverlapStatus()}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${prospect.getPrimaryOfferAxis()} / Axis 1 ${prospect.getAxis1AngleFit()} / Axis 2 ${prospect.getAxis2AngleFit()}</td>
                        <td class="px-4 py-4">
                            @template.component.status-chip(label = prospect.getOwnerContactStatus().name(), tone = "DIRECT".equals(prospect.getOwnerContactStatus().name()) ? "success" : "default")
                            <p class="mt-2 text-xs leading-6 text-[var(--color-hood-text-muted)]">${prospect.getContactName() == null || prospect.getContactName().isBlank() ? "No named contact yet" : prospect.getContactName() + " / " + (prospect.getEmail() == null || prospect.getEmail().isBlank() ? prospect.getPhone() : prospect.getEmail())}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">
                            <a class="font-semibold text-[var(--color-hood-accent-strong)]" href="${prospect.getSourceUrl()}">Source</a>
                            <p class="mt-2 text-xs leading-6">${prospect.getDocumentationMaturity()} / ${prospect.getOwnershipStyle()}</p>
                        </td>
                    </tr>
                @endfor
                @if (prospects.isEmpty())
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-4 py-8 text-[var(--color-hood-text-muted)]" colspan="4">No outbound prospects yet. Add the first small vendor segment before creating a Smartlead campaign.</td>
                    </tr>
                @endif
                </tbody>
            </table>
        </div>
    </div>
</section>
`)
