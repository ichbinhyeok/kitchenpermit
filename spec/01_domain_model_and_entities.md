# 01 Domain Model and Entities

## 1. Model goal
The domain model must support three realities:

1. we sell to vendors
2. Axis 1 and Axis 2 are independent products
3. delivery is no-login, email-first, and render-first
4. cold-email execution is external, but list quality and result analysis still belong in the system

The data model should therefore separate:

- vendor identity and setup
- Axis 1 operational artifacts
- Axis 2 signal and batch artifacts
- outbound acquisition records

---

## 2. Core entity families

### 2.1 Commercial entities
- `VendorOrganization`
- `VendorContact`
- `VendorServiceArea`
- `VendorSetupProfile`
- `CommercialQuote`
- `DeliveryRecord`

### 2.2 Axis 1 entities
- `Axis1Job`
- `Axis1Location`
- `Axis1WorkItem`
- `Axis1Finding`
- `Axis1Asset`
- `Axis1BriefRender`

### 2.3 Axis 2 entities
- `OpportunityProject`
- `OpportunitySignal`
- `OpportunityContact`
- `Axis2Batch`
- `Axis2BatchItem`
- `Axis2PacketRender`

### 2.4 Outbound entities
- `VendorProspect`
- `OutboundCampaign`
- `OutboundMessage`
- `OutboundResultSnapshot`
- `InterestEvent`

---

## 3. Commercial entities

## 3.1 VendorOrganization
Represents the hood vendor that may buy or use the product.

Required fields:

- `id`
- `display_name`
- `legal_name`
- `website_url`
- `primary_metro`
- `hq_city`
- `hq_state`
- `size_band`
- `ownership_style`
- `documentation_maturity`
- `axis1_fit_score`
- `axis2_fit_score`
- `status`

Recommended fields:

- `brand_notes`
- `service_summary`
- `specialties`
- `notes`

### Locked enums
`size_band`

- solo
- micro_team
- small_office
- regional
- enterprise

`ownership_style`

- owner_led
- small_office_led
- manager_led
- unknown

`documentation_maturity`

- low
- medium
- high

`status`

- prospect
- active_customer
- paused
- lost

## 3.2 VendorContact
Represents a human contact at the hood vendor.

Required fields:

- `id`
- `vendor_id`
- `full_name`
- `role_title`
- `email`
- `phone`
- `contact_confidence`
- `source_url`

Locked enums:

- owner
- operations
- office_manager
- sales
- generic_intake
- unknown

## 3.3 VendorServiceArea
Represents metros or cities the vendor claims to serve.

Required fields:

- `vendor_id`
- `metro_key`
- `city_name`
- `is_primary`
- `source_url`

## 3.4 VendorSetupProfile
Stores the reusable setup data used to render both packet families.

Required fields:

- `vendor_id`
- `brand_name`
- `logo_asset_path`
- `primary_contact_name`
- `primary_contact_title`
- `reply_email`
- `phone`
- `service_area_text`
- `service_offerings`
- `emergency_availability_text`
- `cta_text`
- `signature_block`
- `certifications_blurb`
- `insurance_blurb`
- `brand_color_hex`
- `created_at`
- `updated_at`

---

## 4. Axis 1 entities

## 4.1 Axis1Job
Represents one completed or substantially completed service visit.

Required fields:

- `id`
- `vendor_id`
- `customer_name`
- `site_name`
- `site_address`
- `service_date`
- `crew_label`
- `service_summary`
- `next_recommended_service_date`
- `customer_visible_status`

Locked status values:

- draft
- ready_to_render
- delivered

## 4.2 Axis1WorkItem
Represents a scoped work line inside the visit.

Required fields:

- `axis1_job_id`
- `area_label`
- `performed_status`
- `summary`
- `details`

Locked `performed_status` values:

- completed
- partial
- not_completed
- inaccessible

## 4.3 Axis1Finding
Represents an observation, deficiency, or follow-up recommendation.

Required fields:

- `axis1_job_id`
- `finding_type`
- `severity`
- `customer_visible`
- `summary`
- `recommended_action`
- `requires_followup`

Locked `finding_type` values:

- observation
- deficiency
- access_issue
- maintenance_note
- scheduling_note

Locked `severity` values:

- info
- low
- medium
- high

## 4.4 Axis1Asset
Represents before or after evidence assets.

Required fields:

- `axis1_job_id`
- `asset_type`
- `phase`
- `caption`
- `path_or_url`
- `sort_order`

Locked `phase` values:

- before
- after
- reference

## 4.5 Axis1BriefRender
Represents the generated customer-facing output.

Required fields:

- `axis1_job_id`
- `render_version`
- `html_path`
- `pdf_path`
- `render_status`
- `delivered_at`

---

## 5. Axis 2 entities

## 5.1 OpportunityProject
Represents the canonical sales opportunity derived from one or more raw source signals about the same project or location.

This is the commercial unit for Axis 2.
Paid batches should be built from `OpportunityProject`, not directly from raw signals.

Required fields:

- `id`
- `metro_key`
- `city_name`
- `canonical_business_name`
- `canonical_street_address`
- `dedupe_key`
- `strongest_trigger_type`
- `first_seen_trigger_date`
- `last_seen_trigger_date`
- `active_signal_count`
- `food_service_certainty_score`
- `hood_relevance_score`
- `freshness_score`
- `buyer_authority_score`
- `contactability_score`
- `final_score`
- `eligibility_status`
- `created_at`
- `updated_at`

