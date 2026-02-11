const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

async function main() {
  const migrationPath = path.resolve(__dirname, '..', 'sql', 'migrations', '2025-12-28-favorites-notifications.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await connection.query(sql);
  await connection.end();

  console.log('Migration applied: favorites + notifications');
}

main().catch((err) => {
  console.error('DB migrate failed:', err.message);
  process.exitCode = 1;
});
