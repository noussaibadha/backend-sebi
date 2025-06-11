requestLogger.js
const logger = require('../config/winston');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log au début de la requête
  logger.info(`Requête reçue: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    body: req.method !== 'GET' ? req.body : {},
  });

  // Log à la fin de la requête avec le temps de réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logObject = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.utilisateur?.id || 'non authentifié',
    };

    if (res.statusCode >= 400) {
      logger.warn(`Réponse: ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`, logObject);
    } else {
      logger.debug(`Réponse: ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`, logObject);
    }
  });

  next();
};

module.exports = requestLogger;
