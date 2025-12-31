--write up file here
-- USERS TABLE
CREATE INDEX IF NOT EXISTS idx_users_email 
    ON ragapp.users (email) 
WHERE is_deleted = false;

-- NOTEBOOKS TABLE
CREATE INDEX IF NOT EXISTS idx_notebooks_fk_user_id 
    ON ragapp.notebooks (fk_user_id) 
WHERE is_deleted = false;

-- FILES TABLE
CREATE INDEX IF NOT EXISTS idx_files_fk_user_id_fk_notebook_id 
    ON ragapp.files ( fk_user_id, fk_notebook_id ) 
WHERE is_deleted = false;

-- CHATS TABLE
CREATE INDEX IF NOT EXISTS idx_chats_fk_user_id_fk_notebook_id 
    ON ragapp.chats (fk_user_id, fk_notebook_id) 
WHERE is_deleted = false;

-- CONVERSATIONS TABLE
CREATE INDEX IF NOT EXISTS idx_conversations_fk_user_id_fk_notebook_id 
    ON ragapp.conversations (fk_user_id, fk_notebook_id)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_conversations_fk_chat_id_fk_user_id 
    ON ragapp.conversations (fk_chat_id, fk_user_id)
WHERE is_deleted = false;

-- REFRESH_TOKENS TABLE
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_fk_user_id 
    ON ragapp.refresh_tokens (fk_user_id) 
WHERE is_deleted = false;

-- SYSTEM_PROMPTS TABLE
CREATE INDEX IF NOT EXISTS idx_system_prompts_prompt_key_version 
    ON ragapp.system_prompts (prompt_key, version)
    WHERE is_deleted = false;
