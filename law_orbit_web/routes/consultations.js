const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `SELECT co.*, u1.name as client_name, u2.name as lawyer_name, c.title as case_title
            FROM consultations co LEFT JOIN users u1 ON co.client_id=u1.id LEFT JOIN users u2 ON co.lawyer_id=u2.id
            LEFT JOIN cases c ON co.case_id=c.id`;
        let params = [];
        if (req.userRole === 'client') { query += ' WHERE co.client_id=?'; params.push(req.userId); }
        else if (req.userRole === 'lawyer') { query += ' WHERE co.lawyer_id=?'; params.push(req.userId); }
        query += ' ORDER BY co.scheduled_date DESC';
        const [consults] = await db.query(query, params);
        res.json(consults);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { lawyer_id, case_id, scheduled_date, scheduled_time, duration, type, fee } = req.body;
        const link = type === 'Video' ? `https://meet.laworbit.com/room-${Date.now()}` : null;
        const [result] = await db.query(
            'INSERT INTO consultations (client_id,lawyer_id,case_id,scheduled_date,scheduled_time,duration,type,status,meeting_link,fee) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [req.userId, lawyer_id, case_id, scheduled_date, scheduled_time, duration || 30, type || 'Video', 'Requested', link, fee || 2000]);
        await db.query("INSERT INTO notifications (user_id,title,message,type) VALUES (?,'New Consultation Request','A client has requested a consultation','info')", [lawyer_id]);
        res.status(201).json({ id: result.insertId, meeting_link: link, message: 'Consultation requested' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE consultations SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ message: 'Consultation updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
