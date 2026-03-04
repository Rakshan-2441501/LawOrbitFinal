const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        const [templates] = await db.query('SELECT * FROM templates ORDER BY usage_count DESC');
        res.json(templates);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [t] = await db.query('SELECT * FROM templates WHERE id=?', [req.params.id]);
        if (t.length === 0) return res.status(404).json({ message: 'Template not found' });
        await db.query('UPDATE templates SET usage_count=usage_count+1 WHERE id=?', [req.params.id]);
        res.json(t[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, category, type, content } = req.body;
        const [result] = await db.query('INSERT INTO templates (title,category,type,content,created_by) VALUES (?,?,?,?,?)',
            [title, category, type, content, req.userId]);
        res.status(201).json({ id: result.insertId, message: 'Template created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
