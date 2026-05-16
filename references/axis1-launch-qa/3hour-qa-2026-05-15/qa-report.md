# Axis 1 Final Launch QA - 2026-05-15

Local server: http://127.0.0.1:8096

Primary evidence folder: `references/axis1-launch-qa/3hour-qa-2026-05-15/`

## 1. Executive verdict

**$79/mo 가능 여부:** 가능. 특히 recurring commercial accounts, manager/insurance/landlord documentation 요청이 있는 hood cleaning 업체에는 "고객 기록이 쌓이고 회사 이름으로 보낸다"는 가치가 보인다.

**Controlled launch 가능 여부:** 가능.

**Self-serve launch 가능 여부:** 제한적으로 가능. 첫 사용자는 builder의 result 선택, written record 확정, job basics 입력의 의미를 이해해야 하므로 완전한 broad self-serve보다는 paid beta/controlled acquisition이 더 안전하다.

**최종 점수:** 88 / 100

**가장 큰 blocker/risk 3개:**

1. P2 - anonymous photo builder UI는 local photo hints/fallback처럼 보였고, live Gemini가 고객에게 명확히 표시되지는 않았다. 시뮬레이션 API는 Gemini live 통과.
2. P2 - PDF 모바일 화면은 문서성은 유지되지만 매우 길고 빽빽하다. 저장/프린트용으로는 허용 가능하지만 모바일 리뷰 경험은 무겁다.
3. P3 - customer link의 전화 CTA(`Call service team`, `Call after clearing access`)와 본문 customer action의 "reply" 문구가 동시에 보여 일부 고객에게 다음 행동이 약간 혼동될 수 있다.

P0/P1 launch blocker는 발견하지 못했다.

## 2. Persona verdicts

**Hood cleaning 업체 사장:** PASS. Dashboard의 saved reports, customer/site grouping, next-service 상태, company branding, persistent link/PDF가 $79/mo 이유로 보인다.

**현장 기술자:** PASS WITH P2. 사진 없이 written record 생성 가능하고, 불확실한 사진은 `saved, not claimed`로 빠진다. 다만 UI Photo Assist는 anonymous path에서 Gemini live가 아니라 local hints처럼 보였다.

**식당 매니저:** PASS. 대표 고객 링크는 5초 안에 `Reachable work completed / 1 area needs your action`, open item, customer next step, PDF copy를 이해할 수 있다.

**Landlord / insurance / documentation reviewer:** PASS WITH CAUTION. PDF는 retained service record처럼 보이고 과장된 compliance/certificate/pass 표현은 없다. 다만 모바일 PDF는 매우 길고 밀도가 높다.

**무료 사용자:** PASS. Free test link는 no-login test로 명확하고, 회사명/로고/dispatch email/history가 빠져 있다. 기본 기록 가치는 보이지만 paid와 충분히 구분된다.

**유료 company 사용자:** PASS. Kitchen Permit Hood Service branding, accent color, contact, dashboard history, persistent customer link/PDF, edit report가 유료 이유로 작동한다.

## 3. UI/UX findings

**화면별 첫인상**

- `/`: hood cleaning 업체용 restaurant-ready service report라는 목적이 3-5초 안에 보인다.
- `/axis-1`: free vs company value, branded link/PDF, inspection-ready PDF가 명확하다. 마케팅 문맥의 "vendor"는 허용 가능.
- `/samples/axis-1`: 실제 deliverable 미리보기로 작동한다. `Sample Restaurant Group`은 sample page 맥락에서는 허용되며 saved customer link/PDF에는 누수되지 않았다.
- `/pricing`: `$79/mo company version`이 setup fee가 아니라 paid product로 보인다. optional design help도 선택 사항으로 보인다.
- `/company-version`: saved company info, clean PDF, live links, history가 paid value로 연결된다.
- `/dashboard`: "내 고객 기록이 쌓인다"가 가장 강하게 보인다. Marigold Diner가 묶이고, Canal/Blue Line/Northside/Elm 등이 실제 히스토리처럼 보인다.

**모바일 이슈**

