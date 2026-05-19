alter table axis1_report_records
    add column public_view_count integer not null default 0;

alter table axis1_report_records
    add column first_viewed_at timestamp with time zone;

alter table axis1_report_records
    add column last_viewed_at timestamp with time zone;

alter table axis1_report_records
    add column pdf_save_click_count integer not null default 0;

alter table axis1_report_records
    add column last_pdf_save_clicked_at timestamp with time zone;

alter table axis1_report_records
    add column customer_confirmed_at timestamp with time zone;

alter table axis1_report_records
    add column customer_confirmed_by varchar(120);
