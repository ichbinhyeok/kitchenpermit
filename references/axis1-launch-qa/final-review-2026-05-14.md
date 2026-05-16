# Axis 1 Launch QA Final Review

Generated: 2026-05-14

## Post-Fix Update

Updated: 2026-05-14, after the launch QA fix pass.

**Revised launch decision: Ship for controlled launch / paid beta.**

The P1 launch blockers from this review were fixed and re-run through the local simulation:

- Dashboard history no longer labels every saved report as `Open items recorded`. The seeded account now shows separate operational statuses: `Next service`, `Open access item`, `Quote review`, `Monitor / review`, `Written record`, and `Record only`.
- Free customer links no longer tell the restaurant to use a company phone or reply email that is intentionally removed from free output. The free customer page now shows a restrained `Free test link` marker and neutral communication guidance.
- Customer-facing `Call vendor` copy was replaced with service-provider/service-team language.
- The photo section no longer overclaims that all photos “show what changed”; it now distinguishes before/after, after-service, and partial attached-photo records.
- The React service-record PDF route remains the customer-facing PDF path: `/p/server?reportId=<id>&format=pdf`. The browser QA still confirms no customer-facing backend asset PDF CTA.

Latest verification artifact:

- `references/axis1-launch-qa/local-sim-2026-05-14/axis1-launch-local-sim.md`
- `references/axis1-launch-qa/local-sim-2026-05-14/axis1-launch-local-sim-results.json`

Latest local simulation result: 7 company reports, 2 free reports, Gemini live mode, 6 browser pages, 0 findings.

Local base URL: http://127.0.0.1:8096

Source context read first: `references/axis1-core-skeleton-full-context-2026-05-13.md`

Primary simulation artifact: `references/axis1-launch-qa/local-sim-2026-05-14/axis1-launch-local-sim.md`

## Launch Decision

**Ship with fixes.**

Axis 1 is now credible as a branded service report product: the dashboard has real history, customer links show photos/open items/next action, and the customer-facing PDF CTA correctly stays on the React service-record route. There is no P0 route, storage, or PDF-link regression in this run. However, I would not do a confident paid public launch today until the P1 issues below are fixed, because they directly affect whether a hood cleaning owner trusts this as a $79/mo customer-record system. A private demo or controlled beta is acceptable; a paid launch should wait for the copy/status fixes.

## Scorecard

| Area | Score | Why this score | What makes it 10 |
| --- | ---: | --- | --- |
| Company dashboard value | 7/10 | `admin@kitchenpermit.com` has a real profile and 7 saved reports grouped by customer/site with due-soon and past-due counts. The weakness is that every seeded report reads as `Open items recorded`, including clean/no-photo records, so the history loses operational signal. | Clean records, action-needed records, no-photo records, due-soon, and past-due need distinct labels that an owner can scan in seconds. |
| Customer link trust | 7/10 | The customer link is visually strong and clearly separates completed work from blocked access. It also uses real photos and shows the next action. Weaknesses: `Call vendor` is customer-facing internal/generic language, and some photo copy overclaims what changed when no true before/after pair exists. | Replace generic/internal CTA language, remove overclaiming photo copy, and make the first viewport feel a little less like a web app CTA surface. |
| PDF/service-record trust | 8/10 | The PDF screen now reads much more like a retained service record than a marketing page. It uses the correct React route and avoids backend PDF asset CTA exposure. The dense right-column tables are still hard to read and some values wrap awkwardly. | Tighten the document hierarchy, reduce dense tables, improve line wrapping, and make the first page fit as a clean inspection/manager copy. |
| Free vs company conversion clarity | 6/10 | Free links are unbranded and expire, while company reports have branding/history/live links. But the free customer link still says to use company phone/reply email even though free output removes that contact, which weakens trust. | Free should feel like a clear test/sample without contradictions; company should visibly unlock identity, saved history, and durable customer records. |
| Photo/Gemini workflow | 8/10 | Gemini ran live (`gemini-2.5-flash`), suggestions stayed `pending`, and no compliance/approval language appeared. Photo assets saved and loaded through local filesystem storage. The main risk is customer copy that says photos show what changed even when the evidence set is partial. | Keep all AI suggestions vendor-confirmed and make customer copy reflect exact evidence type: before/after, after-only, partial, or written record. |
| Mobile usability | 7/10 | No horizontal overflow, core CTAs remain usable, and the action item is clear on mobile. Some brand text truncates, the hero consumes a lot of the first viewport, and the photo strip shows partially loaded/offscreen thumbnails in the mobile capture. | Shorten mobile header/hero density, improve thumbnail loading/placeholder behavior, and keep the action/PDF path visible without overwhelming the first screen. |
| Copy/language quality | 6.5/10 | `proof link` and backend asset language did not leak, which is good. But `vendor` appears in customer-facing CTA/copy, and free copy has a contradictory contact instruction. | Use restaurant-facing language consistently: service provider, company name, service team, report/PDF copy, next action. |
| Overall $79/month willingness | 7/10 | A hood cleaning owner can see the value: branded report, photos, next action, history, resend links. The dashboard/status and customer-copy issues need to be fixed before I would trust it as a paid public launch. | The dashboard must become a confident operating surface, and customer/free/PDF language must be precise enough for restaurant records. |

