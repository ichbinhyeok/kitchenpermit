@import owner.hood.web.common.PageMeta
@import owner.hood.application.commercial.OrderQueueRowView
@import owner.hood.application.commercial.OrderQueueSummaryView
@param PageMeta page
@param OrderQueueSummaryView summary
@param java.util.List<OrderQueueRowView> orders
@param String convertedOrderNumber

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Ops / orders</p>
            <h1 class="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">Manual commerce queue</h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-hood-text-muted)]">This queue is the spine between inquiry, payment confirmation, fulfillment, and delivery. It does not send the email for you. It makes the manual commercial work legible and repeatable.</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] px-5 py-4 text-sm leading-7 text-[var(--color-hood-text-muted)]">
            Next page lock: <span class="font-semibold text-[var(--color-hood-text)]">new order workbench</span>
        </div>
    </div>

    @if (convertedOrderNumber != null)
        <div class="rounded-xl border border-[var(--color-hood-accent)] bg-[rgba(249,115,22,0.08)] px-5 py-4 text-sm leading-7 text-[var(--color-hood-text)]">
            Inquiry converted to order <span class="font-semibold">${convertedOrderNumber}</span>. Review pricing, payment status, and fulfillment blockers from here.
        </div>
    @endif

    <div class="grid gap-4 md:grid-cols-4">
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Total orders</p>
            <p class="mt-3 text-3xl font-bold">${summary.totalOrders()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">New</p>
            <p class="mt-3 text-3xl font-bold">${summary.newOrders()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Awaiting payment</p>
            <p class="mt-3 text-3xl font-bold">${summary.awaitingPaymentOrders()}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">In fulfillment / ready</p>
            <p class="mt-3 text-3xl font-bold">${summary.inFulfillmentOrders() + summary.readyToSendOrders()}</p>
        </div>
    </div>

    <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)]">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-hood-border)] px-6 py-5">
            <div>
                <p class="font-semibold uppercase tracking-[0.08em]">Commercial queue</p>
                <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">Each row should eventually tie one sale to one real fulfillment path. Axis 1 and Axis 2 stay visible as distinct line items later, but this first screen locks the queue itself.</p>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                <tr>
                    <th class="px-4 py-3">Order</th>
                    <th class="px-4 py-3">Company</th>
                    <th class="px-4 py-3">Primary product</th>
                    <th class="px-4 py-3">Value</th>
                    <th class="px-4 py-3">Order</th>
                    <th class="px-4 py-3">Payment</th>
                    <th class="px-4 py-3">Fulfillment</th>
                    <th class="px-4 py-3">Updated</th>
                </tr>
                </thead>
                <tbody>
                @for (OrderQueueRowView order : orders)
                    <tr class="border-t border-[var(--color-hood-border)] align-top">
                        <td class="px-4 py-4">
                            <p class="font-semibold">${order.orderNumber()}</p>
                            <p class="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${order.orderId()}</p>
                        </td>
                        <td class="px-4 py-4">
                            <p class="font-semibold">${order.companyName()}</p>
                            <p class="mt-1 text-[var(--color-hood-text-muted)]">${order.contactName()}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${order.primaryProductLabel()}</td>
                        <td class="px-4 py-4 font-semibold">${order.totalAmountText()}</td>
                        <td class="px-4 py-4">@template.component.status-chip(label = order.orderStatusLabel(), tone = order.orderStatusTone())</td>
                        <td class="px-4 py-4">@template.component.status-chip(label = order.paymentStatusLabel(), tone = order.paymentStatusTone())</td>
                        <td class="px-4 py-4">@template.component.status-chip(label = order.fulfillmentStatusLabel(), tone = order.fulfillmentStatusTone())</td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">${order.updatedAtText()}</td>
                    </tr>
                @endfor
                @if (orders.isEmpty())
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-6 py-10" colspan="8">
                            <div class="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                                <div>
                                    <p class="font-semibold uppercase tracking-[0.08em]">Queue is empty</p>
                                    <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-hood-text-muted)]">That is expected right now. The order list exists before the order creation workbench because the queue structure needs to be locked first. This page is where manual sales will become trackable instead of living only in inbox threads.</p>
                                </div>
                                <div class="rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-5">
                                    <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">What will appear here</p>
                                    <ul class="mt-4 grid gap-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                                        <li>Direct email inquiries turned into orders</li>
                                        <li>Axis 1 setup orders waiting for vendor setup or packet render</li>
                                        <li>Axis 2 paid batch orders waiting for QA or send-ready delivery</li>
                                        <li>Repeat orders tied back to the same vendor history</li>
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