- 가로 overflow: 검사한 핵심 화면에서 0px.
- `/axis-1/tool`: sticky bottom review buttons가 작업을 빠르게 만들지만 optional note 근처를 일부 덮는다. P3.
- `/dashboard`: 모바일 viewport에서 hero, billing card, report history가 읽힌다.
- customer link: 긴 hero이지만 첫 화면에서 결과와 next action이 명확하다.
- PDF screen: 문서성은 유지되지만 모바일에서 매우 길고 빽빽하다. P2.
- `/pricing`: 모바일에서 $79/mo, free, optional design help가 잘 구분된다.

**문구 이슈**

- 고객 링크/PDF에서 `proof link`, `packet`, invoice/payment/pay now/mailto 노출은 확인되지 않았다.
- 고객 링크에는 전화 CTA가 노출된다. 회사 contact가 paid value이므로 blocker는 아니지만, 본문이 "reply"를 말할 때 CTA가 "Call"이면 약간 불일치한다.
- PDF는 compliance/certificate/inspection pass처럼 과장하지 않는다.

**버튼/CTA 이슈**

- 저장 리포트 customer link의 PDF CTA는 모두 `/p/server?reportId=<id>&format=pdf`였다.
- 고객 전면에 `/api/axis1/assets/<id>/service-report.pdf` anchor는 없었다.
- Free link에도 company phone/mailto/reply email/dispatch email은 보이지 않았다.

**PDF 문서성 평가**

- Desktop PDF는 웹앱보다 retained service record에 가깝다.
- `Save PDF` 버튼, company header, service date, location, system, result, record basis, excluded area, photos, next service, reviewer boundary가 명확하다.
- 정보량은 많다. Documentation reviewer에게는 좋지만 restaurant manager 모바일 리뷰에는 무겁다.

**무료/유료 차이 평가**

- Free: no login, no company logo/contact, 7-day test link, watermarked PDF, no history.
- Company: saved company profile, clean PDF, live links, history, dashboard grouping.
- 차이가 짜증나는 paywall이 아니라 "테스트 vs 실제 회사 기록"으로 설명된다.

## 4. Functional findings

### F-001 - Anonymous photo builder UI appears to use local hints/fallback

- Severity: P2
- Repro:
  1. Open http://127.0.0.1:8096/axis-1/tool
  2. Upload five messy photos: before, after, unrelated, blocked access, random kitchen.
  3. Click `Run Photo Assist`.
- Expected: If live Gemini is available, UI should clearly show Gemini-assisted suggestions or clearly explain why free/anonymous path uses local hints.
- Actual: UI showed local photo hints/fallback style. Unclear photos correctly stayed as `saved, not claimed`; role assignment was available.
- Screenshot:
  - `references/axis1-launch-qa/3hour-qa-2026-05-15/screenshots/photo-builder-gemini-assist.png`
  - `references/axis1-launch-qa/3hour-qa-2026-05-15/screenshots/photo-builder-role-corrected.png`
- Fixed: No. Not a launch blocker because the required sim script returned `photoAssist.mode=live`, provider `gemini`, model `gemini-2.5-flash`.

### F-002 - PDF mobile is document-correct but very dense

- Severity: P2
- Repro:
  1. Open http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd&format=pdf at 390px mobile viewport.
- Expected: Retained service record remains readable without overlap or web-app CTA feel.
- Actual: No overflow and no broken layout, but the document is very long and dense on mobile.
- Screenshot: `references/axis1-launch-qa/3hour-qa-2026-05-15/screenshots/mobile-pdf-mobile.png`
- Fixed: No. Acceptable for paid beta because PDF is mainly save/print/archive, not the primary mobile reading surface.

### F-003 - Customer action CTA mixes call and reply language

- Severity: P3
- Repro:
  1. Open http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd
  2. Compare primary CTA text and customer next step text.
- Expected: Next action phrasing should be aligned.
- Actual: UI includes `Call service team` / `Call after clearing access`, while the action copy says to reply so dispatch can schedule the check.
- Screenshot: `references/axis1-launch-qa/3hour-qa-2026-05-15/screenshots/company-open-access-link-desktop.png`
- Fixed: No. This is polish, not a blocker.

### F-004 - Mobile builder sticky action partially covers the note area while scrolling

- Severity: P3
- Repro:
  1. Open http://127.0.0.1:8096/axis-1/tool at 390px mobile viewport.
- Expected: Sticky actions remain ergonomic without hiding active work.
- Actual: Sticky `Review / Review report` rail overlaps near the optional note area in the screenshot.
- Screenshot: `references/axis1-launch-qa/3hour-qa-2026-05-15/screenshots/mobile-builder-mobile.png`
- Fixed: No. Workflow remains usable.

