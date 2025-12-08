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
    '../sql/up/20251122200711_create_function_generate_id_up.sql'
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
    '../sql/down/20251122200711_create_function_generate_id_down.sql'
  );
  const sql = fs.readFileSync(sqlPath, 'utf8');
  return knex.raw(sql);
}
