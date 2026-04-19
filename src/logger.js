const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, `bot-${this.getDateString()}.log`);
    this.ensureLogDirectory();
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  getTimeString() {
    const now = new Date();
    return now.toISOString();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message) {
    return `[${this.getTimeString()}] [${level}] ${message}`;
  }

  writeToFile(message) {
    fs.appendFileSync(this.logFile, message + '\n', 'utf8');
  }

  info(message) {
    const formatted = this.formatMessage('INFO', message);
    console.log(formatted);
    this.writeToFile(formatted);
  }

  error(message) {
    const formatted = this.formatMessage('ERROR', message);
    console.error(formatted);
    this.writeToFile(formatted);
  }

  warn(message) {
    const formatted = this.formatMessage('WARN', message);
    console.warn(formatted);
    this.writeToFile(formatted);
  }

  debug(message) {
    const formatted = this.formatMessage('DEBUG', message);
    console.log(formatted);
    this.writeToFile(formatted);
  }
}

module.exports = new Logger();
