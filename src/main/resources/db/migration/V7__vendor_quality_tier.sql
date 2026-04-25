ALTER TABLE vendor_prospects
    ADD COLUMN vendor_quality_tier VARCHAR(16) NOT NULL DEFAULT 'B';

UPDATE vendor_prospects
SET vendor_quality_tier = CASE
    WHEN prospect_fit_score >= 82
        AND export_readiness_score >= 68
        AND ownership_style IN ('OWNER_LED', 'SMALL_OFFICE_LED')
        AND documentation_maturity <> 'HIGH'
        AND size_band IN ('SOLO', 'MICRO_TEAM', 'SMALL_OFFICE')
    THEN 'A'
    ELSE 'B'
END;
