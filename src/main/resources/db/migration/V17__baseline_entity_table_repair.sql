create table if not exists vendor_organizations (
    id uuid primary key,
    display_name varchar(255) not null,
    legal_name varchar(255) not null,
    website_url varchar(512),
    primary_metro varchar(64) not null,
    hq_city varchar(128),
    hq_state varchar(64),
    size_band varchar(32) not null,
    ownership_style varchar(32) not null,
    documentation_maturity varchar(32) not null,
    axis1_fit_score integer not null,
    axis2_fit_score integer not null,
    status varchar(32) not null,
    brand_notes varchar(1000),
    service_summary varchar(1000),
    specialties varchar(1000),
    notes varchar(2000),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists vendor_setup_profiles (
    id uuid primary key,
    vendor_id uuid not null unique references vendor_organizations(id),
    brand_name varchar(255) not null,
    logo_asset_path varchar(512),
    primary_contact_name varchar(255) not null,
    primary_contact_title varchar(255),
    reply_email varchar(255) not null,
    phone varchar(64),
    service_area_text varchar(1000),
    service_offerings varchar(1000),
    emergency_availability_text varchar(500),
    cta_text varchar(500),
    signature_block varchar(1000),
    certifications_blurb varchar(1000),
    insurance_blurb varchar(1000),
    brand_color_hex varchar(32),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists delivery_records (
    id uuid primary key,
    vendor_id uuid not null references vendor_organizations(id),
    product_axis varchar(64) not null,
    artifact_type varchar(64) not null,
    delivery_channel varchar(64) not null,
    delivered_to varchar(255),
    delivered_at timestamp with time zone,
    delivery_status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists axis1_jobs (
    id uuid primary key,
    vendor_id uuid not null references vendor_organizations(id),
    customer_name varchar(255) not null,
    site_name varchar(255) not null,
    site_address varchar(512) not null,
    service_date date not null,
    crew_label varchar(255),
    service_summary varchar(2000) not null,
    next_recommended_service_date date,
    customer_visible_status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists axis1_findings (
    id uuid primary key,
    axis1_job_id uuid not null references axis1_jobs(id),
    finding_type varchar(64) not null,
    severity varchar(64) not null,
    customer_visible boolean not null,
    summary varchar(1000) not null,
    recommended_action varchar(2000),
    requires_followup boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists axis1_brief_renders (
    id uuid primary key,
    axis1_job_id uuid not null unique references axis1_jobs(id),
    render_version varchar(64) not null,
    delivery_token varchar(64) not null unique,
    html_path varchar(512),
    pdf_path varchar(512),
    render_status varchar(64) not null,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists opportunity_projects (
    id uuid primary key,
    metro_key varchar(64) not null,
    city_name varchar(128) not null,
    canonical_business_name varchar(255) not null,
    canonical_street_address varchar(512),
    dedupe_key varchar(255) not null unique,
    strongest_trigger_type varchar(64) not null,
    first_seen_trigger_date date not null,
    last_seen_trigger_date date not null,
    active_signal_count integer not null,
    food_service_certainty_score integer not null,
    hood_relevance_score integer not null,
    freshness_score integer not null,
    buyer_authority_score integer not null,
    contactability_score integer not null,
    final_score integer not null,
    eligibility_status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists opportunity_signals (
    id uuid primary key,
    opportunity_project_id uuid not null references opportunity_projects(id),
    metro_key varchar(64) not null,
    city_name varchar(128) not null,
    source_key varchar(128) not null,
    external_record_id varchar(255),
    trigger_type varchar(64) not null,
    trigger_date date not null,
    business_name varchar(255) not null,
    street_address varchar(512),
    source_url varchar(512) not null,
    source_excerpt varchar(2000),
    food_service_certainty_score integer not null,
    hood_relevance_score integer not null,
    freshness_score integer not null,
    buyer_authority_score integer not null,
    contactability_score integer not null,
    final_score integer not null,
    eligibility_status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists opportunity_contacts (
    id uuid primary key,
    signal_id uuid not null references opportunity_signals(id),
    contact_level varchar(64) not null,
    full_name varchar(255),
    role_title varchar(255),
    email varchar(255),
    phone varchar(64),
    source_url varchar(512),
    confidence_score integer not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists axis2_batches (
    id uuid primary key,
    vendor_id uuid not null references vendor_organizations(id),
    batch_type varchar(64) not null,
    target_metro_scope varchar(255),
    intended_size integer not null,
    actual_size integer not null,
    pricing_snapshot varchar(255),
    delivery_status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists axis2_batch_items (
    id uuid primary key,
    batch_id uuid not null references axis2_batches(id),
    project_id uuid not null references opportunity_projects(id),
    primary_signal_id uuid not null references opportunity_signals(id),
    rank_order integer not null,
    vendor_angle_note varchar(1000),
    included_contact_level varchar(64),
    is_demo_safe boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists axis2_packet_renders (
    id uuid primary key,
    vendor_id uuid not null references vendor_organizations(id),
    batch_id uuid not null references axis2_batches(id),
    render_version varchar(64) not null,
    delivery_token varchar(64) not null unique,
    html_path varchar(512),
    pdf_path varchar(512),
    render_status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists commercial_leads (
    id uuid primary key,
    source_type varchar(64) not null,
    company_name varchar(255) not null,
    contact_name varchar(255) not null,
    email varchar(255) not null,
    phone varchar(64),
    service_area_text varchar(1000) not null,
    product_interest varchar(64) not null,
    lead_notes varchar(2000),
    lead_status varchar(64) not null,
    converted_to_order_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists commercial_orders (
    id uuid primary key,
    lead_id uuid not null references commercial_leads(id),
    vendor_id uuid references vendor_organizations(id),
    order_number varchar(64) not null unique,
    order_status varchar(64) not null,
    payment_status varchar(64) not null,
    fulfillment_status varchar(64) not null,
    ordered_at timestamp with time zone not null,
    paid_at timestamp with time zone,
    delivered_at timestamp with time zone,
    owner_notes varchar(2000),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists commercial_order_lines (
    id uuid primary key,
    order_id uuid not null references commercial_orders(id),
    product_line_key varchar(64) not null,
    line_label varchar(255) not null,
    quantity integer not null,
    unit_price integer not null,
    line_total integer not null,
    target_metro_scope varchar(255),
    line_fulfillment_status varchar(64) not null,
    linked_vendor_id uuid references vendor_organizations(id),
    notes varchar(2000),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists vendor_prospects (
    id uuid primary key,
    display_name varchar(255) not null,
    website_url varchar(512),
    primary_metro varchar(64) not null,
    metro_scope varchar(255) not null,
    service_area_text varchar(1000) not null,
    service_area_overlap_status varchar(64) not null,
    size_band varchar(32) not null,
    ownership_style varchar(32) not null,
    documentation_maturity varchar(32) not null,
    segmentation_label varchar(64) not null,
    primary_offer_axis varchar(32) not null,
    cold_email_hook_axis varchar(16) not null,
    axis1_angle_fit integer not null,
    axis2_angle_fit integer not null,
    owner_contact_status varchar(64) not null,
    source_url varchar(512) not null,
    notes varchar(2000),
    contact_name varchar(255),
    role_title varchar(255),
    email varchar(255),
    phone varchar(64),
    contact_confidence integer not null,
    contact_source_url varchar(512),
    vendor_fit_score integer not null,
    prospect_fit_score integer not null,
    export_readiness_score integer not null,
    legitimacy_score integer not null,
    vendor_quality_tier varchar(16) not null,
    source_channel varchar(32) not null,
    send_priority varchar(32) not null,
    prospect_status varchar(64) not null,
    service_area_regions varchar(255),
    service_area_cities varchar(1000),
    axis2_pack_eligibility varchar(64),
    services varchar(1000),
    opportunity_trigger_fit varchar(64),
    axis2_buyer_fit varchar(64),
    preferred_offer varchar(64),
    contact_role_weight integer,
    service_taxonomy varchar(1000),
    operational_rank varchar(64),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists outbound_campaigns (
    id uuid primary key,
    vendor_prospect_id uuid not null references vendor_prospects(id),
    primary_offer_axis varchar(32) not null,
    execution_provider varchar(64) not null,
    provider_campaign_id varchar(255),
    campaign_stage varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists outbound_result_snapshots (
    id uuid primary key,
    campaign_id uuid not null references outbound_campaigns(id),
    analysis_window_start timestamp with time zone not null,
    analysis_window_end timestamp with time zone not null,
    total_sent integer not null,
    delivered_count integer not null,
    bounced_count integer not null,
    positive_reply_count integer not null,
    neutral_reply_count integer not null,
    negative_reply_count integer not null,
    sample_request_count integer not null,
    paid_batch_order_count integer not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);
