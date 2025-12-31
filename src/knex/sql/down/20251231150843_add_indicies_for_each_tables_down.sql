--write down file here
-- USERS TABLE
DROP INDEX IF EXISTS ragapp.idx_users_email;

-- NOTEBOOKS TABLE
DROP INDEX IF EXISTS ragapp.idx_notebooks_fk_user_id;

-- FILES TABLE
DROP INDEX IF EXISTS ragapp.idx_files_fk_user_id_fk_notebook_id;

-- CHATS TABLE
DROP INDEX IF EXISTS ragapp.idx_chats_fk_user_id_fk_notebook_id;

-- CONVERSATIONS TABLE
DROP INDEX IF EXISTS ragapp.idx_conversations_fk_user_id_fk_notebook_id;
DROP INDEX IF EXISTS ragapp.idx_conversations_fk_chat_id_fk_user_id;

-- REFRESH_TOKENS TABLE
DROP INDEX IF EXISTS ragapp.idx_refresh_tokens_fk_user_id;

-- SYSTEM_PROMPTS TABLE
DROP INDEX IF EXISTS ragapp.idx_system_prompts_prompt_key_version;
