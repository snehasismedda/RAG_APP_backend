create table if not exists ragapp.refresh_tokens(
    id bigint primary key default ragapp.generate_id(),
    refresh_token text not null unique,
    fk_user_id bigint,
    expires_at timestamp,
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    deleted_at timestamp
);
