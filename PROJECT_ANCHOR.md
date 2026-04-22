# Hood Project Anchor

## 0. 문서 목적
이 문서는 `hood` 새 프로젝트의 공식 앵커 문서다.

앞으로 이 프로젝트에서 만드는:

- 제품 정의 문서
- 스펙 문서
- IA 문서
- 데이터 수집 문서
- 아웃바운드 문서
- 코딩 작업

은 전부 이 문서를 기준으로 삼는다.

이 문서의 역할은 설명이 아니라 `결정 상태 고정`이다.

---

## 1. 한 줄 정의
`hood`는 상업용 주방 배기 관련 벤더에게

- 기존 고객용 커뮤니케이션 패킷
- 신규 영업용 리스트
- 그 리스트에 붙는 신규 영업용 first-touch packet

을 제공하는 `cold-email-first B2B product`다.

이 프로젝트는 식당 대상 서비스가 아니다.
직접 고객은 `후드 벤더`다.

---

## 2. Drift 금지 사실
아래는 현재 기준으로 흔들리면 안 되는 사실이다.

1. 이 프로젝트의 직접 고객은 식당이 아니라 `후드 벤더`다.
2. 이 프로젝트는 generic SEO info site가 아니다.
3. 이 프로젝트는 all-in-one field SaaS가 아니다.
4. `1축`과 `2축`은 메인/보조 관계가 아니라 `독립적인 메인 제품`이다.
5. `1축`은 기존 고객용 패킷이다.
6. `2축`은 영업용 리스트와 그 리스트에 쓰는 영업용 패킷이다.
7. `2축`에서 리스트가 메인 훅이고, 패킷은 conversion aid다.
8. 초기 전달 방식은 `dashboard-first`가 아니라 `email/push-first`다.
9. 초기 버전은 `로그인 없이` 간다.
10. 출력 형식은 `HTML canonical + PDF export`를 기본으로 본다.
11. 프런트보다 `리스트 품질, 데이터 품질, 패킷 완성도`가 더 중요하다.
12. 이 프로젝트는 테스트용이 아니라 `실제 수익용`으로 설계한다.
13. `Austin`은 시작 도시로는 좋지만, `Austin-only`는 수익형 볼륨 엔진으로 부족하다.
14. 따라서 시장 범위는 `Texas multi-metro`로 확장 가능한 구조를 기본으로 잡는다.
15. `2축`의 판매 단위는 raw source row가 아니라 `dedupe된 canonical opportunity`다.
16. `2축 first` 아웃바운드는 `활성 coverage metro`와 겹치는 벤더에게만 기본값으로 쓸 수 있다.
17. 이 프로젝트는 기존 저장소 위 확장이 아니라 `새 프로젝트`로 시작한다.
18. `2.5축`과 `3축`은 전체 세계관에는 존재하지만, 현재 MVP의 직접 구현축은 아니다.
19. `2.5축`은 나중에 `리드를 받을 권리 / 슬롯 / 독점권`을 파는 future layer다.
20. `3축`은 선택된 2축 세그먼트를 시간차를 두고 B2C로 회수하는 future layer다.

---

## 3. 제품 논지
후드 시장에서 돈이 나는 지점은 단순 후드 청소 설명이 아니다.

실제로 돈이 되는 것은 아래 두 가지다.

1. 벤더가 기존 고객에게 반복적으로 설명해야 하는 작업 후 커뮤니케이션
2. 벤더가 신규 고객을 잡기 위해 반복적으로 필요한 영업 리스트와 첫 접촉 자료

즉 이 프로젝트의 핵심은:

`고객 커뮤니케이션 + 신규 영업 지원 + 리스트 기반 아웃바운드`

다.

이 프로젝트는 "후드가 왜 중요한가"를 길게 설명하는 사이트가 아니라,
벤더가 바로 써먹을 수 있는 제품을 만드는 프로젝트다.

---

## 4. 왜 이 시장이 괜찮은가

### 4.1 1축이 강한 이유
후드 벤더는 기존 고객에게 계속 아래를 설명해야 한다.

