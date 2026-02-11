const crypto = require("crypto");

const express = require("express");
const bcrypt = require("bcryptjs");

const { query } = require("../db");
const { sendPasswordResetEmail } = require("../services/mailer");
const { ApiError } = require("../middleware/errorHandler");
const { 
  normalizeEmail, 
  sanitizeString, 
  validateId,
  isValidEmail,
  isValidPassword 
} = require("../middleware/validation");

const router = express.Router();

router.get("/me", async (req, res) => {
  if (!req.session?.user) return res.status(401).json({ ok: false });
  
  try {
    // Récupérer les infos à jour depuis la base de données (notamment la classe)
    const rows = await query(
      "SELECT id, fullname, email, role, classe FROM users WHERE id = :id LIMIT 1",
      { id: req.session.user.id }
    );
    
    if (rows.length > 0) {
      const user = rows[0];
      // Mettre à jour la session avec les infos actuelles
      req.session.user = { 
        id: user.id, 
        fullname: user.fullname, 
        email: user.email, 
        role: user.role, 
        classe: user.classe || null 
      };
      return res.json({ ok: true, user: req.session.user });
    }
  } catch (err) {
    console.error("[API] /me error:", err);
  }
  
  // Fallback sur la session existante
  return res.json({ ok: true, user: req.session.user });
});

