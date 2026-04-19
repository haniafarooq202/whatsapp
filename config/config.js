const path = require('path');

module.exports = {
  // Handouts folder path
  HANDOUTS_DIR: path.join(__dirname, '../handouts'),
  
  // Supported file extensions
  SUPPORTED_EXTENSIONS: ['.pdf', '.docx', '.zip'],
  
  // Message settings
  AUTO_REPLY_DELAY_MIN: 1000,
  AUTO_REPLY_DELAY_MAX: 3000,
  
  // Regex patterns
  SUBJECT_PATTERN: /(cs|mgt|eco|math)\d{3}/i,
  
  // Message templates
  MESSAGES: {
    FILE_SENT: (subjectCode) => `Sent ${subjectCode} file successfully`,
    FILE_NOT_FOUND: '❌ No handouts uploaded yet for this subject',
    LIST_HEADER: '📋 Available Handouts:\n\n',
    LIST_ITEM: (filename) => `• ${filename}`
  }
};