- 이번에 무엇을 했는가
- 어디까지 작업했는가
- 무엇이 남았는가
- 어떤 문제가 보였는가
- 다음에는 언제 다시 해야 하는가

이 설명은 신뢰, 재예약, 추가 작업 수용성에 직결된다.
즉 1축은 단순 보고서가 아니라 `재매출 장치`다.

### 4.2 2축이 강한 이유
후드 벤더의 신규 영업은 완전한 random cold outreach보다

- remodel
- finish-out
- change of use
- opening

같은 트리거가 있을 때 훨씬 명분이 선명해진다.

즉 2축은 "무작정 영업"이 아니라
`신호가 있는 영업`이다.

---

## 5. 시장 범위와 볼륨 원칙

### 5.1 Austin에 대한 현재 판단
`Austin-first`는 맞다.
하지만 `Austin-only`는 아니다.

Austin은:

- 첫 데이터 소스 검증
- 첫 샘플 생성
- 첫 fulfillment
- 첫 제품 데모

에는 적합하다.

하지만 수익형으로 `40/day` 수준의 아웃바운드를 돌릴 sole market으로 잠그면 공급이 빨리 얇아진다.

### 5.2 현재 기본 지리 전략
현재 기본 전략은 아래다.

- `Austin` = 첫 소스/데모/검증 도시
- `Austin metro + San Antonio + DFW` = 초기 벤더 아웃바운드 시장
- `Houston` = 소스 QA 통과 후 확장 후보

즉 후드는 `Texas multi-metro` 구조를 기본 운영 단위로 본다.

### 5.3 40/day 원칙
하루 40건 수준의 아웃바운드를 수익 목적으로 돌리려면:

- Austin 한 도시만으로는 안 된다
- follow-up이 포함된 운영이어야 한다
- fresh send는 다도시 풀에서 공급받아야 한다
- 좋은 벤더 풀을 태우지 않기 위해 segmentation과 sequencing이 필요하다

이 프로젝트는 볼륨을 `같은 도시에서 더 짜내는 방식`이 아니라
`도시 범위를 넓혀 품질을 유지하는 방식`으로 키운다.

---

## 6. 2축 타겟 원칙
2축은 아이디어 우선이 아니라 `소스 우선`이다.

즉 "신규 오픈이 멋져 보여서"가 아니라,
실제로 검증 가능한 데이터 소스가 있고
freshness와 trigger validity를 유지할 수 있는 타겟이 메인이 된다.

현재 기준 기본 판단은 아래다.

- 수집 범위는 `opening + remodel` 둘 다 연다
- 초기 commercial angle은 `remodel-first`로 간다
- opening은 보조 풀로 유지한다

이 판단의 이유:

- remodel 쪽이 volume이 더 많다
- hood relevance가 더 직접적이다
- buyer authority가 더 선명하다
- urgency가 더 실무적이다

---

## 7. 1차 ICP
현재 1차 타겟 벤더는 아래다.

- 로컬 또는 준로컬 중심
- owner-led 또는 small-office-led
- 기존 고객 커뮤니케이션 체계가 약함
- 고객 포털/문서 자동화가 약함
- 신규 영업도 필요하지만 대형 엔터프라이즈 세일즈 조직은 아님

### 제외 우선순위
- 전국 대형 프랜차이즈형 브랜드
- 이미 포털/보고 체계가 강한 대형 사업자
- 식당 대상이 아니라 institution-only 비중이 너무 높은 사업자
- owner contact가 약하고 generic intake만 있는 사업자

---

## 8. 제품 구조

### 8.1 1축
`1축 = 기존 고객용 패킷`

현재 메인 정의:

`Service Completion Brief`

이 제품은 작업 후 고객에게 보내는 외부 커뮤니케이션 패킷이다.

### 8.2 2축
`2축 = 영업용 리스트 + 신규 영업용 first-touch packet`

현재 메인 정의:

`Opening / Remodel First-Touch Packet`

중요한 점:

- 2축은 패킷 단품이 아니다
- 2축은 본질적으로 `리스트 + 패킷` 묶음이다
- 리스트가 주인공이고 패킷은 리스트를 실제 영업으로 바꾸는 도구다

