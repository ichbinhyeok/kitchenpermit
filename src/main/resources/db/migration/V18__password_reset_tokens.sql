create table password_reset_tokens (
    id uuid primary key,
    account_user_id uuid not null references account_users(id) on delete cascade,
    token_hash varchar(128) not null unique,
    expires_at timestamp with time zone not null,
    used_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_password_reset_tokens_account_user_id
    on password_reset_tokens(account_user_id);

create index idx_password_reset_tokens_expires_at
    on password_reset_tokens(expires_at);
