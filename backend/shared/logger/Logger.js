// Structured logger for production monitoring
export class Logger {
  constructor(service = 'App') {
    this.service = service;
  }

  format(level, message, context = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...context,
    });
  }

  log(message, context) {
    console.log(this.format('INFO', message, context));
  }

  debug(message, context) {
    if (process.env.DEBUG) {
      console.debug(this.format('DEBUG', message, context));
    }
  }

  warn(message, context) {
    console.warn(this.format('WARN', message, context));
  }

  error(message, context) {
    console.error(this.format('ERROR', message, context));
  }
}
