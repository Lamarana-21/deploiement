const { query } = require("../db");

async function checkData() {
  try {
    console.log("=== Test de la requête corrigée (groupée) ===");
    const supervisors = await query(`
      SELECT 
        u.id, 
        u.fullname, 
        u.email,
        COUNT(sp.id) as approved_proposals_count
      FROM users u
      INNER JOIN subject_proposals sp ON sp.user_id = u.id 
        AND sp.approval_status = 'approved' 
        AND sp.status = 'available'
      WHERE u.role = 'teacher'
      GROUP BY u.id, u.fullname, u.email
      ORDER BY u.fullname ASC
    `);
    console.log(JSON.stringify(supervisors, null, 2));
    
    console.log("\nNombre d'enseignants disponibles:", supervisors.length);
    
    process.exit(0);
  } catch (err) {
    console.error("Erreur:", err);
    process.exit(1);
  }
}

checkData();
