const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')

// Load session
const { state, saveState } = useSingleFileAuthState('./session.json')

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Show QR/Pair Code
    logger: P({ level: 'silent' })
  })

  // Save session when updated
  sock.ev.on('creds.update', saveState)

  // Connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed due to', lastDisconnect.error, ', reconnecting:', shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ Bot connected!')
    }
  })

  // Listen for incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message) return
    const sender = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text

    // Example reply
    if (text === 'hi') {
      await sock.sendMessage(sender, { text: 'Hello! This is Egbeyemi-MD bot 🤖' })
    }
  })
}

startBot()
