alter table account_users
    add column email_verified boolean not null default true;

alter table account_users
    add column email_verified_at timestamp with time zone;

update account_users
set email_verified_at = created_at
where email_verified = true
  and email_verified_at is null;

alter table account_users
    alter column email_verified set default false;

create table email_verification_tokens (
    id uuid primary key,
    account_user_id uuid not null references account_users(id) on delete cascade,
    token_hash varchar(128) not null unique,
    expires_at timestamp with time zone not null,
    used_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_email_verification_tokens_account_user_id
    on email_verification_tokens(account_user_id);

create index idx_email_verification_tokens_expires_at
    on email_verification_tokens(expires_at);
