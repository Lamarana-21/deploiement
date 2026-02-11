const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'GestionOffreStage'
  });

  const offers = [
    {
      title: 'Plan Pro - Licence, Master, Ingenieurie',
      company: 'Innovation Formation',
      location: 'Sousse - Tunisie',
      description: 'Ce projet vise a concevoir et developper une application web et mobile permettant la planification et la gestion des taches professionnelles.',
      requirements: 'HTML, CSS, JavaScript, React, Node.js',
      type: 'pfe',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      deadline: '2025-11-04'
    },
    {
      title: 'Shop Ease - Licence, Master, Ingenieurie',
      company: 'Innovation Formation',
      location: 'Sousse - Tunisie',
      description: 'Ce projet consiste a concevoir et developper un site web dynamique et securise pour une boutique en ligne.',
      requirements: 'PHP, MySQL, Bootstrap, JavaScript',
      type: 'pfe',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      deadline: '2025-11-04'
    },
    {
      title: 'Employee Metrics - Dashboard RH',
      company: 'Innovation Formation',
      location: 'Sousse - Tunisie',
      description: 'Ce projet a pour objectif de developper un tableau de bord interactif offrant une vue complete des performances des employes.',
      requirements: 'React, Chart.js, Node.js, MongoDB',
      type: 'pfe',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      deadline: '2025-11-04'
    },
    {
      title: 'Gestion de Stock - Stage Initiation',
      company: 'TechSoft Tunisia',
      location: 'Tunis - Tunisie',
      description: 'Developpement dune application de gestion de stock pour une PME. Apprentissage des bases du developpement web.',
      requirements: 'Bases en HTML/CSS, Motivation',
      type: 'initiation',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
      deadline: '2025-12-15'
    },
    {
      title: 'Application Mobile E-Learning',
      company: 'EduTech Solutions',
      location: 'Sfax - Tunisie',
      description: 'Stage de perfectionnement pour developper une application mobile dapprentissage en ligne avec React Native.',
      requirements: 'JavaScript, React, Bases en mobile',
      type: 'perfectionnement',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop',
      deadline: '2025-12-20'
    }
  ];

  for (const o of offers) {
    await conn.execute(
      'INSERT INTO internship_offers (title, company, location, description, requirements, type, image, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [o.title, o.company, o.location, o.description, o.requirements, o.type, o.image, o.deadline, 'open']
    );
    console.log('Created:', o.title);
  }

  await conn.end();
  console.log('Done! 5 offers created.');
}

seed().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
