const express = require("express");
const { query } = require("../db");
const { notifyAdminNewProposal } = require("../services/mailer");
const { ApiError } = require("../middleware/errorHandler");
const { validateId, sanitizeString } = require("../middleware/validation");

const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

// GET mes propositions (enseignant connecté)
router.get("/me", requireAuth, requireRole(["teacher"]), async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    // Règle métier: une seule proposition active par enseignant
    const proposals = await query(
      `SELECT *
       FROM subject_proposals
       WHERE user_id = :userId
         AND status != 'archived'
       ORDER BY created_at DESC
       LIMIT 1`,
      { userId }
    );
    return res.json({ ok: true, data: proposals });
  } catch (err) {
    next(err);
  }
});

// GET all subject proposals (admin only)
router.get("/", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    // Règle métier: l'admin ne doit voir qu'une seule proposition par enseignant
    // (on garde la plus récente non archivée).
    const proposals = await query(
      `SELECT sp.*, u.fullname, u.email as user_email
       FROM subject_proposals sp
       JOIN (
         SELECT user_id, MAX(id) AS last_id
         FROM subject_proposals
         WHERE user_id IS NOT NULL
           AND status != 'archived'
         GROUP BY user_id
       ) last ON last.last_id = sp.id
       LEFT JOIN users u ON u.id = sp.user_id
       ORDER BY sp.created_at DESC`
    );
    return res.json({ ok: true, data: proposals });
  } catch (err) {
    next(err);
  }
});

// GET single proposal (avec vérification de propriété)
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = validateId(req.params.id, 'Proposition ID');
    
    const rows = await query(
      `SELECT * FROM subject_proposals WHERE id = :id LIMIT 1`,
      { id }
    );
    
    if (!rows.length) {
      throw new ApiError(404, "Proposition non trouvée");
    }
    
    // Vérifier que l'utilisateur est admin ou propriétaire
    const proposal = rows[0];
    if (req.session.user.role !== 'admin' && proposal.user_id !== req.session.user.id) {
      throw new ApiError(403, "Accès interdit");
    }
    
    return res.json({ ok: true, data: proposal });
  } catch (err) {
    next(err);
  }
});

