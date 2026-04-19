const Bot = require('./src/bot');
const logger = require('./src/logger');
const express = require('express');
const path = require('path');

const bot = new Bot();
const app = express();
const PORT = process.env.PORT || 3000;

// Serve QR code
app.get('/qr.png', (req, res) => {
  const qrPath = '/tmp/qr.png';
  res.sendFile(qrPath, (err) => {
    if (err) {
      res.status(404).send('QR code not found. Bot may not be ready yet.');
    }
  });
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
