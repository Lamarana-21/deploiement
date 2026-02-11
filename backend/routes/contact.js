const express = require('express');
const { query } = require('../db');
const { sendEmail } = require('../services/mailer');
const { notifyAdminNewContactMessage } = require('../services/sms');

const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/contact
 * Récupère tous les messages de contact (admin uniquement)
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT 
        cm.*,
        u.fullname as replied_by_name
      FROM contact_messages cm
      LEFT JOIN users u ON cm.replied_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND cm.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (cm.name LIKE ? OR cm.email LIKE ? OR cm.subject LIKE ? OR cm.message LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY cm.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const messages = await query(sql, params);

    // Compter les messages par statut
    const countsSql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
      FROM contact_messages
    `;
    const [counts] = await query(countsSql);

    return res.json({
      ok: true,
      messages,
      counts: {
        total: counts.total || 0,
        unread: counts.unread || 0,
        read: counts.read_count || 0,
        replied: counts.replied || 0,
        archived: counts.archived || 0
      }
    });
  } catch (err) {
    console.error('[Contact] Erreur liste:', err);
    return res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

/**
 * GET /api/contact/:id
 * Récupère un message spécifique (admin uniquement)
 */
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [message] = await query(`
      SELECT 
        cm.*,
        u.fullname as replied_by_name
      FROM contact_messages cm
      LEFT JOIN users u ON cm.replied_by = u.id
      WHERE cm.id = ?
    `, [id]);

    if (!message) {
      return res.status(404).json({ ok: false, message: 'Message non trouvé' });
    }

    // Marquer comme lu si non lu
    if (message.status === 'unread') {
      await query('UPDATE contact_messages SET status = ? WHERE id = ?', ['read', id]);
      message.status = 'read';
    }

    return res.json({ ok: true, message });
  } catch (err) {
    console.error('[Contact] Erreur détail:', err);
    return res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

/**
 * PATCH /api/contact/:id
 * Met à jour le statut d'un message (admin uniquement)
 */
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ ok: false, message: 'Statut invalide' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'replied') {
        updates.push('replied_at = NOW()');
        updates.push('replied_by = ?');
        params.push(req.session.user.id);
      }
    }

    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, message: 'Aucune modification' });
    }

    params.push(id);
    await query(`UPDATE contact_messages SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ ok: true, message: 'Message mis à jour' });
  } catch (err) {
    console.error('[Contact] Erreur mise à jour:', err);
    return res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

/**
 * POST /api/contact/:id/reply
 * Répondre à un message par email (admin uniquement)
 */
router.post('/:id/reply', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || replyMessage.trim().length < 10) {
      return res.status(400).json({ ok: false, message: 'La réponse doit contenir au moins 10 caractères' });
    }

    // Récupérer le message original
    const [original] = await query('SELECT * FROM contact_messages WHERE id = ?', [id]);
    if (!original) {
      return res.status(404).json({ ok: false, message: 'Message non trouvé' });
    }

    // Envoyer l'email de réponse
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Réponse à votre message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 15px; margin-top: 0;">
      📧 Réponse à votre message
    </h2>

    <p style="font-size: 16px;">Bonjour <strong>${original.name}</strong>,</p>
    
    <p style="font-size: 16px;">Nous vous remercions pour votre message concernant "<strong>${original.subject}</strong>".</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0d6efd;">
      <h4 style="margin-top: 0; color: #0d6efd;">Notre réponse :</h4>
      <div style="white-space: pre-wrap;">${replyMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>

    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; color: #0d6efd; font-size: 14px;">
        <strong>Votre message original :</strong><br>
        <em style="color: #6c757d;">${original.message.substring(0, 200)}${original.message.length > 200 ? '...' : ''}</em>
      </p>
    </div>

    <p style="font-size: 14px; color: #6c757d;">
      Si vous avez d'autres questions, n'hésitez pas à nous recontacter.
    </p>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #dee2e6;">
    <p style="font-size: 12px; color: #adb5bd; text-align: center; margin-bottom: 0;">
      Plateforme Gestion des Offres de Stage — ${new Date().getFullYear()}
    </p>
  </div>
</body>
</html>
    `.trim();

    const emailResult = await sendEmail({
      to: original.email,
      subject: `Re: ${original.subject}`,
      text: `Bonjour ${original.name},\n\n${replyMessage}\n\nCordialement,\nL'équipe Gestion des Offres de Stage`,
      html: emailHtml,
    });

    if (!emailResult.ok) {
      return res.status(500).json({ ok: false, message: 'Erreur lors de l\'envoi de l\'email' });
    }

    // Mettre à jour le statut du message
    await query(`
      UPDATE contact_messages 
      SET status = 'replied', replied_at = NOW(), replied_by = ?, admin_notes = CONCAT(IFNULL(admin_notes, ''), '\n--- Réponse envoyée le ', NOW(), ' ---\n', ?)
      WHERE id = ?
    `, [req.session.user.id, replyMessage, id]);

    return res.json({ ok: true, message: 'Réponse envoyée avec succès' });
  } catch (err) {
    console.error('[Contact] Erreur réponse:', err);
    return res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/contact/:id
 * Supprime un message (admin uniquement)
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return res.json({ ok: true, message: 'Message supprimé' });
  } catch (err) {
    console.error('[Contact] Erreur suppression:', err);
    return res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

/**
 * POST /api/contact
 * Reçoit un message de contact d'un visiteur/étudiant
 * Sauvegarde en base de données puis tente d'envoyer des notifications
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        ok: false,
        message: 'Tous les champs sont requis (name, email, subject, message)',
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        ok: false,
        message: 'Le message doit contenir au moins 10 caractères',
      });
    }

    // ÉTAPE 1: Sauvegarder le message en base de données (PRIORITÉ)
    try {
      await query(`
        INSERT INTO contact_messages (name, email, phone, subject, message, status)
        VALUES (?, ?, ?, ?, ?, 'unread')
      `, [name, email, phone || null, subject, message]);
      console.log('[Contact] Message sauvegardé en base de données');
    } catch (dbError) {
      console.error('[Contact] Erreur sauvegarde BDD:', dbError);
      return res.status(500).json({
        ok: false,
        message: 'Erreur lors de l\'enregistrement du message',
      });
    }

    // ÉTAPE 2: Notifications (non bloquantes - on continue même si erreur)
    let emailSent = false;
    let smsSent = false;
    let confirmationSent = false;

    // Données de l'admin
    const adminEmail = process.env.ADMIN_EMAIL || 'mlamaranapalaga21@gmail.com';
    const adminPhone = process.env.ADMIN_PHONE || '53875648';

    // Tenter d'envoyer l'email à l'admin
    try {
      const emailSubject = `📧 Nouveau message de contact - ${subject}`;
      const emailText = `
Bonjour,

Vous avez reçu un nouveau message de contact.

EXPÉDITEUR
──────────────────
Nom: ${name}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ''}

SUJET: ${subject}

MESSAGE
──────────────────
${message}

──────────────────
Pour répondre, envoyez un email à: ${email}
      `.trim();

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouveau message de contact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 15px; margin-top: 0;">
      📧 Nouveau message de contact
    </h2>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
      <h3 style="margin-top: 0; color: #198754; font-size: 18px;">👤 Expéditeur</h3>
      <p style="margin: 10px 0;"><strong>Nom :</strong> ${name}</p>
      <p style="margin: 10px 0;">
        <strong>Email :</strong> 
        <a href="mailto:${email}" style="color: #0d6efd; word-break: break-all;">${email}</a>
      </p>
      ${phone ? `<p style="margin: 10px 0;"><strong>Téléphone :</strong> <a href="tel:${phone}" style="color: #0d6efd;">${phone}</a></p>` : ''}
    </div>

    <div style="background: #e7f3ff; padding: 15px; border-left: 4px solid #0d6efd; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0d6efd;">
        Sujet: ${subject}
      </p>
    </div>

    <div style="margin: 25px 0;">
      <h4 style="color: #495057; margin-bottom: 10px;">Message :</h4>
      <div style="background: #fff; padding: 15px; border-left: 4px solid #0d6efd; background-color: #f8f9fa; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">
        ${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <p style="margin: 0;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">
          Répondre par email
        </a>
        ${phone ? `<a href="tel:${phone}" style="background-color: #198754; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Appeler</a>` : ''}
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

      const emailResult = await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
      emailSent = emailResult.ok;
      if (!emailResult.ok) {
        console.error('[Contact] Erreur envoi email admin:', emailResult.error);
      }
    } catch (emailError) {
      console.error('[Contact] Exception envoi email admin:', emailError.message);
    }

    // Tenter d'envoyer un SMS d'alerte à l'admin
    try {
      const smsResult = await notifyAdminNewContactMessage(
        { name, email, subject, message },
        adminPhone
      );
      smsSent = smsResult.ok;
      if (!smsResult.ok) {
        console.error('[Contact] Erreur envoi SMS admin:', smsResult.error);
      }
    } catch (smsError) {
      console.error('[Contact] Exception envoi SMS:', smsError.message);
    }

    // Tenter d'envoyer un email de confirmation à l'expéditeur
    try {
      const confirmationEmailText = `
Bonjour ${name},

Merci de nous avoir contacté. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.

Résumé de votre demande:
- Sujet: ${subject}

Vous recevrez une réponse à l'adresse email: ${email}

Cordialement,
L'équipe Gestion des Offres de Stage
      `.trim();

      const confirmationEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation de réception</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">✓</span>
      </div>
      <h2 style="color: #28a745; margin: 0;">Message reçu avec succès !</h2>
    </div>

    <p style="font-size: 16px;">Bonjour <strong>${name}</strong>,</p>
    
    <p style="font-size: 16px;">
      Merci de nous avoir contacté. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
    </p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
      <h4 style="margin-top: 0; color: #28a745;">📋 Résumé de votre demande</h4>
      <p style="margin: 10px 0;"><strong>Sujet :</strong> ${subject}</p>
      <p style="margin: 10px 0;"><strong>Email de contact :</strong> ${email}</p>
    </div>

    <p style="font-size: 14px; color: #6c757d;">
      Vous recevrez une réponse à l'adresse email <strong>${email}</strong>.
    </p>

    <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0; color: #155724;">
        <strong>ℹ️ Info :</strong> Les réponses sont généralement envoyées dans les 24 à 48 heures.
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

      const confirmResult = await sendEmail({
        to: email,
        subject: '✓ Confirmation de réception de votre message',
        text: confirmationEmailText,
        html: confirmationEmailHtml,
      });
      confirmationSent = confirmResult.ok;
    } catch (confirmError) {
      console.error('[Contact] Exception envoi confirmation:', confirmError.message);
    }

    // Répondre avec succès (le message est bien enregistré)
    return res.json({
      ok: true,
      message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      emailSent,
      smsSent,
      confirmationSent,
    });
  } catch (err) {
    console.error('[Contact] Erreur inattendue:', err);
    return res.status(500).json({
      ok: false,
      message: 'Erreur lors du traitement de votre message. Veuillez réessayer.',
    });
  }
});

module.exports = router;
