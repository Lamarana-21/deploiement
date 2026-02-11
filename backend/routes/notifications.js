const express = require('express');
const { query } = require('../db');

const router = express.Router();

const { requireAuth } = require('../middleware/auth');

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [row] = await query(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = :userId AND is_read = 0`,
      { userId }
    );
    return res.json({ ok: true, count: row?.count || 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const unreadOnly = String(req.query.unreadOnly || '').trim() === '1';

    const whereUnread = unreadOnly ? ' AND is_read = 0' : '';

    const [countRow] = await query(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = :userId${whereUnread}`,
      { userId }
    );
    const total = countRow?.total || 0;

    const rows = await query(
      `SELECT id, type, title, body, link_url, is_read, created_at
       FROM notifications
       WHERE user_id = :userId${whereUnread}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      { userId }
    );

    return res.json({
      ok: true,
      notifications: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: page < (Math.ceil(total / limit) || 1),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid id' });
    }

    await query(
      `UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :userId`,
      { id, userId }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    await query(`UPDATE notifications SET is_read = 1 WHERE user_id = :userId`, { userId });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

module.exports = router;
