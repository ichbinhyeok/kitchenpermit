alter table axis2_packet_renders
    add column delivery_token varchar(64);

alter table axis2_packet_renders
    alter column delivery_token set not null;

alter table axis2_packet_renders
    add constraint uq_axis2_packet_renders_delivery_token unique (delivery_token);
