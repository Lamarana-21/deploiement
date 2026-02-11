const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const mysql = require("mysql2/promise");

async function main() {
  const schemaPath = path.resolve(__dirname, "..", "sql", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";

  // Connect without specifying database (schema creates/uses DB).
  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await connection.query(schema);
  await connection.end();

  console.log("DB initialized successfully.");
}

main().catch((err) => {
  console.error("DB init failed:", err.message);
  process.exitCode = 1;
});
