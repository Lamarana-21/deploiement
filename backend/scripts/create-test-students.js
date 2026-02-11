const { query } = require('../db');
const bcrypt = require('bcryptjs');

async function createTestStudents() {
  console.log('=== Création d\'étudiants de test pour la même classe ===\n');

  // Définir la classe de test
  const testClasse = 'L3DSI G1';
  
  // Liste des étudiants à créer
  const students = [
    { fullname: 'Ahmed Ben Ali', email: 'ahmed.benali@test.tn' },
    { fullname: 'Fatma Trabelsi', email: 'fatma.trabelsi@test.tn' },
    { fullname: 'Mohamed Bouazizi', email: 'mohamed.bouazizi@test.tn' },
    { fullname: 'Sarra Hamdi', email: 'sarra.hamdi@test.tn' },
    { fullname: 'Youssef Jebali', email: 'youssef.jebali@test.tn' },
  ];

  const passwordHash = await bcrypt.hash('test123', 10);

  for (const student of students) {
    try {
      // Vérifier si l'étudiant existe déjà
      const existing = await query(
        'SELECT id FROM users WHERE email = :email LIMIT 1',
        { email: student.email }
      );

      if (existing.length > 0) {
        // Mettre à jour la classe si l'étudiant existe
        await query(
          'UPDATE users SET classe = :classe WHERE email = :email',
          { classe: testClasse, email: student.email }
        );
        console.log(`[UPDATED] ${student.fullname} - classe mise à jour: ${testClasse}`);
      } else {
        // Créer le nouvel étudiant (password_hash au lieu de password)
        await query(
          `INSERT INTO users (fullname, email, password_hash, role, classe) 
           VALUES (:fullname, :email, :password_hash, 'student', :classe)`,
          {
            fullname: student.fullname,
            email: student.email,
            password_hash: passwordHash,
            classe: testClasse
          }
        );
        console.log(`[CREATED] ${student.fullname} (${student.email}) - classe: ${testClasse}`);
      }
    } catch (err) {
      console.error(`[ERROR] ${student.fullname}: ${err.message}`);
    }
  }

  console.log('\n=== Récapitulatif des étudiants de la classe', testClasse, '===\n');
  
  const allStudents = await query(
    'SELECT id, fullname, email, classe FROM users WHERE role = "student" AND classe = :classe ORDER BY fullname',
    { classe: testClasse }
  );
  
  console.table(allStudents);
  
  console.log('\n✅ Terminé! Mot de passe pour tous les comptes de test: test123');
  process.exit(0);
}

createTestStudents().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
