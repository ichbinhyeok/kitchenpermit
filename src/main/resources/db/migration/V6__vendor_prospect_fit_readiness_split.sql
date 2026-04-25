alter table vendor_prospects
    add column prospect_fit_score integer;

alter table vendor_prospects
    add column export_readiness_score integer;

update vendor_prospects
set prospect_fit_score = coalesce(vendor_fit_score, greatest(coalesce(axis1_angle_fit, 0), coalesce(axis2_angle_fit, 0))),
    export_readiness_score = least(
        100,
        greatest(
            0,
            coalesce(contact_confidence, 0)
            + case
                when prospect_status = 'ACTIVE' then 14
                when prospect_status = 'RESEARCH' then -10
                else 0
            end
            + case
                when coalesce(email, '') <> '' then 12
                else 0
            end
            + case
                when coalesce(contact_source_url, '') <> '' then 8
                else 0
            end
            + case
                when coalesce(phone, '') <> '' then 4
                else 0
            end
            + case coalesce(source_channel, '')
                when 'OFFICIAL_SITE' then 12
                when 'GOOGLE_MAPS' then 9
                when 'GOVERNMENT_LISTING' then 8
                when 'REVIEW_PLATFORM' then 4
                when 'SOCIAL_PROFILE' then 3
                when 'BUSINESS_DIRECTORY' then 1
                else 0
            end
            + case
                when coalesce(legitimacy_score, 0) >= 75 then 10
                when coalesce(legitimacy_score, 0) >= 65 then 6
                when coalesce(legitimacy_score, 0) >= 55 then 2
                else 0
            end
        )
    );

alter table vendor_prospects
    alter column prospect_fit_score set not null;

alter table vendor_prospects
    alter column export_readiness_score set not null;
