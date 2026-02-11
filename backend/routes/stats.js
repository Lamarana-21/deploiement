const express = require('express');
const { query } = require('../db');

const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/stats - Statistiques pour le dashboard admin
router.get('/', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    // Statistiques générales
    const [usersCount] = await query('SELECT COUNT(*) as count FROM users');
    const [studentsCount] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const [teachersCount] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'");
    
    const [offersCount] = await query('SELECT COUNT(*) as count FROM internship_offers');
    const [openOffersCount] = await query("SELECT COUNT(*) as count FROM internship_offers WHERE status = 'open'");
    const [applicationsCount] = await query('SELECT COUNT(*) as count FROM offer_applications');
    const [internshipsCount] = await query('SELECT COUNT(*) as count FROM internship_requests');
    const [proposalsCount] = await query('SELECT COUNT(*) as count FROM subject_proposals');

    // Demandes en attente (pour notification admin)
    const [pendingInternships] = await query("SELECT COUNT(*) as count FROM internship_requests WHERE status = 'pending'");
    const [pendingApplications] = await query("SELECT COUNT(*) as count FROM offer_applications WHERE status = 'pending'");
    const [pendingProposals] = await query("SELECT COUNT(*) as count FROM subject_proposals WHERE status = 'available'");

    // Statistiques par statut des demandes de stage
    const internshipsByStatus = await query(`
      SELECT status, COUNT(*) as count 
      FROM internship_requests 
      GROUP BY status
    `);

    // Statistiques par statut des candidatures
    const applicationsByStatus = await query(`
      SELECT status, COUNT(*) as count 
      FROM offer_applications 
      GROUP BY status
    `);

    // Statistiques par type d'offres
    const offersByType = await query(`
      SELECT type, COUNT(*) as count 
      FROM internship_offers 
      GROUP BY type
    `);

    // Statistiques par statut des propositions
    const proposalsByStatus = await query(`
      SELECT status, COUNT(*) as count 
      FROM subject_proposals 
      GROUP BY status
    `);

    // Inscriptions par mois (derniers 6 mois)
    const registrationsByMonth = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Candidatures par mois (derniers 6 mois)
    const applicationsByMonth = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM offer_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Demandes de stage par mois (derniers 6 mois)
    const internshipsByMonth = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM internship_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Top 5 entreprises les plus demandées
    const topCompanies = await query(`
      SELECT company, COUNT(*) as count 
      FROM internship_offers 
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Taux d'acceptation des candidatures
    const [acceptedApps] = await query("SELECT COUNT(*) as count FROM offer_applications WHERE status = 'accepted'");
    const [totalApps] = await query("SELECT COUNT(*) as count FROM offer_applications WHERE status != 'pending'");
    const acceptanceRate = totalApps.count > 0 ? Math.round((acceptedApps.count / totalApps.count) * 100) : 0;

    // Offres récentes
    const recentOffers = await query(`
      SELECT id, title, company, type, status, created_at 
      FROM internship_offers 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // Candidatures récentes aux offres
    const recentApplications = await query(`
      SELECT 
        oa.id, 
        oa.offer_id,
        oa.status, 
        oa.created_at,
        u.id as student_id,
        u.fullname as student_name,
        u.email as student_email,
        io.title as offer_title,
        io.company as offer_company
      FROM offer_applications oa
      JOIN users u ON oa.user_id = u.id
      JOIN internship_offers io ON oa.offer_id = io.id
      ORDER BY oa.created_at DESC 
      LIMIT 10
    `);

    // Demandes de stage récentes (propres demandes des étudiants)
    const recentInternshipRequests = await query(`
      SELECT 
        ir.id,
        ir.student_name,
        ir.student_surname,
        ir.student_class,
        ir.student_email,
        ir.subject_title,
        ir.host_company,
        ir.has_partner,
        ir.status,
        ir.created_at,
        u.id as user_id,
        u.fullname,
        u.cv_url
      FROM internship_requests ir
      LEFT JOIN users u ON ir.user_id = u.id
      ORDER BY ir.created_at DESC 
      LIMIT 10
    `);

    // Propositions d'enseignants récentes
    const recentProposals = await query(`
      SELECT 
        sp.id,
        sp.teacher_name,
        sp.teacher_surname,
        sp.subject_title,
        sp.host_company,
        sp.description,
        sp.status,
        sp.created_at,
        u.id as user_id,
        u.fullname,
        u.email as teacher_email
      FROM subject_proposals sp
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC 
      LIMIT 10
    `);

    // Statistiques par classe d'étudiants
    const studentsByClass = await query(`
      SELECT student_class, COUNT(*) as count 
      FROM internship_requests 
      GROUP BY student_class 
      ORDER BY count DESC
      LIMIT 10
    `);

    // Performance hebdomadaire (7 derniers jours)
    const weeklyStats = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM offer_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      ok: true,
      stats: {
        totals: {
          users: usersCount.count,
          students: studentsCount.count,
          teachers: teachersCount.count,
          offers: offersCount.count,
          openOffers: openOffersCount.count,
          applications: applicationsCount.count,
          internships: internshipsCount.count,
          proposals: proposalsCount.count,
          acceptanceRate
        },
        pending: {
          internships: pendingInternships.count,
          applications: pendingApplications.count,
          proposals: pendingProposals.count,
          total: pendingInternships.count + pendingApplications.count + pendingProposals.count
        },
        internshipsByStatus,
        applicationsByStatus,
        offersByType,
        proposalsByStatus,
        registrationsByMonth,
        applicationsByMonth,
        internshipsByMonth,
        topCompanies,
        studentsByClass,
        weeklyStats,
        recentOffers,
        recentApplications,
        recentInternshipRequests,
        recentProposals
      }
    });
  } catch (err) {
    console.error('[API] /stats failed:', err);
    res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

// GET /api/stats/pending - Récupérer les demandes en attente pour validation
router.get('/pending', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    // Candidatures aux offres en attente
    const pendingApplications = await query(`
      SELECT 
        oa.id, 
        oa.offer_id,
        oa.status, 
        oa.created_at,
        u.id as student_id,
        u.fullname as student_name,
        u.email as student_email,
        u.cv_url,
        io.title as offer_title,
        io.company as offer_company,
        io.type as offer_type
      FROM offer_applications oa
      JOIN users u ON oa.user_id = u.id
      JOIN internship_offers io ON oa.offer_id = io.id
      WHERE oa.status = 'pending'
      ORDER BY oa.created_at DESC
    `);

    // Demandes de stage propres en attente
    const pendingInternships = await query(`
      SELECT 
        ir.*,
        u.fullname,
        u.cv_url
      FROM internship_requests ir
      LEFT JOIN users u ON ir.user_id = u.id
      WHERE ir.status = 'pending'
      ORDER BY ir.created_at DESC
    `);

    // Propositions d'enseignants disponibles
    const pendingProposals = await query(`
      SELECT 
        sp.*,
        u.fullname,
        u.email as teacher_email
      FROM subject_proposals sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.status = 'available'
      ORDER BY sp.created_at DESC
    `);

    res.json({
      ok: true,
      data: {
        applications: pendingApplications,
        internships: pendingInternships,
        proposals: pendingProposals
      }
    });
  } catch (err) {
    console.error('[API] /stats/pending failed:', err);
    res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
