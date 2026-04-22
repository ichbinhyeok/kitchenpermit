@import owner.hood.web.common.PageMeta
@import owner.hood.application.axis2.Axis2BatchForm
@import owner.hood.application.axis2.Axis2ProjectListItemView
@import owner.hood.domain.vendor.VendorOrganization
@param PageMeta page
@param Axis2BatchForm form
@param java.util.List<Axis2ProjectListItemView> projects
@param java.util.List<VendorOrganization> vendors
@param String batchError

@template.layout.workflow(page = page, content = @`
<section class="shell">
    <div class="mx-auto max-w-6xl rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <div class="space-y-4">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Axis 2 / batch builder</p>
            <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Assemble a paid Austin batch</h1>
            <p class="max-w-3xl text-sm leading-7 text-[var(--color-hood-text-muted)]">This form turns eligible Austin inventory into a vendor-facing packet. Batch size stays deliberately tight for MVP quality control.</p>
        </div>

        @if (batchError != null && !batchError.isBlank())
            <div class="mt-6 rounded-xl border border-[#d7a08a] bg-[#fff1eb] px-5 py-4 text-sm leading-7 text-[var(--color-hood-alert)]">${batchError}</div>
        @endif

        <form class="mt-8 grid gap-6" method="post" action="/ops/axis-2/batches/new">
            <div class="grid gap-6 md:grid-cols-3">
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-[0.12em]">Vendor</label>
                    <select class="select select-bordered w-full" name="vendorId">
                        <option value="">Choose vendor</option>
                        @for (VendorOrganization vendor : vendors)
                            @if (form.getVendorId() != null && form.getVendorId().equals(vendor.getId()))
                                <option value="${vendor.getId().toString()}" selected>${vendor.getDisplayName()}</option>
                            @else
                                <option value="${vendor.getId().toString()}">${vendor.getDisplayName()}</option>
                            @endif
                        @endfor
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-[0.12em]">Batch type</label>
                    <select class="select select-bordered w-full" name="batchType">
                        @if ("PAID_BATCH".equals(form.getBatchType()))
                            <option value="PAID_BATCH" selected>PAID_BATCH</option>
                        @else
                            <option value="PAID_BATCH">PAID_BATCH</option>
                        @endif
                        @if ("SAMPLE".equals(form.getBatchType()))
                            <option value="SAMPLE" selected>SAMPLE</option>
                        @else
                            <option value="SAMPLE">SAMPLE</option>
                        @endif
                        @if ("REPEAT".equals(form.getBatchType()))
                            <option value="REPEAT" selected>REPEAT</option>
                        @else
                            <option value="REPEAT">REPEAT</option>
                        @endif
                    </select>
                </div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Target size</label><input class="input input-bordered w-full" type="number" min="1" max="25" name="intendedSize" value="${form.getIntendedSize()}"></div>
            </div>
            <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Target metro scope</label><input class="input input-bordered w-full" type="text" name="targetMetroScope" value="${form.getTargetMetroScope() == null ? "" : form.getTargetMetroScope()}"></div>
            <div class="rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-5">
                <p class="font-semibold uppercase tracking-[0.08em]">Inventory preview</p>
                <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">The builder will pull from the highest-scoring ACTIVE Austin projects below.</p>
                <div class="mt-4 grid gap-3">
                    @for (Axis2ProjectListItemView project : projects)
                        @if ("ACTIVE".equals(project.eligibilityStatus()))
                            <div class="rounded-lg border border-[var(--color-hood-border)] bg-white px-4 py-3">
                                <div class="flex items-center justify-between gap-4">
                                    <p class="font-semibold">${project.businessName()}</p>
                                    @template.component.status-chip(label = "score " + project.finalScore(), tone = "success")
                                </div>
                                <p class="mt-2 text-sm text-[var(--color-hood-text-muted)]">${project.triggerType()} / ${project.streetAddress()} / ${project.topContactLine()}</p>
                            </div>
                        @endif
                    @endfor
                    @if (projects.isEmpty())
                        <p class="text-sm text-[var(--color-hood-text-muted)]">No inventory available yet. Import signals first.</p>
                    @endif
                </div>
            </div>
            <div class="flex justify-end gap-4 border-t border-[var(--color-hood-border)] pt-6">
                <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/axis-2/projects">Back</a>
                <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Create batch packet</button>
            </div>
        </form>
    </div>
</section>
`)
