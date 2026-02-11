/**
 * Script pour remplir la base de données avec des données de démonstration
 * Pour voir les graphiques et statistiques du tableau de bord administrateur
 * 
 * Exécution: node scripts/seed-demo-data.js
 */

const { query, pool } = require('../db');
const bcrypt = require('bcryptjs');

// Données de démonstration
const demoData = {
  // Utilisateurs de démonstration
  users: [
    // Admin
    { fullname: 'Admin Système', email: 'admin@isett.tn', password: 'admin123', role: 'admin' },
    
    // Enseignants
    { fullname: 'Dr. Mohamed Ben Ali', email: 'mohamed.benali@isett.tn', password: 'prof123', role: 'teacher' },
    { fullname: 'Dr. Fatma Trabelsi', email: 'fatma.trabelsi@isett.tn', password: 'prof123', role: 'teacher' },
    { fullname: 'Dr. Ahmed Mansour', email: 'ahmed.mansour@isett.tn', password: 'prof123', role: 'teacher' },
    { fullname: 'Dr. Sonia Gharbi', email: 'sonia.gharbi@isett.tn', password: 'prof123', role: 'teacher' },
    { fullname: 'Dr. Karim Jebali', email: 'karim.jebali@isett.tn', password: 'prof123', role: 'teacher' },
    
    // Étudiants - Différentes classes
    { fullname: 'Yassine Bouazizi', email: 'yassine.bouazizi@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Amira Chaabane', email: 'amira.chaabane@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Mehdi Sassi', email: 'mehdi.sassi@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Salma Khelifi', email: 'salma.khelifi@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Omar Hamdi', email: 'omar.hamdi@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Ines Mejri', email: 'ines.mejri@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Fares Bouslama', email: 'fares.bouslama@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Nour Ben Salah', email: 'nour.bensalah@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Amine Riahi', email: 'amine.riahi@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Rania Tlili', email: 'rania.tlili@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Bilel Guesmi', email: 'bilel.guesmi@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Mariem Sfar', email: 'mariem.sfar@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Wassim Belhaj', email: 'wassim.belhaj@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Sarra Miled', email: 'sarra.miled@etud.isett.tn', password: 'etud123', role: 'student' },
    { fullname: 'Hatem Zouari', email: 'hatem.zouari@etud.isett.tn', password: 'etud123', role: 'student' },
  ],

  // Entreprises partenaires
  companies: [
    'Vermeg',
    'Sofrecom Tunisie',
    'Telnet Holding',
    'Linedata',
    'Sopra HR Software',
    'Focus Corporation',
    'Cynapsys',
    'Proxym Group',
    'Actia Engineering',
    'Wevioo'
  ],

  // Classes disponibles
  classes: [
    'L3-GL', 'L3-RSI', 'L3-BI', 'L3-DS',
    'M1-GL', 'M1-RSI', 'M1-BI',
    'M2-GL', 'M2-RSI', 'M2-BI'
  ],

  // Offres de stage
  offers: [
    {
      title: 'Développeur Full Stack JavaScript',
      company: 'Vermeg',
      location: 'Tunis, Tunisie',
      description: 'Rejoignez notre équipe de développement pour créer des solutions financières innovantes. Vous travaillerez avec React, Node.js et MongoDB.',
      requirements: 'Maîtrise de JavaScript, React, Node.js. Connaissance des bases de données NoSQL appréciée.',
      type: 'pfe',
      status: 'open'
    },
    {
      title: 'Stage Data Science & Machine Learning',
      company: 'Sofrecom Tunisie',
      location: 'Les Berges du Lac, Tunis',
      description: 'Intégrez notre équipe IA pour développer des modèles prédictifs et des solutions de data analytics.',
      requirements: 'Python, TensorFlow ou PyTorch, SQL, connaissances en statistiques.',
      type: 'pfe',
      status: 'open'
    },
    {
      title: 'Développeur Mobile Flutter',
      company: 'Telnet Holding',
      location: 'Ariana, Tunisie',
      description: 'Développement d\'applications mobiles cross-platform avec Flutter et Dart.',
      requirements: 'Flutter, Dart, API REST, Git.',
      type: 'perfectionnement',
      status: 'open'
    },
    {
      title: 'Administrateur Systèmes et Réseaux',
      company: 'Linedata',
      location: 'Centre Urbain Nord, Tunis',
      description: 'Administration des infrastructures Linux et Windows, virtualisation et cloud.',
      requirements: 'Linux, Windows Server, VMware, Docker, notions cloud AWS/Azure.',
      type: 'pfe',
      status: 'open'
    },
    {
      title: 'Stage Développement .NET',
      company: 'Sopra HR Software',
      location: 'Tunis, Tunisie',
      description: 'Participation au développement de notre solution RH en C# .NET.',
      requirements: 'C#, .NET Core, SQL Server, Entity Framework.',
      type: 'perfectionnement',
      status: 'open'
    },
    {
      title: 'Stage Initiation - Support Technique',
      company: 'Focus Corporation',
      location: 'Sfax, Tunisie',
      description: 'Découverte du support technique IT et de la maintenance informatique.',
      requirements: 'Notions de base en informatique, bon relationnel.',
      type: 'initiation',
      status: 'open'
    },
    {
      title: 'Développeur Backend Java/Spring',
      company: 'Cynapsys',
      location: 'Tunis, Tunisie',
      description: 'Développement de microservices avec Spring Boot et architecture cloud-native.',
      requirements: 'Java 11+, Spring Boot, Microservices, Docker, Kubernetes.',
      type: 'pfe',
      status: 'open'
    },
    {
      title: 'Stage DevOps & CI/CD',
      company: 'Proxym Group',
      location: 'Sousse, Tunisie',
      description: 'Mise en place de pipelines CI/CD et automatisation des déploiements.',
      requirements: 'Jenkins/GitLab CI, Docker, Kubernetes, Ansible.',
      type: 'perfectionnement',
      status: 'open'
    },
    {
      title: 'Stage Initiation Développement Web',
      company: 'Actia Engineering',
      location: 'Tunis, Tunisie',
      description: 'Initiation au développement web frontend avec HTML, CSS et JavaScript.',
      requirements: 'Bases en HTML/CSS, motivation, capacité d\'apprentissage.',
      type: 'initiation',
      status: 'open'
    },
    {
      title: 'Business Intelligence Analyst',
      company: 'Wevioo',
      location: 'Les Berges du Lac, Tunis',
      description: 'Analyse de données et création de tableaux de bord avec Power BI.',
      requirements: 'SQL, Power BI ou Tableau, Excel avancé.',
      type: 'pfe',
      status: 'open'
    },
    {
      title: 'Stage Cybersécurité',
      company: 'Vermeg',
      location: 'Tunis, Tunisie',
      description: 'Audit de sécurité, tests de pénétration et mise en conformité.',
      requirements: 'Réseaux, Linux, outils de pentest, certifications appréciées.',
      type: 'pfe',
      status: 'open'
    },
    {
      title: 'Stage UX/UI Design',
      company: 'Sofrecom Tunisie',
      location: 'Tunis, Tunisie',
      description: 'Conception d\'interfaces utilisateur et expérience utilisateur.',
      requirements: 'Figma, Adobe XD, notions de design thinking.',
      type: 'perfectionnement',
      status: 'open'
    },
    {
      title: 'Stage Initiation Base de Données',
      company: 'Telnet Holding',
      location: 'Ariana, Tunisie',
      description: 'Découverte de l\'administration de bases de données MySQL et PostgreSQL.',
      requirements: 'Notions SQL, rigueur, envie d\'apprendre.',
      type: 'initiation',
      status: 'open'
    },
    {
      title: 'Développeur React Native',
      company: 'Linedata',
      location: 'Tunis, Tunisie',
      description: 'Développement d\'applications mobiles avec React Native.',
      requirements: 'JavaScript, React, React Native, Redux.',
      type: 'perfectionnement',
      status: 'open'
    },
    {
      title: 'Stage Intelligence Artificielle',
      company: 'Cynapsys',
      location: 'Tunis, Tunisie',
      description: 'Recherche et développement en IA, NLP et computer vision.',
      requirements: 'Python, Deep Learning, TensorFlow/PyTorch, mathématiques.',
      type: 'pfe',
      status: 'open'
    }
  ]
};

