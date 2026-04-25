# 12 Order Spine and Manual Commerce

## 1. Purpose
This file locks the manual commercial layer for the `1.5 stage` product.

It defines:

- what the order spine is
- what pages it needs
- what statuses it needs
- what entities it needs
- what remains manual
- what is explicitly out of scope for this stage

Locked rule:
This stage is not self-serve checkout.
It is a `manual sales + systemized fulfillment` stage.

---

## 2. One-line definition
The order spine is the internal commercial operating layer that turns:

`inquiry -> quote -> paid order -> fulfillment -> delivery`

into a trackable system instead of an email-only memory.

---

## 3. Scope boundary

## 3.1 Public Axis pages
`/axis-1` and `/axis-2` are product pages.

They explain:

- the packet product
- the sales batch product
- the pricing posture
- the sample boundary

They are not crawling pages and they are not order-management pages.

## 3.2 Crawling and signal production boundary
The crawling or data-collection engine may exist outside this app.

Locked boundary:

- external crawler or sourcing engine finds and normalizes raw signal candidates
- hood ingests or imports those records into the internal Axis 2 signal layer
- hood owns QA, dedupe, scoring, batch assembly, and packet rendering
- hood does not need to own the crawling engine in this stage

## 3.3 What the order spine owns
The order spine owns:

- inbound inquiry capture
- quote or order creation
- payment-request tracking
- paid confirmation
- fulfillment status
- delivery tracking

## 3.4 What remains manual in 1.5 stage
The following remain manual by design:

- sales conversation
- quote negotiation
- payment collection
- payment confirmation
- delivery email send

Locked rule:
Manual does not mean undocumented.
If it happened commercially, it should still be visible in the order spine.

---

## 4. Why this module is needed now
At the current stage, hood already has:

- public product pages
- Axis 1 packet generation
- Axis 2 batch generation
- no-login delivery

What is still weak is the commercial middle:

- who asked
- what they agreed to buy
- whether they paid
- whether fulfillment has started
- whether the delivery was actually sent

The order spine exists to close that gap.

---

## 5. Lifecycle
Locked default lifecycle:

1. inquiry arrives
2. inquiry is reviewed
3. quote or direct order is created
4. payment is requested
5. payment is confirmed manually
6. fulfillment begins
7. fulfillment becomes send-ready
8. delivery is sent
9. order is closed won or lost

Locked rule:
Do not jump from `interested email` straight to `delivered packet` with no internal commercial record.

---

## 6. Screen map

## 6.1 Public screens

### `GET /start`
Purpose:

- collect a structured request
- help the vendor email `compliance@kitchenpermit.com`

It is not a checkout surface.

### `GET /start/submitted`
Purpose:

- confirm the request structure
- open the email draft
- make the next step explicit

## 6.2 Internal ops screens

### `GET /ops/inquiries`
Purpose:

- show the open inquiry inbox
- prevent new public requests from disappearing into email memory
- provide the first conversion step into a real order

The list page must support:

- newest-first review
- visible source type
- visible service area and product interest
- visible notes preview
- explicit `convert to order` action

Locked rule:
An inquiry should not have to be retyped into the order queue if the system already has the structured fields.

### `GET /ops/orders`
Purpose:

- show the commercial queue
- show what needs action

The list page must support:

- filter by `order_status`
- filter by `payment_status`
- filter by `fulfillment_status`
- filter by product line
- sort by newest, paid, and ready-to-send

Core columns:

- order number
- company or vendor
- primary product
- total amount
- payment status
- fulfillment status
- last action date

### `GET /ops/orders/new`
Purpose:

- create an order from a manual inquiry, direct email, or outbound reply

Required sections:

- source section
- company and contact section
- product line section
- pricing section
- notes section

Locked rule:
This screen must support creating an order even if the vendor setup is not complete yet.

### `GET /ops/orders/{orderId}`
Purpose:

- act as the order workbench
- show everything needed to move the order forward

Required blocks:

1. order header
2. contact summary
3. order lines
4. payment panel
5. fulfillment panel
6. delivery panel
7. timeline
8. next-action note

This should be the main operating page.

### `GET /ops/orders/{orderId}/edit`
Purpose:

- edit company, pricing, scope, and notes before the order is fulfilled

Locked rule:
Editing should stay possible until the order reaches `delivered`.

---

## 7. Order-page block requirements

## 7.1 Order header
Must show:

- order number
- source type
- product summary
- order status
- payment status
- fulfillment status

## 7.2 Contact summary
Must show:

- company name
- contact name
- email
- phone
- service area

## 7.3 Order-line block
Must show:

- product line key
- line label
- target metro
- price
- line fulfillment status
- linked artifact if already created

## 7.4 Payment panel
Must show:

- payment method
- requested amount
- received amount
- payment status
- requested date
- confirmed date
- reference key

## 7.5 Fulfillment panel
Must show:

- line-by-line readiness
- block reason when blocked
- linked vendor setup
- linked Axis 1 render or Axis 2 batch
- send-ready flag

## 7.6 Delivery panel
Must show:

- delivery artifact type
- delivered to
- delivery channel
- token links
- PDF availability
- CSV availability when relevant

## 7.7 Timeline
Must show at least:

- inquiry created
- quote sent
- payment requested
- payment confirmed
- fulfillment started
- delivery sent

