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
  const sqlPath = path.join(
    __dirname,
    '../sql/up/20251122200713_create_table_refresh_tokens_up.sql'
  );
  const sql = fs.readFileSync(sqlPath, 'utf8');
  return knex.raw(sql);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  const sqlPath = path.join(
    __dirname,
    '../sql/down/20251122200713_create_table_refresh_tokens_down.sql'
  );
  const sql = fs.readFileSync(sqlPath, 'utf8');
  return knex.raw(sql);
}
