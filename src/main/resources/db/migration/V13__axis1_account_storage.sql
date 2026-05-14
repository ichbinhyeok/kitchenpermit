create table axis1_company_profiles (
    id uuid primary key,
    account_email varchar(255) not null unique,
    company_name varchar(90) not null,
    service_area varchar(120) not null,
    direct_line varchar(40) not null,
    dispatch_email varchar(120) not null,
    after_hours_phone varchar(40) not null,
    certification varchar(90) not null,
    technician_label varchar(72) not null,
    brand_initials varchar(8) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table axis1_report_records (
    id uuid primary key,
    public_id varchar(40) not null unique,
    account_email varchar(255),
    product_plan varchar(32) not null,
    title varchar(180) not null,
    customer_name varchar(120) not null,
    site_name varchar(120) not null,
    service_date varchar(32),
    next_service_date varchar(32),
    payload_json text not null,
    expires_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_axis1_report_records_account_email
    on axis1_report_records(account_email);

create index idx_axis1_report_records_next_service_date
    on axis1_report_records(next_service_date);
