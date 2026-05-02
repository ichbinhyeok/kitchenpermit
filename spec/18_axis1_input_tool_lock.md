# 18 Axis 1 Input Tool Lock

## 1. Product Role

The Axis 1 input tool is the vendor-side minimal-input proof packet surface.

It exists to turn one service visit into a structured job record and generated
outputs:

- a vendor job proof packet
- a customer-readable proof link
- a retained service evidence PDF
- invoice/payment proof copy
- follow-up quote or revisit copy when needed
- next-service / rebook copy

The input tool is not a manual operations console. The vendor should not build
Quote Guard, Crew Proof, Payment Defense, or Rebook sections by hand. The tool
should infer those packet sections from minimal input and ask the vendor to
confirm only ambiguous or risky items.

Rule:
The product promise is `photos plus a few confirmations in, defensible job
packet out`.

---

## 2. Required Input Model

The tool should keep the required input surface small:

1. field photos when captured, even if filenames are generic phone names
2. job result confirmation
3. customer / property, defaulted or reused when possible
4. service date, defaulted to today when possible
5. next service timing, defaulted by visit type when possible
6. open item, blocked access, recorded condition, or not-applicable state only
   when present

Rule:
If a vendor cannot produce a useful packet from these inputs, the tool is too
hard to operate.

The tool may ask follow-up questions, but only for items that affect claim risk
or output usefulness:

- a fan/roof/duct area appears in photos but has no confirmed result
- the vendor selected completed but required proof areas are missing
- photos look like issue/blocked/access evidence
- a condition-only record would otherwise read like completed work
- no photos exist and the vendor is about to claim photo-supported completion

---

## 3. Output Rule

The same structured input must generate both outputs:

- internal vendor job proof packet
- `/p/*` customer proof link
- `/exports/*` PDF / service evidence record
- invoice/payment proof summary
- quote/revisit/rebook message snippets

The customer link explains the visit. The PDF preserves a more formal record.
The invoice/payment and rebook snippets help the vendor turn the record into
cash collection and recurring work.

Rule:
The customer link and PDF must be generated from the same job record. They must
not become parallel hand-written artifacts.

---

## 4. Free vs Paid Boundary

Free preview:

- neutral branding
- local browser photo storage
- no hosted delivery guarantee
- no saved history

Paid setup:

- vendor branding
- contact and reply CTA
- hosted customer links
- saved history
- stable PDF record delivery
- invoice/payment link fields
- next-service/rebook link fields
- saved customer/site defaults
- retained job proof packet history

Rule:
The input UX can be tested for free, but customer-grade delivery and branding
belong to setup or subscription.

---

## 5. Failure Conditions

The input tool is unacceptable if:

1. it feels like writing a long report from scratch
2. photo upload blocks packet creation
3. blocked or inaccessible areas are easy to hide accidentally
4. the user cannot tell whether they are creating a customer link or PDF
5. the output depends on retyping the same visit details twice
6. the vendor must manually create separate quote guard, crew proof, payment
   defense, and rebook sections
7. AI suggestions enter customer-facing claims before vendor confirmation
8. a missing roof, fan, duct, or access photo is silently treated as completed
9. the generated packet is useful for the customer but not useful for the vendor
   getting paid, defending scope, or booking the next service