Locked rule:
Multiple raw source rows can support one `OpportunityProject`, but one `OpportunityProject` should appear at most once in a paid batch.

## 5.2 OpportunitySignal
Represents one raw sales-opportunity source record derived from a public or verified signal.

Required fields:

- `id`
- `opportunity_project_id`
- `metro_key`
- `city_name`
- `source_key`
- `external_record_id`
- `trigger_type`
- `trigger_date`
- `business_name`
- `street_address`
- `source_url`
- `source_excerpt`
- `food_service_certainty_score`
- `hood_relevance_score`
- `freshness_score`
- `buyer_authority_score`
- `contactability_score`
- `final_score`
- `eligibility_status`
- `created_at`
- `updated_at`

Locked `trigger_type` values:

- remodel_restaurant
- finish_out_restaurant
- change_of_use_to_food
- opening_food_service
- hood_or_grease_system_change
- kitchen_equipment_change

Locked `eligibility_status` values:

- candidate
- batch_eligible
- excluded
- expired

## 5.3 OpportunityContact
Represents a usable contact path attached to an opportunity signal.

Required fields:

- `signal_id`
- `contact_level`
- `full_name`
- `role_title`
- `email`
- `phone`
- `source_url`
- `confidence_score`

Locked `contact_level` values:

- direct_owner
- manager
- generic_business
- landlord_or_gc
- unknown

## 5.4 Axis2Batch
Represents one sold or prepared batch of live canonical opportunities.

Required fields:

- `id`
- `vendor_id`
- `batch_type`
- `target_metro_scope`
- `intended_size`
- `actual_size`
- `pricing_snapshot`
- `created_at`
- `delivery_status`

Locked `batch_type` values:

- trial_10
- repeat_10
- custom
- recurring

Locked `delivery_status` values:

- drafting
- ready
- delivered

## 5.5 Axis2BatchItem
Represents one canonical opportunity included in a batch.

Required fields:

- `batch_id`
- `project_id`
- `primary_signal_id`
- `rank_order`
- `vendor_angle_note`
- `included_contact_level`
- `is_demo_safe`

Locked rule:
The same `project_id` may not appear twice in the same batch.

## 5.6 Axis2PacketRender
Represents the generated first-touch packet tied to a vendor or batch.

Required fields:

- `vendor_id`
- `batch_id`
- `render_version`
- `html_path`
- `pdf_path`
- `render_status`

---

## 6. Outbound entities

## 6.1 VendorProspect
Represents a vendor we are trying to sell to.

Required fields:

- `id`
- `display_name`
- `website_url`
- `metro_scope`
- `size_band`
- `segmentation_label`
- `axis1_angle_fit`
- `axis2_angle_fit`
- `owner_contact_status`
- `prospect_status`

Locked `segmentation_label` values:

- growth_oriented
- stability_oriented
- mixed

## 6.2 OutboundCampaign
Represents a vendor acquisition campaign.

Required fields:

- `id`
- `vendor_prospect_id`
- `primary_offer_axis`
- `execution_provider`
- `provider_campaign_id`
- `campaign_stage`
- `created_at`

Locked `primary_offer_axis` values:

- axis1
- axis2

Locked `execution_provider` values:

- smartlead

Locked `campaign_stage` values:

- planned
- touch1_sent
- active_followup
- interested
- closed_won
- closed_lost

## 6.3 OutboundMessage
Represents one send or reply event synced from the execution provider.

Required fields:

- `campaign_id`
- `provider_message_id`
- `touch_number`
- `sent_at`
- `subject_line`
- `message_type`
- `delivery_status`
- `bounce_category`
- `response_status`

Locked `message_type` values:

- cold_email
- followup_email
- reply

Locked `delivery_status` values:

- sent
- delivered
- bounced
- deferred
- unknown

Locked `response_status` values:

- no_response
- positive
- neutral
- negative

## 6.4 OutboundResultSnapshot
Represents one analysis snapshot built from synced campaign results.

Required fields:

- `id`
- `campaign_id`
- `analysis_window_start`
- `analysis_window_end`
- `total_sent`
- `delivered_count`
- `bounced_count`
- `positive_reply_count`
- `neutral_reply_count`
- `negative_reply_count`
- `sample_request_count`
- `paid_batch_order_count`
- `created_at`

---

## 7. System keys and enums

## 7.1 Metro keys
- `austin`
- `san_antonio`
- `dfw`
- `houston`

## 7.2 Supported output surfaces
- `html`
- `pdf`
- `csv_export`

## 7.3 Product line keys
- `axis1_service_completion_brief`
- `axis2_sales_list`
- `axis2_first_touch_packet`

---

## 8. Storage notes

1. Keep vendor identity separate from vendor prospecting records.
2. Keep Axis 1 and Axis 2 render records separate.
3. Do not force dashboard account creation into the core model.
4. Treat email delivery as a first-class record.
5. Store scoring snapshots on Axis 2 batch and batch items so later analysis is possible even if source records change.
6. Treat `OpportunityProject`, not `OpportunitySignal`, as the commercial sales unit for Axis 2.
7. Treat Smartlead as the MVP execution provider of record for cold email.
8. The hood system owns list preparation, export or handoff, and result analysis. It does not own outbound sending infrastructure in MVP.
