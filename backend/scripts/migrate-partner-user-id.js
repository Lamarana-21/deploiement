const { query } = require('../db');

async function migrate() {
  try {
    // Vérifier si la colonne partner_user_id existe
    const cols = await query('SHOW COLUMNS FROM internship_requests LIKE "partner_user_id"');
    
    if (cols.length === 0) {
      await query('ALTER TABLE internship_requests ADD COLUMN partner_user_id INT UNSIGNED NULL');
      console.log('[OK] partner_user_id column added');
    } else {
      console.log('[OK] partner_user_id column already exists');
    }
    
    process.exit(0);
  } catch (e) {
    console.log('[ERROR]:', e.message);
    process.exit(1);
  }
}

migrate();
