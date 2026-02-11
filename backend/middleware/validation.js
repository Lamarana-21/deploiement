/**
 * Middleware de validation des entrées
 * Valide et nettoie les données utilisateur pour éviter les erreurs et les injections
 */

const { ApiError } = require('./errorHandler');

// Validation d'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation de mot de passe
function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

// Normalisation d'email
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Validation et nettoyage de chaîne
function sanitizeString(value, minLength = 1, maxLength = 255) {
  const str = String(value || '').trim();
  if (str.length < minLength || str.length > maxLength) {
    throw new ApiError(400, `Le champ doit avoir entre ${minLength} et ${maxLength} caractères`);
  }
  return str;
}

// Validation de nombre
function validateNumber(value, min = -Infinity, max = Infinity) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new ApiError(400, `Nombre invalide. Doit être entre ${min} et ${max}`);
  }
  return num;
}

// Validation de boolean
function validateBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return false; // valeur par défaut
}

// Validation d'ID
function validateId(id, paramName = 'id') {
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) {
    throw new ApiError(400, `${paramName} invalide`);
  }
  return numId;
}

// Middleware pour valider les données de connexion
function validateLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new ApiError(400, 'Email et mot de passe requis');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new ApiError(400, 'Email invalide');
    }

    if (!password || password.length < 1) {
      throw new ApiError(400, 'Mot de passe requis');
    }

    req.body.email = normalizedEmail;
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware pour valider les données d'inscription
function validateRegister(req, res, next) {
  try {
    const { fullname, email, password, role } = req.body;
    
    if (!fullname || sanitizeString(fullname, 2).length < 2) {
      throw new ApiError(400, 'Nom complet invalide (minimum 2 caractères)');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new ApiError(400, 'Email invalide');
    }

    if (!isValidPassword(password)) {
      throw new ApiError(400, 'Le mot de passe doit contenir au moins 6 caractères');
    }

    const allowedRoles = ['student', 'teacher', 'admin'];
    if (!role || !allowedRoles.includes(role)) {
      throw new ApiError(400, 'Rôle invalide');
    }

    req.body.fullname = sanitizeString(fullname, 2);
    req.body.email = normalizedEmail;
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware pour valider les paramètres de pagination
function validatePagination(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
      throw new ApiError(400, 'Le numéro de page doit être supérieur à 0');
    }

    if (limit < 1 || limit > 100) {
      throw new ApiError(400, 'La limite doit être entre 1 et 100');
    }

    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  sanitizeString,
  validateNumber,
  validateBoolean,
  validateId,
  validateLogin,
  validateRegister,
  validatePagination,
};
