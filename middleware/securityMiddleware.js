const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const logger = require('../config/winston');

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.security('Limite de requêtes dépassée', {
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      headers: req.headers
    });
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    });
  }
});

// Détection de tentatives d'injection NoSQL
const noSqlInjectionDetection = (req, res, next) => {
  // Modèles d'attaque NoSQL injection
  const suspiciousPatterns = [
    /\$ne/i, 
    /\$gt/i,
    /\$lt/i,
    /\$nin/i,
    /\$eq/i,
    /\$regex/i,
    /\{.*\$.*\}/i,  // Détecte les opérateurs MongoDB dans les objets JSON
    /\$where/i,
    /\$exists/i
  ];

  // Fonction récursive pour vérifier les objets
  const checkForNoSqlInjection = (obj) => {
    if (!obj) return false;
    
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    } else if (typeof obj === 'object') {
      return Object.values(obj).some(val => checkForNoSqlInjection(val));
    }
    return false;
  };

  const hasSuspiciousPattern = checkForNoSqlInjection(req.body) || 
                            checkForNoSqlInjection(req.query) ||
                            checkForNoSqlInjection(req.params);

  if (hasSuspiciousPattern) {
    logger.security('Tentative d\'injection NoSQL potentielle détectée', {
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers['user-agent']
    });
    return res.status(403).json({
      success: false,
      message: 'Requête non autorisée'
    });
  }

  next();
};

// Protéger contre les attaques par force brute
const bruteForceProtection = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 tentatives
  skipSuccessfulRequests: true,
  standardHeaders: true,
  message: {
    success: false,
    message: 'Trop de tentatives échouées, veuillez réessayer plus tard'
  },
  handler: (req, res, next, options) => {
    logger.security('Tentative possible d\'attaque par force brute', {
      ip: req.ip,
      method: req.method,
      path: req.originalUrl
    });
    res.status(429).json(options.message);
  }
});

// Exporter toutes les mesures de sécurité
const securityMiddleware = {
  helmet, // Sécurise les en-têtes HTTP
  xss, // Prévient les attaques XSS
  hpp, // Prévient la pollution des paramètres HTTP
  limiter, // Rate limiting général
  bruteForceProtection, // Protection contre la force brute (à appliquer sur les routes d'auth)
  noSqlInjectionDetection // Détection d'injections NoSQL
};

module.exports = securityMiddleware;
