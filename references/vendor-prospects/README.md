# Vendor Prospect Seed Files

These files are operator-facing sourcing assets for the MVP vendor prospect engine.

- `vendor-sourcing-playbook.md`: research-backed guidance for finding high-fit hood vendors through approval lists, Maps, directories, social profiles, and official-site verification.
- `email-first-source-expansion.md`: operating routine for expanding discovery with an email-first bias using approved lists, directories, Maps-backed verification, and official-site email recovery.
- `discovery\email-first-source-expansion-queue-001.tsv`: prioritized metro/source queue for the next discovery passes, biased toward public-email recovery before social or DM fallback.
- `..\..\scripts\audit-vendor-prospect-batches.ps1`: local audit helper for batch counts, duplicate detection, suspicious TSV rows, and cross-lane collisions before locking a new batch.
- `..\..\scripts\validate-vendor-prospect-batch.ps1`: incremental validator for one new batch file. Use this first so already-locked batches are not re-validated every time.

Recommended locking flow:

1. Run `..\..\scripts\validate-vendor-prospect-batch.ps1 -BatchFile <new-batch.tsv>` to catch duplicate URLs, duplicate names, cross-lane collisions, and TSV column shifts against the already locked pool.
2. Run the targeted batch import test for the new batch only.
3. Run `..\..\scripts\audit-vendor-prospect-batches.ps1` after the batch is locked to confirm the global inventory is still clean.
4. Run the full Gradle suite only when the sourcing engine, scoring rules, or import behavior changed.

