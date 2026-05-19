# Axis 1 Launch Full QA - 2026-05-19

## Post-Fix Verification - 2026-05-19
- 수정 후 판정: 런칭 차단으로 잡은 핵심 P1 4개는 코드 수정 및 회귀 검증 완료. 원래 제품 판정은 “Go with fixes”였고, 현재는 결제/콜드메일 전 UX polish를 남긴 “Go with verified fixes” 상태로 본다.
- 검증 서버: [http://127.0.0.1:8097](http://127.0.0.1:8097)
- 새 saved report: [customer link](http://127.0.0.1:8097/p/server?reportId=a396e5a9edd041a4b2), [React PDF route](http://127.0.0.1:8097/p/server?reportId=a396e5a9edd041a4b2&format=pdf), [load back into builder](http://127.0.0.1:8097/axis-1/tool?loadReport=a396e5a9edd041a4b2&account=company)
- 회귀 evidence JSON: `references/axis1-launch-qa/evidence/fix-pass-2026-05-19T07-14-49-125Z.json`
- 회귀 screenshots: `references/axis1-launch-qa/screenshots/fix-pass-2026-05-19T07-14-49-125Z/`
- 통과 확인:
  - 로그인 직후 company entitlement 계정은 `/axis-1/tool`에서 자동으로 `account=company` 모드로 진입한다.
  - `/axis-1/tool?step=outputs&account=company` 직접 진입은 빈 output 화면 대신 `step=photos`로 안전하게 이동한다.
  - saved report의 `builderState`가 round-trip되어 load/edit 화면에서 saved record와 blocked/access 상태를 복원한다.
  - confirmed photo가 저장 payload, dashboard history asset metadata, customer link, React PDF에서 일관되게 보인다.
  - 같은 data URL photo가 `uploadedFieldPhotos`와 `packetData.proofPhotos`에 동시에 있어도 asset은 1개로 dedupe되고 양쪽 참조가 같은 asset URL을 가리킨다.
  - company profile의 빈 `directLine`/`afterHoursPhone`은 fake phone placeholder로 저장되지 않고, customer/PDF에도 `Customer phone`, `(555) 014-2201`, `(555) 014-2209`가 노출되지 않는다.
  - 고객 전면 PDF CTA는 `/p/server?reportId=<id>&format=pdf` React route를 유지한다.
  - invalid reset token은 `/auth/password-reset/validate`와 `/reset-password?token=...` 화면에서 submit 전 invalid 상태로 표시된다.
  - 회귀 브라우저 세션에서 console error 0, failed request 0.

## Executive Verdict
- 출시 가능 여부: Go with fixes.
- $79/mo 가능성 평가: 가능하다. 다만 지금 상태로 대량 콜드메일과 셀프서브 결제를 강하게 밀면 결제 직전 이탈이 생길 가능성이 높다. 샘플, 무료 툴, 고객 링크, React PDF, 대시보드의 핵심 가치는 실제로 보인다. 반면 유료 계정이 무료 모드로 시작되는 문제, 저장 리포트 재편집 데이터 불일치, 사진 포함 리포트가 고객/PDF에서 사진 없음으로 표시되는 문제는 결제 신뢰를 바로 깎는다.
- 가장 큰 구매 저해 요인 3개:
  - 유료/회사 계정으로 로그인해도 `/axis-1/tool` 첫 화면이 `FREE MODE`로 시작한다. 유료 사용자가 무심코 무브랜딩 무료 산출물을 만들 수 있다.
  - 저장 리포트를 다시 열었을 때 공개 링크와 편집 화면의 상태가 다르게 보인다. 특히 blocked/open item이 written note로 바뀌어 보이는 것은 운영 기록 제품에서 치명적이다.
  - 사진 포함 리포트가 대시보드에는 `1 photo`로 보이지만 고객 링크/PDF에서는 `No photos attached` 및 `no condition photo is attached`로 표시된다.
- 가장 큰 신뢰 요소 3개:
  - 랜딩 첫 화면에서 “후드 청소 후 식당에 보낼 service report link/PDF”가 5초 안에 이해된다.
  - 고객 링크와 React PDF가 식당/검사자/보험 제출용 기록처럼 보이며, 업체명, 식당명, 서비스 날짜, open item, next action, next service가 한 화면에 묶인다.
  - 대시보드는 저장 기록, due soon, open items, receipt confirmation, resend/copy/PDF/edit 액션을 실제 운영 화면처럼 제공한다.

## Tested Links
- [Landing](http://127.0.0.1:8096/)
- [Axis 1 product page](http://127.0.0.1:8096/axis-1)
- [Axis 1 sample page](http://127.0.0.1:8096/samples/axis-1)
- [Free/company report builder](http://127.0.0.1:8096/axis-1/tool)
- [Pricing](http://127.0.0.1:8096/pricing)
- [Company version](http://127.0.0.1:8096/company-version)
- [Login](http://127.0.0.1:8096/login?next=%2Fdashboard)
- [Forgot password](http://127.0.0.1:8096/forgot-password)
- [Dashboard](http://127.0.0.1:8096/dashboard)
- [Resources](http://127.0.0.1:8096/resources)
- [Service report template SEO page](http://127.0.0.1:8096/resources/hood-cleaning-service-report-template)
- [Terms](http://127.0.0.1:8096/terms)
- [Privacy](http://127.0.0.1:8096/privacy)
- [Refund policy](http://127.0.0.1:8096/refund-policy)
- [Saved company customer link - Cedar & 5th Grill](http://127.0.0.1:8096/p/server?reportId=2ebf30e7c3ab4db98b)
- [Saved company React PDF - Cedar & 5th Grill](http://127.0.0.1:8096/p/server?reportId=2ebf30e7c3ab4db98b&format=pdf)
- [Free report customer link - Free Trial Diner](http://127.0.0.1:8096/p/server?reportId=5f04fe0a92274b4d9e)
- [Free report React PDF - Free Trial Diner](http://127.0.0.1:8096/p/server?reportId=5f04fe0a92274b4d9e&format=pdf)
- [Photo report customer link - Photo Proof Bistro](http://127.0.0.1:8096/p/server?reportId=a0eb3d3820df46b7ba)
- [Photo report React PDF - Photo Proof Bistro](http://127.0.0.1:8096/p/server?reportId=a0eb3d3820df46b7ba&format=pdf)
- [Missing public report state](http://127.0.0.1:8096/p/server?reportId=missing-report-id)

## Persona Findings
- Hood cleaning owner: 제품 가치는 명확하다. “매 작업 후 식당에 보낼 기록 링크/PDF”는 $79/mo 설명이 가능하다. 다만 유료 로그인 후 무료 모드로 시작되는 경험은 바로 신뢰를 잃게 한다.
- Office/admin staff: 대시보드의 report history, next service, open item, resend text/email/PDF 액션은 실제 운영 업무에 맞다. 하지만 저장 리포트 재편집 시 데이터가 바뀌어 보이면 과거 기록 관리 도구로 쓰기 어렵다.
- Field technician: 모바일 툴 첫 화면은 읽을 수 있고 사진 업로드/역할 지정 가드레일은 안전하다. 그러나 role assignment 후 실제 고객/PDF에 사진 상태가 반영되지 않는 흐름은 현장 사용자의 입력 시간을 낭비하게 만든다.
- Restaurant manager: 고객 링크는 광고 페이지가 아니라 서비스 기록처럼 보인다. PDF 저장 버튼도 명확하다. 단, receipt confirmation 배너는 일부 식당/검사자에게 앱 CTA처럼 보일 수 있어 문서 느낌을 약간 흐린다.
- Inspector/landlord/insurance reviewer: React PDF는 보관용 문서 느낌이 강하고, 날짜/업체/현장/상태/next action이 잘 보인다. `No photos attached`가 실제 사진 업로드 기록과 충돌하면 제출 문서 신뢰가 깨진다.
- Founder/business reviewer: 콜드메일 후 3분 내 제품 이해는 가능하다. $79/mo 가격 방어도 어느 정도 된다. 결제 전에는 paid account auto-branding, saved report integrity, photo evidence integrity를 먼저 고쳐야 한다.

## Launch Blockers
- P1 - 유료 계정이 `/axis-1/tool`에서 무료 모드로 시작된다.
  - 재현 경로: 로그인 완료 -> [tool](http://127.0.0.1:8096/axis-1/tool) 접속.
  - 관찰: 화면 상단이 `FREE MODE`로 표시되고, 사용자가 직접 `COMPANY`를 눌러야 `Summit Fire Hood Cleaning` 정보가 적용된다. 증거: `references/axis1-launch-qa/screenshots/tool-logged-in-start.png`.
  - 왜 문제인지: $79/mo 결제 사용자가 가장 먼저 만드는 리포트가 무브랜딩/free output이 될 수 있다. 유료 가치의 핵심인 branding/history가 자동으로 체감되지 않는다.
  - 추천 수정: active company entitlement가 있으면 builder 기본 모드를 company로 설정하고, free/company 전환은 보조 옵션으로 낮춘다.
  - 심각도: P1.
- P1 - 저장 리포트 재편집 화면과 공개 링크 데이터가 다르게 보인다.
  - 재현 경로: Cedar & 5th Grill 리포트 생성 -> dashboard `EDIT` -> `/axis-1/tool?step=outputs&account=company&loadReport=2ebf30e7c3ab4db98b`.
  - 관찰: 공개 고객 링크는 `Duct / access`가 blocked/open item으로 보이는데, load/edit 화면에서는 `WRITTEN ONLY NOTES` 및 “apply to duct as blocked” 류의 배치 필요 문구가 보였다. 증거: `references/axis1-launch-qa/screenshots/tool-load-saved-report.png`, `references/axis1-launch-qa/evidence/tool-load-saved-report.json`.
  - 왜 문제인지: 운영 기록 제품에서 재사용/수정 시 상태가 흔들리면 고객에게 보낸 기록의 정합성을 믿을 수 없다.
  - 추천 수정: persisted report payload를 public rendering, dashboard row, edit/load state가 같은 source of truth로 해석하는지 테스트를 추가한다. blocked/not completed/condition statuses를 round-trip fixture로 고정한다.
  - 심각도: P1.
- P1 - 사진 포함 저장 리포트가 고객 링크/PDF에서 `No photos attached`로 표시된다.
  - 재현 경로: 로그인 company mode -> 사진 업로드 -> role 지정 -> Photo Proof Bistro 리포트 생성 -> [customer link](http://127.0.0.1:8096/p/server?reportId=a0eb3d3820df46b7ba) 및 [PDF](http://127.0.0.1:8096/p/server?reportId=a0eb3d3820df46b7ba&format=pdf) 확인.
  - 관찰: dashboard row는 `Company record / 1 photo`라고 표시한다. 고객 링크와 PDF는 `No photos attached`, `no condition photo is attached`, `This is a written service record`라고 표시한다. 증거: `references/axis1-launch-qa/screenshots/photo-company-complete-dashboard.png`, `references/axis1-launch-qa/screenshots/axis1-photo-actual-customer.png`, `references/axis1-launch-qa/screenshots/axis1-photo-actual-pdf.png`.
  - 왜 문제인지: 사진은 제품의 핵심 가치다. vendor가 사진을 넣었는데 고객 제출 문서가 “사진 없음”이라고 말하면 $79/mo 제품 신뢰가 크게 손상된다.
  - 추천 수정: upload -> role assignment -> report payload -> saved record -> public report/PDF까지 photo evidence 상태를 end-to-end로 검증한다. 불확실한 사진은 표시하지 않는 정책은 좋지만, confirmed photo와 dashboard photo count가 public/PDF와 일치해야 한다.
  - 심각도: P1.
- P1 - company output의 primary copy customer link 동작이 불안정하다.
  - 재현 경로: company report outputs -> `Copy customer link` 또는 `CONTINUE AND COPY`.
  - 관찰: free flow와 dashboard TEXT/EMAIL copy는 clipboard 갱신을 확인했지만, company output CTA는 in-app browser clipboard에 고객 링크가 들어오지 않았다. 증거: `references/axis1-launch-qa/screenshots/tool-company-after-continue-copy.png`, `references/axis1-launch-qa/evidence/tool-company-confirm-copy.json`.
  - 왜 문제인지: vendor의 핵심 행동은 링크를 복사해 식당에 보내는 것이다. 이 CTA가 실패하거나 성공 피드백이 애매하면 “보낼 수 있는 산출물”이라는 약속이 약해진다.
  - 추천 수정: copy action을 단일 함수로 통합하고 success/failure toast, visible fallback URL, retry button을 제공한다. browser clipboard 제한에서도 사용자가 링크를 볼 수 있어야 한다.
  - 심각도: P1.

## High Priority Fixes Before Payment Push
- Company profile 기본 phone이 `Customer phone` 같은 placeholder로 노출되는 상태를 제거한다. 빈 값이면 전화 CTA를 숨기거나 “Add company phone”을 vendor-only 화면에만 보여준다.
- Dashboard TEXT/EMAIL copy에서 긴 next step이 `ne...`처럼 잘린다. 이메일 copy는 반드시 전체 문장으로 보내야 한다. 증거: `references/axis1-launch-qa/evidence/dashboard-copy-buttons-visible.json`.
- `/axis-1/tool?step=outputs` 직접 접근/새로고침 시 작업 맥락이 사라지고 `Confirm result first`, `Add job basics` 상태로 돌아간다. 현장/사무실 사용자가 새로고침으로 work-in-progress를 잃을 수 있다.
- Dashboard의 `PREVIEW` 링크는 owner preview라서 `preview=1`이 붙는 것이 맞지만, customer-facing send link와 구분이 더 명확해야 한다.
- 사진 role assignment UI는 안전하지만 “역할 지정 완료 -> 고객 문서 반영”이 확실히 닫혀야 한다. 현재는 role 지정 후에도 written record/no photo copy가 남는다.
- Reset password의 invalid/reused token은 submit 후 명확히 실패하지만, GET 화면에서는 일단 새 비밀번호 폼이 보인다. 가능하면 페이지 진입 시 token validity를 확인해 바로 “invalid/expired” 상태를 보여준다.

## Product Trust Issues
- 현재 결론은 “돈을 낼 이유는 보이지만, 돈을 받기 직전의 record integrity polish가 부족하다”이다.
- 고객 링크/PDF는 꽤 조용하고 신뢰 가능하다. 그러나 receipt confirmation 배너는 restaurant manager에게는 유용할 수 있어도 inspector/landlord 관점에서는 앱 상호작용처럼 느껴질 수 있다. PDF 쪽에는 이런 앱 CTA가 없어 더 신뢰롭다.
- “SERVICE REPORT PDF / COMPANY”, “COMPANY VERSION”, “OUTPUTS READY” 같은 표현은 vendor UI에서는 괜찮지만 고객 전면에서는 최소화해야 한다. 고객 링크/PDF는 현재 대체로 안전하다.
- 무료 산출물 정책은 공격적으로 불쾌하지 않다. Free PDF는 watermarked/free 상태가 명확하고, company branding/history/PDF 보존의 유료 차이가 이해된다.
- `Company access is active for local testing`은 로컬 테스트에서는 유용하지만 프로덕션에서는 절대 보여서는 안 된다.

## UX/UI Issues
- 랜딩은 제품이 무엇인지 빠르게 이해된다. 너무 일반 SaaS처럼 보이지 않고, “restaurant-ready service report”가 첫 화면에서 잘 잡힌다.
- 샘플 페이지는 설득력이 있지만 H1이 데스크톱/모바일 모두 큰 편이고, 모바일에서 줄바꿈이 약간 둔탁하다.
- Dashboard는 카드 나열만은 아니며 summary counts, queues, table-style rows가 있다. 다만 모바일에서는 history row 액션이 빽빽해질 수 있다.
- 아이콘은 대부분 실제 아이콘처럼 보인다. 원형 안 텍스트식 촌스러운 심볼은 크게 보이지 않았다.
- React PDF는 문서답다. 흰 시트, compact metadata, report ID, service scope, next service, document control이 있어 inspector/insurance reviewer가 저장할 명분이 있다.
- PDF 화면 상단의 `Save as PDF` 버튼은 명확하다. 고객-facing PDF CTA가 `/api/axis1/assets/.../service-report.pdf`로 가지 않고 `/p/server?reportId=<id>&format=pdf`를 유지한다.
- 모바일 로그인은 폼이 첫 화면에 들어오며 hero가 방해하지 않는다.

## Copy/Positioning Issues
- 가장 강한 포지셔닝 문장: “Send a restaurant-ready service report after every hood cleaning job.” 이 문장은 유지할 가치가 높다.
- `proof link`, `packet`, `closeout`, `vendor` 같은 내부어가 고객 전면에 과하게 노출되지는 않았다. 과거 내부어는 많이 정리된 상태로 보인다.
- `Contact service team` tel CTA는 mailto보다 낫고 고객 전면에서 자연스럽다. phone 포맷은 실제 `tel:5125550148`로 동작한다.
- Pricing의 $79/mo는 company branding, retained links, clean PDF, history, follow-up reminders로 방어된다. 하지만 실제 유료 모드가 자동 적용되지 않는 UX 때문에 가격 방어가 약해진다.
- Optional design help는 별도 add-on으로 보이며 필수처럼 보이지 않는다.

## Flow-by-Flow QA
- A. 랜딩/마케팅 흐름: [Landing](http://127.0.0.1:8096/)에서 5초 내 제품이 이해된다. CTA는 free builder, sample, company reports로 자연스럽다. 모바일 첫 화면도 명확하다. 증거: `home-viewport.png`, `home-mobile.png`.
- B. 샘플/산출물 흐름: [Samples](http://127.0.0.1:8096/samples/axis-1)에서 샘플 customer link/PDF 진입이 가능하다. PDF는 웹페이지라기보다 retained service record에 가깝다. 큰 hero/card 느낌은 PDF보다 sample marketing page 쪽에만 남아 있다.
- C. 무로그인 무료 툴: [Tool](http://127.0.0.1:8096/axis-1/tool)에서 Free Trial Diner 리포트 생성, 링크 복사, 고객 링크, React PDF 확인 완료. Free output은 테스트/샘플 성격이 분명하고 지나치게 불쾌하지 않다.
- D. 로그인/회원가입: 잘못된 로그인은 `/login?auth=failed`로 명확한 오류를 보여준다. Google provider 미설정도 `/login?auth=google-missing`에서 신뢰 가능한 local fallback 메시지로 처리된다. Signup copy는 접근 가능한 이메일 필요성을 안내한다.
- E. 비밀번호 찾기/reset: 존재/비존재 이메일 모두 같은 응답을 준다. 로컬 로그 fallback에서 reset link를 확인했고 token으로 비밀번호 변경 후 로그인 성공했다. token reuse/bad token은 submit 후 invalid 상태가 된다.
- F. 유료/회사 계정 대시보드: `/dashboard`는 운영 대시보드처럼 느껴진다. reports/customers/due soon/open items, next service, receipt confirmation, text/email/preview/pdf/edit이 보인다. 단 copy text/email truncation은 고쳐야 한다.
- G. Company profile / Account: 회사명, phone, email, service area 저장 후 customer link/PDF에 반영됐다. phone CTA는 `tel:`로 연결된다. Accent color는 customer output 강조색 개념으로 보이지만 깊게 검증하지 못했다.
- H. 로그인 유저 툴 -> 저장 리포트 -> 대시보드: company mode 수동 선택 후 Cedar & 5th Grill 리포트 생성, customer/PDF/dashboard history 반영 확인. `Sample Restaurant Group` 같은 샘플 데이터가 실제 saved public report에 섞이지는 않았다. 재편집 round-trip은 불일치가 있다.
- I. Customer link 관점: 식당/관리자가 받은 링크로 볼 때 광고 페이지가 아니라 서비스 기록으로 보인다. 업체명, 식당명, service date, open item, next action, next service가 명확하다. 불필요한 앱 nav/결제 유도는 보이지 않는다.
- J. PDF 화면 관점: [React PDF](http://127.0.0.1:8096/p/server?reportId=2ebf30e7c3ab4db98b&format=pdf)는 고객 전면 PDF CTA 경로를 유지한다. `/api/axis1/assets/<id>/service-report.pdf`는 200 application/pdf 내부 asset/fallback으로만 확인했고, 고객 전면 CTA는 React service-record route다.
- K. Pricing / 결제: [Pricing](http://127.0.0.1:8096/pricing)은 $79/mo를 어느 정도 방어한다. Logged-out checkout 진입은 login/signup으로 보낸다. 로컬 active entitlement에서는 checkout 완료 대신 dashboard/company setup CTA가 보였다. Paddle/env 전체 결제 완료는 로컬 fallback 한계로 검증하지 못했다.
- L. Legal / trust: terms/privacy/refund policy가 footer에서 접근 가능하고 내용은 최소 신뢰 기준을 충족한다. Refund policy는 subscription 및 optional design help와 크게 충돌하지 않는다.
- M. 모바일 전체 QA: iPhone 크기에서 landing, sample, tool, customer link, PDF, login, dashboard를 확인했다. 좌우 스크롤/치명적 겹침은 보이지 않았다. Dashboard 모바일은 usable하지만 긴 history row 액션은 밀도가 높다.
- N. 기술/안정성: 주요 페이지에서 console error는 발견하지 못했다. 사진 PDF 경로에서 Playwright console warning 2개가 기록됐지만 error는 없었다. Missing report는 “Hosted service report link unavailable” 상태를 명확히 보여준다.
- O. SEO/콜드메일 보조 관점: resources/template 페이지는 얇은 키워드 페이지라기보다 실제 설명/FAQ/구조화 정보가 있다. Public report/PDF는 page-level `noindex,nofollow`가 있어 customer report가 SEO index 대상이 되지 않는 방향이다.

## Data/Backend/API Notes
- 서버: `http://127.0.0.1:8096`. 최초 서버가 죽어 있어 기존 Gradle 방식으로 재시작했다. `bootRun` 중 Next export/build와 Spring Boot 구동이 순차적으로 수행됐다.
- 테스트 실행: 브라우저 기반 QA를 중심으로 수행했다. 별도 Gradle test suite는 실행하지 않았다. Next build/export는 `bootRun` 과정에서 실행됐고 Gradle test와 병렬 실행하지 않았다.
- Worktree: 시작 시점부터 기존 수정/삭제/신규 파일이 많은 dirty 상태였다. QA 산출물 외 unrelated change는 revert하지 않았다.
- DB/storage: H2 file DB `./build/db/hood`, Flyway migrations validated/up to date.
- Auth/session: email/password signup, failed login, Google missing provider, logout/login, dashboard redirect를 확인했다. 세션이 있는 owner가 public URL을 열면 preview behavior가 섞일 수 있어 anonymous browser 확인을 병행했다.
- Password reset/email: 실제 외부 이메일은 local env 한계로 확인하지 못했다. local log fallback에 reset link가 출력됐고 그 링크로 reset 성공했다.
- Report storage: free report, company saved report, photo saved report가 생성됐다. Dashboard history 반영은 된다.
- Public report: 없는 reportId는 명확한 unavailable 상태다.
- PDF: customer-facing PDF CTA는 React route `/p/server?reportId=<id>&format=pdf`다. 백엔드 PdfBox asset URL은 내부/fallback으로만 확인했다.
- Data integrity: `Sample Restaurant Group`/샘플 데이터가 실제 saved customer report에 섞이는 현상은 발견하지 못했다. 대신 edit/load round-trip status mismatch와 photo evidence mismatch가 더 큰 문제로 발견됐다.

## Screenshots / Evidence
- Landing desktop: `C:\Development\Owner\hood\references\axis1-launch-qa\screenshots\home-viewport.png`
- Landing mobile: `C:\Development\Owner\hood\references\axis1-launch-qa\screenshots\home-mobile.png`
- Sample desktop/mobile: `samples-axis-1-viewport.png`, `samples-axis-1-mobile.png`
- Pricing desktop/mobile: `pricing-desktop.png`, `pricing-mobile.png`
- Login failure/signup/google: `auth-login-failure.png`, `auth-signup-tab.png`, `auth-google-result.png`
- Forgot/reset: `forgot-unknown-result.png`, `forgot-known-result.png`, `reset-token-success.png`, `reset-token-reuse.png`, `reset-invalid-token-message.png`
- Free tool/result: `free-tool-start.png`, `free-tool-outputs.png`, `freeCustomer.png`, `freePdf.png`
- Company profile: `dashboard-company-profile-filled.png`, `dashboard-company-profile-saved.png`
- Company saved report: `dashboard-after-relogin-receipt.png`, `anon-customer.png`, `anon-pdf.png`, `saved-customer.png`, `saved-pdf.png`
- Mobile public/PDF: `anon-customer-mobile-ready.png`, `anon-pdf-mobile.png`, `dashboard-mobile-after-history.png`
- Dashboard copy evidence: `dashboard-row-buttons-visible.png`, `dashboard-copy-text-after-scroll.png`, `dashboard-copy-email-after-scroll.png`, `references/axis1-launch-qa/evidence/dashboard-copy-buttons-visible.json`
- Edit/load mismatch: `tool-load-saved-report.png`, `references/axis1-launch-qa/evidence/tool-load-saved-report.json`
- Photo upload mismatch: `photo-company-complete-dashboard.png`, `axis1-photo-actual-customer.png`, `axis1-photo-actual-pdf.png`, `references/axis1-launch-qa/evidence/axis1-photo-actual-customer-snapshot-full.md`, `references/axis1-launch-qa/evidence/axis1-photo-actual-pdf-snapshot-full.md`
- Main evidence JSON: `page-baseline.json`, `mobile-baseline.json`, `free-tool-flow.json`, `saved-report-public-checks.json`, `photo-upload-playwright-complete.json`, `billing-checkout.json`, `reset-password-flow.json`

## Recommended Fix Plan
1. 런칭 차단:
   - Active paid/company account는 builder 기본 모드를 company로 시작하게 한다.
   - Saved report public/dashboard/edit round-trip 정합성 테스트를 만들고 blocked/condition/not completed 상태 복원을 고친다.
   - Photo evidence count/status를 dashboard, customer link, React PDF에서 일치시킨다.
   - Company output copy customer link CTA를 안정화하고 실패 시 visible URL fallback을 제공한다.
2. 결제 전 개선:
   - Placeholder phone/contact가 고객 전면에 노출되지 않게 한다.
   - Dashboard text/email copy truncation을 제거한다.
   - `/axis-1/tool?step=outputs` direct/reload state를 안전하게 처리한다.
   - Invalid reset token은 GET 단계에서 바로 실패 상태를 보여준다.
3. 콜드메일 전환율 개선:
   - Pricing에 “what $79 replaces”를 더 구체화한다: after-service text thread, PDF archive, inspection/landlord/insurance requests, next-service queue.
   - Sample page hero를 약간 낮추고 실제 report preview/link/PDF를 더 빨리 보이게 한다.
   - Customer report의 receipt confirmation CTA를 더 조용하게 만들거나 inspector-oriented PDF path를 더 전면화한다.
4. 후속 개선:
   - Dashboard mobile history action layout을 더 compact하고 scan-friendly하게 다듬는다.
   - Accent color 선택 후 customer link/PDF 적용 여부를 자동 visual preview로 보여준다.
   - Public report analytics/open tracking 설명을 vendor-only로 더 명확히 분리한다.

## Final Scorecard
- Vendor value clarity: 8/10
- Restaurant/customer trust: 7/10
- Dashboard operational usefulness: 7/10
- Tool ease of use: 6/10
- PDF/document credibility: 8/10
- Mobile readiness: 7/10
- Pricing confidence: 7/10
- Login/account reliability: 8/10
- Free-to-paid conversion clarity: 8/10
- Launch readiness: 7/10

최종 판단: 지금 제품은 “가능성 있음” 수준이 아니라, 핵심 가치는 이미 충분히 보인다. 그러나 $79/mo를 실제로 받으려면 기록 정합성과 유료 모드 기본 경험을 먼저 고쳐야 한다. 가장 ROI가 높은 수정은 유료 계정 builder 기본값, saved report round-trip, photo evidence integrity, copy link reliability 네 가지다.

## Product Work Addendum - 2026-05-19

다른 AI가 제시한 의견에 대해 내 판단은 대체로 동의였다. $79/mo 가치는 부족하지 않지만, 첫 사용자가 “사진 정리 리포트 빌더”로 오해하면 전환이 약해진다. 그래서 이번 수정은 기능 추가보다 첫 사용 mental model을 `Declare -> Package -> Send`로 바꾸는 데 집중했다.

### Implemented
- `/axis-1/tool`의 단계/내비게이션/첫 화면을 `Photos & notes -> Review -> Outputs`에서 `Declare job -> Package report -> Send report` 흐름으로 바꿨다.
- 첫 화면에 `What happened on this hood cleaning job?`와 job result 선택을 전면 배치했다. 사진 업로드는 `Optional proof`로 내려서 “사진부터 정리해야 한다”는 느낌을 줄였다.
- `Use normal closeout` 경로를 추가했고, 이 버튼은 no-photo written service record 확인까지 함께 처리한다. 사진 없이도 정상 작업 리포트를 바로 link/text/email/PDF로 보낼 수 있어야 한다는 기준을 맞췄다.
- 결과 화면 최상단 action bar에 `Copy customer text`, `Copy customer email`, `Copy customer link`, `Save service report PDF`를 나란히 노출했다.
- `copy text/email`도 free/company boundary modal을 통과하게 했고, 실제로 hosted report link를 저장한 뒤 고객에게 보낼 SMS/email body를 clipboard에 복사하도록 구현했다. `mailto:`는 추가하지 않았다.
- `/pricing`에 `First report setup` 섹션을 추가했다. “툴을 바로 배우기 싫으면 최근 작업 1건으로 첫 branded report를 같이 만든다”는 반수동 온보딩 경로를 명시했다.
- `/company-version`에서 checkout보다 `Set up my first report` CTA를 먼저 보이게 했다. Paddle checkout은 유지하되 초반 cold-email traffic에는 수동 세팅 CTA가 더 자연스럽게 보이도록 위계를 조정했다.
- 정적 export 회귀 테스트 `PublicSiteControllerTest`의 Axis 1 tool 기대 문구를 새 Declare 카피에 맞게 갱신했다.

### Verification After Product Work
- `npm run build` 통과.
- `npm run test:axis1` 통과: 3 files, 95 tests.
- `.\gradlew.bat --no-daemon test` 통과. Next build와 Gradle test는 병렬 실행하지 않았다.
- 브라우저 회귀 검증 통과:
  - Evidence JSON: `C:\Development\Owner\hood\references\axis1-launch-qa\evidence\product-work-pass-2026-05-19T07-49-02-609Z.json`
  - Screenshot dir: `C:\Development\Owner\hood\references\axis1-launch-qa\screenshots\product-work-pass-2026-05-19T07-49-02-609Z`
  - Generated customer link: [QA Smoke Bistro report](http://127.0.0.1:8097/p/server?reportId=2026eaade9ac4e1e92)
  - React PDF route: [QA Smoke Bistro React PDF](http://127.0.0.1:8097/p/server?reportId=2026eaade9ac4e1e92&format=pdf)
  - Console errors: 0
  - Failed requests: 0

### Updated Launch Judgment
- 출시 판단은 여전히 `Go with fixes`다. 단, 이번 수정으로 “첫 리포트 성공 경험”과 “사진 없이도 정상 리포트가 된다”는 부분은 크게 개선됐다.
- $79/mo는 받을 수 있다. 다만 초기 런칭은 완전 self-serve checkout보다 `first report setup`을 붙인 assisted onboarding으로 파는 편이 낫다.
- 아직 결제 전 최우선으로 남는 것은 기존 QA에서 발견한 저장 리포트 round-trip/photo evidence integrity/dashboard copy polish다. 이번 수정은 구매 전환의 첫 사용 난이도를 낮춘 것이고, 저장 기록의 장기 신뢰성 검증은 계속 P1이다.