// POST create subject proposal (enseignant authentifié)
router.post("/", requireAuth, requireRole(["teacher"]), async (req, res, next) => {
  const {
    teacher_name,
    teacher_surname,
    subject_title,
    host_company,
    description,
    remark,
    email_sent,
  } = req.body;

  try {
    // Validation basique
    if (!subject_title || sanitizeString(subject_title).trim() === '') {
      throw new ApiError(400, "L'intitulé du sujet est obligatoire");
    }

    // Règle métier (refaite): un enseignant ne peut avoir qu'une seule proposition active.
    // => S'il en a déjà une (non archivée), on la MET À JOUR au lieu d'en créer une nouvelle.
    const user = req.session?.user;
    const userId = user?.id || null;
    const existing = await query(
      `SELECT id, status
       FROM subject_proposals
       WHERE user_id = :userId
         AND status != 'archived'
       ORDER BY id DESC
       LIMIT 1`,
      { userId }
    );

    const finalTeacherName = teacher_name ? sanitizeString(teacher_name, 0, 100) : '';
    const finalTeacherSurname = teacher_surname ? sanitizeString(teacher_surname, 0, 100) : '';
    const cleanTitle = sanitizeString(subject_title, 1, 255);

    if (existing.length) {
      const existingId = existing[0].id;
      const existingStatus = existing[0].status;
      if (existingStatus === 'assigned') {
        return res.status(409).json({
          ok: false,
          message: "Votre proposition est déjà assignée. Vous ne pouvez pas en soumettre une nouvelle.",
          existingId,
        });
      }

      // On met à jour la proposition existante.
      // Important: si l'enseignant change le sujet, on repasse l'approbation à 'pending'.
      await query(
        `UPDATE subject_proposals
         SET teacher_name = :teacher_name,
             teacher_surname = :teacher_surname,
             subject_title = :subject_title,
             host_company = :host_company,
             description = :description,
             remark = :remark,
             email_sent = :email_sent,
             status = 'available',
             approval_status = 'pending',
             approved_at = NULL,
             approved_by = NULL,
             rejection_reason = NULL
         WHERE id = :id AND user_id = :userId`,
        {
          id: existingId,
          userId,
          teacher_name: finalTeacherName,
          teacher_surname: finalTeacherSurname,
          subject_title: cleanTitle.trim(),
          host_company: host_company || null,
          description: description || null,
          remark: remark || null,
          email_sent: email_sent ? 1 : 0,
        }
      );

      return res.json({
        ok: true,
        updated: true,
        message: "Proposition mise à jour avec succès",
        id: existingId,
      });
    }
    
    const result = await query(
      `INSERT INTO subject_proposals (
        teacher_name, teacher_surname, subject_title, host_company,
        description, remark, email_sent, user_id
      ) VALUES (
        :teacher_name, :teacher_surname, :subject_title, :host_company,
        :description, :remark, :email_sent, :user_id
      )`,
      {
        teacher_name: finalTeacherName,
        teacher_surname: finalTeacherSurname,
        subject_title: cleanTitle.trim(),
        host_company: host_company || null,
        description: description || null,
        remark: remark || null,
        email_sent: email_sent ? 1 : 0,
        user_id: user?.id || null,
      }
    );

    console.log('[Proposals] Proposition créée avec ID:', result.insertId);

    // Créer une notification pour l'admin
    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, body, link_url)
         SELECT id, 'proposal', 'Nouvelle proposition de sujet',
                :body, '/admin/proposals'
         FROM users WHERE role = 'admin'`,
        { 
          body: `${finalTeacherSurname} ${finalTeacherName} a proposé un nouveau sujet : "${cleanTitle.trim()}"` 
        }
      );
      console.log('[Proposals] Notification admin créée');
    } catch (notifErr) {
      console.warn('[Proposals] Erreur création notification:', notifErr.message);
    }

    // Envoyer un email à l'admin pour notifier de la nouvelle proposition
    if (user) {
      try {
        await notifyAdminNewProposal(
          { subject_title: cleanTitle.trim(), host_company, description, remark },
          { fullname: user.fullname || `${finalTeacherSurname} ${finalTeacherName}`, email: user.email || '' }
        );
        console.log('[Proposals] Email admin envoyé avec succès');
      } catch (emailErr) {
        console.warn('[Proposals] Email admin non envoyé:', emailErr.message);
      }
    }

    return res.json({ ok: true, updated: false, message: "Proposition créée avec succès", id: result.insertId });
  } catch (err) {
    console.error('[Proposals] Erreur création proposition:', err);
    return res.status(500).json({ ok: false, message: "Erreur lors de la création de la proposition" });
  }
});

// PUT update status (admin only)
router.put("/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { status } = req.body;
  if (!["available", "assigned", "archived"].includes(status)) {
    return res.status(400).json({ ok: false, message: "Statut invalide" });
  }

  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid id' });
    }

    const rows = await query(`SELECT id, user_id FROM subject_proposals WHERE id = :id LIMIT 1`, { id });
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Proposition non trouvée' });
    }

    await query(`UPDATE subject_proposals SET status = :status WHERE id = :id`, { status, id });

    // Notify owner teacher if any
    const ownerId = rows[0].user_id;
    if (ownerId) {
      const title = 'Mise à jour de votre proposition';
      const body = status === 'available'
        ? 'Votre proposition est maintenant disponible.'
        : status === 'assigned'
          ? 'Votre proposition a été assignée.'
          : 'Votre proposition a été archivée.';
      try {
        await query(
          `INSERT INTO notifications (user_id, type, title, body, link_url)
           VALUES (:userId, :type, :title, :body, :linkUrl)`,
          {
            userId: ownerId,
            type: 'proposal_status',
            title,
            body,
            linkUrl: `/teacher`,
          }
        );
      } catch (e) {
        console.warn('Notification insert failed', e?.code || e);
      }
    }
    return res.json({ ok: true, message: "Statut mis à jour" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Database error" });
  }
});

// PUT approve/reject proposal (admin only)
router.put("/:id/approval", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { approval_status, rejection_reason } = req.body;
  
  if (!["approved", "rejected"].includes(approval_status)) {
    return res.status(400).json({ ok: false, message: "Statut d'approbation invalide" });
  }

  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid id' });
    }

    const rows = await query(`SELECT id, user_id, subject_title FROM subject_proposals WHERE id = :id LIMIT 1`, { id });
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Proposition non trouvée' });
    }

    const adminId = req.session.user.id;
    
    if (approval_status === 'approved') {
      await query(
        `UPDATE subject_proposals 
         SET approval_status = 'approved', 
             approved_at = NOW(), 
             approved_by = :adminId,
             rejection_reason = NULL
         WHERE id = :id`,
        { adminId, id }
      );
    } else {
      await query(
        `UPDATE subject_proposals 
         SET approval_status = 'rejected', 
             rejection_reason = :rejection_reason,
             approved_at = NULL,
             approved_by = NULL
         WHERE id = :id`,
        { rejection_reason: rejection_reason || null, id }
      );
    }

    // Notify owner teacher
    const ownerId = rows[0].user_id;
    if (ownerId) {
      const title = approval_status === 'approved' 
        ? '✅ Proposition approuvée' 
        : '❌ Proposition refusée';
      const body = approval_status === 'approved'
        ? `Votre proposition "${rows[0].subject_title}" a été approuvée par l'administration. Vous êtes maintenant disponible comme encadrant.`
        : `Votre proposition "${rows[0].subject_title}" a été refusée.${rejection_reason ? ' Raison : ' + rejection_reason : ''}`;
      
      try {
        await query(
          `INSERT INTO notifications (user_id, type, title, body, link_url)
           VALUES (:userId, :type, :title, :body, :linkUrl)`,
          {
            userId: ownerId,
            type: 'proposal_approval',
            title,
            body,
            linkUrl: `/teacher`,
          }
        );
      } catch (e) {
        console.warn('Notification insert failed', e?.code || e);
      }
    }
    
    return res.json({ 
      ok: true, 
      message: approval_status === 'approved' 
        ? "Proposition approuvée avec succès" 
        : "Proposition refusée"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Database error" });
  }
});

