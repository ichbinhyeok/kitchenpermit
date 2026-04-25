alter table vendor_prospects
    add column vendor_fit_score integer;

alter table vendor_prospects
    add column legitimacy_score integer;

alter table vendor_prospects
    add column source_channel varchar(32);

alter table vendor_prospects
    add column send_priority varchar(32);

update vendor_prospects
set vendor_fit_score = greatest(coalesce(axis1_angle_fit, 0), coalesce(axis2_angle_fit, 0)),
    legitimacy_score = 70,
    source_channel = 'OFFICIAL_SITE',
    send_priority = case
        when prospect_status = 'ACTIVE' then 'P2'
        else 'RESEARCH'
    end;

alter table vendor_prospects
    alter column vendor_fit_score set not null;

alter table vendor_prospects
    alter column legitimacy_score set not null;

alter table vendor_prospects
    alter column source_channel set not null;

alter table vendor_prospects
    alter column send_priority set not null;
