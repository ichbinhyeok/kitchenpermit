alter table axis1_company_profiles
    add column logo_url text not null default '';

alter table axis1_company_profiles
    add column brand_color varchar(16) not null default '#0F172A';