// GET /api/auth/teachers - Liste des enseignants inscrits
router.get("/teachers", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }
  try {
    const teachers = await query(
      "SELECT id, fullname, email FROM users WHERE role = 'teacher' ORDER BY fullname ASC"
    );
    return res.json({ ok: true, teachers });
  } catch (err) {
    console.error("[API] /teachers failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// GET /api/auth/classmates - Liste des étudiants de la même classe (pour choisir un binôme)
router.get("/classmates", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }
  
  // Seuls les étudiants peuvent voir leurs camarades de classe
  if (req.session.user.role !== 'student') {
    return res.status(403).json({ ok: false, message: "Accès réservé aux étudiants" });
  }
  
  const currentUserId = req.session.user.id;
  
  try {
    // D'abord, récupérer la classe de l'utilisateur actuel depuis la base de données
    const currentUserRows = await query(
      "SELECT classe FROM users WHERE id = :id LIMIT 1",
      { id: currentUserId }
    );
    
    const userClasse = currentUserRows[0]?.classe;
    
    if (!userClasse) {
      return res.json({ ok: true, classmates: [], message: "Classe non définie dans votre profil" });
    }
    
    console.log(`[API] /classmates - User ${currentUserId} classe: ${userClasse}`);
    
    // Récupérer les étudiants de la même classe, sauf l'utilisateur actuel
    // Exclure aussi ceux qui ont déjà une demande de stage en cours (pending ou approved)
    const classmates = await query(`
      SELECT 
        u.id, 
        u.fullname, 
        u.email,
        u.classe
      FROM users u
      WHERE u.role = 'student'
        AND u.classe = :classe
        AND u.id != :currentUserId
        AND u.id NOT IN (
          -- Exclure les étudiants qui ont déjà une demande de stage en cours
          SELECT ir.user_id FROM internship_requests ir 
          WHERE ir.user_id IS NOT NULL
            AND ir.status IN ('pending', 'approved')
        )
        AND u.id NOT IN (
          -- Exclure les étudiants qui sont déjà binôme de quelqu'un d'autre
          SELECT ir.partner_user_id FROM internship_requests ir 
          WHERE ir.partner_user_id IS NOT NULL 
            AND ir.status IN ('pending', 'approved')
        )
      ORDER BY u.fullname ASC
    `, { classe: userClasse, currentUserId });
    
    console.log(`[API] /classmates - Found ${classmates.length} classmates`);
    
    return res.json({ ok: true, classmates });
  } catch (err) {
    console.error("[API] /classmates failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// GET /api/auth/available-supervisors - Liste des enseignants approuvés et disponibles comme encadrants
router.get("/available-supervisors", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }
  
  // Le paramètre has_partner indique si l'étudiant a un binôme
  const hasPartner = req.query.has_partner === 'true' || req.query.has_partner === '1';
  
  try {
    // Récupérer les enseignants qui ont au moins une proposition approuvée
    // ET qui n'ont pas encore été choisis comme encadrant par un autre étudiant
    // Un enseignant est "pris" s'il a une demande de stage approuvée OU en attente avec lui comme supervisor
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
        AND u.id NOT IN (
          -- Exclure les enseignants qui ont déjà été choisis comme encadrant
          -- (demandes en attente ou approuvées)
          SELECT DISTINCT ir.supervisor_id 
          FROM internship_requests ir 
          WHERE ir.supervisor_id IS NOT NULL 
            AND ir.status IN ('pending', 'approved')
        )
      GROUP BY u.id, u.fullname, u.email
      ORDER BY u.fullname ASC
    `);
    
    return res.json({ ok: true, supervisors });
  } catch (err) {
    console.error("[API] /available-supervisors failed:", err);
    // En cas d'erreur, fallback sur la liste simple sans vérification de limite
    try {
      const fallbackSupervisors = await query(`
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
          AND u.id NOT IN (
            SELECT DISTINCT ir.supervisor_id 
            FROM internship_requests ir 
            WHERE ir.supervisor_id IS NOT NULL 
              AND ir.status IN ('pending', 'approved')
          )
        GROUP BY u.id, u.fullname, u.email
        ORDER BY u.fullname ASC
      `);
      return res.json({ ok: true, supervisors: fallbackSupervisors });
    } catch (fallbackErr) {
      console.error("[API] Fallback also failed:", fallbackErr);
      return res.status(500).json({ ok: false, message: "Erreur serveur" });
    }
  }
});

// GET /api/auth/profile - Obtenir le profil complet
router.get("/profile", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }
  
  try {
    const rows = await query(
      "SELECT id, fullname, email, phone, role, created_at, cv_url, avatar_url, cin, annee, filiere, diplome, classe FROM users WHERE id = :id LIMIT 1",
      { id: req.session.user.id }
    );
    
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Utilisateur non trouvé" });
    }
    
    return res.json({ ok: true, profile: rows[0] });
  } catch (err) {
    console.error("[API] /profile failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// PUT /api/auth/profile - Mettre à jour le profil
router.put("/profile", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }
  
  try {
    const fullname = String(req.body.fullname || "").trim();
    const email = normalizeEmail(req.body.email);
    
    if (!fullname || fullname.length < 2) {
      return res.status(400).json({ ok: false, message: "Nom invalide" });
    }
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ ok: false, message: "Email invalide" });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existing = await query(
      "SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1",
      { email, id: req.session.user.id }
    );
    
    if (existing.length) {
      return res.status(409).json({ ok: false, message: "Cet email est déjà utilisé" });
    }
    
    await query(
      "UPDATE users SET fullname = :fullname, email = :email WHERE id = :id",
      { fullname, email, id: req.session.user.id }
    );
    
    // Mettre à jour la session
    req.session.user.fullname = fullname;
    req.session.user.email = email;
    
    return res.json({ ok: true, user: req.session.user });
  } catch (err) {
    console.error("[API] PUT /profile failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

// PUT /api/auth/password - Changer le mot de passe
router.put("/password", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }
  
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    
    if (newPassword.length < 6) {
      return res.status(400).json({ ok: false, message: "Le nouveau mot de passe doit avoir au moins 6 caractères" });
    }
    
    // Vérifier le mot de passe actuel
    const rows = await query(
      "SELECT password_hash FROM users WHERE id = :id LIMIT 1",
      { id: req.session.user.id }
    );
    
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Utilisateur non trouvé" });
    }
    
    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ ok: false, message: "Mot de passe actuel incorrect" });
    }
    
    const password_hash = await bcrypt.hash(newPassword, 10);
    await query(
      "UPDATE users SET password_hash = :password_hash WHERE id = :id",
      { password_hash, id: req.session.user.id }
    );
    
    return res.json({ ok: true, message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error("[API] PUT /password failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const fullname = sanitizeString(req.body.fullname, 2, 100);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const role = req.body.role || "student"; // Par défaut: étudiant

    // Champs spécifiques aux étudiants
    const cin = String(req.body.cin || "").trim();
    const annee = String(req.body.annee || "").trim();
    const filiere = String(req.body.filiere || "").trim();
    const diplome = String(req.body.diplome || "").trim();
    const classe = String(req.body.classe || "").trim();

    if (!fullname || fullname.length < 2) {
      throw new ApiError(400, "Le nom complet doit contenir au moins 2 caractères");
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Email invalide");
    }

    if (!isValidPassword(password)) {
      throw new ApiError(400, "Le mot de passe doit contenir au moins 6 caractères");
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      throw new ApiError(400, "Rôle invalide");
    }

    // Validation des champs étudiants si le rôle est étudiant
    if (role === 'student') {
      if (!cin || !annee || !filiere || !classe) {
        throw new ApiError(400, "Tous les champs académiques sont requis pour les étudiants");
      }
    }

    const existing = await query("SELECT id FROM users WHERE email = :email LIMIT 1", { email });
    if (existing.length) {
      return res.status(409).json({ ok: false, message: "Cet email existe déjà" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (fullname, email, password_hash, role, cin, annee, filiere, diplome, classe) VALUES (:fullname, :email, :password_hash, :role, :cin, :annee, :filiere, :diplome, :classe)",
      { fullname, email, password_hash, role, cin: cin || null, annee: annee || null, filiere: filiere || null, diplome: diplome || null, classe: classe || null }
    );

    return res.json({ ok: true });
  } catch (err) {
    next(err); // Passer l'erreur au middleware de gestion d'erreurs
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Email invalide");
    }

    if (!password) {
      throw new ApiError(400, "Mot de passe requis");
    }

    const rows = await query(
      "SELECT id, fullname, email, password_hash, role, classe FROM users WHERE email = :email LIMIT 1",
      { email }
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "Email ou mot de passe incorrect" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, message: "Email ou mot de passe incorrect" });
    }

    req.session.user = { id: user.id, fullname: user.fullname, email: user.email, role: user.role, classe: user.classe || null };
    return res.json({ ok: true, user: req.session.user });
  } catch (err) {
    next(err); // Passer l'erreur au middleware de gestion d'erreurs
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.post("/request-reset", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "Email invalide" });
  }

  try {
    const rows = await query("SELECT id, fullname FROM users WHERE email = :email LIMIT 1", { email });

    // Always respond OK to prevent user enumeration.
    if (!rows.length) {
      return res.json({ ok: true, message: "Si le compte existe, un email a été envoyé." });
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresMinutes = 30;

    await query(
      `UPDATE users
       SET reset_token_hash = :tokenHash,
           reset_token_expires_at = DATE_ADD(NOW(), INTERVAL ${expiresMinutes} MINUTE)
       WHERE email = :email`,
      { tokenHash, email }
    );

    // Construire le lien de réinitialisation
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    // Envoyer l'email
    const emailResult = await sendPasswordResetEmail(email, user.fullname, resetLink, expiresMinutes);

    if (emailResult.ok) {
      console.log(`[Auth] Email de réinitialisation envoyé à ${email}`);
      return res.json({ ok: true, message: "Un email de réinitialisation a été envoyé à votre adresse." });
    } else {
      // Si l'email n'a pas pu être envoyé (SMTP non configuré), retourner le lien en dev
      console.warn(`[Auth] Email non envoyé (SMTP non configuré), lien de dev: ${resetLink}`);
      
      // En développement, on peut retourner le lien directement
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ 
          ok: true, 
          message: "Lien de réinitialisation généré (mode développement).", 
          resetLink,
          devMode: true 
        });
      }
      
      return res.json({ ok: true, message: "Si le compte existe, un email a été envoyé." });
    }
  } catch (err) {
    console.error("[API] /request-reset failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur lors de la demande de réinitialisation." });
  }
});

router.post("/reset-password", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const token = String(req.body.token || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!email || !email.includes("@") || token.length < 10 || newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: "Données invalides" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const rows = await query(
    `SELECT id FROM users
     WHERE email = :email
       AND reset_token_hash = :tokenHash
       AND reset_token_expires_at IS NOT NULL
       AND reset_token_expires_at > NOW()
     LIMIT 1`,
    { email, tokenHash }
  );

  if (!rows.length) {
    return res.status(400).json({ ok: false, message: "Lien invalide ou expiré" });
  }

  const password_hash = await bcrypt.hash(newPassword, 10);
  await query(
    `UPDATE users
     SET password_hash = :password_hash,
         reset_token_hash = NULL,
         reset_token_expires_at = NULL
     WHERE email = :email`,
    { password_hash, email }
  );

  return res.json({ ok: true, message: "Mot de passe mis à jour" });
});

module.exports = router;
