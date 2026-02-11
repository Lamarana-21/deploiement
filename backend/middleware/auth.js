// backend/middleware/auth.js

/**
 * Middleware pour vérifier si un utilisateur est authentifié.
 * Il vérifie la présence de `req.session.user`.
 */
const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: 'Non authentifié. Veuillez vous connecter.' });
  }
  next();
};

/**
 * Middleware pour vérifier si un utilisateur a un rôle spécifique.
 * @param {string|string[]} allowedRoles - Le ou les rôles autorisés.
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.session?.user?.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ ok: false, message: 'Accès interdit. Permissions insuffisantes.' });
    }
    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur.
 * C'est un raccourci pour requireRole('admin').
 */
const requireAdmin = requireRole('admin');

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
};
