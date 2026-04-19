const Bot = require('./src/bot');
const logger = require('./src/logger');
const express = require('express');
const path = require('path');

const bot = new Bot();
const app = express();
const PORT = process.env.PORT || 3000;

// Store QR code in memory
let qrCodeData = null;

// Set QR code data from bot
bot.setQRCodeData = (data) => {
  qrCodeData = data;
  logger.info('QR code data stored in memory');
};

// Serve QR code
app.get('/qr.png', (req, res) => {
  if (!qrCodeData) {
    res.status(404).send('QR code not generated yet. Bot is still starting...');
    return;
  }
  res.setHeader('Content-Type', 'image/png');
  res.send(qrCodeData);
});

// Health check
app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running. QR code at /qr.png');
});

// Start HTTP server
app.listen(PORT, () => {
  logger.info(`HTTP server running on port ${PORT}`);
  logger.info(`QR code available at: http://localhost:${PORT}/qr.png`);
});

async function start() {
  try {
    await bot.initialize();
  } catch (error) {
    logger.error(`Failed to start bot: ${error.message}`);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await bot.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await bot.destroy();
  process.exit(0);
});
