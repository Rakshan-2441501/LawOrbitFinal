const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `SELECT c.*, u1.name as client_name, u2.name as lawyer_name 
            FROM cases c LEFT JOIN users u1 ON c.client_id=u1.id LEFT JOIN users u2 ON c.lawyer_id=u2.id`;
        let params = [];
        if (req.userRole === 'client') { query += ' WHERE c.client_id=?'; params.push(req.userId); }
        else if (req.userRole === 'lawyer') { query += ' WHERE c.lawyer_id=?'; params.push(req.userId); }
        query += ' ORDER BY c.updated_at DESC';
        const [cases] = await db.query(query, params);
        res.json(cases);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [cases] = await db.query(`SELECT c.*, u1.name as client_name, u2.name as lawyer_name 
            FROM cases c LEFT JOIN users u1 ON c.client_id=u1.id LEFT JOIN users u2 ON c.lawyer_id=u2.id WHERE c.id=?`, [req.params.id]);
        if (cases.length === 0) return res.status(404).json({ message: 'Case not found' });
        res.json(cases[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/timeline', verifyToken, async (req, res) => {
    try {
        const [events] = await db.query(`SELECT ct.*, u.name as created_by_name FROM case_timeline ct 
            LEFT JOIN users u ON ct.created_by=u.id WHERE ct.case_id=? ORDER BY ct.event_date ASC`, [req.params.id]);
        res.json(events);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, type, description, lawyer_id, client_id, court_name, priority } = req.body;
        const cid = req.userRole === 'client' ? req.userId : (client_id || null);
        const lid = req.userRole === 'lawyer' ? req.userId : (lawyer_id || null);
        const caseNum = `LO/${type ? type.substring(0, 3).toUpperCase() : 'GEN'}/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
        const [result] = await db.query(
            `INSERT INTO cases (case_number,title,description,type,status,priority,client_id,lawyer_id,court_name,filing_date) 
             VALUES (?,?,?,?,?,?,?,?,?,CURDATE())`,
            [caseNum, title, description, type || 'Civil', 'Filed', priority || 'Medium', cid, lid, court_name]);
        await db.query('INSERT INTO case_timeline (case_id,event_title,event_description,event_date,event_type,created_by) VALUES (?,?,?,CURDATE(),?,?)',
            [result.insertId, 'Case Filed', `Case ${title} filed`, 'Filing', req.userId]);
        res.status(201).json({ id: result.insertId, case_number: caseNum, message: 'Case filed successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE cases SET status=? WHERE id=?', [status, req.params.id]);
        await db.query('INSERT INTO case_timeline (case_id,event_title,event_date,event_type,created_by) VALUES (?,?,CURDATE(),?,?)',
            [req.params.id, `Status changed to ${status}`, 'Other', req.userId]);
        res.json({ message: 'Status updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Research - keyword based precedent search (simulated)
router.get('/:id/research', verifyToken, async (req, res) => {
    try {
        const [caseData] = await db.query('SELECT * FROM cases WHERE id=?', [req.params.id]);
        if (caseData.length === 0) return res.status(404).json({ message: 'Case not found' });
        const c = caseData[0];
        const precedents = [];
        const t = (c.type || '').toLowerCase();
        if (t.includes('criminal')) {
            precedents.push(
                { title: 'State of Rajasthan v. Balchand', citation: 'AIR 1977 SC 2447', relevance: 95, summary: 'Bail is the rule, jail is the exception.' },
                { title: 'Arnesh Kumar v. State of Bihar', citation: '(2014) 8 SCC 273', relevance: 88, summary: 'Guidelines for arrest under Section 498A IPC.' },
                { title: 'Maneka Gandhi v. Union of India', citation: 'AIR 1978 SC 597', relevance: 82, summary: 'Right to life includes right to live with dignity.' }
            );
        } else if (t.includes('family')) {
            precedents.push(
                { title: 'Shilpa Sailesh v. Varun Sreenivasan', citation: '(2023) SCC Online SC 544', relevance: 92, summary: 'Supreme Court can directly grant divorce under Article 142.' },
                { title: 'Rajnesh v. Neha', citation: '(2020) SCC Online SC 903', relevance: 87, summary: 'Guidelines for maintenance payments.' }
            );
        } else if (t.includes('corporate')) {
            precedents.push(
                { title: 'Vodafone International v. Union of India', citation: '(2012) 6 SCC 613', relevance: 90, summary: 'Landmark case on tax liability in cross-border M&A.' },
                { title: 'Tata Consultancy Services v. Cyrus Investments', citation: '(2021) SCC Online SC 272', relevance: 85, summary: 'Corporate governance and minority shareholder rights.' }
            );
        } else {
            precedents.push(
                { title: 'Vishaka v. State of Rajasthan', citation: 'AIR 1997 SC 3011', relevance: 80, summary: 'Guidelines for prevention of sexual harassment.' },
                { title: 'Kesavananda Bharati v. State of Kerala', citation: '(1973) 4 SCC 225', relevance: 75, summary: 'Basic structure doctrine of the Constitution.' }
            );
        }
        res.json({ caseTitle: c.title, caseType: c.type, precedents });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
