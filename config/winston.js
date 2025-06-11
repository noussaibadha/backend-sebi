const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');
const fs = require('fs');

// Créer le dossier logs s'il n'existe pas
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Format pour les logs console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `[${timestamp}] ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''}`;
});

// Création du logger - On définit un niveau par défaut sans dépendre de NODE_ENV
const logger = createLogger({
  level: 'info', // Niveau par défaut
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'sebi-gazelle-api' },
  transports: [
    // Logs d'erreurs
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Logs d'informations et plus
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Logs de sécurité
    new transports.File({
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    // Toujours ajouter les logs console pour faciliter le débogage
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      )
    })
  ]
});

// Intercepter les exceptions non gérées
logger.exceptions.handle(
  new transports.File({ 
    filename: path.join(logDir, 'exceptions.log'),
    format: combine(
      timestamp(),
      json()
    )
  })
);

// Méthode pour logger les tentatives d'intrusion
logger.security = (message, metadata) => {
  logger.warn(message, { ...metadata, security: true });
};

module.exports = logger;