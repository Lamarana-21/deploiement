const express = require("express");
const { query } = require("../db");

const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

// GET mes demandes de stage (étudiant connecté)
router.get("/me", requireAuth, requireRole(["student"]), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const requests = await query(
      `SELECT * FROM internship_requests WHERE user_id = :userId ORDER BY created_at DESC`,
      { userId }
    );
    return res.json({ ok: true, data: requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Database error" });
  }
});

// GET all internship requests (admin only)
router.get("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const requests = await query(
      `SELECT ir.*, u.fullname, u.email as user_email, u.cv_url
       FROM internship_requests ir
       LEFT JOIN users u ON u.id = ir.user_id
       ORDER BY ir.created_at DESC`
    );
    return res.json({ ok: true, data: requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Database error" });
  }
});

// GET single internship request (avec vérification de propriété)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT * FROM internship_requests WHERE id = :id LIMIT 1`,
      { id: req.params.id }
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Request not found" });
    }
    // Vérifier que l'utilisateur est admin ou propriétaire de la demande
    const request = rows[0];
    if (req.session.user.role !== 'admin' && request.user_id !== req.session.user.id) {
      return res.status(403).json({ ok: false, message: "Accès interdit" });
    }
    return res.json({ ok: true, data: request });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Database error" });
  }
});

// POST create internship request (étudiant authentifié)
router.post("/", requireAuth, requireRole(["student"]), async (req, res) => {
  const {
    student_name,
    student_surname,
    has_partner,
    partner_user_id,
    partner_name,
    partner_surname,
    partner_phone,
    partner_email,
    partner_class,
    has_subject,
    isett_supervisor,
    isett_supervisor_id,
    subject_title,
    host_company,
    student_class,
    student_phone,
    student_email,
    pfe_unit_remark,
  } = req.body;

  // Validation basique
  if (!student_name || !student_surname || !student_class || !student_phone || !student_email) {
    return res.status(400).json({ ok: false, message: "Champs obligatoires manquants" });
  }

  try {
    let resolvedSupervisorName = (isett_supervisor || '').trim() || null;

    // Résoudre le supervisor_id à partir de isett_supervisor_id
    let supervisorId = null;
    if (isett_supervisor_id !== undefined && isett_supervisor_id !== null && String(isett_supervisor_id).trim() !== '') {
      const teacherId = Number(isett_supervisor_id);
      if (!Number.isFinite(teacherId)) {
        return res.status(400).json({ ok: false, message: "Encadreur invalide" });
      }

      const teacherRows = await query(
        "SELECT id, fullname FROM users WHERE id = :id AND role = 'teacher' LIMIT 1",
        { id: teacherId }
      );
      if (!teacherRows.length) {
        return res.status(400).json({ ok: false, message: "Enseignant introuvable" });
      }
      resolvedSupervisorName = teacherRows[0].fullname;
      supervisorId = teacherRows[0].id;
    }

    // Valider le partner_user_id si un binôme est sélectionné
    let validPartnerUserId = null;
    if (has_partner && partner_user_id) {
      const partnerId = Number(partner_user_id);
      if (Number.isFinite(partnerId)) {
        const partnerRows = await query(
          "SELECT id FROM users WHERE id = :id AND role = 'student' LIMIT 1",
          { id: partnerId }
        );
        if (partnerRows.length > 0) {
          validPartnerUserId = partnerId;
        }
      }
    }

    const result = await query(
      `INSERT INTO internship_requests (
        student_name, student_surname, has_partner, partner_user_id, partner_name, partner_surname,
        partner_phone, partner_email, partner_class, has_subject, isett_supervisor, supervisor_id,
        subject_title, host_company, student_class, student_phone, student_email,
        pfe_unit_remark, user_id
      ) VALUES (
        :student_name, :student_surname, :has_partner, :partner_user_id, :partner_name, :partner_surname,
        :partner_phone, :partner_email, :partner_class, :has_subject, :isett_supervisor, :supervisor_id,
        :subject_title, :host_company, :student_class, :student_phone, :student_email,
        :pfe_unit_remark, :user_id
      )`,
      {
        student_name,
        student_surname,
        has_partner: has_partner ? 1 : 0,
        partner_user_id: validPartnerUserId,
        partner_name: partner_name || null,
        partner_surname: partner_surname || null,
        partner_phone: partner_phone || null,
        partner_email: partner_email || null,
        partner_class: partner_class || null,
        has_subject: has_subject ? 1 : 0,
        isett_supervisor: resolvedSupervisorName,
        supervisor_id: supervisorId,
        subject_title: subject_title || null,
        host_company: host_company || null,
        student_class,
        student_phone,
        student_email,
        pfe_unit_remark: pfe_unit_remark || null,
        user_id: req.session?.user?.id || null,
      }
    );

    return res.json({ ok: true, message: "Demande créée avec succès", id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Erreur lors de la création" });
  }
});

// PUT update status (admin only) + notification à l'étudiant
router.put("/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, message: "Statut invalide" });
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, message: "Identifiant invalide" });
  }

  try {
    // Vérifier l'existence et récupérer le propriétaire
    const rows = await query(
      `SELECT id, user_id FROM internship_requests WHERE id = :id LIMIT 1`,
      { id }
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Demande introuvable" });
    }

    await query(
      `UPDATE internship_requests SET status = :status WHERE id = :id`,
      { status, id }
    );

    // Notification pour l'étudiant
    const userId = rows[0].user_id;
    if (userId) {
      const title = 'Mise à jour de votre demande de stage';
      const body = status === 'approved'
        ? 'Votre demande de stage a été approuvée par l\'administration.'
        : status === 'rejected'
          ? 'Votre demande de stage a été refusée.'
          : 'Votre demande de stage est en cours de traitement.';
      try {
        await query(
          `INSERT INTO notifications (user_id, type, title, body, link_url)
           VALUES (:userId, :type, :title, :body, :linkUrl)`,
          {
            userId,
            type: 'internship_status',
            title,
            body,
            linkUrl: '/student/applications',
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

module.exports = router;
