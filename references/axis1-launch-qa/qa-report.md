# Axis 1 Launch Full QA - 2026-05-20

## Executive Verdict
- 출시 가능 여부: Go with fixes. 결제 버튼을 Paddle checkout이 아니라 30-day pilot access로 닫아둔 현재 런칭은 가능하다. 완전 셀프서브 유료 결제 런칭은 Paddle domain approval 전까지 No-go.
- $79/mo 가능성 평가: 받을 수 있다. 다만 첫 결제 전에는 "회사명/로고/연락처가 들어간 실제 고객용 링크/PDF와 히스토리"를 바로 보여줘야 한다. 현재 파일럿 요청 흐름은 Paddle 대기 중 임시 전환으로 적절하다.
- 가장 큰 구매 저해 요인 3개: Paddle live domain approval pending, active company account/history를 외부 고객처럼 끝까지 보는 seed QA 부족, builder output 화면의 정보 밀도.
- 가장 큰 신뢰 요소 3개: 첫 화면이 hood cleaning service report를 5초 안에 설명함, sample/customer/PDF/report-history 가치가 제품 포지션과 맞음, login/reset/email verification/pilot request가 실제 운영 메일 경로로 동작함.
- Latest deploy: `f65d454` CD run `26111657406` completed successfully and live recheck passed.

