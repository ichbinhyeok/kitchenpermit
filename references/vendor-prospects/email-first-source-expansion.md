# Email-First Source Expansion

Last updated: `2026-04-25`

## Goal

Expand vendor discovery without collapsing into low-quality generic cleaners.

The constraint is not just "find more hood vendors."
The real constraint is:

- find more real hood vendors
- recover a usable public email whenever possible
- send `RESEARCH` only when email recovery fails after the right source sequence

This is an `email-first` expansion routine, not an `official-site-only` routine.

## Why This Exists

The current bottleneck is not market size.
It is discovery shape.

If discovery starts at the official site, the engine over-favors:

- better marketed vendors
- more systemized vendors
- easier-to-read websites

and under-finds:

- local owner-led hood operators
- phone-first companies
- approved-list vendors with thin websites
- directory-backed vendors with real inboxes hidden off the homepage

So the correct flow is:

1. find the operator from high-yield source families
2. recover email from the best reachable public source
3. verify hood fit and metro fit
4. only then decide `SEND_READY` vs `RESEARCH`

## Email-First Source Order

Use source families in this order when the goal is `send-ready` expansion.

### 1. Approved / regulatory lists

Best starting point for:

- FDNY approved companies
- city fire marshal or approved cleaner rosters
- registered hood cleaner PDFs
- licensed local fire / hood cleaner rosters

Why first:

- high legitimacy
- high local concentration
- often includes owner, phone, and sometimes email
- better chance of finding real small operators the open web hides

### 2. Long-tail business directories

Use for:

- AllBiz
- MapQuest
- chamber-style local directories
- regional business listings
- verified local business indexes

Why second:

- often recovers public email when the official homepage does not
- often recovers owner names, addresses, and linked official domains
- useful for thin local operators

### 3. Official site recovery pages

Do not stop at the homepage.
Check:

- contact
- about
- service pages
- city pages
- privacy
- terms
- footer markup
- schema / JSON-LD
- embedded JS bundles

Why third:

- first-party inboxes are strongest for send-ready acceptance
- some operators hide inboxes away from the homepage

### 4. Maps-backed public business profiles

Use when:

- approved list exists but website is weak
- official site has no clear email
- directory evidence is incomplete

Why fourth:

- strong legitimacy and local radius signal
- good for phone-first businesses
- good for deciding whether a no-email vendor deserves `RESEARCH`

### 5. Social as fallback verification only

For now, because outbound is email-first:

- use Facebook / Instagram only to verify the business is real
- do not treat DM as primary outbound
- only use social to support `RESEARCH`, not to replace email recovery

## Email Recovery Order

When a vendor looks real, recover email in this order:

1. official contact page
2. official footer / header / service page
3. official privacy / terms / schema / first-party JS
4. approved-list or government listing
5. strong directory with linked official domain and matching operator identity

Do not use:

- guessed emails
- third-party enrichment guesses
- non-public inferred addresses
- parent-brand support inboxes unless the relationship is explicit and commercially usable

## Queue Rules

### Promote to `SEND_READY`

Require all of:

- explicit hood / kitchen exhaust fit
- explicit metro
- public usable email
- traceable source path

### Move to `RESEARCH`

Use when:

- fit is real
- legitimacy is real
- phone / form / strong public trail exists
- but public email recovery failed after the source sequence above

### Reject

Reject when:

- hood fit is weak
- the operator is really janitorial / pressure washing / HVAC-first
- metro is vague
- source proof is too thin

## Source Family Priority By Lane

### Send-ready lane

Bias toward:

- approved list + official email
- directory + official domain + public inbox
- official site + public inbox

### Research lane

Bias toward:

- approved list + phone-only
- Maps + official site but no inbox
- directory + owner / phone / domain match but no inbox

## Working Metric

Track discovery not only by count, but by recovery efficiency:

- `raw discovered`
- `usable email recovered`
- `research-worthy no-email`
- `low-fit rejected`

The target is not just "more vendors."
The target is:

`more vendors per hour that have a real chance to become send-ready`

## Near-Term Operating Rule

Until verified sendable inventory is comfortably above `1,000`:

- prefer email recovery work over marginal DM discovery
- prefer approved-list and directory lanes over broad random web search
- prefer one strong metro dug deeply over five shallow metros

