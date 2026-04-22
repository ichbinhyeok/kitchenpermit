@import owner.hood.web.common.PageMeta
@param PageMeta page
@param String siteName
@param String submittedCompanyName
@param String submittedContactName
@param String submittedEmail
@param String submittedProductInterest
@param String submittedServiceArea
@param String supportEmail
@param String emailDraftUrl

@template.layout.site(page = page, content = @`
<section class="shell py-16 lg:py-20">
    <div class="mx-auto max-w-3xl rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 lg:p-10">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Submitted</p>
        <h1 class="mt-4 text-4xl font-black uppercase tracking-[-0.04em]">Email draft ready.</h1>
        <p class="mt-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">
            Company: <strong>${submittedCompanyName == null ? "Unknown vendor" : submittedCompanyName}</strong><br>
            Contact: <strong>${submittedContactName == null ? "Unknown" : submittedContactName}</strong><br>
            Email: <strong>${submittedEmail == null ? "Unknown" : submittedEmail}</strong><br>
            Product interest: <strong>${submittedProductInterest == null ? "Unknown" : submittedProductInterest}</strong><br>
            Service area: <strong>${submittedServiceArea == null ? "Unknown" : submittedServiceArea}</strong>
        </p>
        <p class="mt-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">
            Next step: open the draft and send it to <strong>${supportEmail}</strong>. hood will keep the commercial flow manual at this stage, then fulfill the packet or batch through the internal ops path.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
            <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" href="${emailDraftUrl}">Open email draft</a>
            <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/samples">Review samples</a>
            <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/start">Back to start</a>
        </div>
    </div>
</section>
`)
