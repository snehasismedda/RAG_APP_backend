--write down file here
ALTER TABLE ragapp.files
DROP COLUMN IF EXISTS storage_provider,
DROP COLUMN IF EXISTS bucket_name,
DROP COLUMN IF EXISTS object_key,
DROP COLUMN IF EXISTS checksum_sha256,
DROP COLUMN IF EXISTS upload_completed_at,
DROP COLUMN IF EXISTS processing_started_at,
DROP COLUMN IF EXISTS processing_completed_at,
DROP COLUMN IF EXISTS error_message,
ADD COLUMN IF NOT EXISTS file_url text;