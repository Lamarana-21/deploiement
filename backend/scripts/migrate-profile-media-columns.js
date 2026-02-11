const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const mysql = require("mysql2/promise");

async function ensureColumn(connection, dbName, tableName, columnName, columnDefinitionSql) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, tableName, columnName]
  );

  if (rows[0].cnt > 0) {
    console.log(`[OK] ${tableName}.${columnName} already exists`);
    return;
  }

  console.log(`[MIGRATE] Adding ${tableName}.${columnName} ...`);
  await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDefinitionSql}`);
  console.log(`[OK] Added ${tableName}.${columnName}`);
}

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";

  const dbName = process.env.DB_NAME || "GestionOffreStage";

  const connection = await mysql.createConnection({ host, port, user, password, database: dbName });

  await ensureColumn(connection, dbName, "users", "cv_url", "`cv_url` VARCHAR(255) NULL");
  await ensureColumn(connection, dbName, "users", "avatar_url", "`avatar_url` VARCHAR(255) NULL");

  await connection.end();
  console.log("Migration completed.");
}
npm 
main().catch((err) => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});
