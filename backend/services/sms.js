/**
 * Service d'envoi de SMS via Twilio
 * Configuration via variables d'environnement dans .env :
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

let twilio = null;

// Initialisation de Twilio (lazy loading)
const getTwilioClient = () => {
  if (twilio) return twilio;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('⚠️  TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN non défini. Les SMS ne seront pas envoyés.');
    return null;
  }

  try {
    const TwilioSdk = require('twilio');
    twilio = new TwilioSdk(accountSid, authToken);
    return twilio;
  } catch (err) {
    console.warn('⚠️  Twilio non disponible. Les SMS ne seront pas envoyés.');
    return null;
  }
};

/**
 * Envoie un SMS
 * @param {Object} options
 * @param {string} options.to - Numéro de téléphone destinataire (format international)
 * @param {string} options.body - Contenu du message
 * @returns {Promise<{ok: boolean, sid?: string, error?: string}>}
 */
async function sendSMS({ to, body }) {
  const client = getTwilioClient();

  if (!client) {
    console.log('[SMS] SMS non envoyé (Twilio non configuré)');
    return { ok: false, error: 'Twilio non configuré' };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.warn('[SMS] TWILIO_PHONE_NUMBER non défini.');
    return { ok: false, error: 'TWILIO_PHONE_NUMBER non configuré' };
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: to.startsWith('+') ? to : `+${to}`,
    });

    console.log('[SMS] SMS envoyé :', message.sid);
    return { ok: true, sid: message.sid };
  } catch (err) {
    console.error('[SMS] Erreur envoi SMS :', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Envoie un SMS d'alerte à l'admin pour un nouveau message de contact
 * @param {Object} contact - Données du message de contact
 * @param {string} adminPhone - Numéro de téléphone de l'admin
 */
async function notifyAdminNewContactMessage(contact, adminPhone) {
  const message = `
📨 NOUVEAU MESSAGE DE CONTACT

De: ${contact.name} (${contact.email})
Sujet: ${contact.subject}

Message:
${contact.message.substring(0, 100)}${contact.message.length > 100 ? '...' : ''}

Répondre à: ${contact.email}
  `.trim();

  return sendSMS({ to: adminPhone, body: message });
}

module.exports = {
  sendSMS,
  notifyAdminNewContactMessage,
};
