const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Document Verification
router.put('/verify-document/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE documents SET verification_status=?, verified_by=? WHERE id=?', [status, req.userId, req.params.id]);
        res.json({ message: `Document ${status.toLowerCase()}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/pending-documents', verifyToken, async (req, res) => {
    try {
        const [docs] = await db.query(`SELECT d.*, c.title as case_title, u.name as uploader 
            FROM documents d LEFT JOIN cases c ON d.case_id=c.id LEFT JOIN users u ON d.uploaded_by=u.id
            WHERE d.verification_status='Pending' ORDER BY d.upload_date DESC`);
        res.json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Courtroom Availability
router.get('/courtrooms', verifyToken, async (req, res) => {
    try {
        const [rooms] = await db.query(`SELECT cr.*, c.name as court_name, c.city 
            FROM courtrooms cr JOIN courts c ON cr.court_id=c.id ORDER BY c.name, cr.room_number`);
        res.json(rooms);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/courtrooms/:id', verifyToken, async (req, res) => {
    try {
        const { is_available } = req.body;
        await db.query('UPDATE courtrooms SET is_available=? WHERE id=?', [is_available, req.params.id]);
        res.json({ message: 'Courtroom updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cause List
router.get('/cause-lists', verifyToken, async (req, res) => {
    try {
        const [lists] = await db.query(`SELECT cl.*, c.name as court_name, u.name as uploaded_by_name 
            FROM cause_lists cl JOIN courts c ON cl.court_id=c.id LEFT JOIN users u ON cl.uploaded_by=u.id ORDER BY cl.date DESC`);
        res.json(lists);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/cause-lists', verifyToken, async (req, res) => {
    try {
        const { court_id, date, total_cases } = req.body;
        const [result] = await db.query('INSERT INTO cause_lists (court_id,date,uploaded_by,total_cases) VALUES (?,?,?,?)',
            [court_id, date, req.userId, total_cases || 0]);
        res.status(201).json({ id: result.insertId, message: 'Cause list uploaded' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Stamp Duty Calculator
router.post('/stamp-duty', verifyToken, async (req, res) => {
    try {
        const { case_type, property_value, state } = req.body;
        let dutyRate = 0.05, regFee = 1000;
        if (case_type === 'Property') { dutyRate = state === 'Karnataka' ? 0.056 : state === 'Maharashtra' ? 0.06 : 0.05; regFee = 5000; }
        else if (case_type === 'Criminal') { dutyRate = 0; regFee = 500; }
        else if (case_type === 'Family') { dutyRate = 0; regFee = 750; }
        else if (case_type === 'Corporate') { dutyRate = 0.01; regFee = 10000; }
        const stampDuty = Math.round((property_value || 0) * dutyRate);
        const courtFee = regFee;
        const total = stampDuty + courtFee;
        res.json({ stampDuty, courtFee, total, dutyRate: (dutyRate * 100).toFixed(1) + '%' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Evidence
router.get('/evidence/:caseId', verifyToken, async (req, res) => {
    try {
        const [evidence] = await db.query(`SELECT e.*, u.name as uploader FROM evidence e 
            LEFT JOIN users u ON e.uploaded_by=u.id WHERE e.case_id=? ORDER BY e.upload_date DESC`, [req.params.caseId]);
        res.json(evidence);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/evidence', verifyToken, async (req, res) => {
    try {
        const { case_id, title, type, description } = req.body;
        const [result] = await db.query('INSERT INTO evidence (case_id,title,type,uploaded_by,description) VALUES (?,?,?,?,?)',
            [case_id, title, type || 'Document', req.userId, description]);
        res.status(201).json({ id: result.insertId, message: 'Evidence uploaded' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Physical Document Tracking
router.get('/physical-docs', verifyToken, async (req, res) => {
    try {
        const [docs] = await db.query(`SELECT pd.*, c.title as case_title, u.name as tracked_by_name 
            FROM physical_docs pd LEFT JOIN cases c ON pd.case_id=c.id LEFT JOIN users u ON pd.tracked_by=u.id ORDER BY pd.last_updated DESC`);
        res.json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/physical-docs/:id', verifyToken, async (req, res) => {
    try {
        const { current_location, location_detail } = req.body;
        await db.query('UPDATE physical_docs SET current_location=?, location_detail=?, tracked_by=? WHERE id=?',
            [current_location, location_detail, req.userId, req.params.id]);
        // Add to history
        await db.query('INSERT INTO physical_doc_history (doc_id,location,location_detail,action,notes,handled_by) VALUES (?,?,?,?,?,?)',
            [req.params.id, current_location, location_detail, 'Location Updated', `Moved to ${current_location}: ${location_detail}`, req.userId]);
        res.json({ message: 'Location updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single physical doc with history
router.get('/physical-docs/:id', verifyToken, async (req, res) => {
    try {
        const [docs] = await db.query(`SELECT pd.*, c.title as case_title, c.case_number, c.type as case_type, u.name as tracked_by_name 
            FROM physical_docs pd LEFT JOIN cases c ON pd.case_id=c.id LEFT JOIN users u ON pd.tracked_by=u.id WHERE pd.id=?`, [req.params.id]);
        if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });
        const [history] = await db.query(`SELECT h.*, u.name as handler_name 
            FROM physical_doc_history h LEFT JOIN users u ON h.handled_by=u.id WHERE h.doc_id=? ORDER BY h.created_at DESC`, [req.params.id]);
        res.json({ ...docs[0], history });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Filing Checklist
router.get('/filing-checklist/:caseId', verifyToken, async (req, res) => {
    try {
        const [caseData] = await db.query('SELECT * FROM cases WHERE id=?', [req.params.caseId]);
        if (caseData.length === 0) return res.status(404).json({ message: 'Case not found' });
        const type = caseData[0].type;
        const [docs] = await db.query('SELECT name, verification_status FROM documents WHERE case_id=?', [req.params.caseId]);
        let required = ['Vakalatnama', 'Court Fee Receipt', 'Index of Documents'];
        if (type === 'Criminal') required.push('FIR Copy', 'Charge Sheet', 'Bail Application');
        else if (type === 'Civil') required.push('Plaint', 'Written Statement', 'Affidavit');
        else if (type === 'Family') required.push('Marriage Certificate', 'Income Proof', 'Petition');
        else if (type === 'Corporate') required.push('Board Resolution', 'MOA/AOA', 'Financial Statements');
        else if (type === 'Property') required.push('Sale Deed', 'Property Tax Receipts', 'Survey Map');
        const checklist = required.map(r => {
            const found = docs.find(d => d.name.toLowerCase().includes(r.toLowerCase().split(' ')[0]));
            return { document: r, status: found ? found.verification_status : 'Missing' };
        });
        res.json({ caseType: type, checklist });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Bulk Hearing Scheduler
router.post('/bulk-hearings', verifyToken, async (req, res) => {
    try {
        const { hearings } = req.body;
        let count = 0;
        for (const h of hearings) {
            await db.query('INSERT INTO hearings (case_id,title,date,time,venue,courtroom,judge,status) VALUES (?,?,?,?,?,?,?,?)',
                [h.case_id, h.title, h.date, h.time, h.venue, h.courtroom, h.judge, 'Scheduled']);
            count++;
        }
        res.status(201).json({ message: `${count} hearings scheduled`, count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Send Reminder to Lawyer
router.post('/remind-lawyer', verifyToken, async (req, res) => {
    try {
        const { lawyer_id, title, message } = req.body;
        await db.query("INSERT INTO notifications (user_id,title,message,type,link) VALUES (?,CONCAT('📋 Clerk Reminder: ',?),?,'warning','tasks')",
            [lawyer_id, title, message]);
        res.json({ message: 'Reminder sent' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
