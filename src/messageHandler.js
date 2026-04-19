const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const Utils = require('./utils');
const logger = require('./logger');

class MessageHandler {
  constructor(client) {
    this.client = client;
    this.handoutsDir = config.HANDOUTS_DIR;
    this.ensureHandoutsDirectory();
  }

  ensureHandoutsDirectory() {
    if (!fs.existsSync(this.handoutsDir)) {
      fs.mkdirSync(this.handoutsDir, { recursive: true });
      logger.info(`Created handouts directory: ${this.handoutsDir}`);
    }
  }

  async handleMessage(message) {
    try {
      const messageBody = message.body;
      const normalizedText = Utils.normalizeMessage(messageBody);
      const senderNumber = message.from;

      logger.info(`Message from ${Utils.formatPhoneNumber(senderNumber)}: ${messageBody}`);
      logger.info(`Normalized text: ${normalizedText}`);

      const isGroup = senderNumber.includes('@g.us');
      logger.debug(`Is group message: ${isGroup}`);

      // Extract subject code
      const subjectCode = Utils.extractSubjectCode(normalizedText, config.SUBJECT_PATTERN);
      logger.info(`Extracted subject code: ${subjectCode}`);

      // Check for format: <SUBJECT_CODE> handout(s) or <SUBJECT_CODE>handout(s)
      // Accepts: cs201 handout, cs201 handouts, cs201handout, cs201handouts
      const correctFormatPattern = new RegExp(`^${config.SUBJECT_PATTERN.source}\\s*handouts?$`, 'i');
      const isCorrectFormat = correctFormatPattern.test(normalizedText);
      logger.info(`Correct format: ${isCorrectFormat}`);

      if (isCorrectFormat && subjectCode) {
        // Correct format: send file
        await this.handleSubjectRequest(message, subjectCode);
      } else {
        // Wrong format or no subject code: ignore completely
        logger.info('Wrong format or no subject code - ignoring message');
      }

    } catch (error) {
      logger.error(`Error handling message: ${error.message}`);
    }
  }

  async handleSubjectRequest(message, subjectCode) {
    try {
      const delay = Utils.getRandomDelay(
        config.AUTO_REPLY_DELAY_MIN, 
        config.AUTO_REPLY_DELAY_MAX
      );
      await Utils.sleep(delay);

      const filePath = this.findHandoutFile(subjectCode);
      
      if (filePath) {
        const media = MessageMedia.fromFilePath(filePath);
        await message.reply(media);
        logger.info(config.MESSAGES.FILE_SENT(subjectCode));
      } else {
        await message.reply(config.MESSAGES.FILE_NOT_FOUND);
        logger.info(`File not found for ${subjectCode}`);
      }
    } catch (error) {
      logger.error(`Error handling subject request: ${error.message}`);
    }
  }

  findHandoutFile(subjectCode) {
    const files = fs.readdirSync(this.handoutsDir);
    logger.info(`Searching for ${subjectCode} in ${files.length} files`);

    for (const file of files) {
      const fileName = path.parse(file).name;
      const ext = path.parse(file).ext.toLowerCase();

      if (!config.SUPPORTED_EXTENSIONS.includes(ext)) {
        continue;
      }

      const extractedCode = Utils.extractSubjectCode(fileName.toLowerCase(), config.SUBJECT_PATTERN);
      logger.debug(`Checking file: ${file}, extracted code: ${extractedCode}`);

      if (extractedCode === subjectCode) {
        logger.info(`Found matching file: ${file}`);
        return path.join(this.handoutsDir, file);
      }
    }

    logger.info(`No file found for ${subjectCode}`);
    return null;
  }

  async handleListCommand(message) {
    try {
      const files = fs.readdirSync(this.handoutsDir);
      const handoutFiles = files.filter(file => {
        const ext = path.parse(file).ext.toLowerCase();
        return config.SUPPORTED_EXTENSIONS.includes(ext);
      });

      if (handoutFiles.length === 0) {
        await message.reply('❌ No handouts uploaded yet.');
        return;
      }

      let response = config.MESSAGES.LIST_HEADER;
      handoutFiles.sort().forEach(file => {
        response += config.MESSAGES.LIST_ITEM(file) + '\n';
      });

      const delay = Utils.getRandomDelay(
        config.AUTO_REPLY_DELAY_MIN, 
        config.AUTO_REPLY_DELAY_MAX
      );
      await Utils.sleep(delay);
      
      await message.reply(response);
      logger.info(`Sent handouts list to ${Utils.formatPhoneNumber(message.from)}`);
    } catch (error) {
      logger.error(`Error handling list command: ${error.message}`);
    }
  }
}

module.exports = MessageHandler;
