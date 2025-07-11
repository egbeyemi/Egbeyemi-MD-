require('dotenv').config();
const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const fs = require('fs');

const { SESSION_ID } = process.env;
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const startBot = async () => {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m.message) return;

    const text = m.message.conversation || m.message.extendedTextMessage?.text;
    if (text === '.ping') {
      await sock.sendMessage(m.key.remoteJid, { text: '🟢 Bot is online!' });
    }
  });
};

startBot();
