/**
 * Middleware de gestion globale des erreurs
 * Capture toutes les erreurs non gérées et retourne une réponse appropriée
 */

// Classe d'erreur personnalisée pour les erreurs API
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Middleware de gestion des erreurs
function errorHandler(err, req, res, next) {
  // Log l'erreur avec plus de détails
  console.error('[Error Handler]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Si c'est une erreur API personnalisée
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      details: err.details,
    });
  }

  // Si c'est une erreur multer (upload de fichiers)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        ok: false,
        message: 'Fichier trop volumineux',
      });
    }
    return res.status(400).json({
      ok: false,
      message: `Erreur d'upload: ${err.message}`,
    });
  }

  // Si c'est une erreur de validation personnalisée
  if (err.message && err.message.includes('Seuls les fichiers')) {
    return res.status(400).json({
      ok: false,
      message: err.message,
    });
  }

  // Erreur de base de données MySQL
  if (err.code && err.code.startsWith('ER_')) {
    const dbErrors = {
      ER_DUP_ENTRY: 'Cette entrée existe déjà',
      ER_NO_REFERENCED_ROW: 'Référence invalide',
      ER_ROW_IS_REFERENCED: 'Impossible de supprimer: référencé ailleurs',
      ER_BAD_FIELD_ERROR: 'Champ invalide dans la requête',
      ER_PARSE_ERROR: 'Erreur de syntaxe SQL',
    };

    return res.status(400).json({
      ok: false,
      message: dbErrors[err.code] || 'Erreur de base de données',
      ...(process.env.NODE_ENV === 'development' && { details: err.sqlMessage }),
    });
  }

  // Erreur par défaut (erreur interne du serveur)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  return res.status(statusCode).json({
    ok: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// Middleware pour les routes non trouvées
function notFoundHandler(req, res) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      ok: false,
      message: 'Endpoint non trouvé',
      path: req.path,
    });
  }
  // Pour les routes frontend, laisser le serveur décider
  return res.status(404).send('Page non trouvée');
}

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
};
