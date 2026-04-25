@import owner.hood.web.common.PageMeta
@import owner.hood.application.outbound.VendorProspectForm
@import owner.hood.application.outbound.VendorProspectEnrichmentForm
@import owner.hood.application.outbound.VendorProspectEnrichmentResultView
@import owner.hood.application.outbound.VendorProspectEnrichmentRowView
@import owner.hood.application.outbound.VendorProspectImportForm
@import owner.hood.application.outbound.VendorProspectImportResultView
@import owner.hood.application.outbound.VendorProspectImportRowView
@import owner.hood.application.outbound.VendorProspectQueueSummaryView
@import owner.hood.domain.outbound.VendorProspect
@param PageMeta page
@param VendorProspectForm form
@param VendorProspectEnrichmentForm enrichmentForm
@param VendorProspectEnrichmentResultView lastEnrichmentResult
@param VendorProspectImportForm importForm
@param VendorProspectImportResultView lastImportResult
@param VendorProspectQueueSummaryView queueSummary
@param java.util.List<VendorProspect> prospects
@param java.util.List<VendorProspect> researchBacklog

@template.layout.workflow(page = page, content = @`
<section class="shell space-y-8">
    <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-2xl border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface)] p-8">
            <div class="space-y-4">
                <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Outbound / vendor prospects</p>
                <h1 class="text-4xl font-black uppercase tracking-[-0.04em]">Source B2B vendor targets</h1>
                <p class="text-sm leading-7 text-[var(--color-hood-text-muted)]">Smartlead will send. hood owns who goes in, how the list is framed, and what quality bar makes a prospect worth contacting.</p>
            </div>

            <div class="mt-8 grid gap-4 md:grid-cols-3">
                <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-white p-4">
                    <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Send Now</p>
                    <p class="mt-2 text-3xl font-black">${queueSummary.sendNowCount()}</p>
                    <p class="mt-1 text-xs leading-6 text-[var(--color-hood-text-muted)]">High-fit, send-ready vendors worth burning first.</p>
                </div>
                <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-white p-4">
                    <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Enrich First</p>
                    <p class="mt-2 text-3xl font-black">${queueSummary.enrichFirstCount()}</p>
                    <p class="mt-1 text-xs leading-6 text-[var(--color-hood-text-muted)]">Strong-fit local vendors that still need a better contact path.</p>
                </div>
                <div class="rounded-xl border border-[var(--color-hood-border-strong)] bg-white p-4">
                    <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Reserve</p>
                    <p class="mt-2 text-3xl font-black">${queueSummary.reserveCount()}</p>
                    <p class="mt-1 text-xs leading-6 text-[var(--color-hood-text-muted)]">Usable pool, but not first-burn or enrich-first priority.</p>
                </div>
            </div>

            <div class="mt-8 rounded-xl border border-[var(--color-hood-border-strong)] bg-white p-5">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Vendor list engine</p>
                        <h2 class="mt-2 text-xl font-black uppercase tracking-[-0.03em]">Bulk-source qualified prospects</h2>
                        <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">Paste traceable candidates from official sites, Google Maps, Facebook, BBB/Yelp, or other public sources. The engine separates best-fit discovery from reachability, stores send-ready vendors as active prospects, and keeps strong local vendors without usable email in a research queue.</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white" href="/ops/outbound/prospects/send-now.csv">Export Send-Now CSV</a>
                        <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface-muted)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]" href="/ops/outbound/prospects/export.csv">Export Active CSV</a>
                    </div>
                </div>
                <form class="mt-5 grid gap-4" method="post" action="/ops/outbound/prospects/import">
                    <div class="space-y-2">
                        <label class="text-xs font-semibold uppercase tracking-[0.12em]">Candidate rows</label>
                        <textarea class="textarea textarea-bordered min-h-44 w-full font-mono text-xs leading-6" name="candidateRows" placeholder="display_name | website_url | source_url | primary_metro | service_area | contact_name | email | phone | evidence">${importForm.getCandidateRows() == null ? "" : importForm.getCandidateRows()}</textarea>
                        <p class="text-xs leading-6 text-[var(--color-hood-text-muted)]">Pipe format: display name | website | source URL | primary metro | service area | contact name | email | phone | evidence. Source URL and hood-service evidence are mandatory. Email is optional if the row is strong enough for the research queue. Maps reviews, Facebook photos, BBB/Yelp listings, and government contractor pages are valid evidence if they point to a real local operator.</p>
                    </div>
                    <div class="flex justify-end">
                        <button class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" type="submit">Run sourcing engine</button>
                    </div>
                </form>

                @if (lastImportResult != null)
                    <div class="mt-5 rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                        <div class="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                            <span>Processed ${lastImportResult.processedCount()}</span>
                            <span>Imported ${lastImportResult.importedCount()}</span>
                            <span>Rejected ${lastImportResult.rejectedCount()}</span>
                        </div>
                        <div class="mt-4 grid gap-3">
                            @for (VendorProspectImportRowView row : lastImportResult.rows())
                                <div class="rounded-lg border border-[var(--color-hood-border)] bg-white p-3">
                                    <div class="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p class="font-semibold">${row.displayName()}</p>
                                            <p class="mt-1 text-xs leading-6 text-[var(--color-hood-text-muted)]">${row.reason()}</p>
                                            @if (row.sourceUrl() != null && !row.sourceUrl().isBlank())
                                                <a class="text-xs font-semibold text-[var(--color-hood-accent-strong)]" href="${row.sourceUrl()}">Source</a>
                                            @endif
                                        </div>
                                        @template.component.status-chip(label = row.decision(), tone = row.imported() ? "success" : "alert")
                                    </div>
                                    @if (row.imported())
                                        <p class="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${row.primaryMetro()} / ${row.segmentationLabel()} / ${row.primaryOfferAxis()} / ${row.prospectStatus()} / ${row.sendPriority()}</p>
                                    @endif
                                </div>
                            @endfor
                        </div>
                    </div>
                @endif
            </div>

            <div class="mt-6 rounded-xl border border-[var(--color-hood-border-strong)] bg-white p-5">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-accent-strong)]">Research queue enrichment</p>
                        <h2 class="mt-2 text-xl font-black uppercase tracking-[-0.03em]">Promote the best local vendors</h2>
                        <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">Use this after discovery. Match an existing research prospect, add the real contact path, and let the engine decide if it is ready to move from research into active send.</p>
                    </div>
                </div>
                <form class="mt-5 grid gap-4" method="post" action="/ops/outbound/prospects/enrichment">
                    <div class="space-y-2">
                        <label class="text-xs font-semibold uppercase tracking-[0.12em]">Enrichment rows</label>
                        <textarea class="textarea textarea-bordered min-h-36 w-full font-mono text-xs leading-6" name="enrichmentRows" placeholder="display_name | source_url | contact_source_url | contact_name | role_title | email | phone | evidence">${enrichmentForm.getEnrichmentRows() == null ? "" : enrichmentForm.getEnrichmentRows()}</textarea>
                        <p class="text-xs leading-6 text-[var(--color-hood-text-muted)]">Pipe format: display name | existing source URL | contact source URL | contact name | role title | email | phone | evidence. Use this to enrich vendors already in the queue with official contact pages, Facebook owner replies, Maps proofs, or other reachable paths.</p>
                    </div>
                    <div class="flex justify-end">
                        <button class="rounded-md border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-surface-muted)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" type="submit">Run enrichment pass</button>
                    </div>
                </form>

                @if (lastEnrichmentResult != null)
                    <div class="mt-5 rounded-xl border border-[var(--color-hood-border)] bg-[var(--color-hood-surface-muted)] p-4">
                        <div class="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                            <span>Processed ${lastEnrichmentResult.processedCount()}</span>
                            <span>Updated ${lastEnrichmentResult.updatedCount()}</span>
                            <span>Rejected ${lastEnrichmentResult.rejectedCount()}</span>
                        </div>
                        <div class="mt-4 grid gap-3">
                            @for (VendorProspectEnrichmentRowView row : lastEnrichmentResult.rows())
                                <div class="rounded-lg border border-[var(--color-hood-border)] bg-white p-3">
                                    <div class="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p class="font-semibold">${row.displayName()}</p>
                                            <p class="mt-1 text-xs leading-6 text-[var(--color-hood-text-muted)]">${row.reason()}</p>
                                        </div>
                                        @template.component.status-chip(label = row.decision(), tone = row.successful() ? "success" : "alert")
                                    </div>
                                    @if (row.successful())
                                        <p class="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${row.prospectStatus()} / ${row.sendPriority()} / ${row.sourceChannel()}</p>
                                        <p class="text-xs leading-6 text-[var(--color-hood-text-muted)]">${row.contactPath()}</p>
                                    @endif
                                </div>
                            @endfor
                        </div>
                    </div>
                @endif
            </div>

            <form class="mt-8 grid gap-5" method="post" action="/ops/outbound/prospects">
                <div class="border-t border-[var(--color-hood-border)] pt-6">
                    <p class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-hood-text-muted)]">Manual override</p>
                    <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">Use this only when a row has already been reviewed and the automatic sourcing result needs owner correction.</p>
                </div>
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
                    <div class="mr-auto flex flex-wrap gap-2">
                        <a class="rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white" href="/ops/outbound/prospects/send-now.csv">Export Send-Now CSV</a>
                        <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em]" href="/ops/outbound/prospects/export.csv">Export Active CSV</a>
                    </div>
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
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Scores</th>
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
                        <td class="px-4 py-4">
                            @template.component.status-chip(label = prospect.getProspectStatus().name(), tone = "ACTIVE".equals(prospect.getProspectStatus().name()) ? "success" : "default")
                            <p class="mt-2 text-xs leading-6 text-[var(--color-hood-text-muted)]">${prospect.getSendPriority()} / ${prospect.getPrimaryOfferAxis()} / ${prospect.getOwnerContactStatus().name()}</p>
                            <p class="text-xs leading-6 text-[var(--color-hood-text-muted)]">${prospect.getContactName() == null || prospect.getContactName().isBlank() ? "No named contact yet" : prospect.getContactName() + " / " + (prospect.getEmail() == null || prospect.getEmail().isBlank() ? prospect.getPhone() : prospect.getEmail())}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">
                            Fit ${prospect.getProspectFitScore()} / Ready ${prospect.getExportReadinessScore()} / Legit ${prospect.getLegitimacyScore()} / Reach ${prospect.getContactConfidence()}
                            <p class="mt-2 text-xs leading-6">${prospect.getDocumentationMaturity()} / ${prospect.getOwnershipStyle()} / Axis 1 ${prospect.getAxis1AngleFit()} / Axis 2 ${prospect.getAxis2AngleFit()}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">
                            <a class="font-semibold text-[var(--color-hood-accent-strong)]" href="${prospect.getSourceUrl()}">Source</a>
                            <p class="mt-2 text-xs leading-6">${prospect.getSourceChannel()} / ${prospect.getSendPriority()}</p>
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

            <div class="border-t border-[var(--color-hood-border)] px-6 py-5">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p class="font-semibold uppercase tracking-[0.08em]">Enrich-First Backlog</p>
                        <p class="mt-2 text-sm leading-7 text-[var(--color-hood-text-muted)]">These are high-fit vendors that still need better contact data before send. Work this list before scraping more mediocre send-ready rows.</p>
                    </div>
                    <a class="rounded-md border border-[var(--color-hood-border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]" href="/ops/outbound/prospects/research.csv">Export Research CSV</a>
                </div>
            </div>
            <table class="w-full text-left text-sm">
                <thead class="bg-[var(--color-hood-surface-muted)] uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">
                <tr>
                    <th class="px-4 py-3">Vendor</th>
                    <th class="px-4 py-3">Priority</th>
                    <th class="px-4 py-3">Scores</th>
                    <th class="px-4 py-3">Route</th>
                </tr>
                </thead>
                <tbody>
                @for (VendorProspect prospect : researchBacklog)
                    <tr class="border-t border-[var(--color-hood-border)] align-top">
                        <td class="px-4 py-4">
                            <p class="font-semibold">${prospect.getDisplayName()}</p>
                            <p class="mt-1 text-[var(--color-hood-text-muted)]">${prospect.getPrimaryMetro()} / ${prospect.getMetroScope()}</p>
                            <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-hood-text-muted)]">${prospect.getOwnershipStyle()} / ${prospect.getDocumentationMaturity()}</p>
                        </td>
                        <td class="px-4 py-4">
                            @template.component.status-chip(label = prospect.getSendPriority(), tone = "RESEARCH".equals(prospect.getSendPriority()) ? "default" : "success")
                            <p class="mt-2 text-xs leading-6 text-[var(--color-hood-text-muted)]">${prospect.getProspectStatus().name()} / ${prospect.getOwnerContactStatus().name()}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">
                            Fit ${prospect.getProspectFitScore()} / Ready ${prospect.getExportReadinessScore()} / Legit ${prospect.getLegitimacyScore()} / Reach ${prospect.getContactConfidence()}
                            <p class="mt-2 text-xs leading-6">${prospect.getPrimaryOfferAxis()} / Axis 1 ${prospect.getAxis1AngleFit()} / Axis 2 ${prospect.getAxis2AngleFit()}</p>
                        </td>
                        <td class="px-4 py-4 text-[var(--color-hood-text-muted)]">
                            <a class="font-semibold text-[var(--color-hood-accent-strong)]" href="${prospect.getSourceUrl()}">Source</a>
                            <p class="mt-2 text-xs leading-6">${prospect.getContactSourceUrl() == null || prospect.getContactSourceUrl().isBlank() ? "Need better contact source" : prospect.getContactSourceUrl()}</p>
                            <p class="text-xs leading-6">${prospect.getEmail() == null || prospect.getEmail().isBlank() ? (prospect.getPhone() == null || prospect.getPhone().isBlank() ? "No public inbox yet" : prospect.getPhone()) : prospect.getEmail()}</p>
                        </td>
                    </tr>
                @endfor
                @if (researchBacklog.isEmpty())
                    <tr class="border-t border-[var(--color-hood-border)]">
                        <td class="px-4 py-8 text-[var(--color-hood-text-muted)]" colspan="4">No enrich-first backlog yet. Strong-fit vendors without usable email will appear here automatically.</td>
                    </tr>
                @endif
                </tbody>
            </table>
        </div>
    </div>
</section>
`)
