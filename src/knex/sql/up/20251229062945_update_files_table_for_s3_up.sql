--write up file here
ALTER TABLE ragapp.files
ADD COLUMN IF NOT EXISTS storage_provider text default 's3',
ADD COLUMN IF NOT EXISTS bucket_name text,
ADD COLUMN IF NOT EXISTS object_key text,
ADD COLUMN IF NOT EXISTS checksum_sha256 char(64),
ADD COLUMN IF NOT EXISTS upload_completed_at timestamp,
ADD COLUMN IF NOT EXISTS processing_started_at timestamp,
ADD COLUMN IF NOT EXISTS processing_completed_at timestamp,
ADD COLUMN IF NOT EXISTS error_message text,
DROP COLUMN IF EXISTS file_url;