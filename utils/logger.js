const winston = require("winston");
const path = require("path");
const format = winston.format;

winston.addColors({
  morgan: "bold white",
  info: "bold cyan",
  warn: "bold yellow",
  error: "grey"
});

const logger = winston.createLogger({
  level: "morgan",
  levels: { error: 0, warn: 1, info: 2, morgan: 3 },
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "WayfarerServer" }
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: format.combine(format.colorize({ all: true }), format.simple())
    })
  );
}

module.exports = (fileName, dirname = "") => {
  if (!fileName) {
    logger.warn("Must specify a `__filename`. Usage: `const logger = require(logger)(__filename)`. Returning default Winston logger.");
    return logger;
  }
    
  fileName = path.parse(dirname).base + `/` + path.parse(fileName).base; 

  const wrappedLogger = {
      error: (message, meta) => meta ? logger.error(message, { ...meta, at: fileName }) : logger.error(message, { at: fileName }),
      warn: (message, meta) => meta ? logger.warn(message, { ...meta, at: fileName }) : logger.warn(message, { at: fileName }),
      info: (message, meta) => meta ? logger.info(message, { ...meta, at: fileName }) : logger.info(message, { at: fileName }),
      morgan: (message) => logger.morgan(message)
  }

  return wrappedLogger;
}