- `texas-mvp-send-ready.tsv`: public email found, traceable source URL present, and ready to paste into `/ops/outbound/prospects/import`.
- `us-expansion-send-ready-batch-001.tsv`: first national expansion batch for the one-month new-vendor launch. These rows have public email/contact route, source URL, explicit primary metro, and should import as Axis 1-first.
- `us-expansion-send-ready-batch-002.tsv`: second expansion batch sourced from additional metros and multiple public source paths, with verified email/contact route and explicit primary metro.
- `us-expansion-send-ready-batch-003.tsv`: third expansion batch sourced across Southwest, Midwest, Northeast, and Southeast metros with official-site email/contact routes and explicit metros.
- `us-expansion-send-ready-batch-004.tsv`: fourth expansion batch sourced across Midwest, Mountain, Southeast, Pacific Northwest, and Florida metros with official-site email/contact routes and explicit metros.
- `us-expansion-send-ready-batch-005.tsv`: fifth expansion batch sourced from home, service, contact, and local metro landing pages across repeat metros and new metros, with verified public email/contact route and explicit primary metro.
- `us-expansion-send-ready-batch-006.tsv`: sixth expansion batch sourced across Mid-Atlantic, Midwest, Northeast, Southeast, Southwest, and Southern California using verified service, contact, and city pages with public email/contact routes.
- `us-expansion-send-ready-batch-007.tsv`: seventh expansion batch sourced from official home, contact, service, and location pages across Midwest, Northeast, Southeast, Mountain, Pacific Northwest, and Southern California metros.
- `us-expansion-send-ready-batch-008.tsv`: eighth expansion batch sourced from official home, contact, service, and verified listing pages across Pacific Northwest, Mountain, Midwest, Mid-Atlantic, Southeast, and South Florida metros.
- `us-expansion-send-ready-batch-009.tsv`: ninth expansion batch sourced from official sites, FDNY approved-contractor PDFs, and verified public business listings across Northeast, Mountain, Southeast, Southwest, and Southern California metros.
- `us-expansion-send-ready-batch-010.tsv`: tenth expansion batch sourced from official sites, about.me pages, public business listings, and industry contact pages across Florida, Midwest, Mountain, Pacific, Northeast, and Mid-Atlantic metros.
- `us-expansion-send-ready-batch-011.tsv`: eleventh expansion batch sourced from official sites, about.me pages, TrustedPros, EZlocal, Brownbook, and Nextdoor across Sunbelt, Midwest, Northeast, Southeast, and Mid-Atlantic metros.
- `us-expansion-send-ready-batch-012.tsv`: twelfth expansion batch sourced from official home, hood-service, contact, and regional operator pages across Mountain West, Midwest, Southeast, Mid-Atlantic, and national expansion metros.
- `us-expansion-send-ready-batch-013.tsv`: thirteenth expansion batch sourced from official sites, service pages, StartUs listings, and public operator directories across Mountain West, Northeast, Southeast, Midwest, Mid-Atlantic, and Sunbelt metros.
- `us-expansion-send-ready-batch-014.tsv`: fourteenth expansion batch sourced from official home, contact, hood-service, and operator profile pages across Southeast, Mid-South, Gulf Coast, and Mid-Atlantic metros with a quality bias toward direct inboxes and explicit local coverage.
- `us-expansion-send-ready-batch-015.tsv`: fifteenth expansion batch sourced from official contact, service, site-builder, and direct operator pages across Northeast, Midwest, Mid-Atlantic, Mountain, Southeast, Southern California, and Florida Panhandle metros, with false-positive enterprise filtering tightened for legal-name edge cases.
- `us-expansion-send-ready-batch-016.tsv`: sixteenth expansion batch sourced from official home, contact, hood-service, and mixed hood-install/hood-cleaning pages across Mountain West, Gulf Coast, Mid-Atlantic, Midwest, Northeast, South, Southwest, and Hawaii with a bias toward direct public inboxes.
- `us-expansion-send-ready-batch-017.tsv`: seventeenth expansion batch sourced from official hood-service, restaurant-cleaning, and ventilation pages plus one public contact listing across New York, Tri-State, Front Range, Los Angeles, Eastern North Carolina, and Western New York metros.
- `us-expansion-send-ready-batch-018.tsv`: eighteenth expansion batch sourced from official home, contact, service, and hood-cleaning pages across Southern California, Southwest Florida, Bay Area, Front Range, Midwest, DMV, Southeast, Shenandoah Valley, Iowa, and Wisconsin metros with a bias toward direct public inboxes and explicit metro coverage.
- `us-expansion-send-ready-batch-019.tsv`: nineteenth expansion batch sourced from official contact, home, and about pages across Kansas, Virginia, Philadelphia, DMV, Michigan, Central Virginia, Gulf South, and Washington metro operators with a bias toward direct public inboxes and explicit local hood-service evidence.
- `us-expansion-send-ready-batch-020.tsv`: twentieth expansion batch sourced with a local-small-operator bias from official home, contact, about, and kitchen-exhaust pages across Hudson Valley, Eastern North Carolina, Asheville, Ozarks, Western Massachusetts, South Carolina, Northern California, South Florida, Central Coast California, and Tri-State operators.
- `us-expansion-send-ready-batch-021.tsv`: twenty-first expansion batch sourced from official home, terms, and direct operator pages across Rochester, North Alabama, and Central Kentucky with a family-owned/local-operator bias and verified public inboxes.
- `us-expansion-send-ready-batch-022.tsv`: twenty-second expansion batch sourced from official direct operator pages across Denver metro, Florida Panhandle, and Colorado with a local-SMB bias and verified public inboxes.
- `us-expansion-send-ready-batch-023.tsv`: twenty-third expansion batch sourced from official direct operator pages across western New York, Arizona, Utah, Washington, Tennessee, and Georgia with a local-SMB bias and vetted parallel-agent discoveries.
- `us-expansion-send-ready-batch-024.tsv`: twenty-fourth expansion batch sourced from official direct operator pages across the DMV, Alabama, and North Mississippi with a bias toward verified public inboxes and explicit hood/exhaust service coverage.
- `us-expansion-send-ready-batch-025.tsv`: twenty-fifth expansion batch sourced from official direct operator pages across Wisconsin, Virginia, New Jersey, Tennessee, Louisiana, South Carolina, and Nevada with a bias toward local operators and verified public inboxes.
- `us-expansion-send-ready-batch-026.tsv`: twenty-sixth expansion batch sourced from official contact pages across the Kansas City metro and Gallatin Valley with a bias toward family-run local operators and direct public inboxes.
- `us-expansion-send-ready-batch-027.tsv`: twenty-seventh expansion batch sourced from official contact, about, and hood-service pages across Vermont, New Hampshire, South Dakota, southwest Minnesota, Wyoming, Northwest Florida, and South Florida with a bias toward local hood operators and direct public inboxes.
- `us-expansion-send-ready-batch-028.tsv`: twenty-eighth expansion batch sourced from official contact, contact-snippet, and hood-service pages across Virginia, southwest Louisiana, Vermont, Alabama, South Louisiana, and Central California with a bias toward reachable local operators and active-reserve volume.
- `us-expansion-send-ready-batch-029.tsv`: twenty-ninth expansion batch sourced from official contact, home, and kitchen-hood service pages across South Carolina, coastal Maine, North New Jersey, North Idaho, and Hampton Roads with a quality bias toward local hood operators plus a small number of reachable mixed-service locals.
- `us-expansion-send-ready-batch-030.tsv`: thirtieth expansion batch sourced from official local-office, ventilation, and contact pages across Idaho, Utah, Hampton Roads, and California's Central Coast with a bias toward local owner-route coverage and direct public inboxes.
- `us-expansion-send-ready-batch-031.tsv`: thirty-first expansion batch sourced from official contact, hood-cleaning, kitchen-services, and regional coverage pages across Pennsylvania, DMV, Massachusetts, Oregon, Northern California, and New England with a mix of strong local send-ready operators and lower-priority reserve-ready regional specialists.
- `us-expansion-send-ready-batch-032.tsv`: thirty-second expansion batch sourced from official hood-cleaning, contact, and kitchen-exhaust pages across Kansas, New Mexico, Maryland, Pennsylvania, and Ohio-border metros with a bias toward explicit hood-service evidence and direct public inboxes.
- `us-expansion-send-ready-batch-033.tsv`: thirty-third expansion batch sourced from official about, hood-cleaning, and kitchen-exhaust pages across Central Pennsylvania, the Mid-South, South Louisiana, West Texas, Central/Southeast Texas, Northwest Florida, and Arkansas with a bias toward direct public inboxes and explicit local hood-service coverage.
- `us-expansion-send-ready-batch-034.tsv`: thirty-fourth expansion batch sourced from official contact, hood-cleaning, and service pages across Los Angeles, Lubbock, New Orleans, Charlotte, Idaho Falls, Pittsburgh, Reading, Louisville, and the Gulf Coast with a bias toward local operators that expose direct public inboxes on official pages.
- `us-expansion-send-ready-batch-035.tsv`: thirty-fifth expansion batch sourced from Google Maps discovery, BBB profiles, Nashua's approved hood-cleaner page, Boston's 2026 registered hood cleaners PDF, FDNY approval lists, and official operator pages across Spokane, Boston, Lowell, Huntington, Portland, and New York City with a bias toward traceable multi-source validation plus direct public inboxes.
- `us-expansion-send-ready-batch-036.tsv`: thirty-sixth expansion batch sourced from official contact, quote, and services pages across southern New Hampshire, Boise, western Pennsylvania, southwest Washington, and South Florida with a bias toward long-tail local operators that expose direct public inboxes.
- `us-expansion-send-ready-batch-037.tsv`: thirty-seventh expansion batch sourced from official hood-service and contact pages across eastern North Carolina and New Hampshire with a bias toward long-tail local operators that expose direct public inboxes.
- `us-expansion-send-ready-batch-038.tsv`: thirty-eighth expansion batch sourced from official hood-service, about, and contact pages across the DMV, Long Island, Orlando, California's Central Coast, and north Louisiana with a bias toward newly surfaced local operators plus a small number of reserve-grade mixed specialists.
- `us-expansion-send-ready-batch-039.tsv`: thirty-ninth expansion batch sourced from long-tail directories, Boston registered-cleaner lists, and official contact or services pages across Tidewater Virginia, Boston, Tampa, Dover, Newark, Long Island, and New York's North Country with a mix of local hood-first operators and reserve-grade adjacent mixed specialists.
- `us-expansion-send-ready-batch-040.tsv`: fortieth expansion batch sourced from vetted parallel-agent discovery, FDNY approved contractor lists, and official hood-service pages across New York City, Marysville's Puget Sound lane, and East Texas with a mix of direct hood-first operators plus reserve-grade mixed-adjacent routes.
- `us-expansion-send-ready-batch-041.tsv`: forty-first expansion batch sourced from official contact pages and owner-route recovery across Central New Jersey, Buffalo, and Spokane with a mix of local hood-first operators and reserve-grade adjacent routes.
- `us-expansion-send-ready-batch-042.tsv`: forty-second expansion batch sourced from an official hood-site contact page, an owner-led family-run official site, and a long-tail Fargo directory profile across Levittown, Renton, and Fargo with a mix of direct hood-first operators and reserve-grade long-tail coverage.
- `us-expansion-send-ready-batch-043.tsv`: forty-third expansion batch sourced from an official Hudson Valley hood-cleaning page, the current FDNY approved commercial cooking list, and a long-tail Pittsburgh directory profile across Newburgh, Brooklyn, and Pittsburgh with a mix of direct hood-first operators and reserve-grade regulatory/directory-backed routes.
- `us-expansion-send-ready-batch-044.tsv`: forty-fourth expansion batch sourced from the current FDNY approved commercial cooking list plus official-site verification across New York City, Westchester, Long Island, and North Jersey with an email-first bias toward approved-list operators.
- `us-expansion-send-ready-batch-045.tsv`: forty-fifth expansion batch sourced from Hudson Valley and Pittsburgh official hood-cleaning, fire-suppression, and exhaust-service pages with an email-first bias toward local mixed-adjacent operators that still expose public inboxes.
- `us-expansion-send-ready-batch-046.tsv`: forty-sixth expansion batch sourced from the current FDNY approved commercial cooking list plus official-site verification across New York City and North Jersey with an email-first bias toward approved-list operators that still expose direct public inboxes.
- `us-expansion-send-ready-batch-047.tsv`: forty-seventh expansion batch sourced from official Orlando and Southwest Missouri hood-cleaning pages with an email-first bias toward local long-tail operators that still expose public inboxes.
- `us-expansion-send-ready-batch-048.tsv`: forty-eighth expansion batch sourced from Southern New England official contact pages, FDNY approved-list recovery, and Hudson Valley official operator pages with an email-first bias toward family-owned or long-running hood and exhaust operators that still expose direct public inboxes.
- `us-expansion-send-ready-batch-049.tsv`: forty-ninth expansion batch sourced from North Carolina, Indianapolis, Savannah-Hilton Head, and Orlando official pages plus one long-tail business directory with an email-first bias toward local hood-first or mixed-adjacent operators that still expose public inboxes.
- `us-expansion-send-ready-batch-050.tsv`: fiftieth expansion batch sourced from FDNY approved-list recovery plus official New York and Long Island kitchen-exhaust operator pages with an email-first bias toward bare-metal hood and exhaust cleaning vendors that still expose public inboxes.
- `us-expansion-send-ready-batch-051.tsv`: fifty-first expansion batch sourced from Carolina, Midwest, Central Florida, Tampa Bay, and Charlotte official hood-cleaning pages with an email-first bias toward hood-first and mixed-adjacent local operators that still expose public inboxes.
- `us-expansion-send-ready-batch-052.tsv`: fifty-second expansion batch sourced from Treasure Coast Florida and Southern Tier New York official operator pages with an email-first bias toward one owner-led hood specialist and one hood-adjacent mixed fire-system operator that still expose public inboxes.
- `us-expansion-needs-enrichment-batch-001.tsv`: first national research queue batch for strong-fit local hood vendors that lack public email. These rows should import into `RESEARCH`, stay out of Smartlead export, and be promoted only after an enrichment pass finds a usable inbox.
- `us-expansion-needs-enrichment-batch-002.tsv`: second national research queue batch for strong-fit local hood vendors that lack public email. These rows should import into `RESEARCH`, stay out of Smartlead export, and be promoted only after an enrichment pass finds a usable inbox.
- `us-expansion-needs-enrichment-batch-003.tsv`: third national research queue batch for strong-fit local hood vendors that lack public email, including vetted parallel-agent discoveries across New Jersey, New York, Ohio, Wisconsin, Montana, Oregon, Arizona, and West Virginia.
- `us-expansion-needs-enrichment-batch-004.tsv`: fourth national research queue batch for strong-fit local hood vendors that lack public email, adding a North Carolina hood-service operator with strong service-area coverage but no public inbox.
- `us-expansion-needs-enrichment-batch-005.tsv`: fifth national research queue batch for strong-fit local hood vendors that lack public email, adding vetted discoveries across Wisconsin, Pennsylvania, Virginia, Indiana, Louisiana, Nevada, and Northern Nevada.
- `us-expansion-needs-enrichment-batch-006.tsv`: sixth national research queue batch for strong-fit local hood vendors that lack public email, adding vetted discoveries across Pennsylvania, Florida, and St. Louis with owner-operated or long-running local service signals but no public inbox.
- `us-expansion-needs-enrichment-batch-007.tsv`: seventh national research queue batch for strong-fit hood operators that lack public email, adding vetted discoveries across Connecticut, Massachusetts, South Dakota, Montana, Iowa, Georgia, and Mississippi.
- `us-expansion-needs-enrichment-batch-008.tsv`: eighth national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding a vetted New Orleans hood-cleaning operator with local family-owned signals and explicit metro coverage.
- `us-expansion-needs-enrichment-batch-014.tsv`: fourteenth national research queue batch for strong-fit hood operators that lack public email, adding Springfield and Northern Illinois operators with official hood-cleaning pages and public phone routes but no visible inbox.
- `us-expansion-needs-enrichment-batch-009.tsv`: ninth national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding vetted Southeast and Northwest Florida discoveries with direct phone routes and explicit hood-cleaning fit.
- `us-expansion-needs-enrichment-batch-010.tsv`: tenth national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding vetted Georgia and Oregon discoveries with direct phone routes and explicit hood-cleaning fit.
- `us-expansion-needs-enrichment-batch-011.tsv`: eleventh national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding vetted Buffalo, Eastern Pennsylvania, and Idaho discoveries with direct phone routes and explicit hood/exhaust fit.
- `us-expansion-needs-enrichment-batch-012.tsv`: twelfth national research queue batch for strong-fit hood operators that still lack a verified public inbox, adding vetted Ohio Valley and Connecticut discoveries with direct phone or quote-form routes and explicit kitchen exhaust cleaning fit.
- `us-expansion-needs-enrichment-batch-013.tsv`: thirteenth national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding vetted East Tennessee and Central Louisiana discoveries with direct phone routes and explicit hood/exhaust fit.
- `us-expansion-needs-enrichment-batch-015.tsv`: fifteenth national research queue batch for strong-fit long-tail hood operators that still lack a verified public inbox, adding a South Florida kitchen exhaust specialist with explicit county coverage, NFPA 96 fit, and only a public phone route today.
- `us-expansion-needs-enrichment-batch-016.tsv`: sixteenth national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding vetted Maine/New Hampshire, Puget Sound north, and Charlotte discoveries with direct phone routes and explicit hood/exhaust fit.
- `us-expansion-needs-enrichment-batch-017.tsv`: seventeenth national research queue batch for strong-fit local or institutional hood operators that still lack a verified public inbox, adding vetted DMV, Southern Maryland, and Southern Oregon discoveries with direct phone routes and explicit hood/exhaust fit.
- `us-expansion-needs-enrichment-batch-018.tsv`: eighteenth national research queue batch for strong-fit local hood operators that still lack a verified public inbox, adding vetted Honolulu and Phoenix discoveries with strong owner-led signals and phone/form routes but no usable public email.
- `us-expansion-needs-enrichment-batch-019.tsv`: nineteenth national research queue batch for strong-fit hood operators that still lack a verified public inbox, adding vetted Pennsylvania, Chicagoland, San Diego, and South Florida discoveries with explicit hood-service evidence and direct phone routes.
- `us-expansion-needs-enrichment-batch-020.tsv`: twentieth national research queue batch for strong-fit hood operators that still lack a verified public inbox, adding North Jersey, Eastern North Carolina, Los Angeles, and Houston discoveries with explicit hood-service evidence and direct phone routes.
- `us-expansion-needs-enrichment-batch-021.tsv`: twenty-first national research queue batch for a strong-fit Atlanta hood operator that still lacks a verified public inbox, with a direct phone route and explicit hood-service fit.
- `us-expansion-needs-enrichment-batch-022.tsv`: twenty-second national research queue batch for strong-fit Raleigh and Hartford hood operators that still lack a verified public inbox, using MapQuest and official-site phone routes plus explicit hood-service evidence.
- `us-expansion-needs-enrichment-batch-023.tsv`: twenty-third national research queue batch for strong-fit St. George, Salt Lake City, and Birmingham hood operators that still lack a verified public inbox, using official-site and metro landing-page evidence plus direct phone routes.
- `us-expansion-needs-enrichment-batch-024.tsv`: twenty-fourth national research queue batch for strong-fit Buffalo, Brooklyn, Queens, and Nashville hood operators that still lack a verified public inbox, using official-site phone and form routes plus explicit hood-service evidence.
- `us-expansion-needs-enrichment-batch-025.tsv`: twenty-fifth national research queue batch for strong-fit Hartford, Detroit, Milwaukee, Indianapolis, Minneapolis-St. Paul, and Detroit-metro hood operators that still lack a verified public inbox, using official-site phone and form routes plus explicit hood-service evidence.
- `us-expansion-needs-enrichment-batch-026.tsv`: twenty-sixth national research queue batch for strong-fit Jacksonville, Raleigh-Durham, New York City, Columbus, and Tampa Bay hood operators that still lack a verified public inbox, using official-site phone and form routes plus explicit hood-service evidence.
- `us-expansion-needs-enrichment-batch-027.tsv`: twenty-seventh national research queue batch for a strong-fit Puget Sound hood operator that still lacks a verified public inbox, using official-site phone and form routes plus explicit hood-service evidence.
- `us-expansion-enrichment-batch-001.tsv`: first national expansion enrichment batch. It promotes one previously locked US research prospect to `ACTIVE` using a newly surfaced official public inbox.
- `us-expansion-enrichment-batch-002.tsv`: second national expansion enrichment batch. It promotes Velocity Hood Cleaning and McCleaners Restaurant Services from `RESEARCH` to `ACTIVE` using official public inboxes exposed in official page HTML and schema markup.
- `us-expansion-enrichment-batch-003.tsv`: third national expansion enrichment batch. It promotes Rogue Hood & Fire and Western States Exhaust Cleaning from `RESEARCH` to `ACTIVE` using public inboxes surfaced from official page HTML and contact pages.
- `us-expansion-enrichment-batch-004.tsv`: fourth national expansion enrichment batch. It promotes Super Hood Cleaning, Elite Hood Cleaning Service, and Houston Hood Cleaning from `RESEARCH` to `ACTIVE` using public inboxes surfaced from same-domain JS, official service-area pages, and official privacy/contact pages.
- `us-expansion-enrichment-batch-005.tsv`: fifth national expansion enrichment batch. It promotes Florida Hood Cleaning, R & R Hood Cleaning Specialists, SafeKex L.L.C., and TD Hood Cleaning Service LLC from `RESEARCH` to `ACTIVE` using public inboxes surfaced from official contact pages and first-party schema markup.
- `texas-mvp-needs-enrichment.tsv`: hood-service fit and metro fit look strong, but the row should not be exported to Smartlead until an email or owner route is enriched.
- `texas-mvp-enrichment-batch-001.tsv`: first locked research-to-active enrichment batch for the Texas MVP queue. When applied through `/ops/outbound/prospects/enrichment`, 6 of the 12 Texas research rows are promoted to `ACTIVE` and 6 remain in `RESEARCH`.
- `texas-mvp-enrichment-batch-002.tsv`: second Texas research enrichment batch. It promotes 3 more of the remaining 6 Texas research rows to `ACTIVE` using official page-source emails for Kitchen Guard DFW, Kitchen Guard San Antonio, and Hood Boss.
- `texas-mvp-enrichment-batch-003.tsv`: third Texas research enrichment batch. It promotes Kitchen Guard of Austin to `ACTIVE` using the official Kitchen Guard global location object embedded in the privacy-policy page source.
- `texas-mvp-enrichment-batch-004.tsv`: fourth Texas enrichment batch. It does not create new send-ready rows, but it hardens the remaining two research prospects with stronger contact paths: official Setpoint contacts page evidence and BBB owner-route evidence for Spectra.

