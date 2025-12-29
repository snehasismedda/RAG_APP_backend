create table if not exists ragapp.conversations(
    id bigint primary key default ragapp.generate_id(),
    message jsonb not null,
    metadata jsonb,
    role text not null,
    display_sequence serial not null,
    fk_chat_id bigint,
    fk_notebook_id bigint,
    fk_user_id bigint,
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    deleted_at timestamp
);