### Verified non-findings

- Empty customer/site/reviewer does not proceed to output: manual browser run showed `Job details needed`.
- Fresh builder first screen has no `Sample Restaurant Group` or `Austin, TX`.
- Saved company customer links/PDFs have no sample data leakage.
- Saved report customer link PDF CTA uses `/p/server?reportId=<id>&format=pdf`.
- Customer-facing saved links/PDFs do not expose `/api/axis1/assets/<id>/service-report.pdf`.
- Customer-facing saved links/PDFs do not expose invoice/payment/pay now/mailto.
- Free link omits company branding/contact/history.

## 5. Fixes applied

No product code fix was applied in this pass. The QA found no P0/P1 issue and no P2 issue that was safe to fix without changing product policy or Photo Assist behavior.

Generated QA artifacts:

- `references/axis1-launch-qa/3hour-qa-2026-05-15/qa-report.md`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/browser-product-audit.json`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/photo-builder-ui-audit.json`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/photo-builder-gemini-ui-audit.json`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/fresh-builder-timed-flow.json`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/local-sim/axis1-launch-local-sim.md`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/local-sim/axis1-launch-local-sim-results.json`

Why this is product-safe: no code churn was introduced for non-blocking polish issues during launch QA. The evidence is preserved for targeted follow-up without risking a last-minute regression.

Regression prevention: browser audits, required launch sim, Next lint/build, Gradle resources, and Axis1AccountStorageApiTest all passed.

## 6. Remaining concerns

**Launch blockers:** none found.

**Paid beta acceptable issues:**

- Photo Assist UI wording/state should be tightened so operators understand whether Gemini is live or local hints are being used.
- Mobile PDF density is acceptable for retained copy but should not be the primary mobile consumption path.
- Call vs reply CTA copy can be unified later.

**Later improvements:**

- Add a clearer "Gemini suggestions require review" state in the upload tray.
- Consider a shorter mobile PDF summary at top before the full retained record.
- Reduce duplicate PDF/call CTAs on long customer links while preserving quick actions.
- Polish mobile sticky action placement in builder.

## 7. Links to inspect later

- Dashboard: http://127.0.0.1:8096/dashboard
- Fresh builder: http://127.0.0.1:8096/axis-1/tool
- Representative company customer link: http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd
- Representative PDF screen: http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd&format=pdf
- Free test link from latest sim: http://127.0.0.1:8096/p/server?reportId=a9f198aea39446e891
- Free test PDF from latest sim: http://127.0.0.1:8096/p/server?reportId=a9f198aea39446e891&format=pdf
- Screenshots folder: `references/axis1-launch-qa/3hour-qa-2026-05-15/screenshots/`
- Local sim report: `references/axis1-launch-qa/3hour-qa-2026-05-15/local-sim/axis1-launch-local-sim.md`

## Verification

Required commands, run sequentially with no parallel Next/Gradle build:

1. `npm --prefix frontend run lint` - PASS
2. `npm --prefix frontend run build` - PASS
3. `.\gradlew.bat --no-daemon processResources` - PASS
4. `node scripts\axis1-launch-local-sim-qa.cjs` with `AXIS1_SIM_OUTPUT_DIR=references/axis1-launch-qa/3hour-qa-2026-05-15/local-sim` - PASS

Additional targeted verification:

- `.\gradlew.bat --no-daemon test --tests owner.hood.web.Axis1AccountStorageApiTest` - PASS

Latest local sim summary:

```json
{
  "ok": true,
  "companyReports": 7,
  "freeReports": 2,
  "photoAssist": {
    "mode": "live",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  },
  "browserPages": 7,
  "findings": []
}
```

## 8. Post-report fix pass - 2026-05-15

This follow-up pass addressed the safe P2/P3 items that did not require changing the core Axis 1 product policy.

### Fixes applied after this report

- F-001 Photo Assist UI/API path:
  - Removed the frontend guard that skipped `/api/axis1/photo-assist` whenever `NEXT_PUBLIC_API_BASE_URL` was empty. Local same-origin API calls now run first.
  - Updated Photo Assist copy so Gemini usage and local fallback are clearly distinguished.
  - Local fallback now says local hints were used only after the API is unavailable.
  - Follow-up: removed the visible `Gemini` provider name from the builder UI. The vendor-facing product copy now says `Photo Assist`; provider details remain internal/QA-only.
