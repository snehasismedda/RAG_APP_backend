import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
let migrationName = null;

// Try to find the filename flag or a positional argument
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--filename' || arg === '-f') {
    migrationName = args[i + 1];
    break;
  }
  // Handle case where npm passes 'user_table' as a positional arg even if --filename was intended for the script but consumed by npm
  // But wait, if the user types `npm run migrate:create --filename user_table`, npm might consume --filename and pass nothing or pass user_table?
  // Actually, `npm run script --flag value` -> script receives `value` if the flag matches an npm config, or it might just pass it through.
  // Let's support finding the first non-flag argument as the name if no flag is found.
}

if (!migrationName) {
  // Fallback: find the first argument that doesn't start with '-'
  const positional = args.find((arg) => !arg.startsWith('-'));
  if (positional) {
    migrationName = positional;
  }
}

if (!migrationName) {
  // Last resort: check npm_config_filename environment variable
  // npm might convert --filename=foo to npm_config_filename=foo
  if (process.env.npm_config_filename) {
    migrationName = process.env.npm_config_filename;
  }
}

if (!migrationName) {
  console.error(
    'Please provide a migration name using --filename <name>, -f <name>, or as a positional argument.'
  );
  process.exit(1);
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-T:.Z]/g, '')
  .slice(0, 14);
const fileName = `${timestamp}_${migrationName}`;

const sqlUpPath = path.join(__dirname, 'sql', 'up', `${fileName}_up.sql`);
const sqlDownPath = path.join(__dirname, 'sql', 'down', `${fileName}_down.sql`);
const jsMigrationPath = path.join(__dirname, 'migrations', `${fileName}.js`);

// Ensure directories exist
fs.mkdirSync(path.dirname(sqlUpPath), { recursive: true });
fs.mkdirSync(path.dirname(sqlDownPath), { recursive: true });
fs.mkdirSync(path.dirname(jsMigrationPath), { recursive: true });

// Create empty SQL files
fs.writeFileSync(sqlUpPath, '--write up file here');
fs.writeFileSync(sqlDownPath, '--write down file here');

// Create JS migration file
const jsContent = `import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    const sqlPath = path.join(__dirname, '../sql/up/${fileName}_up.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    return knex.raw(sql);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    const sqlPath = path.join(__dirname, '../sql/down/${fileName}_down.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    return knex.raw(sql);
}
`;

fs.writeFileSync(jsMigrationPath, jsContent);

console.log(`Created migration files:
- ${sqlUpPath}
- ${sqlDownPath}
- ${jsMigrationPath}`);
