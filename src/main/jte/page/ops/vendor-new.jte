@import owner.hood.web.common.PageMeta
@import owner.hood.application.vendor.VendorSetupForm
@param PageMeta page
@param VendorSetupForm form

@template.layout.workflow(page = page, content = @`
<section class="shell">
    <div class="mx-auto max-w-5xl rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <div class="space-y-4">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Ops / new vendor</p>
            <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Create vendor setup</h1>
        </div>
        <form class="mt-8 grid gap-6" method="post" action="/ops/vendors/new">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Display name</label><input class="input input-bordered w-full" type="text" name="displayName" value="${form.getDisplayName() == null ? "" : form.getDisplayName()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Legal name</label><input class="input input-bordered w-full" type="text" name="legalName" value="${form.getLegalName() == null ? "" : form.getLegalName()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Website</label><input class="input input-bordered w-full" type="text" name="websiteUrl" value="${form.getWebsiteUrl() == null ? "" : form.getWebsiteUrl()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Primary metro</label><input class="input input-bordered w-full" type="text" name="primaryMetro" value="${form.getPrimaryMetro() == null ? "" : form.getPrimaryMetro()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Primary contact</label><input class="input input-bordered w-full" type="text" name="primaryContactName" value="${form.getPrimaryContactName() == null ? "" : form.getPrimaryContactName()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact title</label><input class="input input-bordered w-full" type="text" name="primaryContactTitle" value="${form.getPrimaryContactTitle() == null ? "" : form.getPrimaryContactTitle()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Reply email</label><input class="input input-bordered w-full" type="email" name="replyEmail" value="${form.getReplyEmail() == null ? "" : form.getReplyEmail()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Phone</label><input class="input input-bordered w-full" type="text" name="phone" value="${form.getPhone() == null ? "" : form.getPhone()}"></div>
            </div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Service area text</label><textarea class="textarea textarea-bordered min-h-24 w-full" name="serviceAreaText">${form.getServiceAreaText() == null ? "" : form.getServiceAreaText()}</textarea></div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Service offerings</label><textarea class="textarea textarea-bordered min-h-28 w-full" name="serviceOfferings">${form.getServiceOfferings() == null ? "" : form.getServiceOfferings()}</textarea></div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">CTA text</label><input class="input input-bordered w-full" type="text" name="ctaText" value="${form.getCtaText() == null ? "" : form.getCtaText()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Emergency text</label><input class="input input-bordered w-full" type="text" name="emergencyAvailabilityText" value="${form.getEmergencyAvailabilityText() == null ? "" : form.getEmergencyAvailabilityText()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Certifications blurb</label><textarea class="textarea textarea-bordered min-h-20 w-full" name="certificationsBlurb">${form.getCertificationsBlurb() == null ? "" : form.getCertificationsBlurb()}</textarea></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Insurance blurb</label><textarea class="textarea textarea-bordered min-h-20 w-full" name="insuranceBlurb">${form.getInsuranceBlurb() == null ? "" : form.getInsuranceBlurb()}</textarea></div>
            </div>
            <div class="flex justify-end gap-4 border-t border-[var(--color-hood-border)] pt-6">
                <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/vendors">Cancel</a>
                <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Save vendor</button>
            </div>
        </form>
    </div>
</section>
`)