- F-003 customer action CTA:
  - Customer link CTA language now uses `Contact after clearing access` / `Contact service team` instead of mixing `Call` buttons with `reply` body copy.
  - Customer-facing action copy converts reply-oriented phrases to contact-oriented phrases.
- F-004 mobile builder sticky action:
  - Mobile review-step bottom padding increased so the fixed action rail has enough breathing room near the end of the form.

### Verification after fixes

- `npm --prefix frontend run lint` - PASS
- `npm --prefix frontend run build` - PASS
- `.\gradlew.bat --no-daemon processResources` - PASS
- `.\gradlew.bat --no-daemon test --tests owner.hood.web.Axis1AccountStorageApiTest` - PASS
- Local server restarted on `http://127.0.0.1:8096` with QA DB confirmed in logs:
  - `jdbc:h2:file:./build/db/axis1-launch-qa`

### Targeted browser verification

- Representative customer link:
  - URL: `http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd`
  - `Call after clearing access`: not present
  - `Call service team`: not present
  - `Contact after clearing access`: present
  - visible `reply` count: 0
  - `/api/axis1/assets/<id>/service-report.pdf` customer-facing PDF anchors: 0
  - PDF anchors still point to `/p/server?reportId=67e4d189dc3b4fa5bd&format=pdf`
  - `Sample Restaurant Group` / `Austin, TX`: not present
- Mobile builder review screen:
  - URL: `http://127.0.0.1:8096/axis-1/tool?step=review`
  - horizontal overflow: 0px
  - review-step workspace bottom padding: 168px

### Post-fix launch sim

Two post-fix local sim runs completed the account/report/browser flow, but Gemini returned HTTP 503 both times and the product used mock fallback as designed.

- `references/axis1-launch-qa/3hour-qa-2026-05-15/post-fix-local-sim/axis1-launch-local-sim.md`
- `references/axis1-launch-qa/3hour-qa-2026-05-15/post-fix-local-sim-retry/axis1-launch-local-sim.md`

Latest post-fix sim summary:

```json
{
  "ok": true,
  "companyReports": 7,
  "freeReports": 2,
  "photoAssist": {
    "mode": "mock",
    "provider": "mock",
    "model": "mock-rule-fallback",
    "warning": "Photo Assist failed with HTTP 503; mock suggestions were used."
  },
  "browserPages": 7,
  "findings": [
    "Photo Assist did not return live Gemini mode; check AXIS1_PHOTO_ASSIST_MODE and GEMINI_API_KEY inheritance."
  ]
}
```

Interpretation: this is not a customer-link/PDF launch blocker, because uncertain photos remain out of customer copy and the UI now labels local fallback clearly. It remains a launch-day operational risk if Photo Assist is marketed as live Gemini instead of an assistive organizer with review/fallback behavior.

## 9. Final polish pass - 2026-05-15

This pass focused on the founder question from the follow-up review: whether the dashboard feels like an operating workspace for hood cleaning vendors, not only a saved-report archive.

### Fixes applied

- Dashboard operations queue:
  - Added an `Operations queue` above report history.
  - Shows active follow-up records across customers/sites with `Recommended next service`, due/past-due status, open access items, quote review, monitor/review, and record-only states.
  - Added direct `Customer link`, `PDF`, and `Edit` actions in the queue.
  - Existing report rows now also expose `Open PDF`.
  - Product reason: a vendor can now see which customers need scheduling or exception follow-up without opening every report. This makes the $79/mo value feel more operational: records accumulate, next visits surface, and exceptions stay separate from completed work.
- Dashboard wording polish:
  - Queue action text now converts customer-facing `reply`/`call` phrasing to `contact the service team` where it appears in the operations view.
- Customer link and PDF wording:
  - Customer-facing action copy uses `Contact...` instead of mixing `Call...` and `reply...`.
  - PDF quick facts and customer next-step copy now apply the same contact-oriented language.
- Mobile PDF:
  - Added a compact mobile summary strip for result, open item, next service, and photo count so the PDF screen keeps document intent on small screens.
