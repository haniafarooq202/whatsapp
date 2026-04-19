const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const MessageHandler = require('./messageHandler');
const logger = require('./logger');

class Bot {
  constructor() {
    const puppeteerConfig = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };

    // Detect Chrome executable path based on OS
    const platform = process.platform;
    if (platform === 'win32') {
      puppeteerConfig.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else if (platform === 'linux') {
      // Linux cloud environments
      puppeteerConfig.executablePath = process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome';
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
      }),
      puppeteer: puppeteerConfig
    });

    this.messageHandler = null;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // QR Code generation
    this.client.on('qr', (qr) => {
      logger.info('QR Code received. Scan to authenticate.');
      
      // Generate QR code as buffer
      QRCode.toBuffer(qr, {
        width: 300,
        margin: 2
      }, (err, buffer) => {
        if (err) {
          logger.error(`Error generating QR code: ${err.message}`);
        } else {
          logger.info('QR code generated successfully');
          // Store in memory via the function set by index.js
          if (this.setQRCodeData) {
            this.setQRCodeData(buffer);
          }
          // Also save to local file
          const fs = require('fs');
          const qrPath = './qr.png';
          fs.writeFileSync(qrPath, buffer);
          logger.info(`QR code saved to: ${qrPath}`);
          logger.info('Open qr.png to scan with WhatsApp');
        }
      });
    });

    // Ready event
    this.client.on('ready', () => {
      logger.info('WhatsApp client is ready!');
      logger.info('Bot is now listening for messages...');
    });

    // Authentication success
    this.client.on('authenticated', () => {
      logger.info('Authentication successful!');
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      logger.error(`Authentication failed: ${msg}`);
    });

    // Message received
    this.client.on('message', async (message) => {
      // Ignore messages from self
      if (message.fromMe) {
        return;
      }

      // Handle message
      if (this.messageHandler) {
        await this.messageHandler.handleMessage(message);
      }
    });

    // Disconnection
    this.client.on('disconnected', (reason) => {
      logger.warn(`Client disconnected: ${reason}`);
    });

    // Error handling
    this.client.on('error', (error) => {
      logger.error(`Client error: ${error.message}`);
    });
  }

  async initialize() {
    try {
      logger.info('Initializing WhatsApp bot...');
      
      this.messageHandler = new MessageHandler(this.client);

      await this.client.initialize();
      
    } catch (error) {
      logger.error(`Error initializing bot: ${error.message}`);
      throw error;
    }
  }

  async destroy() {
    try {
      logger.info('Destroying bot client...');
      await this.client.destroy();
      logger.info('Bot destroyed successfully');
    } catch (error) {
      logger.error(`Error destroying bot: ${error.message}`);
    }
  }
}

module.exports = Bot;