// Teacher: update own proposal (not allowed if assigned)
router.put('/:id', requireAuth, requireRole(['teacher']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid id' });
    }

    const userId = req.session.user.id;
    const rows = await query(`SELECT * FROM subject_proposals WHERE id = :id LIMIT 1`, { id });
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Proposition non trouvée' });

    const proposal = rows[0];
    if (proposal.user_id !== userId) {
      return res.status(403).json({ ok: false, message: 'Accès interdit' });
    }
    if (proposal.status === 'assigned') {
      return res.status(400).json({ ok: false, message: 'Impossible de modifier une proposition assignée' });
    }

    const teacher_name = String(req.body.teacher_name || proposal.teacher_name).trim();
    const teacher_surname = String(req.body.teacher_surname || proposal.teacher_surname).trim();
    const subject_title = String(req.body.subject_title || '').trim();
    const host_company = req.body.host_company ? String(req.body.host_company).trim() : null;
    const description = req.body.description ? String(req.body.description).trim() : null;
    const remark = req.body.remark ? String(req.body.remark).trim() : null;
    const email_sent = req.body.email_sent ? 1 : 0;

    if (!teacher_name || !teacher_surname || !subject_title) {
      return res.status(400).json({ ok: false, message: 'Champs obligatoires manquants' });
    }

    await query(
      `UPDATE subject_proposals
       SET teacher_name = :teacher_name,
           teacher_surname = :teacher_surname,
           subject_title = :subject_title,
           host_company = :host_company,
           description = :description,
           remark = :remark,
           email_sent = :email_sent
       WHERE id = :id AND user_id = :userId`,
      { teacher_name, teacher_surname, subject_title, host_company, description, remark, email_sent, id, userId }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// Teacher: archive own proposal (not allowed if assigned)
router.post('/:id/archive', requireAuth, requireRole(['teacher']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid id' });
    }
    const userId = req.session.user.id;
    const rows = await query(`SELECT status FROM subject_proposals WHERE id = :id AND user_id = :userId LIMIT 1`, { id, userId });
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Proposition non trouvée' });
    if (rows[0].status === 'assigned') {
      return res.status(400).json({ ok: false, message: 'Impossible d\'archiver une proposition assignée' });
    }
    await query(`UPDATE subject_proposals SET status = 'archived' WHERE id = :id AND user_id = :userId`, { id, userId });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// Teacher: delete own proposal (not allowed if assigned)
router.delete('/:id', requireAuth, requireRole(['teacher']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid id' });
    }
    const userId = req.session.user.id;
    const rows = await query(`SELECT status FROM subject_proposals WHERE id = :id AND user_id = :userId LIMIT 1`, { id, userId });
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Proposition non trouvée' });
    if (rows[0].status === 'assigned') {
      return res.status(400).json({ ok: false, message: 'Impossible de supprimer une proposition assignée' });
    }
    await query(`DELETE FROM subject_proposals WHERE id = :id AND user_id = :userId`, { id, userId });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

module.exports = router;
