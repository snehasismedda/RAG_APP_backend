create table if not exists ragapp.files(
    id bigint primary key default ragapp.generate_id(),
    file_name text not null,
    file_url text not null,
    fk_notebook_id bigint,
    fk_user_id bigint,
    mime_type text,
    file_size bigint,
    status text default 'PENDING', --'PENDING', 'UPLOADED', 'PROCESSING', 'EMBEDDED', 'FAILED'
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    deleted_at timestamp
);