---

## 8. Status model

## 8.1 Lead status
Use:

- `new`
- `reviewed`
- `converted_to_order`
- `closed_no_fit`

## 8.2 Quote status
Use:

- `draft`
- `sent`
- `accepted`
- `expired`
- `closed_lost`

## 8.3 Order status
Use:

- `new`
- `awaiting_payment`
- `paid`
- `in_fulfillment`
- `ready_to_send`
- `delivered`
- `closed_won`
- `closed_lost`

## 8.4 Payment status
Use:

- `not_requested`
- `requested`
- `reported_paid`
- `confirmed`
- `failed`
- `refunded`

## 8.5 Fulfillment status
Use:

- `not_started`
- `blocked_vendor_setup`
- `blocked_inventory_or_qa`
- `building`
- `review_ready`
- `send_ready`
- `sent`

Locked rule:
`paid` is not the same thing as `send_ready`.
Commercial confirmation and fulfillment readiness must stay separate.

---

## 9. Entity model

## 9.1 CommercialLead
Purpose:

- capture the inbound request before pricing or fulfillment

Required fields:

- `source_type`
- `company_name`
- `contact_name`
- `email`
- `phone`
- `service_area_text`
- `product_interest`
- `lead_notes`
- `lead_status`

## 9.2 CommercialQuote
Purpose:

- record what was offered and at what price

Required fields:

- `quote_number`
- `vendor_id`
- `quote_status`
- `subtotal_amount`
- `discount_amount`
- `total_amount`
- `pricing_basis`
- `scope_summary`

## 9.3 CommercialOrder
Purpose:

- become the fulfillment anchor after the sale is real

Required fields:

- `order_number`
- `lead_id`
- `quote_id`
- `vendor_id`
- `order_status`
- `payment_status`
- `fulfillment_status`
- `ordered_at`
- `paid_at`
- `delivered_at`
- `owner_notes`

## 9.4 CommercialOrderLine
Purpose:

- support one order containing one or more sellable items

Required fields:

- `product_line_key`
- `line_label`
- `quantity`
- `unit_price`
- `line_total`
- `target_metro_scope`
- `line_fulfillment_status`
- `linked_vendor_id`
- `linked_axis1_render_id`
- `linked_axis2_batch_id`
- `linked_delivery_record_id`
- `notes`

## 9.5 PaymentRecord
Purpose:

- record payment request and confirmation without requiring automated checkout

Required fields:

- `payment_method`
- `payment_status`
- `requested_amount`
- `received_amount`
- `reference_key`
- `requested_at`
- `reported_paid_at`
- `confirmed_at`
- `notes`

## 9.6 DeliveryRecord
Purpose:

- record what was actually sent

Required fields:

- `product_axis`
- `artifact_type`
- `delivery_channel`
- `delivered_to`
- `delivered_at`
- `delivery_status`

---

## 10. Product-line rules

## 10.1 Allowed line types in 1.5 stage

- `axis1_setup`
- `axis2_packet_setup`
- `axis2_paid_batch_10`
- `axis1_axis2_bundle`
- `axis2_repeat_batch`

## 10.2 Axis 1 rule
An `axis1_setup` line may become `send_ready` only when:

- vendor setup exists
- one real Axis 1 render exists
- PDF export exists

## 10.3 Axis 2 paid batch rule
An `axis2_paid_batch_10` line may become `send_ready` only when:

- target metro is active coverage
- batch QA passed
- canonical batch exists
- packet render exists
- CSV export exists

## 10.4 Bundle rule
A bundle order should still keep separate fulfillment visibility for:

- Axis 1
- Axis 2

Locked rule:
Bundle pricing does not justify collapsing two different fulfillment paths into one opaque step.

---

## 11. Manual-commerce rules

1. Public inquiry does not create an account.
2. Public inquiry does not auto-create a paid order.
3. Payment confirmation may be manual.
4. Delivery send may be manual.
5. Every paid job must still have an internal order.
6. Every delivered artifact should tie back to an order line.
7. Repeat purchase should reuse vendor history, not restart from zero.

---

## 12. Explicit non-goals for 1.5 stage
Do not build these yet:

- self-serve checkout
- webhook-driven payment automation
- automatic delivery email sending
- customer portal
- invoice PDF generation engine
- refunds workflow automation
- subscription billing

---

## 13. Acceptance bar
The order spine is acceptable for 1.5 stage when:

1. a public inquiry can be turned into an internal order
2. an operator can record price and payment status
3. an operator can see whether fulfillment is blocked or ready
4. Axis 1 and Axis 2 lines are visible separately
5. delivery records are tied back to the commercial order
6. a repeat purchase can be recorded against the same vendor

It is unacceptable when:

1. payment truth still lives only in email
2. fulfillment starts with no order record
3. delivered packets cannot be tied back to what was sold
4. Axis 1 and Axis 2 are collapsed into one fuzzy line item
5. unsupported Axis 2 metros can be marked ready to send

---

## 14. Final lock
In 1.5 stage, hood remains:

- manual-sale
- manual-payment-confirmation
- manual-delivery-send

But it is no longer:

- memory-driven
- inbox-only
- fulfillment-opaque

The order spine is the layer that makes the manual business legible and repeatable.
