--write up file here

ALTER TABLE ragapp.conversations
ADD COLUMN IF NOT EXISTS model text;

ALTER TABLE ragapp.conversations
ADD COLUMN IF NOT EXISTS model_id text;
