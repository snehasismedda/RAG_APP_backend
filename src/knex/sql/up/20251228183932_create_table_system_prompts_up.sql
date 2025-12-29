--write up file here
CREATE TABLE IF NOT EXISTS ragapp.system_prompts (
    id bigint primary key default ragapp.generate_id(),
    prompt_key VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);