# 04 Axis 2 Sales List and First-Touch Packet

## 1. Product role
Axis 2 is the new-sales support product.

It is composed of:

- a sales opportunity list
- a first-touch packet that helps the vendor use that list

Locked rule:
Axis 2 is not a packet-only product.

---

## 2. Product hierarchy

### 2.1 Main hook
`sales list`

### 2.2 Supporting artifact
`first-touch packet`

### 2.3 Why this hierarchy is locked
Vendors buy the opportunity first.
They value the packet because it helps convert the opportunity into outreach.

---

## 3. Core sales unit

### 3.1 Trial batch
Locked MVP unit:

- `10 deduped live opportunities`

### 3.2 Sample unit
Locked public sample:

- `2 to 3 masked rows`

### 3.3 Why 10 is locked
It is large enough to feel commercial and small enough to human-review tightly in MVP.

---

## 4. Trigger taxonomy
Locked MVP trigger families:

1. restaurant remodel
2. restaurant finish-out
3. change of use to food service
4. opening-like food-service activation
5. hood-relevant kitchen system change

Locked commercial emphasis:
`remodel-first`

Opening stays in the pipeline but is not the lead commercial angle for launch.

---

## 5. Sales list content
Each paid batch row represents one canonical opportunity, not one raw source row.

Each paid batch item must include:

- business name
- address
- city
- metro
- trigger type
- trigger date
- source name
- source link
- short hood-relevance note
- contact ladder
- fit note
- exclusion or risk note if relevant

Optional enrichments:

- website
- role-specific contact
- short operator note

---

## 6. First-touch packet purpose
The packet should help the vendor answer:

1. why this business is on the list
2. why now is a reasonable time to reach out
3. what the vendor should say first
4. what framing is most likely to land
5. what first checklist or prep point is relevant

The packet is not a generic brochure.
It is a focused sales enablement artifact.

---

## 7. Packet structure
Locked block order:

1. what this packet is
2. why the lead was surfaced
3. trigger summary
4. why this matters for hood service
5. suggested first email opener
6. suggested first call opener
7. suggested vendor angle
8. first-service or pre-opening prep checklist
9. vendor CTA block

---

## 8. List QA
Paid batch items must satisfy:

- freshness threshold
- food-service certainty threshold
- hood relevance threshold
- contactability threshold
- no duplicate canonical project in the same batch

Locked rule:
If the item is not good enough to explain in one sentence, it is not good enough for a paid batch.

---

## 9. Sample and demo locking

## 9.1 Public sample allowed fields
- business name
- city
- trigger type
- trigger date
- short signal note

## 9.2 Public sample hidden fields
- direct usable email
- direct usable phone if it would give away the paid value
- exact enrichment logic
- complete personalized vendor-ready copy

## 9.3 Demo rendering rules
- HTML preview allowed
- PDF preview allowed
- watermark required on free demo
- free preview cannot include a fully usable lead package

---

## 10. Delivery package
The default paid Axis 2 delivery package is:

1. delivery email summary
2. HTML view of batch and packet
3. PDF export of packet
4. structured list export for operational use

Locked rule:
The structured list export exists for usability, but the product should still read coherently in HTML and PDF.

---

## 11. Pricing defaults
Locked MVP defaults:

- public sample: free
- paid trial batch of 10 live prospects: starting at `$149`
- first-touch packet setup: starting at `$149`
- bundle with Axis 1 packet setup: starting at `$259`

Recurring or premium pricing is quoted only after repeat usage evidence.

---

## 12. Axis 2 failure conditions
Axis 2 is unacceptable if:

1. the list looks like generic business data
2. the trigger is weak or stale
3. the packet reads like abstract marketing copy
4. the vendor cannot immediately act on the batch
5. unsupported metros are sold as active inventory
