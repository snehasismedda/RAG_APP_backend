create table if not exists ragapp.chats(
    id bigint primary key default ragapp.generate_id(),
    title text not null,
    fk_notebook_id bigint,
    fk_user_id bigint,
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    deleted_at timestamp
);
