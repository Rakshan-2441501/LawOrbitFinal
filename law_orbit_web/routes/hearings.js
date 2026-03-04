const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `SELECT h.*, c.title as case_title, c.case_number FROM hearings h 
            JOIN cases c ON h.case_id=c.id`;
        let params = [];
        if (req.userRole === 'client') { query += ' WHERE c.client_id=?'; params.push(req.userId); }
        else if (req.userRole === 'lawyer') { query += ' WHERE c.lawyer_id=?'; params.push(req.userId); }
        query += ' ORDER BY h.date ASC, h.time ASC';
        const [hearings] = await db.query(query, params);
        res.json(hearings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { case_id, title, date, time, venue, courtroom, judge } = req.body;
        const [result] = await db.query(
            'INSERT INTO hearings (case_id,title,date,time,venue,courtroom,judge,status) VALUES (?,?,?,?,?,?,?,?)',
            [case_id, title, date, time, venue, courtroom, judge, 'Scheduled']);
        await db.query('INSERT INTO case_timeline (case_id,event_title,event_date,event_type,created_by) VALUES (?,?,?,?,?)',
            [case_id, `Hearing: ${title}`, date, 'Hearing', req.userId]);
        res.status(201).json({ id: result.insertId, message: 'Hearing scheduled' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status, notes, next_date } = req.body;
        await db.query('UPDATE hearings SET status=?, notes=?, next_date=? WHERE id=?', [status, notes, next_date, req.params.id]);
        res.json({ message: 'Hearing updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Calendar export (ICS format)
router.get('/calendar-export', verifyToken, async (req, res) => {
    try {
        let query = `SELECT h.*, c.title as case_title FROM hearings h JOIN cases c ON h.case_id=c.id WHERE h.status='Scheduled'`;
        let params = [];
        if (req.userRole === 'lawyer') { query += ' AND c.lawyer_id=?'; params.push(req.userId); }
        else if (req.userRole === 'client') { query += ' AND c.client_id=?'; params.push(req.userId); }
        const [hearings] = await db.query(query, params);
        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LawOrbit//EN\n';
        hearings.forEach(h => {
            const d = new Date(h.date).toISOString().replace(/[-:]/g, '').split('T')[0];
            const t = (h.time || '10:00:00').replace(/:/g, '');
            ics += `BEGIN:VEVENT\nDTSTART:${d}T${t}\nSUMMARY:${h.title} - ${h.case_title}\nLOCATION:${h.venue || ''}\nEND:VEVENT\n`;
        });
        ics += 'END:VCALENDAR';
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename=hearings.ics');
        res.send(ics);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
