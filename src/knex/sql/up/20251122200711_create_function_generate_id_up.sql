create or replace function ragapp.generate_id()
returns bigint as $$
declare
    our_epoch bigint := 1700000000000;
    seq_id bigint;
    now_millis bigint;
    random_part bigint;
begin
    now_millis := (extract(epoch from clock_timestamp()) * 1000)::bigint - our_epoch;
    random_part := (random() * 4194303)::bigint;
    seq_id := (now_millis << 22) | random_part;
    return seq_id;
end;
$$ language plpgsql;
