create table billing_subscriptions (
    id uuid primary key,
    account_email varchar(255) not null,
    provider varchar(32) not null,
    provider_customer_id varchar(64),
    provider_subscription_id varchar(64) not null unique,
    provider_transaction_id varchar(64),
    price_id varchar(64),
    status varchar(32) not null,
    current_period_starts_at timestamp with time zone,
    current_period_ends_at timestamp with time zone,
    last_event_id varchar(64),
    last_event_type varchar(80),
    raw_event_json text,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_billing_subscriptions_account_email
    on billing_subscriptions(account_email);

create index idx_billing_subscriptions_status
    on billing_subscriptions(status);

create table billing_webhook_events (
    id uuid primary key,
    provider varchar(32) not null,
    event_id varchar(64) not null unique,
    event_type varchar(80) not null,
    processed_at timestamp with time zone not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);
