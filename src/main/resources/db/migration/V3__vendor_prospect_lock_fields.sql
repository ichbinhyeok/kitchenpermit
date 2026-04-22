alter table vendor_prospects
    add column primary_metro varchar(64);

alter table vendor_prospects
    add column service_area_text varchar(1000);

alter table vendor_prospects
    add column service_area_overlap_status varchar(64);

alter table vendor_prospects
    add column ownership_style varchar(32);

alter table vendor_prospects
    add column documentation_maturity varchar(32);

alter table vendor_prospects
    add column primary_offer_axis varchar(32);

alter table vendor_prospects
    add column source_url varchar(512);

alter table vendor_prospects
    add column notes varchar(2000);

alter table vendor_prospects
    add column contact_name varchar(255);

alter table vendor_prospects
    add column role_title varchar(255);

alter table vendor_prospects
    add column email varchar(255);

alter table vendor_prospects
    add column phone varchar(64);

alter table vendor_prospects
    add column contact_confidence integer;

alter table vendor_prospects
    add column contact_source_url varchar(512);

update vendor_prospects
set primary_metro = coalesce(primary_metro, metro_scope),
    service_area_text = coalesce(service_area_text, metro_scope),
    service_area_overlap_status = coalesce(service_area_overlap_status, 'ACTIVE_OVERLAP'),
    ownership_style = coalesce(ownership_style, 'OWNER_LED'),
    documentation_maturity = coalesce(documentation_maturity, 'LOW'),
    primary_offer_axis = coalesce(primary_offer_axis, 'AXIS_2'),
    source_url = coalesce(source_url, website_url),
    contact_confidence = coalesce(contact_confidence, 0);

alter table vendor_prospects
    alter column primary_metro set not null;

alter table vendor_prospects
    alter column service_area_text set not null;

alter table vendor_prospects
    alter column service_area_overlap_status set not null;

alter table vendor_prospects
    alter column ownership_style set not null;

alter table vendor_prospects
    alter column documentation_maturity set not null;

alter table vendor_prospects
    alter column primary_offer_axis set not null;

alter table vendor_prospects
    alter column source_url set not null;

alter table vendor_prospects
    alter column contact_confidence set not null;
