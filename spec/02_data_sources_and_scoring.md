# 02 Data Sources and Scoring

## 1. Source strategy
Axis 2 is source-first.

That means the product does not decide the target by taste alone.
It activates targets only where the source stack can support:

- usable freshness
- clear trigger meaning
- hood relevance
- repeatable extraction

---

## 2. Activation policy by metro

## 2.1 Austin
`Active for MVP`

Why:

- strong public permit data
- food establishment and inspection context exists
- enough volume to prove the system
- best current starting city for source validation

Primary source surfaces:

- [Austin permits dataset](https://data.austintexas.gov/Building-and-Development/Construction-Permits-Issued-since-2010/d792-2sc3/about)
- [Austin Fixed Food Establishments](https://www.austintexas.gov/health/programs/fixed-food-establishments)
- [Austin food inspection data](https://data.austintexas.gov/Health-and-Community-Services/Food-Establishment-Inspection-Scores/ecmv-9xxi)
- [Austin Commercial Plan Review](https://www.austintexas.gov/development-services/commercial-plan-review)

## 2.2 San Antonio
`P1 expansion target`

Why:

- relevant food licensing surface exists
- building permit reporting surface exists
- strong secondary Texas metro for vendor sales and signal expansion

Primary source surfaces:

- [San Antonio food establishment license](https://www.sa.gov/Directory/Departments/SAMHD/Licenses-Food-Permits/Food-Establishment-License)
- [San Antonio food inspections](https://www.sa.gov/Directory/Departments/SAMHD/Licenses-Food-Permits/Food-Establishment-Inspections)
- [San Antonio permit reports](https://www.sanantonio.gov/DSD/Resources/Reports)

## 2.3 DFW
`P1 expansion target`

Why:

- large vendor market
- large restaurant base
- commercial permit and food permit workflow surfaces exist

Primary source surfaces:

- [Dallas food establishment page](https://dallascityhall.com/departments/codecompliance/consumer-health/Pages/food-establishment.aspx)
- [Dallas commercial permits overview](https://dallas.gov/departments/sustainabledevelopment/buildinginspection/Pages/commercial_overview.aspx)
- [Dallas permits and inspections data surface](https://dallas.gov/departments/sustainabledevelopment/Pages/permits-inspections.aspx)

## 2.4 Houston
`Deferred for Axis 2 until explicit QA pass`

Why:

- commercially important
- but weaker current confidence in a smooth structured signal pipeline for MVP

Primary reference surfaces:

- [Houston opening food establishment](https://www.houstonconsumer.org/services/permits/food-permits/opening-food-establishment)
- [Houston food dealer permit](https://www.houstonpermittingcenter.org/hhd1003)

Locked rule:
Do not market Houston as a live Axis 2 coverage metro until the source pass is complete.

---

## 3. Source families

### 3.1 Primary sources
- official commercial permits
- official plan review or permit issuance records
- official food establishment license or inspection records

### 3.2 Secondary sources
- official certificate of occupancy or change-of-use records
- official inspection schedules or reports
- official public records portals

### 3.3 Supporting sources
- vendor website contact pages
- business websites for direct contact discovery
- official maps or parcel context

### 3.4 Non-authoritative but useful support
- business directories
- local news about openings
- review platforms

Locked rule:
Secondary and supporting sources can enrich.
They cannot replace primary trigger validation for paid Axis 2 batches.

---

## 4. Signal model

## 4.1 Preferred trigger classes
1. remodel of existing restaurant
2. finish-out for restaurant use
3. change of use to restaurant or bar
4. opening-related food-service activation
5. hood-relevant kitchen equipment or grease-system change

## 4.2 Default commercial angle
`remodel-first`

Locked rule:
- collect both `opening` and `remodel`
- sell with `remodel-first`
- use opening as secondary supply

---

## 5. Signal normalization and dedupe

## 5.1 Core rule
A raw source row is not automatically a sellable opportunity.

The commercial unit for Axis 2 is a deduped `OpportunityProject`.

## 5.2 Why this is required
Permit and public-record systems often emit multiple rows for the same real-world project:

- revision records
- trade-level records
- linked permits
- repeated updates

If these are sold as separate rows, the paid batch can contain fake diversity.

## 5.3 Dedupe rules
Raw signals should be clustered into one `OpportunityProject` using a combination of:

- normalized business name
- normalized address
- source linkage
- trigger date proximity
- same-project scope language when present

## 5.4 Batch unit rule
Batch eligibility is decided at the `OpportunityProject` level.

Locked rules:

- one paid batch row = one canonical opportunity project
- the same project cannot appear twice in one batch
- supporting raw signals can be used as evidence, but not as separate paid rows

---

## 6. Scoring dimensions

## 6.1 Weighted score
Each candidate signal gets a weighted score out of 100.

Locked weights:

- `freshness_score`: 30
- `hood_relevance_score`: 25
- `food_service_certainty_score`: 20
- `buyer_authority_score`: 15
- `contactability_score`: 10

## 6.2 Freshness score
Goal:
reward signals that still feel live.

Default rubric:

- 0-7 days = 100
- 8-14 days = 85
- 15-21 days = 55
- 22-30 days = 25
- over 30 days = 0

Locked rule:
Initial paid batches target `14 days or newer`.

## 6.3 Hood relevance score
Measures how likely the signal is to matter to a hood vendor.

High indicators:

- restaurant remodel
- kitchen renovation
- vent hood
- grease trap or grease interceptor
- fryer addition
- cook line reconfiguration
- bar with food service build-out

Low indicators:

- generic retail
- landlord-only shell work
- office renovation with weak food evidence

## 6.4 Food-service certainty score
Measures whether this really maps to a food-service operator.

High indicators:

- explicit restaurant mention
- cafe, bakery, bar with food, deli, kitchen
- food establishment permit linkage

Low indicators:

- event permit noise
- vague commercial construction with no food evidence
- institutional or warehouse records without an operator-level use case

## 6.5 Buyer authority score
Measures whether the likely buyer is reachable and operationally relevant.

High indicators:

- existing operator remodel
- change of use where the tenant/operator is visible
- direct business website or owner path exists

Low indicators:

- landlord-only shell
- GC-only record with no operator trace
- corporate chain with no usable local decision path

## 6.6 Contactability score
Measures whether a usable first route exists.

High indicators:

- direct owner or operations email
- role-specific contact
- strong generic business contact plus strong website

Low indicators:

- no usable route
- only landlord or permit filer
- dead website or missing business surface

---

## 7. Hard exclusion rules
Exclude from paid batch eligibility when any of the following is true:

1. food-service certainty is too weak
2. likely buyer is franchise or corporate-controlled with weak local authority
3. the record points mainly to GC, landlord, or non-operator parties
4. freshness exceeds 14 days for initial-sales inventory
5. the trigger is generic contractor or generic commercial noise
6. the site looks institutional or non-core for MVP
7. the record cannot be reasonably tied to hood-relevant work

---

## 8. Batch eligibility thresholds

### 8.1 Candidate status
Any parsed signal can be stored as a candidate.

### 8.2 Batch-eligible status
To become `batch_eligible`, an `OpportunityProject` must satisfy:

- `food_service_certainty_score >= 60`
- `hood_relevance_score >= 60`
- `freshness_score >= 85` for standard trial batches
- `final_score >= 70`

### 8.3 Duplicate suppression rule
A batch-eligible project must also satisfy:

- it is deduped into one canonical project row
- it does not duplicate another included project in the same batch

### 8.4 Premium-eligible status
Reserved for later expansion.
Not needed for MVP.

---

## 9. Manual enrichment policy

### 9.1 Allowed enrichments
- business website
- contact page
- public email
- public phone
- category clarification
- operator verification

### 9.2 Disallowed assumptions
- inventing buyer intent
- inventing operator ownership
- inventing direct contact where none exists

### 9.3 Locked human-review rule
Every paid 10-lead batch must be human-reviewed before delivery in MVP.

The review must confirm:

- canonical project dedupe
- source validity
- trigger validity
- usable contact path

---

## 10. Vendor-side data acquisition
Vendor prospecting uses a different source family than Axis 2.

Primary vendor discovery inputs:

- official city reference lists where available
- vendor websites
- metro-specific hood service pages
- public service-area pages

Locked rule:
Vendor list quality is judged by:

- local fit
- ownership path
- documentation weakness
- actual service-area clarity

not by raw vendor count.