- The engine now tags each vendor as `A` or `B` via `vendor_quality_tier`.
- `A`: local hood-first operators with stronger owner-led, small-team, pure-play signals.
- `B`: hood-adjacent mixed operators that still fit hood's motion, or otherwise usable non-A vendors.

Current seed counts:

- Send-ready seed files: 628 vendors.
- Needs enrichment seed files: 103 vendors.
- Effective after applying `texas-mvp-enrichment-batch-001.tsv`: 634 send-ready vendors, 97 remaining in enrichment, 731 total sourced candidates.
- Effective after applying `texas-mvp-enrichment-batch-001.tsv` and `texas-mvp-enrichment-batch-002.tsv`: 637 send-ready vendors, 94 remaining in enrichment, 731 total sourced candidates.
- Effective after applying `texas-mvp-enrichment-batch-001.tsv`, `texas-mvp-enrichment-batch-002.tsv`, and `texas-mvp-enrichment-batch-003.tsv`: 638 send-ready vendors, 93 remaining in enrichment, 731 total sourced candidates.
- After applying `texas-mvp-enrichment-batch-004.tsv`, counts stay at 638 send-ready and 93 remaining in enrichment, but the remaining research rows still need enrichment before export.
- After additionally applying `us-expansion-enrichment-batch-001.tsv`, counts move to 639 send-ready and 92 remaining in enrichment across 731 total sourced candidates.
- After additionally applying `us-expansion-enrichment-batch-002.tsv`, counts move to 641 send-ready and 90 remaining in enrichment across 731 total sourced candidates.
- After additionally applying `us-expansion-enrichment-batch-003.tsv`, counts move to 643 send-ready and 88 remaining in enrichment across 731 total sourced candidates.
- After additionally applying `us-expansion-enrichment-batch-004.tsv`, counts move to 646 send-ready and 85 remaining in enrichment across 731 total sourced candidates.
- After additionally applying `us-expansion-enrichment-batch-005.tsv`, counts move to 650 send-ready and 81 remaining in enrichment across 731 total sourced candidates.

