# Axis 1 Local Launch Simulation QA

Generated: 2026-05-15T04:59:36.440Z

Base URL: [http://127.0.0.1:8096](http://127.0.0.1:8096)

Admin account for local browser QA: admin@kitchenpermit.com

Local password: correct-horse-1

## Open First

- [Dashboard](http://127.0.0.1:8096/dashboard)
- [Company profile section](http://127.0.0.1:8096/dashboard#company-profile)
- [Report history section](http://127.0.0.1:8096/dashboard#report-history)

## Company Reports

| Report | Service date | Next service | State | Customer link | PDF screen | Builder |
| --- | --- | --- | --- | --- | --- | --- |
| Marigold Diner / Main cookline hood | 2026-02-15 | 2026-05-16 | record | [customer](http://127.0.0.1:8096/p/server?reportId=9e5d5f04aa714a0a8f) | [PDF](http://127.0.0.1:8096/p/server?reportId=9e5d5f04aa714a0a8f&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=9e5d5f04aa714a0a8f) |
| Canal Street Tacos / Tortilla line exhaust | 2026-02-02 | 2026-05-03 | open item | [customer](http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd) | [PDF](http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=67e4d189dc3b4fa5bd) |
| Northside Grill / Charbroiler hood line | 2026-04-23 | 2026-06-22 | record | [customer](http://127.0.0.1:8096/p/server?reportId=b708543a796c4110a6) | [PDF](http://127.0.0.1:8096/p/server?reportId=b708543a796c4110a6&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=b708543a796c4110a6) |
| Harbor Wok / High-volume wok line | 2026-04-29 | 2026-05-29 | record | [customer](http://127.0.0.1:8096/p/server?reportId=20fcc152496a44178d) | [PDF](http://127.0.0.1:8096/p/server?reportId=20fcc152496a44178d&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=20fcc152496a44178d) |
| Blue Line Pizza / Oven hood and make-line exhaust | 2026-05-08 | 2026-06-07 | record | [customer](http://127.0.0.1:8096/p/server?reportId=119b1986e45341ae87) | [PDF](http://127.0.0.1:8096/p/server?reportId=119b1986e45341ae87&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=119b1986e45341ae87) |
| Elm Market Kitchen / Market prep hood | 2026-03-14 | 2026-06-12 | record | [customer](http://127.0.0.1:8096/p/server?reportId=c31a06545e6648648b) | [PDF](http://127.0.0.1:8096/p/server?reportId=c31a06545e6648648b&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=c31a06545e6648648b) |
| Marigold Diner / Main cookline hood | 2025-11-17 | 2026-02-15 | record | [customer](http://127.0.0.1:8096/p/server?reportId=2a7b7514ee624a7d87) | [PDF](http://127.0.0.1:8096/p/server?reportId=2a7b7514ee624a7d87&format=pdf) | [builder](http://127.0.0.1:8096/axis-1/tool?step=outputs&account=company&loadReport=2a7b7514ee624a7d87) |

## Free Test Links

| Report | Expires | Customer link | PDF screen |
| --- | --- | --- | --- |
| Free Trial Bistro / Main hood test report | 2026-05-22T04:59:37.222034700Z | [customer](http://127.0.0.1:8096/p/server?reportId=a9f198aea39446e891) | [PDF](http://127.0.0.1:8096/p/server?reportId=a9f198aea39446e891&format=pdf) |
| Spoofed Brand Cafe / Cafe hood test report | 2026-05-22T04:59:37.361847300Z | [customer](http://127.0.0.1:8096/p/server?reportId=fd645ffb342046fc80) | [PDF](http://127.0.0.1:8096/p/server?reportId=fd645ffb342046fc80&format=pdf) |

## Gemini Photo Assist

- Mode: live
- Provider: gemini
- Model: gemini-2.5-flash
- Warning: none

- qa-phone-001 / IMG_7421.jpg: hood-before, confidence 0.85, review true. The image shows a hood area with significant grease accumulation, consistent with a 'before' cleaning state. The filename is generic and does not provide additional context.
- qa-phone-002 / IMG_7422.jpg: hood-after, confidence 0.92, review true. The image clearly shows a clean, reflective hood system with lights, consistent with an 'after' cleaning state. The filename is generic and does not provide additional context.
- qa-phone-003 / IMG_7423.jpg: none, confidence 0.3, review true. The image shows a hand dryer and an electrical outlet, which is not related to hood cleaning services. The filename is generic and does not provide additional context.
- qa-phone-004 / blocked_area_cleaned_questionmark.jpg: access-condition, confidence 0.75, review true. The image shows an interior duct or access point with heavy grease buildup, suggesting a 'before' condition or an access area that needs attention. The filename 'blocked_area_cleaned_questionmark.jpg' hints at an access condition and potential cleaning, but the visual content is the primary driver for the suggestion.

## Browser QA

| Page | Actionable console | All console warnings/errors | Horizontal overflow | Loaded images | Screenshot |
| --- | ---: | ---: | ---: | ---: | --- |
| dashboard-admin-history | 0 | 0 | 0px | 0/0 | [screenshot](screenshots/dashboard-admin-history.png) |
| builder-load-saved-report | 0 | 0 | 0px | 5/12 | [screenshot](screenshots/builder-load-saved-report.png) |
| fresh-builder-first-report | 0 | 2 | 0px | 0/0 | [screenshot](screenshots/fresh-builder-first-report.png) |
| company-customer-link-desktop | 0 | 2 | 0px | 8/9 | [screenshot](screenshots/company-customer-link-desktop.png) |
| company-service-record-pdf | 0 | 2 | 0px | 2/2 | [screenshot](screenshots/company-service-record-pdf.png) |
| free-customer-link-desktop | 0 | 2 | 0px | 4/4 | [screenshot](screenshots/free-customer-link-desktop.png) |
| company-customer-link-mobile | 0 | 0 | 0px | 5/9 | [screenshot](screenshots/company-customer-link-mobile.png) |

## Findings

- Critical blocker not found in this local simulation run.

## Detailed Prompt For Next QA Pass

다음 작업자는 C:\Development\Owner\hood에서 Axis 1 런칭 직전 실사용 QA를 이어서 수행한다.

반드시 먼저 references/axis1-core-skeleton-full-context-2026-05-13.md를 처음부터 끝까지 읽는다. 그 다음 현재 로컬 서버와 결과 문서 링크를 연다.

제품 기준:
- Axis 1은 hood cleaning service 업체가 식당/고객에게 보낼 수 있는 branded service report link/PDF를 만드는 제품이다.
- $79/월을 낼 회사 사용자가 원하는 것은 복잡한 도구가 아니라, 고객이 inspection, manager review, landlord/insurance/documentation 때 저장할 수 있는 믿을 만한 기록이다.
- 고객 전면에는 "proof link", "packet", "vendor", "closeout" 같은 내부어가 과하게 보이면 안 된다.
- invoice/payment link, mailto: 노출, 개발자스러운 링크는 실패로 본다.
- 무료는 no-login test link다. 회사명/로고/연락처/히스토리/지속 링크는 회사 버전의 이유여야 한다.
- 브랜드 색상은 앱 테마가 아니라 고객 링크/PDF의 업체 accent color로 보이는지 확인한다.
- 저장 리포트의 PDF CTA는 반드시 /p/server?reportId=<id>&format=pdf React service-record route여야 한다. 고객 전면에서 /api/axis1/assets/<id>/service-report.pdf를 누르게 만들면 회귀다.

실사용 시나리오:
1. admin@kitchenpermit.com으로 로그인해서 /dashboard를 연다.
2. 회사 프로필이 Kitchen Permit Hood Service로 보이고, 저장된 리포트 히스토리가 실제 고객/현장처럼 묶여 있는지 본다.
3. due soon, past due, open item, clean record, no-photo written record가 한눈에 식별되는지 본다.
4. 각 리포트의 Open customer link, PDF 화면, Edit report 링크를 연다.
5. 고객 링크는 웹페이지처럼 풍부해도 되지만, PDF 화면은 조용한 service record retained copy처럼 보여야 한다.
6. 무료 링크는 회사 브랜딩이 제거되고 7일 테스트 링크처럼 보여야 한다.
7. Gemini Photo Assist 결과는 사진을 정리만 하고, 서비스 완료를 판정하거나 compliance/inspection/certificate류 표현을 쓰면 안 된다.
8. 데스크톱과 모바일에서 텍스트 겹침, 가로 overflow, 깨진 이미지, 콘솔 에러, 샘플 데이터(Sample Restaurant Group / Austin, TX) 누수를 찾는다.

평가 질문:
- 식당 매니저가 이 링크를 저장하고 나중에 보여줘도 부끄럽지 않은가?
- 업체 사장이 이 대시보드를 보고 "내 고객 기록이 쌓인다"고 느끼는가?
- $79/월 회사 버전의 이유가 무료 테스트 링크와 명확히 갈리는가?
- PDF 화면이 웹 기능이 아니라 보관/제출 가능한 서비스 기록처럼 보이는가?
- 사진이 고객 기록에 도움이 되지만 업체에게 분류 노동을 강요하지 않는가?
- 링크와 PDF가 실제 운영에서 문자/이메일로 보낼 수 있는 톤인가?

작업 규칙:
- unrelated change는 revert하지 않는다.
- Next build와 Gradle test를 병렬로 돌리지 않는다.
- 수동 파일 수정은 apply_patch를 우선 사용한다.
- 결과는 references/axis1-launch-qa/local-sim-2026-05-14 아래에 남기고, 브라우저로 바로 열 수 있는 localhost 링크를 포함한다.
