create table if not exists ragapp.notebooks(
    id bigint primary key default ragapp.generate_id(),
    title text not null,
    description text,
    fk_user_id bigint,
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp,
    deleted_at timestamp
);
