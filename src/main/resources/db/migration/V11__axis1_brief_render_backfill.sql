create table if not exists axis1_brief_renders (
    id uuid primary key,
    axis1_job_id uuid not null unique references axis1_jobs(id),
    render_version varchar(64) not null,
    delivery_token varchar(64) not null unique,
    html_path varchar(512),
    pdf_path varchar(512),
    render_status varchar(64) not null,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);