## Critical Findings

| Severity | Area | Finding | Evidence | Why it matters | Recommended fix |
| --- | --- | --- | --- | --- | --- |
| P1 | Dashboard history | Every company report is labeled as `Open items recorded`, including clean, prior-cycle, and no-photo written-record cases. | Screenshot: `local-sim-2026-05-14/screenshots/dashboard-admin-history.png`. JSON: all 7 company reports have `hasOpenItems: true`. | A company owner cannot scan the history and know which customer needs action versus which records are routine. This weakens the $79/mo history value. | Do not treat every `customerActionOverride` as an open item. Split statuses into `record only`, `next service`, `open access`, `quote/monitor`, and `no-photo written record`. |
| P1 | Free customer link | Free output says: `Use the company phone or reply email shown on the service report`, but free output intentionally removes company phone/email. | Screenshot: `local-sim-2026-05-14/screenshots/free-customer-link-desktop.png`. | This creates a trust break exactly where free users are evaluating the product. It also makes free/company policy feel inconsistent. | For free reports, replace contact copy with `This no-login test link is unbranded. Use your normal customer communication channel.` |
| P1 | Customer-facing copy | The company customer link uses `Call vendor` as a primary CTA and in the top navigation. | Screenshot: `local-sim-2026-05-14/screenshots/company-customer-link-desktop.png`. | The user explicitly wants to avoid overusing customer-facing internal terms like `vendor`. Restaurant managers understand company/service provider names better. | Replace with `Call Kitchen Permit`, `Call service team`, or `Contact service provider`. Prefer company-specific CTA when phone exists. |
| P2 | Customer photo section | The heading `The photos show what changed` can overclaim when the record is partial, after-only, or access-condition focused. | Company mobile and desktop customer screenshots show partial photo evidence with missing before photo. | A retained service record must not imply a before/after proof set when one is not attached. | Generate evidence-specific headings: `Photos attached to this record`, `After-service photos`, `Blocked access photo`, or `Written service record`. |
| P2 | PDF readability | PDF is document-like, but long table values wrap into narrow right-aligned columns and the page is very dense. | Screenshot: `local-sim-2026-05-14/screenshots/company-service-record-pdf.png`. | A manager/landlord/insurance reviewer may find it harder to scan than necessary. Dense text reduces perceived document quality. | Widen key-value value columns, reduce repeated rows, and make first-page summary plus excluded area/action item more prominent. |
| P2 | Free vs company conversion | Free link is unbranded but still visually polished enough that the paid difference depends heavily on dashboard/history rather than the customer artifact itself. | Free customer screenshot and company customer screenshot are structurally similar. | Free should build trust but still clearly feel like a test link, not a complete branded company system. | Add a restrained test-link marker/watermark and stronger in-builder upgrade explanation, while keeping the report usable. |
| P3 | Mobile polish | Mobile header truncates the company name and some photo thumbnails appear partially loaded/offscreen in the full photo strip. | Screenshot: `local-sim-2026-05-14/screenshots/company-customer-link-mobile.png`; mobile run loaded 5/9 images. | Not a blocker because no broken image was detected and no horizontal overflow exists, but it reduces polish. | Add predictable thumbnail placeholders/loading and shorten mobile header brand display. |

## User Journey Evaluation

### Company owner opens dashboard

- What worked: account status, $79/mo value, company profile, and report history are visible on one page. The owner can see 7 reports across 6 customer/sites, with due-soon and past-due counts.
- What felt weak: the dashboard is still visually marketing-heavy for a logged-in workspace, and every report says `Open items recorded`.
- Trust level: medium-high.
- Conversion impact: positive, but weakened by noisy statuses.
- Fix priority: P1.