One-month new-vendor launch requirement:

- 30 new vendors/day for 30 days requires 900 live sends.
- Because external email verification and bounce pruning will remove a meaningful slice of the list, the working pre-verification minimum should be 1,000 send-ready prospects.
- The working raw pool should be 1,800-2,500 candidates because many rows will fail on email, source traceability, hood-service specificity, or later verification.
- The current seed is a quality sample, not a launch-sized list.

Metro intent:

- DFW carries the highest volume because it is the largest MVP vendor market.
- Austin rows are prioritized for Axis 2-first only when the vendor service area overlaps Austin active coverage.
- San Antonio rows default to Axis 1-first unless their service area also clearly overlaps Austin.

Row format:

```text
display_name|website_url|source_url|primary_metro|service_area|contact_name|email|phone|evidence
```

Enrichment row format:

```text
display_name|source_url|contact_source_url|contact_name|role_title|email|phone|evidence
```

Quality rule:

Do not merge the enrichment file directly into Smartlead. Run it through `/ops/outbound/prospects/enrichment`, let the engine promote only `ACTIVE` rows, and export Smartlead CSV from the active queue only.

Expansion rule:

Rows outside Austin, DFW, and San Antonio are allowed only when the primary metro is explicit. They are Axis 1-first by default unless the service area overlaps active Axis 2 coverage.
