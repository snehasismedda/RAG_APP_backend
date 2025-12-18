import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    const sqlPath = path.join(__dirname, '../sql/up/20251210084554_update_conversation_table_to_store_model_data_up.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    return knex.raw(sql);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    const sqlPath = path.join(__dirname, '../sql/down/20251210084554_update_conversation_table_to_store_model_data_down.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    return knex.raw(sql);
}
