create table account_users (
    id uuid primary key,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    enabled boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);
