# Vendor Sourcing Playbook

Last updated: `2026-04-24`

## Core Principle

Official websites are not the best discovery layer for this market. They are the best verification layer.

The best-fit hood vendors often appear first in:

- city/state approved cleaner lists
- Google Maps / Google Business Profile
- BBB / Yellow Pages / local directories
- Facebook pages
- long-tail single-purpose websites

Then the official site is used to confirm hood fit, metro fit, and contact path.

## Best-Fit Vendor Profile

Prioritize vendors with these signals:

- `owner-led` or `small-office-led`
- one metro or a narrow adjacent-county footprint
- explicit `hood / exhaust / NFPA 96 / inspection / report / sticker / fan / duct` language
- real field proof: `before-and-after`, `job photos`, `review replies`, `service reports`
- compliance familiarity: approved lists, fire-marshal wording, certification language
- weak sales systems but usable reachability: direct phone, Gmail/Yahoo, simple quote form, Facebook Messenger

Do not over-penalize `free mailbox` or `phone-first` behavior. In this category, those are often signals of a real low-system operator rather than a fake one.

## Channel Stack

Use channels in this order:

1. `APPROVED_VENDOR_LIST`
   Discovery seed for a metro.
   Examples: FDNY approved companies, Boston registered hood cleaners, Nashua approved hood cleaning list.

2. `GOOGLE_MAPS`
   Best source for local-small discovery, photos, reviews, realistic service radius, and owner-operated footprints.

3. `BBB`
   Best fit-verification layer for owner names, entity type, years in business, and mixed-service false positives.

4. `BUSINESS_DIRECTORY`
   Yellow Pages, Allbiz, MacRae's, BuildZoom, Houzz, MapQuest.
   Use to recover weak websites and fill missing phone, address, owner, or website links.

5. `SOCIAL_PROFILE`
   Facebook and Instagram are reachability helpers, not legitimacy anchors by themselves.
   Strong when paired with Maps or an approval list.

6. `TRADE_ASSOCIATION`
   IKECA / similar sources are trust boosters and good for certification-aware operators.

7. `OFFICIAL_SITE`
   Final confirmation layer for hood specificity, service area, and public inbox.

## Data Model Direction

The next schema step should split:

- `discovery_source_class`: where the lead was first found
- `anchor_source_class`: the strongest legitimacy layer that confirmed the lead

Examples:

- found on `BBB`, anchored by `APPROVED_VENDOR_LIST`
- found on `GOOGLE_MAPS`, anchored by `OFFICIAL_SITE`
- found on `BUSINESS_DIRECTORY`, anchored by `TRADE_ASSOCIATION`

This market is too multi-source to compress discovery and trust into one field forever.

## Queue Logic

### Send Now

- high hood fit
- direct or usable public email
- legitimacy backed by at least one strong source family
- no dominant mixed-service red flag

### Enrich First

- high fit
- legitimacy is real
- email is missing or weak
- Maps / Facebook / approval-list / directory path is present

### Active Reserve

- reachable
- real hood operator
- but too mixed, too regional, or too systemized for first-wave send

### Reject

- hood is not clearly core
- service mix is too broad
- geography is unrealistic
- no legitimacy layer beyond thin public text

## Mixed-Service Value

Mixed vendors are not useless. They are usually `ACTIVE_RESERVE`, not first-wave `Send Now`.

Keep mixed vendors when:

- hood / kitchen exhaust is still explicit and credible
- the same local owner or operator likely buys both hood work and the adjacent service
- adjacent services stay close to the hood workflow: `fire suppression`, `fire extinguisher`, `hood repair`, `filter exchange`, `restaurant equipment`
- the operator still looks low-system: phone-first, free quote, simple site, direct owner route

Deprioritize or reject mixed vendors when:

- hood looks incidental to `janitorial`, `HVAC`, `air duct`, `floor care`, `window cleaning`, or broad facilities work
- the buyer route is centralized: `portal`, `dashboard`, `account manager`, `national accounts`
- institutional or property-management language dominates restaurant language

Working rule: `adjacent mixed` can be reserve value; `broad facility mixed` usually drags reply quality and should stay out of the first wave.

## Scoring Guidance

Reward:

- explicit `owner`, `founder`, `member`, `sole proprietor`, `owner + operator`
- `locally owned`, `family-run`, `veteran-owned`, `firefighter-owned`
- `call/text`, `same-day estimate`, `free quote`, `request service`
- `job photos`, `before-and-after`, `review replies`
- `approved`, `registered`, `FDNY`, `Boston Fire`, `fire marshal`, `IKECA`, `CECS`, `certificate of fitness`

Penalize:

- janitorial / carpet / window / floor-care heavy positioning
- HVAC / air-duct / facility-services dominant positioning
- `national accounts`, `portal`, `dashboard`, `account manager`, `multi-state`
- broad SEO shell landing pages with no owner, no proof, and no local operating trail

## Operating Routine

1. Start with an approval or regulatory list for a metro.
2. Expand that metro in Google Maps to find lookalike local operators.
3. Use BBB to confirm ownership, entity type, and mixed-service risk.
4. Use directories to recover missing phone / website / owner data.
5. Use the official site to verify hood specificity and email path.
6. Move high-fit no-email rows into `RESEARCH` fast instead of dropping them.

## Example Sources

- [Google Business Profile guidelines](https://support.google.com/business/answer/3038177)
- [Google service-area business help](https://support.google.com/business/answer/7039811?hl=en)
- [IKECA membership](https://www.ikeca.org/page/IKECAMembership)
- [IKECA about page](https://www.ikeca.org/page/AboutIKECA)
- [Nashua approved hood cleaning list](https://www.nashuanh.gov/1496/Commercial-Kitchen-Hood-Cleaning)
- [Boston registered hood cleaners PDF](https://content.boston.gov/sites/default/files/file/2026/03/2026%20Registered%20Hood%20Cleaners.pdf)
- [FDNY approved commercial cooking list](https://www.bers.nyc.gov/assets/fdny/downloads/pdf/business/approved-companies-commercial-cooking-precipitator.pdf)
- [BrightLocal SMB marketing 2025](https://www.brightlocal.com/research/smb-marketing-2025/)
- [NFIB 2025 technology survey](https://www.nfib.com/wp-content/uploads/2025/06/2025-NFIB-Technology-Survey.pdf)
