const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class Utils {
  /**
   * Load subjects data from JSON file with caching
   */
  static subjectsCache = null;
  static subjectsCacheTime = null;
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static loadSubjects(filePath) {
    try {
      // Check cache
      if (this.subjectsCache && 
          this.subjectsCacheTime && 
          (Date.now() - this.subjectsCacheTime) < this.CACHE_DURATION) {
        logger.debug('Returning cached subjects data');
        return this.subjectsCache;
      }

      logger.info(`Loading subjects from: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        logger.error(`Subjects file not found: ${filePath}`);
        return {};
      }

      const data = fs.readFileSync(filePath, 'utf8');
      const subjects = JSON.parse(data);
      
      // Update cache
      this.subjectsCache = subjects;
      this.subjectsCacheTime = Date.now();
      
      logger.info(`Loaded ${Object.keys(subjects).length} subjects`);
      return subjects;
    } catch (error) {
      logger.error(`Error loading subjects: ${error.message}`);
      return {};
    }
  }

  /**
   * Save subjects data to JSON file
   */
  static saveSubjects(filePath, subjects) {
    try {
      logger.info(`Saving subjects to: ${filePath}`);
      fs.writeFileSync(filePath, JSON.stringify(subjects, null, 2), 'utf8');
      
      // Update cache
      this.subjectsCache = subjects;
      this.subjectsCacheTime = Date.now();
      
      logger.info('Subjects saved successfully');
      return true;
    } catch (error) {
      logger.error(`Error saving subjects: ${error.message}`);
      return false;
    }
  }

  /**
   * Normalize message text
   */
  static normalizeMessage(text) {
    if (!text) return '';
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Extract subject code from message using regex
   */
  static extractSubjectCode(text, pattern) {
    if (!text) return null;
    
    const match = text.match(pattern);
    return match ? match[0].toLowerCase() : null;
  }

  /**
   * Generate random delay for human-like response
   */
  static getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Sleep function for delays
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if message is from authorized admin
   */
  static isAdminNumber(number, adminNumber) {
    if (!number || !adminNumber) return false;
    
    // Normalize numbers (remove spaces, dashes, etc.)
    const normalizedNumber = number.replace(/[\s\-]/g, '');
    const normalizedAdmin = adminNumber.replace(/[\s\-]/g, '');
    
    return normalizedNumber === normalizedAdmin || 
           normalizedNumber.endsWith(normalizedAdmin.slice(-10));
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(number) {
    if (!number) return 'Unknown';
    return number.replace(/@c\.us$/, '').replace(/@g\.us$/, '');
  }
}

module.exports = Utils;