## Tested Links
- [Live home](https://kitchenpermit.com/)
- [Axis 1 product](https://kitchenpermit.com/axis-1)
- [Axis 1 sample hub](https://kitchenpermit.com/samples/axis-1)
- [Sample customer report](https://kitchenpermit.com/p/sample-clean-closeout)
- [Sample PDF/service record](https://kitchenpermit.com/p/sample-clean-closeout?format=pdf)
- [Free builder](https://kitchenpermit.com/axis-1/tool)
- [Pricing](https://kitchenpermit.com/pricing)
- [Company version / pilot access](https://kitchenpermit.com/company-version)
- [Login to dashboard](https://kitchenpermit.com/login?next=%2Fdashboard)
- [Forgot password](https://kitchenpermit.com/forgot-password)
- [Dashboard](https://kitchenpermit.com/dashboard)
- [Terms](https://kitchenpermit.com/terms)
- [Privacy](https://kitchenpermit.com/privacy)
- [Refund policy](https://kitchenpermit.com/refund-policy)
- [Missing hosted report state](https://kitchenpermit.com/p/server?reportId=missing-overnight-qa)
- Local server candidate [127.0.0.1:8096](http://127.0.0.1:8096) was down during this pass, so production was the primary QA target.

## Persona Findings
- Hood cleaning owner: value is clear. "Send a restaurant-ready service report after every hood cleaning job" is strong enough for a cold-email click. $79 is defensible if company branding/history is activated quickly.
- Office/admin staff: dashboard explains saved records, next dates, resend copy, and company profile, but inactive accounts see mostly locked value. A real paid seed account should be used for one final history QA.
- Field technician: the Declare-first builder is much better than a photo-sorting tool. Normal closeout works without photos. Output step still feels dense and may slow a non-technical user.
- Restaurant manager: sample customer link reads like a service record, not an app pitch. Customer report pages are noindex and avoid billing/account pressure.
- Inspector/landlord/insurance reviewer: service result, photos, dates, open items, and next step are visible. The sample PDF previously looked too web-like; fixed so `?format=pdf` renders the service-record document mode.
- Founder/business reviewer: launch story is now coherent: free builder proves output, company version gives real brand/history, Paddle pending is handled as pilot access instead of broken checkout.

## Launch Blockers
- P1 resolved: `/axis-1/tool` could emit React hydration error around date calculation. Repro: open live `/axis-1/tool` near a server/browser timezone date mismatch. Observation: React minified #418 console error. Why it matters: core builder first page cannot show hydration errors during launch. Fix: static initial service date now hydrates consistently, then client updates today's date after mount. Commit: `3795f5c`.
- P1 resolved: sample `?format=pdf` routes rendered the full customer web report instead of the service-record document mode. Repro: open `/p/sample-clean-closeout?format=pdf`. Observation: top nav, confirm buttons, large web hero, and customer CTA remained. Why it matters: inspector/reviewer expects a retained record, not a web page. Fix: sample report routes now switch to `outputIntent="service-record"` when `format=pdf`. Commit: `f65d454`.
- P1 mitigated external: Paddle domain approval is pending. Repro: Paddle dashboard shows `kitchenpermit.com` unapproved. Why it matters: live checkout cannot be relied on. Mitigation: checkout is not front-facing; pricing/company CTA uses no-card pilot access.

## High Priority Fixes Before Payment Push
- Create or enable one paid/company QA account and run full saved-report history QA: company profile edit, logo/color/phone, saved report link, PDF, copy text/email, delete/reuse, next service queue.
- After Paddle approval, restore checkout only after a live checkout smoke test from `kitchenpermit.com`.
- Reduce output-step density for first-time field users. Keep advanced service-area/status details collapsible unless the user chooses to edit.
- Add a production canary for `/axis-1/tool`, `/company-version`, `/p/sample-clean-closeout?format=pdf`, and `/p/server?reportId=missing`.

## Product Trust Issues
- Current company dashboard is persuasive but locked for non-active accounts. It explains value, but it does not let a cold user feel a working history unless access is granted.
- PDF/service-record credibility depends on the React document mode. The route direction is correct, but every customer-facing PDF CTA must continue to point to `/p/server?reportId=<id>&format=pdf`, not backend asset PDFs.
- The file-pilot CTA is honest and avoids "broken payment" smell. It should remain framed as launch pilot access, not as payment unavailable.

## UX/UI Issues
- Landing and Axis 1 pages are clear and not generic SaaS.
- Mobile home/tool/dashboard have no horizontal overflow in tested viewports.
- Builder first step is correct: "What happened on this hood cleaning job?" not "Upload photos."
- Output screen has too many buttons and repeated controls. It works, but a technician could feel they are editing a report instead of sending a generated closeout.
- Dashboard list/history value could be stronger for paid accounts; inactive account only shows the locked version.

## Copy/Positioning Issues
- Good: "Free builder. $79/mo company version." and "Free proves output, company version is the paid product."
- Good: no live invoice/payment link is over-promoted while Paddle approval is pending.
- Watch: "inspection-ready PDF" is acceptable as customer-file posture, but avoid implying NFPA/fire marshal approval.
- Fixed: legal/support fallback now uses `compliance@kitchenpermit.com` instead of `support@kitchenpermit.com`.

## Flow-by-Flow QA
- A. Landing/marketing: Pass. 5-second value is clear. CTAs go to free builder, sample, company setup. Mobile first screen works.
- B. Sample/output: Pass after fix. Customer link is readable. PDF route now uses service-record mode for sample `?format=pdf`.
- C. No-login free tool: Pass. Normal closeout can be created without photos and reaches outputs. Free limitations are visible and not hostile.
- D. Login/signup: Pass. Wrong password redirects to `/login?auth=failed` and displays "Could not sign in" with clear copy. Google login worked in the existing browser session.
- E. Forgot/reset: Partial pass. Unknown email returns same safe response: "If an account exists..." Prior manual thread confirmed real email verification/reset delivery; this overnight pass did not request another reset for a real inbox.
- F. Paid/company dashboard: Partial pass. Logged-in verified account shows subscription-required state, locked company profile, and clear upgrade/pilot path. Fully active paid history still needs a seeded access account.
- G. Company profile/account: Partial pass. Locked state explains logo/color/phone/service area. Actual edit/save/reflection requires active company access.
- H. Logged-in tool to dashboard: Pass for free/logged-in mode. Report output is generated, but history is intentionally not saved while company access is inactive.
- I. Customer link: Pass. Sample report feels like a service record and is noindex. No billing/account pressure appears on public report.
- J. PDF screen: Pass after fix for sample routes; hosted `/p/server?...&format=pdf` already uses React service-record route. Need one active saved report to verify final hosted PDF data end-to-end.
- K. Pricing/payment: Pass for pilot launch. Pricing defends $79 with branding, live links, clean PDF, history, follow-up. Live checkout remains intentionally closed.
- L. Legal/trust: Pass after support email fallback fix. Terms/privacy/refund are linked from footer and login.
- M. Mobile: Pass baseline. No horizontal overflow found on home/tool/dashboard/sample PDF. Dashboard first screen is understandable, though locked value dominates.
- N. Technical/stability: Pass with caveats. Cloudflare RUM `net::ERR_ABORTED` appeared repeatedly and looks benign. Missing report returns a helpful noindex unavailable state with expected 404 API call.
- O. SEO/cold email: Pass. Public marketing/resource pages are indexable. Customer report/sample report pages are noindex. Resource pages are relevant enough, not just keyword filler.

## Data/Backend/API Notes
- Pilot request logged-in API returned 200 and sent the request path: `/api/billing/pilot/request`.
- Logged-out pilot CTA redirects to signup/login with `next=/company-version?pilot=1`.
- Login failed state is visible and specific.
- Missing hosted report state is safe and noindex.
- No sample data was observed leaking into manually entered free output text. Actual saved paid report data needs one active company account pass.
- Targeted verification passed:
  - `npm --prefix frontend run build`
  - `npm --prefix frontend run test:axis1` with 95 tests passing
  - `.\gradlew.bat test --tests owner.hood.web.PublicSiteApiControllerTest --tests owner.hood.web.PublicInquiryApiControllerTest`
- Post-deploy live verification passed:
  - `/axis-1/tool` returned 200 with no captured console errors and no horizontal overflow.
  - `/p/sample-clean-closeout?format=pdf` returned 200, no captured console errors, no old customer-link nav, and showed `Customer-retained copy / Kitchen Exhaust Cleaning Service Report`.
  - `/terms`, `/privacy`, and `/refund-policy` all show `compliance@kitchenpermit.com` and no `support@kitchenpermit.com`.

## Screenshots / Evidence
- [Home desktop](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/home-desktop.png)
- [Home mobile](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/home-mobile.png)
- [Axis 1 desktop](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/axis1-desktop.png)
- [Samples desktop](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/samples-desktop.png)
- [Sample customer report](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/sample-clean-desktop.png)
- [Original sample PDF issue evidence](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/sample-pdf-desktop.png)
- [Fixed sample PDF live recheck](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/sample-pdf-after-fix-live.png)
- [Free tool first screen](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/tool-desktop.png)
- [Free tool review](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/free-tool-review-after-normal-closeout.png)
- [Free tool outputs](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/free-tool-outputs-after-job-basics.png)
- [Pricing desktop](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/pricing-desktop.png)
- [Company version desktop](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/company-version-desktop.png)
- [Login desktop](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/login-desktop.png)
- [Dashboard logged-out](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/dashboard-logged-out-desktop.png)
- [Missing report state](C:/Development/Owner/hood/references/axis1-launch-qa/screenshots/overnight-2026-05-20/missing-report-desktop.png)
- [Tool hydration console evidence](C:/Development/Owner/hood/references/axis1-launch-qa/evidence/overnight-2026-05-20/tool-start-console-errors.md)

## Recommended Fix Plan
1. 런칭 차단: completed in commits `3795f5c` and `f65d454`; latest CD succeeded and live recheck passed.
2. 결제 전 개선: paid seed account QA, Paddle approval, live checkout smoke, dashboard history polish.
3. 콜드메일 전환율 개선: keep "request 30-day pilot access" until checkout is approved; offer company-branded first report quickly after request.
4. 후속 개선: simplify output screen, add scheduled canary, add one-click demo account/history preview for sales.

## Final Scorecard
- Vendor value clarity: 8/10
- Restaurant/customer trust: 8/10 after PDF route fix
- Dashboard operational usefulness: 6.5/10 until active paid history is QA'd
- Tool ease of use: 7.5/10
- PDF/document credibility: 8/10 after sample PDF service-record fix, pending live hosted saved report proof
- Mobile readiness: 7.5/10
- Pricing confidence: 7.5/10 with pilot, 5/10 if checkout is promised before Paddle approval
- Login/account reliability: 8/10
- Free-to-paid conversion clarity: 8/10
- Launch readiness: 8/10 for pilot launch, 6/10 for self-serve paid launch
