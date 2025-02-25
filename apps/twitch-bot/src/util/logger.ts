import winston from 'winston';

// Check if we're in debug mode from environment variable or default to 'info'
const logLevel = process.env.LOG_LEVEL || 'debug'; // Changed default to 'debug'

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Add a dedicated file for debug logs
    new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
  ],
});

// Log the current log level on startup
logger.info(`Logger initialized with log level: ${logLevel}`);

export default logger;