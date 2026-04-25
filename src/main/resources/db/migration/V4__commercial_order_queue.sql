create table commercial_leads (
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

create table commercial_orders (
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

create table commercial_order_lines (
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
