const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:lawyerId', verifyToken, async (req, res) => {
    try {
        const [ratings] = await db.query(`SELECT r.*, u.name as client_name, c.title as case_title 
            FROM ratings r JOIN users u ON r.client_id=u.id JOIN cases c ON r.case_id=c.id
            WHERE r.lawyer_id=? ORDER BY r.created_at DESC`, [req.params.lawyerId]);
        const [avg] = await db.query('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM ratings WHERE lawyer_id=?', [req.params.lawyerId]);
        res.json({ ratings, average: parseFloat(avg[0].avg_rating || 0).toFixed(1), totalReviews: avg[0].count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { case_id, lawyer_id, rating, review } = req.body;
        await db.query('INSERT INTO ratings (case_id,client_id,lawyer_id,rating,review) VALUES (?,?,?,?,?)',
            [case_id, req.userId, lawyer_id, rating, review]);
        const [avg] = await db.query('SELECT AVG(rating) as avg FROM ratings WHERE lawyer_id=?', [lawyer_id]);
        await db.query('UPDATE lawyers SET rating=? WHERE user_id=?', [avg[0].avg, lawyer_id]);
        res.status(201).json({ message: 'Rating submitted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
