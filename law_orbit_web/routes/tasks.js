const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = 'SELECT t.*, c.title as case_title FROM tasks t LEFT JOIN cases c ON t.case_id=c.id WHERE t.user_id=?';
        query += ' ORDER BY FIELD(t.priority,"Urgent","High","Medium","Low"), t.due_date ASC';
        const [tasks] = await db.query(query, [req.userId]);
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { case_id, title, description, priority, due_date } = req.body;
        const [result] = await db.query(
            'INSERT INTO tasks (user_id,case_id,title,description,priority,due_date) VALUES (?,?,?,?,?,?)',
            [req.userId, case_id, title, description, priority || 'Medium', due_date]);
        res.status(201).json({ id: result.insertId, message: 'Task created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const completedAt = status === 'Completed' ? new Date() : null;
        await db.query('UPDATE tasks SET status=?, completed_at=? WHERE id=? AND user_id=?',
            [status, completedAt, req.params.id, req.userId]);
        res.json({ message: 'Task updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE id=? AND user_id=?', [req.params.id, req.userId]);
        res.json({ message: 'Task deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
