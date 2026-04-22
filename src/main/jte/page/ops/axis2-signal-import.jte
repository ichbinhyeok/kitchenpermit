@import owner.hood.web.common.PageMeta
@import owner.hood.application.axis2.Axis2SignalImportForm
@import owner.hood.domain.axis2.TriggerType
@param PageMeta page
@param Axis2SignalImportForm form

@template.layout.workflow(page = page, content = @`
<section class="shell">
    <div class="mx-auto max-w-6xl rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <div class="space-y-4">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 2 / signal import</p>
            <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Manual Austin signal intake</h1>
            <p class="max-w-3xl text-sm leading-7 text-[var(--color-hood-text-muted)]">
                This is the manual-first paid inventory path. We store the trigger, preserve the source, score it, and only then allow it into a batch.
            </p>
        </div>

        <form class="mt-8 grid gap-6" method="post" action="/ops/axis-2/signals/import">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Metro key</label><input class="input input-bordered w-full" type="text" name="metroKey" value="${form.getMetroKey() == null ? "" : form.getMetroKey()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">City name</label><input class="input input-bordered w-full" type="text" name="cityName" value="${form.getCityName() == null ? "" : form.getCityName()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Canonical business</label><input class="input input-bordered w-full" type="text" name="canonicalBusinessName" value="${form.getCanonicalBusinessName() == null ? "" : form.getCanonicalBusinessName()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Street address</label><input class="input input-bordered w-full" type="text" name="canonicalStreetAddress" value="${form.getCanonicalStreetAddress() == null ? "" : form.getCanonicalStreetAddress()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-3">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Trigger type</label><select class="select select-bordered w-full" name="triggerType">
                    @if (TriggerType.REMODEL.equals(form.getTriggerType()))
                        <option value="REMODEL" selected>REMODEL</option>
                    @else
                        <option value="REMODEL">REMODEL</option>
                    @endif
                    @if (TriggerType.FINISH_OUT.equals(form.getTriggerType()))
                        <option value="FINISH_OUT" selected>FINISH_OUT</option>
                    @else
                        <option value="FINISH_OUT">FINISH_OUT</option>
                    @endif
                    @if (TriggerType.CHANGE_OF_USE.equals(form.getTriggerType()))
                        <option value="CHANGE_OF_USE" selected>CHANGE_OF_USE</option>
                    @else
                        <option value="CHANGE_OF_USE">CHANGE_OF_USE</option>
                    @endif
                    @if (TriggerType.NEW_OPENING.equals(form.getTriggerType()))
                        <option value="NEW_OPENING" selected>NEW_OPENING</option>
                    @else
                        <option value="NEW_OPENING">NEW_OPENING</option>
                    @endif
                    @if (TriggerType.EQUIPMENT_SWAP.equals(form.getTriggerType()))
                        <option value="EQUIPMENT_SWAP" selected>EQUIPMENT_SWAP</option>
                    @else
                        <option value="EQUIPMENT_SWAP">EQUIPMENT_SWAP</option>
                    @endif
                    @if (TriggerType.OTHER.equals(form.getTriggerType()))
                        <option value="OTHER" selected>OTHER</option>
                    @else
                        <option value="OTHER">OTHER</option>
                    @endif
                </select></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Trigger date</label><input class="input input-bordered w-full" type="date" name="triggerDate" value="${form.getTriggerDate() == null ? "" : form.getTriggerDate().toString()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Source key</label><input class="input input-bordered w-full" type="text" name="sourceKey" value="${form.getSourceKey() == null ? "" : form.getSourceKey()}"></div>
            </div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Source URL</label><input class="input input-bordered w-full" type="text" name="sourceUrl" value="${form.getSourceUrl() == null ? "" : form.getSourceUrl()}"></div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Source excerpt</label><textarea class="textarea textarea-bordered min-h-28 w-full" name="sourceExcerpt">${form.getSourceExcerpt() == null ? "" : form.getSourceExcerpt()}</textarea></div>
            <div class="grid gap-6 md:grid-cols-5">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Freshness</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="freshnessScore" value="${form.getFreshnessScore()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Hood fit</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="hoodRelevanceScore" value="${form.getHoodRelevanceScore()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Food certainty</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="foodServiceCertaintyScore" value="${form.getFoodServiceCertaintyScore()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Buyer authority</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="buyerAuthorityScore" value="${form.getBuyerAuthorityScore()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contactability</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="contactabilityScore" value="${form.getContactabilityScore()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-4">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact level</label><input class="input input-bordered w-full" type="text" name="contactLevel" value="${form.getContactLevel() == null ? "" : form.getContactLevel()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact name</label><input class="input input-bordered w-full" type="text" name="contactFullName" value="${form.getContactFullName() == null ? "" : form.getContactFullName()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Role title</label><input class="input input-bordered w-full" type="text" name="contactRoleTitle" value="${form.getContactRoleTitle() == null ? "" : form.getContactRoleTitle()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Confidence</label><input class="input input-bordered w-full" type="number" min="0" max="100" name="contactConfidenceScore" value="${form.getContactConfidenceScore()}"></div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact email</label><input class="input input-bordered w-full" type="email" name="contactEmail" value="${form.getContactEmail() == null ? "" : form.getContactEmail()}"></div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Contact phone</label><input class="input input-bordered w-full" type="text" name="contactPhone" value="${form.getContactPhone() == null ? "" : form.getContactPhone()}"></div>
            </div>
            <div class="flex justify-end gap-4 border-t border-[var(--color-hood-border)] pt-6">
                <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/axis-2/projects">Back to projects</a>
                <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Store signal</button>
            </div>
        </form>
    </div>
</section>
`)
