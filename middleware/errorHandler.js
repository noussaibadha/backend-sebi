<<<<<<< HEAD
const errorHandler = (err, req, res, next) => {
    console.error(`[❌ ERREUR] ${err.message}`); // Log de l'erreur côté console

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Une erreur interne est survenue",
    });
};

module.exports = errorHandler;
=======
const logger = require('../config/winston');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Journaliser l'erreur
  const logDetails = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    user: req.utilisateur ? req.utilisateur.id : 'non authentifié',
    body: req.method !== 'GET' ? req.body : {},
    params: req.params,
    query: req.query,
    stack: err.stack
  };

  // Erreurs MongoDB
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  if (err.code === 11000) { // Duplicate key
    error.message = `Une valeur en doublon a été détectée: ${Object.keys(err.keyValue).join(', ')}`;
    error.statusCode = 400;
  }

  if (err.name === 'CastError') {
    error.message = `Format invalide pour ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token invalide. Veuillez vous reconnecter.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Votre session a expiré. Veuillez vous reconnecter.';
    error.statusCode = 401;
  }

  // Répondre avec l'erreur
  if (error.statusCode >= 500) {
    logger.error(`Erreur serveur: ${error.message}`, logDetails);
    res.status(error.statusCode).json({
      success: false,
      message: 'Une erreur interne est survenue',
    });
  } else {
    logger.warn(`Erreur client: ${error.message}`, logDetails);
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { errorHandler, AppError };
>>>>>>> dbd6d096b4d0e9dab38dfc7b43359458530505a1
