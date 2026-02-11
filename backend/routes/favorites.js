const express = require('express');
const { query } = require('../db');

const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/favorites/ids - list of favorited offer IDs for current student
router.get('/ids', requireAuth, requireRole(['student']), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const rows = await query(
      `SELECT offer_id FROM offer_favorites WHERE user_id = :userId ORDER BY created_at DESC`,
      { userId }
    );
    return res.json({ ok: true, ids: rows.map((r) => r.offer_id) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// GET /api/favorites - paginated list of favorite offers
router.get('/', requireAuth, requireRole(['student']), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const [countRow] = await query(
      `SELECT COUNT(*) AS total FROM offer_favorites WHERE user_id = :userId`,
      { userId }
    );
    const total = countRow?.total || 0;

    const offers = await query(
      `SELECT o.id, o.title, o.company, o.location, o.deadline, o.status, o.type, o.image, o.created_at,
              f.created_at AS favorited_at
       FROM offer_favorites f
       JOIN internship_offers o ON o.id = f.offer_id
       WHERE f.user_id = :userId
       ORDER BY f.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      { userId }
    );

    return res.json({
      ok: true,
      offers,
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

// POST /api/favorites/:offerId - add a favorite
router.post('/:offerId', requireAuth, requireRole(['student']), async (req, res) => {
  const offerId = Number(req.params.offerId);
  if (!Number.isFinite(offerId)) {
    return res.status(400).json({ ok: false, message: 'Invalid offer id' });
  }

  try {
    // Only allow favorites for existing offers
    const offerRows = await query(`SELECT id FROM internship_offers WHERE id = :id LIMIT 1`, { id: offerId });
    if (!offerRows.length) {
      return res.status(404).json({ ok: false, message: 'Offer not found' });
    }

    await query(
      `INSERT INTO offer_favorites (offer_id, user_id) VALUES (:offerId, :userId)`,
      { offerId, userId: req.session.user.id }
    );

    return res.json({ ok: true });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.json({ ok: true });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// DELETE /api/favorites/:offerId - remove a favorite
router.delete('/:offerId', requireAuth, requireRole(['student']), async (req, res) => {
  const offerId = Number(req.params.offerId);
  if (!Number.isFinite(offerId)) {
    return res.status(400).json({ ok: false, message: 'Invalid offer id' });
  }

  try {
    await query(
      `DELETE FROM offer_favorites WHERE offer_id = :offerId AND user_id = :userId`,
      { offerId, userId: req.session.user.id }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

module.exports = router;
