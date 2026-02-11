/**
 * Script de migration pour le système d'approbation des enseignants
 * 
 * Ce script ajoute :
 * - Un statut d'approbation aux propositions (pending, approved, rejected)
 * - Une colonne supervisor_id dans internship_requests
 * - Une logique de limitation (max 2 étudiants par encadrant, seulement si binômes)
 */

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
    return false;
  }

  console.log(`[MIGRATE] Adding ${tableName}.${columnName} ...`);
  await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDefinitionSql}`);
  console.log(`[OK] Added ${tableName}.${columnName}`);
  return true;
}

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "GestionOffreStage";

  console.log("=== Migration: Teacher Approval System ===\n");

  const connection = await mysql.createConnection({ host, port, user, password, database: dbName });

  try {
    // 1. Ajouter approval_status à subject_proposals
    await ensureColumn(
      connection, dbName, "subject_proposals", "approval_status",
      "`approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER `status`"
    );

    // 2. Ajouter rejection_reason
    await ensureColumn(
      connection, dbName, "subject_proposals", "rejection_reason",
      "`rejection_reason` TEXT NULL AFTER `approval_status`"
    );

    // 3. Ajouter approved_at
    await ensureColumn(
      connection, dbName, "subject_proposals", "approved_at",
      "`approved_at` DATETIME NULL AFTER `rejection_reason`"
    );

    // 4. Ajouter approved_by
    await ensureColumn(
      connection, dbName, "subject_proposals", "approved_by",
      "`approved_by` INT UNSIGNED NULL AFTER `approved_at`"
    );

    // 5. Ajouter supervisor_id à internship_requests
    await ensureColumn(
      connection, dbName, "internship_requests", "supervisor_id",
      "`supervisor_id` INT UNSIGNED NULL AFTER `isett_supervisor`"
    );

    // 6. Créer ou mettre à jour la vue pour compter les étudiants par encadrant
    console.log(`[MIGRATE] Creating/updating supervisor_student_count view...`);
    await connection.query(`
      CREATE OR REPLACE VIEW supervisor_student_count AS
      SELECT 
          u.id AS supervisor_id,
          u.fullname AS supervisor_name,
          COUNT(DISTINCT ir.id) AS student_count,
          SUM(CASE WHEN ir.has_partner = 1 THEN 1 ELSE 0 END) AS binome_count,
          SUM(CASE WHEN ir.has_partner = 0 THEN 1 ELSE 0 END) AS solo_count
      FROM users u
      LEFT JOIN internship_requests ir ON ir.supervisor_id = u.id AND ir.status = 'approved'
      WHERE u.role = 'teacher'
      GROUP BY u.id, u.fullname
    `);
    console.log(`[OK] View supervisor_student_count created/updated`);

    console.log("\n=== Migration completed successfully! ===");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});