- Photo Assist:
  - Builder copy now states that Gemini is used when the API is live, local hints are labeled as local, and uncertain photos are not used in customer outputs until assigned a role.
  - Fallback notices now include `Local hints` plus the boundary that the vendor must confirm photo roles.
- Login build fix:
  - `frontend/src/components/auth/login-form.tsx` had a pre-existing TypeScript inference issue from the current dirty tree. Added an explicit `AuthStatusMessage` type so the build stays green without reverting the UI work.

### Final targeted browser checks

- Dashboard desktop:
  - URL: `http://127.0.0.1:8096/dashboard`
  - Operations queue present: yes.
  - `Recommended next service` visible: yes.
  - `OPEN ACCESS ITEM`, `NEXT SERVICE`, `QUOTE REVIEW`, `MONITOR / REVIEW`, `WRITTEN RECORD`, `RECORD ONLY` states present: yes.
  - PDF links use `/p/server?reportId=<id>&format=pdf`: yes.
  - `/api/axis1/assets/<id>/service-report.pdf` anchor: not present.
  - Horizontal page overflow: 0.
  - Screenshot: `screenshots/post-polish-dashboard-desktop.png`
- Dashboard mobile:
  - Operations queue present: yes.
  - `Recommended next service` visible: yes.
  - Horizontal page overflow: 0.
  - Screenshot: `screenshots/post-polish-dashboard-mobile.png`
- Representative company customer link:
  - URL: `http://127.0.0.1:8096/p/server?reportId=6651bdb3ce5e4a1192`
  - `Contact` copy present: yes.
  - `Call service team`: not present.
  - `reply after clearing access`: not present.
  - PDF anchors use `/p/server?reportId=6651bdb3ce5e4a1192&format=pdf`: yes.
  - Backend asset PDF anchor: not present.
  - Sample Restaurant Group / Austin, TX leak: not present.
  - Payment/invoice/pay-now copy: not present.
  - Page horizontal overflow: no.
  - Screenshots: `screenshots/post-polish-customer-link-desktop.png`, `screenshots/post-polish-customer-link-mobile.png`
- Representative PDF screen:
  - URL: `http://127.0.0.1:8096/p/server?reportId=6651bdb3ce5e4a1192&format=pdf`
  - `Save PDF` present: yes.
  - Mobile summary strip present: yes.
  - `reply after clearing access`: not present.
  - `Contact after clearing access` / contact-oriented copy: present.
  - Sample/payment leaks: not present.
  - Page horizontal overflow: no.
  - Screenshot: `screenshots/post-polish-pdf-mobile.png`
- Fresh/photo builder:
  - URL: `http://127.0.0.1:8096/axis-1/tool`
  - Sample Restaurant Group / Austin, TX leak on fresh start: not present.
  - Mobile page horizontal overflow: no.
  - Photo Assist copy distinguishes live Gemini, local hints, and vendor confirmation boundary: yes.
  - Screenshot: `screenshots/post-polish-photo-assist-ui.png`

### Final command verification

- `npm --prefix frontend run lint` - PASS
- `npm --prefix frontend run build` - PASS
- `.\gradlew.bat --no-daemon processResources` - PASS
- `node scripts\axis1-launch-local-sim-qa.cjs` - PASS

Latest local sim output:

```json
{
  "ok": true,
  "companyReports": 7,
  "freeReports": 2,
  "photoAssist": {
    "mode": "mock",
    "provider": "mock",
    "model": "mock-rule-fallback",
    "warning": "Photo Assist is running in mock mode."
  },
  "browserPages": 7,
  "findings": [
    "Photo Assist did not return live Gemini mode; check AXIS1_PHOTO_ASSIST_MODE and GEMINI_API_KEY inheritance."
  ]
}
```

The final sim used mock Photo Assist because the restarted local server did not inherit live Gemini credentials. The product behavior is acceptable for launch QA because mock/local hints are labeled, uncertain photos are not claimed, and customer links/PDFs do not expose unsafe photo conclusions. Live Gemini availability remains an ops check before a sales demo.

### Final business read

The dashboard now has a clearer paid reason than before: it is not just "reports I made," it is "customers, next service dates, and exceptions I need to handle." That is the right direction for $79/mo. For cold outbound, the strongest wedge is still founder-led: send a vendor-specific sample and offer to pre-set their company profile so they can judge the actual customer-facing report in under a minute.
