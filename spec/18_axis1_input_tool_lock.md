# 18 Axis 1 Input Tool Lock

## 1. Product Role

The Axis 1 input tool is the vendor-side closeout capture surface.

It exists to turn one service visit into:

- a customer proof link
- a service evidence PDF

The input tool is not the final customer product. The proof link and PDF are the
paid-facing outputs.

---

## 2. Required Input Model

The tool should keep the required input surface small:

1. job result
2. customer / property
3. service date
4. next service timing
5. open item or recorded condition when present
6. field photos when captured

Rule:
If a vendor cannot produce a useful packet from these inputs, the tool is too
hard to operate.

---

## 3. Output Rule

The same structured input must generate both outputs:

- `/p/*` customer proof link
- `/exports/*` PDF / service evidence record

The customer link explains the visit. The PDF preserves a more formal record.

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