// Fonction pour générer une date aléatoire dans les X derniers mois
function randomDateInLastMonths(months) {
  const now = new Date();
  const past = new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// Fonction principale
async function seedDemoData() {
  console.log('🚀 Démarrage du seed des données de démonstration...\n');

  try {
    // 1. Vider les tables existantes (optionnel - commenter si vous voulez garder les données)
    console.log('🗑️  Nettoyage des tables...');
    await query('SET FOREIGN_KEY_CHECKS = 0');
    await query('TRUNCATE TABLE notifications');
    await query('TRUNCATE TABLE offer_favorites');
    await query('TRUNCATE TABLE offer_applications');
    await query('TRUNCATE TABLE internship_offers');
    await query('TRUNCATE TABLE subject_proposals');
    await query('TRUNCATE TABLE internship_requests');
    await query('TRUNCATE TABLE users');
    await query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables nettoyées\n');

    // 2. Insérer les utilisateurs
    console.log('👥 Insertion des utilisateurs...');
    const userIds = { admin: [], teachers: [], students: [] };
    
    for (const user of demoData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const createdAt = randomDateInLastMonths(6);
      
      const result = await query(
        'INSERT INTO users (fullname, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
        [user.fullname, user.email, hashedPassword, user.role, createdAt]
      );
      
      if (user.role === 'admin') userIds.admin.push(result.insertId);
      else if (user.role === 'teacher') userIds.teachers.push(result.insertId);
      else userIds.students.push(result.insertId);
    }
    console.log(`✅ ${demoData.users.length} utilisateurs créés\n`);

    // 3. Insérer les offres de stage
    console.log('📋 Insertion des offres de stage...');
    const offerIds = [];
    
    for (const offer of demoData.offers) {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + Math.floor(Math.random() * 3) + 1);
      const createdAt = randomDateInLastMonths(4);
      
      const result = await query(
        `INSERT INTO internship_offers 
         (title, company, location, description, requirements, type, deadline, status, created_by, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [offer.title, offer.company, offer.location, offer.description, 
         offer.requirements, offer.type, deadline, offer.status, 
         userIds.admin[0], createdAt]
      );
      offerIds.push(result.insertId);
    }
    console.log(`✅ ${demoData.offers.length} offres créées\n`);

    // 4. Insérer des candidatures aux offres
    console.log('📨 Insertion des candidatures...');
    const statuses = ['pending', 'accepted', 'rejected'];
    let applicationCount = 0;
    
    for (const studentId of userIds.students) {
      // Chaque étudiant postule à 2-5 offres aléatoires
      const numApplications = Math.floor(Math.random() * 4) + 2;
      const shuffledOffers = [...offerIds].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(numApplications, shuffledOffers.length); i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const createdAt = randomDateInLastMonths(5);
        
        try {
          await query(
            'INSERT INTO offer_applications (offer_id, user_id, status, created_at) VALUES (?, ?, ?, ?)',
            [shuffledOffers[i], studentId, status, createdAt]
          );
          applicationCount++;
        } catch (e) {
          // Ignore duplicate errors
        }
      }
    }
    console.log(`✅ ${applicationCount} candidatures créées\n`);

    // 5. Insérer des demandes de stage (internship_requests)
    console.log('📝 Insertion des demandes de stage...');
    const requestStatuses = ['pending', 'approved', 'rejected'];
    let requestCount = 0;
    
    const studentNames = [
      { name: 'Yassine', surname: 'Bouazizi' },
      { name: 'Amira', surname: 'Chaabane' },
      { name: 'Mehdi', surname: 'Sassi' },
      { name: 'Salma', surname: 'Khelifi' },
      { name: 'Omar', surname: 'Hamdi' },
      { name: 'Ines', surname: 'Mejri' },
      { name: 'Fares', surname: 'Bouslama' },
      { name: 'Nour', surname: 'Ben Salah' },
      { name: 'Amine', surname: 'Riahi' },
      { name: 'Rania', surname: 'Tlili' },
      { name: 'Bilel', surname: 'Guesmi' },
      { name: 'Mariem', surname: 'Sfar' },
      { name: 'Wassim', surname: 'Belhaj' },
      { name: 'Sarra', surname: 'Miled' },
      { name: 'Hatem', surname: 'Zouari' },
    ];

    const subjects = [
      'Développement d\'une application e-commerce',
      'Mise en place d\'un système de gestion des stocks',
      'Création d\'une plateforme de réservation en ligne',
      'Développement d\'une application mobile de suivi fitness',
      'Conception d\'un dashboard analytique',
      'Implémentation d\'un chatbot intelligent',
      'Système de reconnaissance faciale',
      'Application de gestion de projets',
      'Plateforme d\'apprentissage en ligne',
      'Système de monitoring réseau'
    ];

    for (let i = 0; i < userIds.students.length; i++) {
      const student = studentNames[i] || studentNames[0];
      const studentClass = demoData.classes[Math.floor(Math.random() * demoData.classes.length)];
      const company = demoData.companies[Math.floor(Math.random() * demoData.companies.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const status = requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
      const hasPartner = Math.random() > 0.7;
      const createdAt = randomDateInLastMonths(5);

      await query(
        `INSERT INTO internship_requests 
         (student_name, student_surname, student_class, student_phone, student_email,
          has_partner, subject_title, host_company, status, user_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student.name, student.surname, studentClass, 
         `+216 ${Math.floor(Math.random() * 90000000) + 10000000}`,
         `${student.name.toLowerCase()}.${student.surname.toLowerCase()}@etud.isett.tn`,
         hasPartner ? 1 : 0, subject, company, status, userIds.students[i], createdAt]
      );
      requestCount++;
    }
    console.log(`✅ ${requestCount} demandes de stage créées\n`);

    // 6. Insérer des propositions d'enseignants
    console.log('💡 Insertion des propositions de sujets...');
    const proposalStatuses = ['available', 'assigned', 'archived'];
    const teacherProposals = [
      { title: 'Système de détection d\'intrusion basé sur l\'IA', desc: 'Développer un IDS utilisant des algorithmes de machine learning pour détecter les menaces réseau.' },
      { title: 'Application IoT pour agriculture intelligente', desc: 'Créer un système de monitoring agricole avec capteurs et tableau de bord temps réel.' },
      { title: 'Blockchain pour la traçabilité alimentaire', desc: 'Implémenter une solution blockchain pour suivre la chaîne d\'approvisionnement alimentaire.' },
      { title: 'Assistant virtuel pour support étudiant', desc: 'Développer un chatbot IA pour répondre aux questions fréquentes des étudiants.' },
      { title: 'Plateforme de télémédecine', desc: 'Créer une application web/mobile pour consultations médicales à distance.' },
      { title: 'Système de recommandation e-learning', desc: 'Développer un moteur de recommandation personnalisé pour contenus éducatifs.' },
      { title: 'Application de covoiturage universitaire', desc: 'Créer une plateforme de mise en relation pour covoiturage entre étudiants.' },
      { title: 'Système de gestion de parking intelligent', desc: 'Développer une solution IoT pour gestion automatisée de parking.' },
    ];

    const teacherNames = [
      { name: 'Mohamed', surname: 'Ben Ali' },
      { name: 'Fatma', surname: 'Trabelsi' },
      { name: 'Ahmed', surname: 'Mansour' },
      { name: 'Sonia', surname: 'Gharbi' },
      { name: 'Karim', surname: 'Jebali' },
    ];

    for (let i = 0; i < teacherProposals.length; i++) {
      const teacher = teacherNames[i % teacherNames.length];
      const proposal = teacherProposals[i];
      const status = proposalStatuses[Math.floor(Math.random() * proposalStatuses.length)];
      const company = Math.random() > 0.5 ? demoData.companies[Math.floor(Math.random() * demoData.companies.length)] : null;
      const createdAt = randomDateInLastMonths(4);

      await query(
        `INSERT INTO subject_proposals 
         (teacher_name, teacher_surname, subject_title, description, host_company, status, user_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [teacher.name, teacher.surname, proposal.title, proposal.desc, 
         company, status, userIds.teachers[i % userIds.teachers.length], createdAt]
      );
    }
    console.log(`✅ ${teacherProposals.length} propositions créées\n`);

    // 7. Ajouter quelques favoris
    console.log('⭐ Ajout de favoris...');
    let favCount = 0;
    for (const studentId of userIds.students.slice(0, 8)) {
      const numFavs = Math.floor(Math.random() * 3) + 1;
      const shuffledOffers = [...offerIds].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numFavs; i++) {
        try {
          await query(
            'INSERT INTO offer_favorites (offer_id, user_id) VALUES (?, ?)',
            [shuffledOffers[i], studentId]
          );
          favCount++;
        } catch (e) {
          // Ignore
        }
      }
    }
    console.log(`✅ ${favCount} favoris ajoutés\n`);

    // Résumé final
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !');
    console.log('═══════════════════════════════════════════════════');
    console.log(`
📊 Résumé des données créées:
   • ${demoData.users.length} utilisateurs (1 admin, 5 enseignants, ${userIds.students.length} étudiants)
   • ${demoData.offers.length} offres de stage
   • ${applicationCount} candidatures
   • ${requestCount} demandes de stage
   • ${teacherProposals.length} propositions de sujets
   • ${favCount} favoris

🔐 Comptes de test:
   Admin:     admin@isett.tn / admin123
   Enseignant: mohamed.benali@isett.tn / prof123
   Étudiant:  yassine.bouazizi@etud.isett.tn / etud123
    `);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    pool.end();
  }
}

// Exécution
seedDemoData();
