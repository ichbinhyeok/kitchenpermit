@import owner.hood.web.common.PageMeta
@import owner.hood.web.intake.StartRequestForm
@param PageMeta page
@param String siteName
@param StartRequestForm form
@param String supportEmail
@param String genericEmailDraftUrl

@template.layout.site(page = page, content = @`
<section class="shell py-16 lg:py-20">
    <div class="mx-auto max-w-4xl rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <div class="space-y-4">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Vendor intake / order start</p>
            <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Start the hood workflow.</h1>
            <p class="max-w-2xl text-sm leading-7 text-[var(--color-hood-text-muted)]">
                This is the public commercial start surface. Fill the fields once, then open the email draft to send your request directly to ${supportEmail}.
            </p>
        </div>

        <form class="mt-8 grid gap-6" method="post" action="/start">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-[0.12em]">Company name</label>
                    <input class="input input-bordered w-full" type="text" name="companyName" value="${form.getCompanyName() == null ? "" : form.getCompanyName()}">
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-[0.12em]">Primary contact</label>
                    <input class="input input-bordered w-full" type="text" name="contactName" value="${form.getContactName() == null ? "" : form.getContactName()}">
                </div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-[0.12em]">Email</label>
                    <input class="input input-bordered w-full" type="email" name="email" value="${form.getEmail() == null ? "" : form.getEmail()}">
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-[0.12em]">Service area</label>
                    <input class="input input-bordered w-full" type="text" name="serviceArea" value="${form.getServiceArea() == null ? "" : form.getServiceArea()}">
                </div>
            </div>
            <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-[0.12em]">Product interest</label>
                <select class="select select-bordered w-full" name="productInterest">
                    <option value="">Choose one</option>
                    @if ("Axis 1".equals(form.getProductInterest()))
                        <option value="Axis 1" selected>Axis 1</option>
                    @else
                        <option value="Axis 1">Axis 1</option>
                    @endif
                    @if ("Axis 2".equals(form.getProductInterest()))
                        <option value="Axis 2" selected>Axis 2</option>
                    @else
                        <option value="Axis 2">Axis 2</option>
                    @endif
                    @if ("Bundle".equals(form.getProductInterest()))
                        <option value="Bundle" selected>Bundle</option>
                    @else
                        <option value="Bundle">Bundle</option>
                    @endif
                </select>
            </div>
            <div class="flex flex-wrap justify-between gap-4 border-t border-[var(--color-hood-border)] pt-6">
                <div class="max-w-xl space-y-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    <p>The page does not create an account or self-serve checkout yet. It prepares a structured email request to ${supportEmail}.</p>
                    <a class="font-semibold text-[var(--color-hood-accent-strong)]" href="${genericEmailDraftUrl}">Prefer a direct email without filling the form first?</a>
                </div>
                <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Prepare email draft</button>
            </div>
        </form>
    </div>
</section>
`)