### Company owner resends customer link

- What worked: each report has `Copy text`, `Copy email`, `Edit report`, and `Open customer link`. This maps well to real owner workflows.
- What felt weak: the status language does not help decide which report to resend or follow up on.
- Trust level: medium-high.
- Conversion impact: positive if the status model is fixed.
- Fix priority: P1.

### Restaurant manager opens customer link

- What worked: the customer immediately sees the service provider, property, date, service result, blocked access, action item, photos, and PDF copy.
- What felt weak: `Call vendor` feels generic/internal, and the page still has a strong web-app CTA feel in the first viewport.
- Trust level: high for blocked-access clarity, medium for copy polish.
- Conversion impact: strong demo value once language is tightened.
- Fix priority: P1/P2.

### Manager saves/prints PDF

- What worked: the PDF screen is now a quiet service record and the toolbar uses `Save PDF`. The route is correct: `/p/server?reportId=<id>&format=pdf`.
- What felt weak: the document is long and table-dense, with awkward wrapping in narrow columns.
- Trust level: high enough for beta, medium-high for public launch.
- Conversion impact: strong, because this is the retained-copy promise.
- Fix priority: P2.

### Free user creates/opens test link

- What worked: free output is unbranded, expires in 7 days, and does not leak the company profile even when spoofed branding is sent.
- What felt weak: free copy says to use company phone/reply email that is not present.
- Trust level: medium until the contradiction is fixed.
- Conversion impact: risky, because free is the evaluation path.
- Fix priority: P1.

### Vendor uses photos/Gemini assist

- What worked: Gemini live mode returned suggestions, every suggestion remained `pending`, and the unrelated hand-dryer photo was rejected as no slot. No inspection/compliance/approval terms appeared.
- What felt weak: customer-facing photo section language can imply change/proof more broadly than the actual evidence supports.
- Trust level: high for backend/AI guardrail, medium-high for customer copy.
- Fix priority: P2.

### No-photo written record case

- What worked: the system can create a no-photo report and stores it in history.
- What felt weak: dashboard still marks it as `Open items recorded`; it should read more like `Written record` or `No photos saved`.
- Trust level: medium.
- Conversion impact: important, because vendors will sometimes have no photos.
- Fix priority: P1/P2.

## Technical Verification Summary

- Local server: running on `http://127.0.0.1:8096`
- DB: `jdbc:h2:file:./build/db/axis1-launch-qa`
- Storage: filesystem under `storage/axis1-launch-qa`
- `admin@kitchenpermit.com`: authenticated company access via `HOOD_BILLING_PROVIDER=abstract`
- Company reports seeded: 7
- Free reports seeded: 2
- Stored photo asset read: passed
- Gemini Photo Assist: `live`, provider `gemini`, model `gemini-2.5-flash`, no warning
- Browser actionable console issues: 0
- Horizontal overflow: 0px on checked pages
- Customer PDF anchors: React route only, no customer-facing `/api/axis1/assets/.../service-report.pdf` CTA
- Stale sample data check: no `Sample Restaurant Group` / `Austin, TX` on tested saved report pages

## Link Index

### Core

