const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../db');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// -----------------------
// CV upload (PDF)
// -----------------------
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/cv');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: user_id-timestamp.pdf
    const userId = req.session?.user?.id || 'guest';
    const ext = path.extname(file.originalname);
    cb(null, `cv-${userId}-${Date.now()}${ext}`);
  }
});

const cvFileFilter = (req, file, cb) => {
  // Accept only PDF
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
  }
};

const uploadCv = multer({ 
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// -----------------------
// Avatar upload (images)
// -----------------------
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.session?.user?.id || 'guest';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (allowed.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formats acceptés: JPG, PNG, WEBP'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: 'Non authentifié' });
  }
  return next();
}

// POST /api/upload/cv
router.post('/cv', requireAuth, uploadCv.single('cv'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Aucun fichier fourni');
    }

    const userId = req.session.user.id;
    // Construct public URL (assuming we serve 'uploads' statically or via a route)
    // We will serve /uploads via express.static in server.js
    const cvUrl = `/uploads/cv/${req.file.filename}`;

    await query('UPDATE users SET cv_url = :cvUrl WHERE id = :userId', { cvUrl, userId });
    
    // Update session info if needed (optional)
    req.session.user.cv_url = cvUrl;

    return res.json({ ok: true, cvUrl, message: 'CV téléchargé avec succès' });
  } catch (err) {
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('[Upload] Erreur suppression fichier:', unlinkErr);
      });
    }
    next(err);
  }
});

// POST /api/upload/avatar
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Aucun fichier fourni');
    }

    const userId = req.session.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Supprimer l'ancien avatar si existant
    const oldAvatar = await query('SELECT avatar_url FROM users WHERE id = :userId', { userId });
    if (oldAvatar.length && oldAvatar[0].avatar_url) {
      const oldPath = path.join(__dirname, '../..', oldAvatar[0].avatar_url);
      fs.unlink(oldPath, (err) => {
        if (err) console.warn('[Upload] Ancien avatar non supprimé:', err.message);
      });
    }

    await query('UPDATE users SET avatar_url = :avatarUrl WHERE id = :userId', { avatarUrl, userId });
    req.session.user.avatar_url = avatarUrl;

    return res.json({ ok: true, avatarUrl, message: 'Photo de profil mise à jour' });
  } catch (err) {
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('[Upload] Erreur suppression fichier:', unlinkErr);
      });
    }
    next(err);
  }
});

module.exports = router;