### 8.3 2.5축
`2.5축 = 리드를 받을 권리 / 슬롯 / 독점권`

현재 정의:

- Axis 2가 충분히 검증된 뒤 여는 future commercial layer
- "연락할 리스트"가 아니라 "우선권 또는 독점권"을 파는 구조
- 현재 MVP의 직접 판매축은 아님

### 8.4 3축
`3축 = 2축 세그먼트를 시간차를 두고 B2C 유입으로 재활용하는 구조`

현재 정의:

- 별도 도메인에서 운영하는 future recovery layer
- 초기에는 `보조 채널 + 신뢰 보강 + 장기 복리 채널`
- 현재 MVP의 주 수익 엔진은 아님

### 8.5 관계
1축과 2축은 연결될 수는 있지만
제품 정의와 판매 흐름은 독립적으로 본다.

즉:

- 1축이 잘 팔린다고 2축이 자동으로 성립하지 않는다
- 2축이 잘 팔린다고 1축이 자동으로 완성되지 않는다
- 현재 직접 구현 메인은 `1축 + 2축`이다
- `2.5축 + 3축`은 future layer로 정의만 잠그고, MVP 범위는 넓히지 않는다

---

## 9. 1축 제품급 요구사항
1축은 예쁜 PDF가 아니라 `proof of work + trust + rebook engine`이어야 한다.

최소 포함 요소:

- 업장명, 주소, 담당자, 서비스 일시
- 작업자 또는 작업팀 식별
- 이번 방문에서 실제 수행한 scope
- before/after evidence
- cleaned / not cleaned / inaccessible 구분
- 관찰사항
- deficiency 또는 follow-up recommendation
- urgency 또는 severity 레벨
- 다음 권장 서비스 시점
- 재예약 또는 문의 CTA
- 벤더 브랜딩
- 연락처

추가 원칙:

- 고객용 표현은 technician raw note를 그대로 복붙하지 않는다
- 외부용 brief와 내부용 기록은 분리 가능해야 한다
- 벤더가 실제로 "이제 고객에게 이걸 보낼 수 있다"라고 느껴야 한다

1축 MVP는 문서 수준이 아니라 `제품급`이어야 한다.

---

## 10. 2축 제품급 요구사항
2축은 CSV 판매가 아니다.
`sales enablement dossier`여야 한다.

### 10.1 영업 리스트 최소 필드
- business name
- address
- city
- trigger type
- trigger date
- source
- source link
- why this is hood-relevant
- opening/remodel/change-of-use classification
- freshness
- contact ladder
- contact confidence
- fit note
- exclusion/risk note

### 10.2 first-touch packet 최소 목적
패킷은 아래를 해결해야 한다.

1. 왜 이 업장에 연락하는지
2. 왜 지금이 타이밍인지
3. 벤더가 어떤 식으로 접근하면 되는지
4. 첫 서비스 또는 첫 점검 대화를 어떻게 열지
5. 식당 입장에서 받아들일 만한 명분이 무엇인지

### 10.3 2축 QA 원칙
리스트 품질 기준은 아래 네 가지다.

- freshness
- trigger validity
- contactability
- food-service certainty

초기 판매용 리스트는 `14일 freshness`를 강하게 본다.

---

## 11. 샘플, 데모, 잠금 원칙

### 11.1 샘플 공개 원칙
무료 샘플에서는 아래 정도만 보여준다.

- business name
- city
- trigger type
- trigger date
- 짧은 signal note

숨기는 항목:

- 직접 usable contact route
- 너무 구체적인 actionable details
- personalization 완성본

### 11.2 데모 원칙
- HTML preview 공개 가능
- PDF export 제공 가능
- watermark 또는 demo mark 유지
- free version에서 완전한 vendor branding 삽입은 막는다

---

## 12. 전달 방식
초기 전달은 `email-first`가 맞다.

원칙:

- 로그인 없이 전달 가능해야 한다
- 받은 즉시 쓸 수 있어야 한다
- dashboard는 나중 문제다

사이트의 역할은:

- 제품 설명
- 샘플 제시
- 가격 감각 제시
- 전환 CTA

전달의 역할은:

- 실제 사용성
- 즉시성
- 매출 전환

---

## 13. 가격 및 판매 구조
현재 기준 가격 철학은 아래다.

- 2축은 저가 batch로 문을 연다
- 패킷 setup으로 객단가를 올린다
- 반복 구매가 생기면 subscription으로 넘어간다

현재 가격은 `시작가 공개` 방식이 맞다.

즉:

- 패킷 단품: starting at
- 번들: starting at
- batch: starting at

정교한 최종 가격표는 후속 운영 데이터로 보정한다.

현재 문서 가안은 유지하되,
라이브 전환 데이터를 보고 보정 가능하게 둔다.

---

## 14. 포맷과 기술 기본값
현재 기본값:

- 새 프로젝트로 시작
- HTML canonical
- PDF export 지원
- no login
- backend 우선
- list quality 우선
- packet generation 우선
- UI polish는 후순위

이 프로젝트의 초반 기술 목적은
`보여주는 사이트`보다 `팔 수 있는 산출물`을 만드는 것이다.

---

## 15. 현재 기본값으로 잠근 운영 결정
아래는 현재 기준으로 기본값이 잠긴 운영 결정이다.

1. Axis 2 데이터 활성화 순서는 `Austin -> San Antonio -> DFW -> Houston`이다.
2. Houston은 상업적으로는 중요하지만, Axis 2는 `2차 활성화`로 둔다.
3. `40/day` 운영은 `총 send` 기준으로 보며, 기본값은 `16 new / 24 follow-up`이다.
4. 새로운 vendor outbound의 기본 오퍼 가중치는 `Axis 2 first 65% / Axis 1 first 35%`다.
   - 단, 이 가중치는 `활성 Axis 2 coverage metro`와 서비스 지역이 겹치는 벤더에게만 적용한다.
   - coverage가 겹치지 않으면 기본값은 `Axis 1 first`다.
5. 1축 내부용 deficiency layer는 MVP에서 `독립 SKU로 팔지 않는다`.
6. 2축 paid batch의 기본 판매 단위는 `10 dedupe된 live opportunities`다.
7. 공개 가격은 `starting at` 방식으로 노출한다.
8. 현재 공개 starting price 기본값은 아래다.
   - Axis 1 setup: `$149`
   - Axis 2 first-touch packet setup: `$149`
   - Axis 1 + Axis 2 bundle: `$259`
   - Axis 2 paid batch of 10 live prospects: `$149`

즉 현재는 "큰 방향만 맞다" 수준이 아니라,
MVP를 설계하고 팔기 위한 기본 숫자와 기본 계층까지 잠겼다.

---

## 16. 다음 문서 체계
이 앵커 다음으로 바로 필요한 문서는 아래 순서다.

1. `spec/00_strategy.md`
2. `spec/01_domain_model_and_entities.md`
3. `spec/02_data_sources_and_scoring.md`
4. `spec/03_axis1_service_completion_brief.md`
5. `spec/04_axis2_sales_list_and_first_touch_packet.md`
6. `spec/05_outbound_and_delivery_model.md`
7. `spec/06_acceptance_matrix.md`
8. `spec/07_technical_stack.md`
9. `spec/08_design_direction.md`
10. `spec/09_ui_system_and_page_skeleton.md`
11. `spec/10_implementation_plan.md`
12. `spec/11_vendor_prospect_list_and_outbound_sourcing.md`

즉 이 문서는 시작점이고,
상세 설계는 이후 분할 스펙 세트로 이어진다.

---

## 17. 결론
`hood`는 후드 청소 정보 사이트가 아니다.

이 프로젝트는:

- 후드 벤더가 기존 고객에게 보내는 작업 후 패킷
- 후드 벤더가 신규 영업에 쓰는 영업 리스트와 영업 패킷

을 제품급으로 만들어 파는 B2B 프로젝트다.

현재 기준으로 가장 중요한 전략 판단은 세 가지다.

1. `1축`과 `2축`을 둘 다 메인으로 본다
2. `Austin-first`는 맞지만 `Austin-only`는 아니다
3. 수익을 내려면 `Texas multi-metro` 구조로 가야 한다
