const express = require("express");

const { query } = require("../db");

const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

function toNullableString(value) {
  const v = String(value ?? "").trim();
  return v ? v : null;
}

// Public: list offers for homepage (with pagination and filters)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type || null;
    const search = req.query.search || null;
    
    // Build the query dynamically
    let whereClause = "WHERE status = 'open'";
    const params = {};
    
    if (type) {
      whereClause += " AND type = :type";
      params.type = type;
    }
    
    if (search) {
      whereClause += " AND (title LIKE :search OR company LIKE :search OR location LIKE :search OR description LIKE :search)";
      params.search = `%${search}%`;
    }
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM internship_offers ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Get paginated results
    const offers = await query(
      `SELECT id, title, company, location, deadline, status, type, image, created_at
       FROM internship_offers
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    
    return res.json({ 
      ok: true, 
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Error fetching offers:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// Admin: list offers (all statuses) with application counts
router.get("/admin/all", requireAuth, requireRole(["admin"]), async (_req, res) => {
  try {
    const offers = await query(
      `SELECT o.id,
              o.title,
              o.company,
              o.location,
              o.deadline,
              o.status,
              o.type, -- Ajouté pour le badge dans React
              o.created_at,
              COUNT(a.id) AS applications_count
       FROM internship_offers o
       LEFT JOIN offer_applications a ON a.offer_id = o.id
       GROUP BY o.id, o.title, o.company, o.location, o.deadline, o.status, o.type, o.created_at
       ORDER BY o.created_at DESC`
    );
    
    // On s'assure de renvoyer l'objet attendu par React
    return res.json({ ok: true, offers });
  } catch (err) {
    console.error("Erreur /admin/all:", err);
    return res.status(500).json({ ok: false, message: "Erreur lors de la récupération des offres" });
  }
});

// Admin: list ALL applications (toutes les candidatures)
router.get("/admin/applications", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const status = req.query.status || null;
    const search = req.query.search || null;
    const offerId = req.query.offer_id ? Number(req.query.offer_id) : null;
    
    let whereClause = "WHERE 1=1";
    const params = {};
    
    if (status && status !== 'all') {
      whereClause += " AND a.status = :status";
      params.status = status;
    }
    
    if (offerId) {
      whereClause += " AND a.offer_id = :offerId";
      params.offerId = offerId;
    }
    
    if (search) {
      whereClause += " AND (u.fullname LIKE :search OR u.email LIKE :search OR o.title LIKE :search OR o.company LIKE :search)";
      params.search = `%${search}%`;
    }
    
    const applications = await query(
      `SELECT a.id,
              a.offer_id,
              a.user_id,
              a.status,
              a.created_at,
              u.fullname AS student_name,
              u.email AS student_email,
              u.cv_url,
              o.title AS offer_title,
              o.company AS offer_company,
              o.type AS offer_type,
              o.location AS offer_location
       FROM offer_applications a
       JOIN users u ON u.id = a.user_id
       JOIN internship_offers o ON o.id = a.offer_id
       ${whereClause}
       ORDER BY a.created_at DESC`,
      params
    );
    
    // Stats par statut
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM offer_applications
    `);
    
    return res.json({ 
      ok: true, 
      applications,
      stats: stats[0] || { total: 0, pending: 0, accepted: 0, rejected: 0 }
    });
  } catch (err) {
    console.error("Error fetching all applications:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// Admin: bulk update applications status
router.patch("/admin/applications/bulk", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const { applicationIds, status } = req.body;
    
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ ok: false, message: "Aucune candidature sélectionnée" });
    }
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ ok: false, message: "Statut invalide" });
    }
    
    // Update all selected applications
    const placeholders = applicationIds.map((_, i) => `:id${i}`).join(',');
    const params = { status };
    applicationIds.forEach((id, i) => {
      params[`id${i}`] = id;
    });
    
    await query(
      `UPDATE offer_applications SET status = :status WHERE id IN (${placeholders})`,
      params
    );
    
    // Get user IDs for notifications
    const apps = await query(
      `SELECT id, user_id, offer_id FROM offer_applications WHERE id IN (${placeholders})`,
      params
    );
    
    // Create notifications for each student
    const title = 'Mise à jour de votre candidature';
    const body = status === 'accepted'
      ? 'Votre candidature a été acceptée.'
      : status === 'rejected'
        ? 'Votre candidature a été refusée.'
        : 'Le statut de votre candidature est repassé en attente.';
    
    for (const app of apps) {
      try {
        await query(
          `INSERT INTO notifications (user_id, type, title, body, link_url)
           VALUES (:userId, :type, :title, :body, :linkUrl)`,
          {
            userId: app.user_id,
            type: 'application_status',
            title,
            body,
            linkUrl: `/offers/${app.offer_id}`,
          }
        );
      } catch (e) {
        console.warn('Notification insert failed', e?.code || e);
      }
    }
    
    return res.json({ ok: true, updated: applicationIds.length });
  } catch (err) {
    console.error("Error bulk updating applications:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// Student: list my applications (DOIT être avant /:id pour éviter conflit)
router.get("/me/applications", requireAuth, requireRole(["student"]), async (req, res) => {
  const userId = req.session.user.id;
  const applications = await query(
    `SELECT a.id,
            a.status,
            a.created_at,
            o.id AS offer_id,
            o.title,
            o.company,
            o.location,
            o.deadline,
            o.status AS offer_status
     FROM offer_applications a
     JOIN internship_offers o ON o.id = a.offer_id
     WHERE a.user_id = :userId
     ORDER BY a.created_at DESC`,
    { userId }
  );
  return res.json({ ok: true, applications });
});

// Public: offer details
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, message: "Invalid offer id" });
  }

  const rows = await query(
    `SELECT id, title, company, location, description, requirements, deadline, status, type, image, created_at
     FROM internship_offers
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  if (!rows.length) return res.status(404).json({ ok: false, message: "Offer not found" });
  return res.json({ ok: true, offer: rows[0] });
});

// Admin: create offer
router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const title = toNullableString(req.body.title);
  const company = toNullableString(req.body.company);
  const location = toNullableString(req.body.location);
  const description = toNullableString(req.body.description);
  const requirements = toNullableString(req.body.requirements);
  const deadline = toNullableString(req.body.deadline); // Expect YYYY-MM-DD or empty
  const type = toNullableString(req.body.type) || 'pfe';
  const image = toNullableString(req.body.image);

  if (!title || !company || !description) {
    return res.status(400).json({ ok: false, message: "Champs requis: title, company, description" });
  }

  await query(
    `INSERT INTO internship_offers (title, company, location, description, requirements, deadline, type, image, created_by)
     VALUES (:title, :company, :location, :description, :requirements, :deadline, :type, :image, :created_by)`,
    {
      title,
      company,
      location,
      description,
      requirements,
      deadline,
      type,
      image,
      created_by: req.session.user.id,
    }
  );

  return res.json({ ok: true });
});

// Admin: update offer status (open/closed)
router.patch("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, message: "Invalid offer id" });
  }

  const status = String(req.body.status || "").trim();
  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ ok: false, message: "Invalid status" });
  }

  const rows = await query("SELECT id FROM internship_offers WHERE id = :id LIMIT 1", { id });
  if (!rows.length) return res.status(404).json({ ok: false, message: "Offer not found" });

  await query("UPDATE internship_offers SET status = :status WHERE id = :id", { id, status });
  return res.json({ ok: true });
});

// Admin: update offer (full update)
router.put("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, message: "Invalid offer id" });
  }

  const rows = await query("SELECT id FROM internship_offers WHERE id = :id LIMIT 1", { id });
  if (!rows.length) return res.status(404).json({ ok: false, message: "Offer not found" });

  const title = toNullableString(req.body.title);
  const company = toNullableString(req.body.company);
  const location = toNullableString(req.body.location);
  const description = toNullableString(req.body.description);
  const requirements = toNullableString(req.body.requirements);
  const deadline = toNullableString(req.body.deadline);
  const type = toNullableString(req.body.type) || 'pfe';
  const image = toNullableString(req.body.image);
  const status = toNullableString(req.body.status) || 'open';

  if (!title || !company || !description) {
    return res.status(400).json({ ok: false, message: "Champs requis: title, company, description" });
  }

  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ ok: false, message: "Invalid status" });
  }

  await query(
    `UPDATE internship_offers 
     SET title = :title, company = :company, location = :location, 
         description = :description, requirements = :requirements, 
         deadline = :deadline, type = :type, image = :image, status = :status
     WHERE id = :id`,
    { id, title, company, location, description, requirements, deadline, type, image, status }
  );

  return res.json({ ok: true });
});

// Admin: delete offer
router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, message: "Invalid offer id" });
  }

  const rows = await query("SELECT id FROM internship_offers WHERE id = :id LIMIT 1", { id });
  if (!rows.length) return res.status(404).json({ ok: false, message: "Offer not found" });

  // Delete related applications first (or use CASCADE in DB)
  await query("DELETE FROM offer_applications WHERE offer_id = :id", { id });
  await query("DELETE FROM internship_offers WHERE id = :id", { id });

  return res.json({ ok: true });
});

// Admin: list applications for an offer
router.get("/:id/applications", requireAuth, requireRole(["admin"]), async (req, res) => {
  const offerId = Number(req.params.id);
  if (!Number.isFinite(offerId)) {
    return res.status(400).json({ ok: false, message: "Invalid offer id" });
  }

  const offerRows = await query(
    `SELECT id, title, company, status, deadline, created_at
     FROM internship_offers
     WHERE id = :id
     LIMIT 1`,
    { id: offerId }
  );
  if (!offerRows.length) return res.status(404).json({ ok: false, message: "Offer not found" });

  const applications = await query(
    `SELECT a.id,
            a.status,
            a.created_at,
            u.id AS user_id,
            u.fullname,
            u.email
     FROM offer_applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.offer_id = :offerId
     ORDER BY a.created_at DESC`,
    { offerId }
  );

  return res.json({ ok: true, offer: offerRows[0], applications });
});

// Admin: update application status (accepted/rejected/pending)
router.patch(
  "/:offerId/applications/:applicationId",
  requireAuth,
  requireRole(["admin"]),
  async (req, res) => {
    const offerId = Number(req.params.offerId);
    const applicationId = Number(req.params.applicationId);
    if (!Number.isFinite(offerId) || !Number.isFinite(applicationId)) {
      return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    const status = String(req.body.status || "").trim();
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ ok: false, message: "Invalid status" });
    }

    const rows = await query(
      `SELECT id FROM offer_applications
       WHERE id = :id AND offer_id = :offerId
       LIMIT 1`,
      { id: applicationId, offerId }
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Application not found" });

    const appRows = await query(
      `SELECT id, user_id FROM offer_applications
       WHERE id = :id AND offer_id = :offerId
       LIMIT 1`,
      { id: applicationId, offerId }
    );
    if (!appRows.length) return res.status(404).json({ ok: false, message: "Application not found" });

    await query(`UPDATE offer_applications SET status = :status WHERE id = :id`, { id: applicationId, status });

    // Create a notification for the student
    const studentUserId = appRows[0].user_id;
    const title = 'Mise à jour de votre candidature';
    const body = status === 'accepted'
      ? 'Votre candidature a été acceptée.'
      : status === 'rejected'
        ? 'Votre candidature a été refusée.'
        : 'Le statut de votre candidature est repassé en attente.';

    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, body, link_url)
         VALUES (:userId, :type, :title, :body, :linkUrl)`,
        {
          userId: studentUserId,
          type: 'application_status',
          title,
          body,
          linkUrl: `/offers/${offerId}`,
        }
      );
    } catch (e) {
      // don't fail the request if notification insert fails
      console.warn('Notification insert failed', e?.code || e);
    }

    return res.json({ ok: true });
  }
);

