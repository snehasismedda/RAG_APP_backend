create table if not exists ragapp.users(
    id bigint primary key default ragapp.generate_id(),
    user_id text not null unique,
    first_name text not null,
    last_name  text not null,
    email text not null unique,
    hash_password text not null,
    role text default 'user',
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp,
    deleted_at timestamp
);
