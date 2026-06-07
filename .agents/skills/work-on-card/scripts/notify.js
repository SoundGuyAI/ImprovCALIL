#!/usr/bin/env node
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Gather message from CLI arguments
const args = process.argv.slice(2);
const message = args.join(' ').trim();

if (!message) {
  console.error('Usage: node notify.js "<message_text>"');
  process.exit(1);
}

// 1. First attempt: notify via Symphony daemon
let daemonPort = 9069;
try {
  const envPath = path.resolve('C:/UnityProj/symphony/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^TELEGRAM_NOTIFIER_PORT\s*=\s*(\d+)/m);
    if (match && match[1]) {
      daemonPort = parseInt(match[1], 10);
    }
  }
} catch (e) {
  // Ignore env read failure, fallback to default port
}

const payload = JSON.stringify({ message });

function tryDaemon() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: daemonPort,
      path: '/notify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Notification sent successfully via Symphony Notifier daemon.');
          resolve(true);
        } else {
          console.warn(`Daemon returned HTTP ${res.statusCode}: ${responseData}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.warn(`Symphony Notifier daemon unreachable on port ${daemonPort}: ${err.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

function tryDirectTelegram() {
  return new Promise((resolve) => {
    let botToken = process.env.TELEGRAM_BOT_TOKEN;
    let chatId = process.env.TELEGRAM_CHAT_ID;

    // Load from symphony/.env if not in environment
    try {
      const envPath = path.resolve('C:/UnityProj/symphony/.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const tokenMatch = envContent.match(/^TELEGRAM_BOT_TOKEN\s*=\s*(.+)/m);
        const chatMatch = envContent.match(/^TELEGRAM_CHAT_ID\s*=\s*(.+)/m);
        if (tokenMatch && tokenMatch[1] && (!botToken || botToken === 'your_bot_token_here')) {
          botToken = tokenMatch[1].trim().replace(/['"]/g, '');
        }
        if (chatMatch && chatMatch[1] && (!chatId || chatId === 'your_chat_id_here')) {
          chatId = chatMatch[1].trim().replace(/['"]/g, '');
        }
      }
    } catch (e) {
      console.warn('Could not read or parse C:/UnityProj/symphony/.env for Telegram credentials:', e.message);
    }

    if (!botToken || !chatId || botToken === 'your_bot_token_here') {
      console.error('Error: Telegram Bot Token or Chat ID not configured in environment or symphony/.env');
      resolve(false);
      return;
    }

    const tgPayload = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(tgPayload)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Notification sent successfully directly to Telegram Bot API.');
          resolve(true);
        } else {
          console.error(`Telegram API returned HTTP ${res.statusCode}: ${responseData}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Failed to connect to Telegram API: ${err.message}`);
      resolve(false);
    });

    req.write(tgPayload);
    req.end();
  });
}

async function main() {
  const daemonSuccess = await tryDaemon();
  if (daemonSuccess) {
    process.exit(0);
  }

  console.log('Attempting direct Telegram Bot API fallback...');
  const directSuccess = await tryDirectTelegram();
  if (directSuccess) {
    process.exit(0);
  } else {
    console.error('All notification attempts failed.');
    process.exit(1);
  }
}

main();
