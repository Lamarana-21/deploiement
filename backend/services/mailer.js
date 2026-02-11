/**
 * Service d'envoi d'emails via Nodemailer
 * Configuration via variables d'environnement dans .env :
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL
 */

const nodemailer = require('nodemailer');

// Création du transporteur SMTP
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️  SMTP_USER ou SMTP_PASS non défini. Les emails ne seront pas envoyés.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

let transporter = null;

/**
 * Envoie un email
 * @param {Object} options
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.text - Corps texte brut
 * @param {string} [options.html] - Corps HTML (optionnel)
 * @returns {Promise<{ok: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    transporter = createTransporter();
  }

  if (!transporter) {
    console.log('[Mailer] Email non envoyé (SMTP non configuré) :', subject);
    return { ok: false, error: 'SMTP non configuré' };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from: `"Gestion Offres de Stage" <${from}>`,
      to,
      subject,
      text,
      html: html || undefined,
    });

    console.log('[Mailer] Email envoyé :', info.messageId);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Mailer] Erreur envoi email :', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Notifie l'admin d'une nouvelle proposition de sujet par un enseignant.
 * @param {Object} proposal - Données de la proposition
 * @param {Object} teacher - Infos enseignant (fullname, email)
 */
async function notifyAdminNewProposal(proposal, teacher) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[Mailer] ADMIN_EMAIL non défini. Notification admin ignorée.');
    return { ok: false, error: 'ADMIN_EMAIL non configuré' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = `📩 Nouvelle proposition de sujet de stage - ${proposal.subject_title}`;

  const text = `
Bonjour,

Un enseignant vient de soumettre une nouvelle proposition de sujet de stage sur la plateforme.

📋 DÉTAILS DE LA PROPOSITION
────────────────────────────
Enseignant : ${teacher.fullname} (${teacher.email})
Intitulé du sujet : ${proposal.subject_title}
Entreprise : ${proposal.host_company || 'Non spécifiée'}

Description :
${proposal.description || 'Aucune description fournie.'}

Remarques :
${proposal.remark || 'Aucune.'}
────────────────────────────

Connectez-vous à la plateforme pour examiner cette proposition :
${frontendUrl}/admin/offers

Cordialement,
Plateforme Gestion des Offres de Stage
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle proposition</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 15px; margin-top: 0;">
      📩 Nouvelle proposition de sujet
    </h2>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
      <h3 style="margin-top: 0; color: #198754; font-size: 18px;">📋 Détails de la proposition</h3>
      <p style="margin: 10px 0;"><strong>Enseignant :</strong> ${teacher.fullname} (<a href="mailto:${teacher.email}" style="color: #0d6efd;">${teacher.email}</a>)</p>
      <p style="margin: 10px 0;"><strong>Intitulé du sujet :</strong> ${proposal.subject_title}</p>
      <p style="margin: 10px 0;"><strong>Entreprise :</strong> ${proposal.host_company || '<em>Non spécifiée</em>'}</p>
    </div>

    <div style="margin: 25px 0;">
      <h4 style="color: #495057; margin-bottom: 10px;">Description :</h4>
      <div style="background: #fff; padding: 15px; border-left: 4px solid #0d6efd; background-color: #f8f9fa;">
        ${proposal.description ? proposal.description.replace(/\n/g, '<br>') : '<em>Aucune description fournie.</em>'}
      </div>
    </div>

    ${proposal.remark ? `
    <div style="margin: 25px 0;">
      <h4 style="color: #495057; margin-bottom: 10px;">Remarques :</h4>
      <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
        ${proposal.remark.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    <div style="margin-top: 35px; text-align: center;">
      <a href="${frontendUrl}/admin/offers" style="background-color: #0d6efd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Accéder au Dashboard Admin
      </a>
      <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
        Ou copiez ce lien : <br>
        <a href="${frontendUrl}/admin/offers" style="color: #6c757d;">${frontendUrl}/admin/offers</a>
      </p>
    </div>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #dee2e6;">
    <p style="font-size: 12px; color: #adb5bd; text-align: center; margin-bottom: 0;">
      Plateforme Gestion des Offres de Stage — ${new Date().getFullYear()}
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: adminEmail, subject, text, html });
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} fullname - Nom de l'utilisateur
 * @param {string} resetLink - Lien de réinitialisation complet
 * @param {number} expiresMinutes - Durée de validité en minutes
 */
async function sendPasswordResetEmail(email, fullname, resetLink, expiresMinutes = 30) {
  const subject = '🔐 Réinitialisation de votre mot de passe - Plateforme Stages';

  const text = `
Bonjour ${fullname},

Vous avez demandé la réinitialisation de votre mot de passe sur la Plateforme de Gestion des Stages.

Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
${resetLink}

⚠️ Ce lien est valable ${expiresMinutes} minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.

Cordialement,
L'équipe Plateforme Gestion des Stages
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">🔐</span>
      </div>
      <h2 style="color: #764ba2; margin: 0;">Réinitialisation de mot de passe</h2>
    </div>

    <p style="font-size: 16px;">Bonjour <strong>${fullname}</strong>,</p>
    
    <p style="font-size: 16px;">
      Vous avez demandé la réinitialisation de votre mot de passe sur la Plateforme de Gestion des Stages.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>⚠️ Important :</strong> Ce lien est valable <strong>${expiresMinutes} minutes</strong>.
      </p>
    </div>

    <p style="font-size: 14px; color: #6c757d;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
      <a href="${resetLink}" style="color: #764ba2; word-break: break-all;">${resetLink}</a>
    </p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
      <p style="margin: 0; font-size: 14px; color: #6c757d;">
        <strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>
        Ignorez simplement cet email. Votre mot de passe restera inchangé et aucune action ne sera prise.
      </p>
    </div>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #dee2e6;">
    <p style="font-size: 12px; color: #adb5bd; text-align: center; margin-bottom: 0;">
      Plateforme Gestion des Offres de Stage — ${new Date().getFullYear()}<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

module.exports = {
  sendEmail,
  notifyAdminNewProposal,
  sendPasswordResetEmail,
};
