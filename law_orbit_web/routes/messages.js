const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:caseId', verifyToken, async (req, res) => {
    try {
        const [messages] = await db.query(`SELECT m.*, u.name as sender_name FROM messages m 
            JOIN users u ON m.sender_id=u.id WHERE m.case_id=? ORDER BY m.sent_at ASC`, [req.params.caseId]);
        res.json(messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { case_id, receiver_id, content } = req.body;
        const [result] = await db.query('INSERT INTO messages (case_id,sender_id,receiver_id,content) VALUES (?,?,?,?)',
            [case_id, req.userId, receiver_id, content]);
        await db.query("INSERT INTO notifications (user_id,title,message,type,link) VALUES (?,'New Message',?,'info','messages')",
            [receiver_id, `New message regarding your case`]);
        res.status(201).json({ id: result.insertId, message: 'Message sent' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/conversations/list', verifyToken, async (req, res) => {
    try {
        const [convos] = await db.query(`
            SELECT DISTINCT c.id as case_id, c.title as case_title, 
                   CASE WHEN m.sender_id=? THEN u2.name ELSE u1.name END as other_party,
                   (SELECT content FROM messages WHERE case_id=c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
                   (SELECT sent_at FROM messages WHERE case_id=c.id ORDER BY sent_at DESC LIMIT 1) as last_time
            FROM messages m JOIN cases c ON m.case_id=c.id 
            JOIN users u1 ON m.sender_id=u1.id JOIN users u2 ON m.receiver_id=u2.id
            WHERE m.sender_id=? OR m.receiver_id=? GROUP BY c.id ORDER BY last_time DESC`,
            [req.userId, req.userId, req.userId]);
        res.json(convos);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
