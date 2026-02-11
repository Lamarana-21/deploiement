const { query, pool } = require('../db');

async function testData() {
  try {
    console.log('🔍 Vérification des données dans la base...\n');
    
    // Utilisateurs admin
    const admins = await query('SELECT id, fullname, email, role FROM users WHERE role = "admin"');
    console.log('👤 Admins:', admins);
    
    // Tous les utilisateurs par rôle
    const usersByRole = await query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    console.log('📊 Utilisateurs par rôle:', usersByRole);
    
    // Candidatures par statut
    const apps = await query('SELECT status, COUNT(*) as count FROM offer_applications GROUP BY status');
    console.log('📨 Candidatures par statut:', apps);
    
    // Offres par type
    const offers = await query('SELECT type, COUNT(*) as count FROM internship_offers GROUP BY type');
    console.log('📋 Offres par type:', offers);
    
    // Demandes de stage par statut
    const internships = await query('SELECT status, COUNT(*) as count FROM internship_requests GROUP BY status');
    console.log('📝 Demandes par statut:', internships);
    
    // Propositions par statut
    const proposals = await query('SELECT status, COUNT(*) as count FROM subject_proposals GROUP BY status');
    console.log('💡 Propositions par statut:', proposals);
    
    // Top entreprises
    const companies = await query('SELECT company, COUNT(*) as count FROM internship_offers GROUP BY company ORDER BY count DESC LIMIT 5');
    console.log('🏢 Top entreprises:', companies);
    
    // Étudiants par classe
    const classes = await query('SELECT student_class, COUNT(*) as count FROM internship_requests GROUP BY student_class');
    console.log('🎓 Demandes par classe:', classes);
    
    console.log('\n✅ Données vérifiées avec succès!');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    pool.end();
  }
}

testData();