- [Dashboard](http://127.0.0.1:8096/dashboard)
- [Company profile](http://127.0.0.1:8096/dashboard#company-profile)
- [Report history](http://127.0.0.1:8096/dashboard#report-history)
- [Simulation report](local-sim-2026-05-14/axis1-launch-local-sim.md)
- [Simulation JSON](local-sim-2026-05-14/axis1-launch-local-sim-results.json)

### Company Reports

| Report | Customer link | PDF screen | Builder reload |
| --- | --- | --- | --- |
| Marigold Diner / Main cookline hood | [customer](http://127.0.0.1:8096/p/server?reportId=9e5d5f04aa714a0a8f) | [PDF](http://127.0.0.1:8096/p/server?reportId=9e5d5f04aa714a0a8f&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=9e5d5f04aa714a0a8f) |
| Canal Street Tacos / Tortilla line exhaust | [customer](http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd) | [PDF](http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=67e4d189dc3b4fa5bd) |
| Northside Grill / Charbroiler hood line | [customer](http://127.0.0.1:8096/p/server?reportId=b708543a796c4110a6) | [PDF](http://127.0.0.1:8096/p/server?reportId=b708543a796c4110a6&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=b708543a796c4110a6) |
| Harbor Wok / High-volume wok line | [customer](http://127.0.0.1:8096/p/server?reportId=20fcc152496a44178d) | [PDF](http://127.0.0.1:8096/p/server?reportId=20fcc152496a44178d&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=20fcc152496a44178d) |
| Blue Line Pizza / Oven hood and make-line exhaust | [customer](http://127.0.0.1:8096/p/server?reportId=119b1986e45341ae87) | [PDF](http://127.0.0.1:8096/p/server?reportId=119b1986e45341ae87&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=119b1986e45341ae87) |
| Elm Market Kitchen / Market prep hood | [customer](http://127.0.0.1:8096/p/server?reportId=c31a06545e6648648b) | [PDF](http://127.0.0.1:8096/p/server?reportId=c31a06545e6648648b&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=c31a06545e6648648b) |
| Marigold Diner / prior cycle | [customer](http://127.0.0.1:8096/p/server?reportId=2a7b7514ee624a7d87) | [PDF](http://127.0.0.1:8096/p/server?reportId=2a7b7514ee624a7d87&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=2a7b7514ee624a7d87) |

### Free Test Links

| Report | Customer link | PDF screen | Expires |
| --- | --- | --- | --- |
| Free Trial Bistro / Main hood test report | [customer](http://127.0.0.1:8096/p/server?reportId=636121f600f24ffa90) | [PDF](http://127.0.0.1:8096/p/server?reportId=636121f600f24ffa90&format=pdf) | 2026-05-21 |
| Spoofed Brand Cafe / Cafe hood test report | [customer](http://127.0.0.1:8096/p/server?reportId=1cc641e7f99f46c786) | [PDF](http://127.0.0.1:8096/p/server?reportId=1cc641e7f99f46c786&format=pdf) | 2026-05-21 |

### Screenshots

- [Dashboard history](local-sim-2026-05-14/screenshots/dashboard-admin-history.png)
- [Company customer link desktop](local-sim-2026-05-14/screenshots/company-customer-link-desktop.png)
- [Company customer link mobile](local-sim-2026-05-14/screenshots/company-customer-link-mobile.png)
- [Company PDF/service record](local-sim-2026-05-14/screenshots/company-service-record-pdf.png)
- [Free customer link desktop](local-sim-2026-05-14/screenshots/free-customer-link-desktop.png)
- [Builder reload saved report](local-sim-2026-05-14/screenshots/builder-load-saved-report.png)

## Final Recommendation

**Do not do the paid public launch today without fixing the P1 items.** There is no hard technical blocker, and the product is strong enough for demos or a controlled beta. But for a real `$79/mo` launch, the dashboard needs trustworthy status semantics and the customer/free copy must stop using contradictory or internal language. Once those P1 fixes are verified, I would move this to `Ship`.

## Next Codex Prompt

```text
너는 C:\Development\Owner\hood에서 작업하는 Codex다. 답변은 반드시 한글로 해라.

먼저 references/axis1-core-skeleton-full-context-2026-05-13.md를 처음부터 끝까지 완전히 읽어라. 그 다음 references/axis1-launch-qa/final-review-2026-05-14.md를 읽어라.

목표는 Axis 1 유료 런칭 전 P1 제품 신뢰 이슈를 고치는 것이다. unrelated change는 절대 revert하지 마라. Next build와 Gradle test를 병렬로 돌리지 마라. 수동 파일 수정은 apply_patch를 우선 사용해라.

수정 우선순위:
1. Dashboard report history에서 모든 리포트가 `Open items recorded`로 보이는 문제를 고쳐라. clean/record-only, next-service, open access, quote/monitor, no-photo written record를 구분해야 한다.
2. Free customer link에서 회사 phone/reply email을 쓰라는 모순 copy를 제거하라. 무료는 no-login unbranded test link라는 점을 신뢰 있게 설명해야 한다.
3. Customer-facing CTA/copy에서 `Call vendor` 같은 내부적/기계적 표현을 회사명 또는 service provider 중심 표현으로 바꿔라.
4. Photo section copy가 `photos show what changed`처럼 partial evidence를 overclaim하지 않게 evidence type별로 바꿔라.

검증:
- node scripts/axis1-launch-local-sim-qa.cjs
- 고객 링크 PDF CTA가 여전히 /p/server?reportId=<id>&format=pdf인지 확인
- dashboard/customer link/free link/PDF를 브라우저로 확인
- final-review 문서 또는 새 QA note에 수정 후 결과를 남겨라.
```
