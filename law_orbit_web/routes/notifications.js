const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM notifications WHERE user_id=? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50';
        const [notifs] = await db.query(query, [req.userId]);
        res.json(notifs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read=1 WHERE id=?', [req.params.id]);
        res.json({ message: 'Marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/read-all', verifyToken, async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read=1 WHERE user_id=? OR user_id IS NULL', [req.userId]);
        res.json({ message: 'All marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/unread-count', verifyToken, async (req, res) => {
    try {
        const [result] = await db.query('SELECT COUNT(*) as count FROM notifications WHERE (user_id=? OR user_id IS NULL) AND is_read=0', [req.userId]);
        res.json({ count: result[0].count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
