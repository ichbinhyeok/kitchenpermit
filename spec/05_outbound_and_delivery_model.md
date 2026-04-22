# 05 Outbound and Delivery Model

## 1. Outbound purpose
Outbound is how we sell the product to hood vendors.

It is not an afterthought.
It is a primary go-to-market layer.

---

## 2. Core channel
Locked default channel:

- `cold email first`

Supporting channels:

- website sample request
- reply-driven conversations

Not required for MVP:

- internal sending engine
- multichannel orchestration stack
- SDR workflow tooling

Locked execution boundary:

- `Smartlead` executes the cold-email sends
- `hood` prepares the list, offer angle, and export or handoff payload
- `hood` stores and analyzes outbound results after sending
- mailbox and domain operations are external to the hood product scope

---

## 3. Offer positioning by segment

## 3.1 Growth-oriented vendor
Lead with Axis 2 first.

Why:

- new-sales hunger is usually clearer
- live list is a stronger initial hook

## 3.2 Stability-oriented vendor
Lead with Axis 1 first.

Why:

- they often already have customer volume
- their pain is documentation, clarity, and repeatability

## 3.3 Mixed vendor
Use the stronger signal from available context.

---

## 4. Locked daily send model
The user intends to run about `40 sends per day`.

Locked interpretation:

- `40/day` is the `stable target`, not the day-1 live volume
- it is `total daily sends`
- it includes follow-ups
- it is not `40 brand-new prospects every day`

### 4.1 Ramp rule
Start below the stable target.

Only move toward `40/day` after deliverability is stable.

### 4.2 Stable daily mix
Once stable, default to:

- `16 new sends`
- `24 follow-up sends`

### 4.3 Stable weekly mix on a 5-day week
- `80 new sends`
- `120 follow-up sends`

### 4.4 Why this is locked
Austin-only cannot support infinite fresh volume.
Revenue requires follow-up discipline, not just fresh list burning.

### 4.5 Stability gate
Do not raise live sending toward `40/day` until:

- bounce behavior is controlled
- spam or placement problems are not material
- reply handling is keeping up
- list quality remains commercially defensible

---

## 5. Locked new-send offer mix
Across new-send inventory, the default offer weighting is:

- `65% Axis 2 first`
- `35% Axis 1 first`

Locked rule:
This is `traffic weighting`, not a declaration that Axis 2 is the only main product.

This weighting applies only when the vendor service area overlaps an `active Axis 2 coverage metro`.

If the overlap does not exist:

- the default angle becomes `Axis 1 first`
- the outreach must not imply that live Axis 2 inventory already exists for that vendor's market

---

## 6. Locked metro mix for vendor prospecting
For new-send vendor prospecting in MVP, use:

- `DFW: 40%`
- `Austin metro: 30%`
- `San Antonio metro: 30%`

Houston is excluded from default new-send mix until explicitly activated.

Locked rule:
This prospecting mix controls vendor targeting, not permission to promise live Axis 2 coverage.

For MVP:

- Austin-overlap vendors may receive `Axis 2 first`
- San Antonio-overlap vendors default to `Axis 1 first` until San Antonio coverage becomes active
- DFW-overlap vendors default to `Axis 1 first` until DFW coverage becomes active

---

## 7. Sequence model
Locked MVP sequence:

1. touch 1
2. follow-up 1
3. follow-up 2
4. final follow-up

Tone rules:

- short
- direct
- artifact-led
- no fluffy positioning language

CTA rules:

- primary CTA = reply
- secondary CTA = request sample

Locked execution rule:
The sequence logic can be defined here, but the actual send execution is done in `Smartlead`, not inside hood.

---

## 8. Results analysis role
After Smartlead executes the send, hood should analyze:

- send count
- delivered vs bounced
- positive vs neutral vs negative replies
- sample requests
- paid batch conversion
- angle performance by Axis 1 first vs Axis 2 first
- metro and segment performance

Locked rule:
hood owns the `list quality loop` and the `results analysis loop`, even when send execution is external.

---

## 9. Website CTA model
The public site should support:

- `Request sample`
- `See sample`
- `Starting at pricing`
- `Reply to discuss your market`

Locked rule:
Do not optimize the site around broad brochure UX.
Optimize it around conversion into a conversation.

---

## 10. Delivery after purchase

## 10.1 Axis 1 delivery
Default delivery:

- email with HTML link
- PDF attached or linked

## 10.2 Axis 2 delivery
Default delivery:

- summary email
- HTML batch and packet link
- PDF packet
- operational list export

## 10.3 No-login lock
No customer account is required for MVP delivery.

---

## 11. Public pricing model
Locked public pricing mode:

- `starting at` prices only

Locked public defaults:

- Axis 1 setup: starting at `$149`
- Axis 2 packet setup: starting at `$149`
- Axis 1 + Axis 2 setup bundle: starting at `$259`
- Axis 2 trial batch of 10: starting at `$149`

Do not publish recurring pricing menus until repeat-buy behavior is clearer.

---

## 12. Sales honesty rules

1. Do not promise unsupported metros as live list coverage.
2. Do not promise daily inventory everywhere.
3. Do not imply that a list row guarantees a closed sale.
4. Do not hide that lists are freshness-sensitive.
5. Do not sell generic stale data as a premium signal product.

---

## 13. MVP outbound failure conditions
The outbound motion is not acceptable if:

1. it depends on one city only
2. it burns fresh prospects without structured follow-up
3. it sends the same weak angle to every vendor type
4. it hides pricing entirely
5. it lacks a clean sample path
6. it assumes `40/day` before deliverability is stable
7. it requires hood to become the outbound sending tool instead of the list and analysis system
