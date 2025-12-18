--write down file here
ALTER TABLE ragapp.conversations
DROP COLUMN IF EXISTS model;

ALTER TABLE ragapp.conversations
DROP COLUMN IF EXISTS model_id;