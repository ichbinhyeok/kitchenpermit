@import owner.hood.web.common.PageMeta
@import owner.hood.application.outbound.OutboundCampaignForm
@import owner.hood.application.outbound.OutboundCampaignSummaryView
@import owner.hood.application.outbound.OutboundPerformanceRowView
@import owner.hood.application.outbound.OutboundResultSnapshotForm
@import owner.hood.domain.outbound.VendorProspect
@param PageMeta page
@param OutboundCampaignForm campaignForm
@param OutboundResultSnapshotForm snapshotForm
@param java.util.List<VendorProspect> prospects
@param java.util.List<OutboundCampaignSummaryView> campaigns
@param java.util.List<OutboundPerformanceRowView> angleRows
@param java.util.List<OutboundPerformanceRowView> metroRows
@param java.util.List<OutboundPerformanceRowView> segmentRows

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Locked send model</p>
        <p class="mt-3 text-sm leading-7 text-[var(--color-hood-text-muted)]">Smartlead executes the sends. hood stays responsible for list quality, angle selection, and results analysis. Live sending ramps toward 40 per day only after deliverability stabilizes, with a default stable mix of 16 new and 24 follow-up sends.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Angle analysis</p>
            <div class="mt-4 grid gap-3">
                @for (OutboundPerformanceRowView row : angleRows)
                    <div class="rounded-lg border border-[var(--color-hood-border)] p-3">
                        <p class="font-semibold">${row.label()}</p>
                        <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">${row.campaignCount()} campaigns / ${row.totalSent()} sent / ${row.paidBatchOrderCount()} paid orders</p>
                    </div>
                @endfor
            </div>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Metro analysis</p>
            <div class="mt-4 grid gap-3">
                @for (OutboundPerformanceRowView row : metroRows)
                    <div class="rounded-lg border border-[var(--color-hood-border)] p-3">
                        <p class="font-semibold">${row.label()}</p>
                        <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">${row.campaignCount()} campaigns / ${row.totalSent()} sent / ${row.positiveReplyCount()} positive replies</p>
                    </div>
                @endfor
            </div>
        </div>
        <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-5">
            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Segment analysis</p>
            <div class="mt-4 grid gap-3">
                @for (OutboundPerformanceRowView row : segmentRows)
                    <div class="rounded-lg border border-[var(--color-hood-border)] p-3">
                        <p class="font-semibold">${row.label()}</p>
                        <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">${row.campaignCount()} campaigns / ${row.totalSent()} sent / ${row.paidBatchOrderCount()} paid orders</p>
                    </div>
                @endfor
            </div>
        </div>
    </div>

    <div class="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Outbound / Smartlead handoff</p>
                <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Create a campaign shell</h1>
                <p class="text-sm leading-7 text-[var(--color-hood-text-muted)]">This is not the sender. It is the internal record that lets hood map a Smartlead campaign back to offer angle, list quality, and paid outcomes.</p>
            </div>
            <form class="mt-8 grid gap-5" method="post" action="/ops/outbound/campaigns">
                    <div class="space-y-2">
                        <label class="text-xs font-semibold uppercase tracking-[0.12em]">Vendor prospect</label>
                        <select class="select select-bordered w-full" name="vendorProspectId">
                            <option value="">Choose prospect</option>
                            @for (VendorProspect prospect : prospects)
                            @if (campaignForm.getVendorProspectId() != null && campaignForm.getVendorProspectId().equals(prospect.getId()))
                                <option value="${prospect.getId().toString()}" selected>${prospect.getDisplayName()}</option>
                            @else
                                <option value="${prospect.getId().toString()}">${prospect.getDisplayName()}</option>
                            @endif
                        @endfor
                    </select>
                    <p class="mt-2 text-xs leading-6 text-[var(--color-hood-text-muted)]">Prospects are exported to Smartlead from the sourcing screen. Campaign shells here let hood read results back by angle, metro, and segment.</p>
                </div>
                <div class="grid gap-5 md:grid-cols-2">
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Primary offer axis</label><input class="input input-bordered w-full" type="text" name="primaryOfferAxis" value="${campaignForm.getPrimaryOfferAxis() == null ? "" : campaignForm.getPrimaryOfferAxis()}"></div>
                    <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Campaign stage</label><input class="input input-bordered w-full" type="text" name="campaignStage" value="${campaignForm.getCampaignStage() == null ? "" : campaignForm.getCampaignStage()}"></div>
                </div>
                <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Smartlead campaign id</label><input class="input input-bordered w-full" type="text" name="providerCampaignId" value="${campaignForm.getProviderCampaignId() == null ? "" : campaignForm.getProviderCampaignId()}"></div>
                <div class="flex justify-end border-t border-[var(--color-hood-border)] pt-5">
                    <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Save campaign shell</button>
                </div>
            </form>
        </div>

        <div class="space-y-5">
            @for (OutboundCampaignSummaryView campaign : campaigns)
                <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-6">
                    <div class="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p class="font-semibold uppercase tracking-[0.08em]">${campaign.prospectName()}</p>
                            <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">${campaign.primaryOfferAxis()} / ${campaign.campaignStage()} / ${campaign.windowLabel()}</p>
                            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${campaign.providerCampaignId() == null || campaign.providerCampaignId().isBlank() ? "Smartlead id pending" : campaign.providerCampaignId()}</p>
                        </div>
                        @template.component.status-chip(label = campaign.campaignStage(), tone = "LIVE".equals(campaign.campaignStage()) ? "success" : "default")
                    </div>
                    <div class="mt-5 grid gap-3 md:grid-cols-5">
                        <div class="rounded-lg border border-[var(--color-hood-border)] p-3"><p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Sent</p><p class="mt-2 text-2xl font-bold">${campaign.totalSent()}</p></div>
                        <div class="rounded-lg border border-[var(--color-hood-border)] p-3"><p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Delivered</p><p class="mt-2 text-2xl font-bold">${campaign.deliveredCount()}</p></div>
                        <div class="rounded-lg border border-[var(--color-hood-border)] p-3"><p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Bounced</p><p class="mt-2 text-2xl font-bold">${campaign.bouncedCount()}</p></div>
                        <div class="rounded-lg border border-[var(--color-hood-border)] p-3"><p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Positive</p><p class="mt-2 text-2xl font-bold">${campaign.positiveReplyCount()}</p></div>
                        <div class="rounded-lg border border-[var(--color-hood-border)] p-3"><p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">Paid orders</p><p class="mt-2 text-2xl font-bold">${campaign.paidBatchOrderCount()}</p></div>
                    </div>
                    <form class="mt-5 grid gap-4 border-t border-[var(--color-hood-border)] pt-5 lg:grid-cols-[1fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr] lg:items-end" method="post" action="/ops/outbound/campaigns/${campaign.campaignId()}/snapshots">
                        <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Window start</label><input class="input input-bordered w-full" type="date" name="analysisWindowStart" value="${snapshotForm.getAnalysisWindowStart() == null ? "" : snapshotForm.getAnalysisWindowStart().toString()}"></div>
                        <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Window end</label><input class="input input-bordered w-full" type="date" name="analysisWindowEnd" value="${snapshotForm.getAnalysisWindowEnd() == null ? "" : snapshotForm.getAnalysisWindowEnd().toString()}"></div>
                        <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Total sent</label><input class="input input-bordered w-full" type="number" min="0" name="totalSent" value="${snapshotForm.getTotalSent()}"></div>
                        <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Delivered</label><input class="input input-bordered w-full" type="number" min="0" name="deliveredCount" value="${snapshotForm.getDeliveredCount()}"></div>
                        <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Positive replies</label><input class="input input-bordered w-full" type="number" min="0" name="positiveReplyCount" value="${snapshotForm.getPositiveReplyCount()}"></div>
                        <div class="space-y-2"><label class="text-xs font-semibold uppercase tracking-[0.12em]">Paid batch orders</label><input class="input input-bordered w-full" type="number" min="0" name="paidBatchOrderCount" value="${snapshotForm.getPaidBatchOrderCount()}"></div>
                        <input type="hidden" name="bouncedCount" value="${snapshotForm.getBouncedCount()}">
                        <input type="hidden" name="neutralReplyCount" value="${snapshotForm.getNeutralReplyCount()}">
                        <input type="hidden" name="negativeReplyCount" value="${snapshotForm.getNegativeReplyCount()}">
                        <input type="hidden" name="sampleRequestCount" value="${snapshotForm.getSampleRequestCount()}">
                        <div class="lg:col-span-6 flex justify-end">
                            <button class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" type="submit">Record result snapshot</button>
                        </div>
                    </form>
                </div>
            @endfor
            @if (campaigns.isEmpty())
                <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8 text-sm leading-7 text-[var(--color-hood-text-muted)]">
                    No campaign shells yet. Create a prospect first, then attach a Smartlead campaign id and start recording result windows.
                </div>
            @endif
        </div>
    </div>
</section>
`)