// Student: withdraw my application (only if pending)
router.delete(
  "/me/applications/:applicationId",
  requireAuth,
  requireRole(["student"]),
  async (req, res) => {
    const applicationId = Number(req.params.applicationId);
    if (!Number.isFinite(applicationId)) {
      return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    const userId = req.session.user.id;
    const rows = await query(
      `SELECT id, status FROM offer_applications WHERE id = :id AND user_id = :userId LIMIT 1`,
      { id: applicationId, userId }
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Application not found" });
    }

    if (rows[0].status !== 'pending') {
      return res.status(400).json({ ok: false, message: "Vous ne pouvez retirer que les candidatures en attente" });
    }

    await query(`DELETE FROM offer_applications WHERE id = :id AND user_id = :userId`, { id: applicationId, userId });
    return res.json({ ok: true });
  }
);

// Student: apply to offer (requires login)
router.post("/:id/apply", requireAuth, requireRole(["student"]), async (req, res) => {
  const offerId = Number(req.params.id);
  if (!Number.isFinite(offerId)) {
    return res.status(400).json({ ok: false, message: "Invalid offer id" });
  }

  const offerRows = await query(
    `SELECT id, status FROM internship_offers WHERE id = :id LIMIT 1`,
    { id: offerId }
  );
  if (!offerRows.length) return res.status(404).json({ ok: false, message: "Offer not found" });
  if (offerRows[0].status !== "open") {
    return res.status(400).json({ ok: false, message: "Offer is not open" });
  }

  try {
    await query(
      `INSERT INTO offer_applications (offer_id, user_id)
       VALUES (:offer_id, :user_id)`,
      { offer_id: offerId, user_id: req.session.user.id }
    );
    return res.json({ ok: true, status: "applied" });
  } catch (err) {
    // Duplicate application
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ ok: false, message: "Vous avez déjà postulé à cette offre" });
    }
    throw err;
  }
});

module.exports = router;
