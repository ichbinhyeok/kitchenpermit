@import owner.hood.web.common.PageMeta
@import owner.hood.application.commercial.InquiryQueueRowView
@import owner.hood.application.commercial.InquiryQueueSummaryView
@param PageMeta page
@param InquiryQueueSummaryView summary
@param java.util.List<InquiryQueueRowView> inquiries

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Ops / inquiries</p>
            <h1 class="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">Inquiry inbox</h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-hood-text-muted)]">This inbox is the front door of the order spine. Every serious inbound request should become either a tracked order or an explicit no-fit decision, not another forgotten inbox thread.</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] px-5 py-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">
            Next move: <span class="font-semibold text-[var(--color-hood-text)]">convert the right rows into orders</span>
        </div>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Open inquiries</p>
            <p class="mt-3 text-3xl font-bold">${summary.openInquiries()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">New</p>
            <p class="mt-3 text-3xl font-bold">${summary.newInquiries()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Reviewed</p>
            <p class="mt-3 text-3xl font-bold">${summary.reviewedInquiries()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Converted</p>
            <p class="mt-3 text-3xl font-bold">${summary.convertedInquiries()}</p>
        </div>
    </div>

    <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)]">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-hood-border)] px-6 py-5">
            <div>
                <p class="font-semibold uppercase tracking-[0.08em]">Open inquiry rows</p>
                <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">Conversion uses a starting-price preset so nothing gets stuck in limbo, but the operator still reviews pricing and scope before payment is requested.</p>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                <tr>
                    <th class="px-4 py-3">Company</th>
                    <th class="px-4 py-3">Interest</th>
                    <th class="px-4 py-3">Coverage</th>
                    <th class="px-4 py-3">Notes</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Received</th>
                    <th class="px-4 py-3">Action</th>
                </tr>
                </thead>
                <tbody>
                @for (InquiryQueueRowView inquiry : inquiries)
                    <tr class="border-t border-[var(--color-hood-border)] align-top">
                        <td class="px-4 py-4">
                            <p class="font-semibold">${inquiry.companyName()}</p>
                            <p class="mt-1 text-[var(--color-hood-text-muted)]">${inquiry.contactName()}</p>
                            <p class="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${inquiry.sourceTypeLabel()}</p>
                            <p class="mt-2 text-[var(--color-hood-text-muted)]">${inquiry.email()}</p>
                            @if (inquiry.phone() != null)
                                <p class="text-[var(--color-hood-text-muted)]">${inquiry.phone()}</p>
                            @endif
                        </td>
                        <td class="px-4 py-4">
                            <p class="font-semibold">${inquiry.productInterest()}</p>
                            <p class="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${inquiry.leadId()}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${inquiry.serviceAreaText()}</td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${inquiry.notesPreview()}</td>
                        <td class="px-4 py-4">@template.component.status-chip(label = inquiry.leadStatusLabel(), tone = inquiry.leadStatusTone())</td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${inquiry.createdAtText()}</td>
                        <td class="px-4 py-4">
                            @if (inquiry.convertible())
                                <form method="post" action="/ops/inquiries/${inquiry.leadId()}/convert">
                                    <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white" type="submit">Convert to order</button>
                                </form>
                            @else
                                <span class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Locked</span>
                            @endif
                        </td>
                    </tr>
                @endfor
                @if (inquiries.isEmpty())
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-6 py-10" colspan="7">
                            <div class="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                                <div>
                                    <p class="font-semibold uppercase tracking-[0.08em]">No open inquiries</p>
                                    <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-hood-text-muted)]">That is fine for now. Once the Next start flow and direct inbox responses feed in consistently, this page becomes the first daily operating surface before anything enters the order queue.</p>
                                </div>
                                <div class="rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-5">
                                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Expected future rows</p>
                                    <ul class="mt-4 grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                                        <li>Public start inquiries from the website</li>
                                        <li>Direct inbox requests copied into manual entry</li>
                                        <li>Positive outbound replies worth converting to a scoped order</li>
                                        <li>Bundle requests that need manual pricing review</li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                    </tr>
                @endif
                </tbody>
            </table>
        </div>
    </div>
</section>
`)
