const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'laworbitofficial@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || ''
    }
});

// GET all users (admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUBLIC: GET lawyers list (any authenticated user)
router.get('/lawyers', verifyToken, async (req, res) => {
    try {
        const [lawyers] = await db.query(`
            SELECT u.id, u.name, u.email, u.phone, l.bar_council_id, l.specialization, 
                   l.experience, l.rating, l.won_cases AS cases_won, l.total_cases
            FROM users u LEFT JOIN lawyers l ON u.id = l.user_id 
            WHERE u.role = 'lawyer' ORDER BY l.rating DESC`);
        res.json(lawyers);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE user (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'password', 10);
        const [result] = await db.query('INSERT INTO users (name,email,password,role,phone) VALUES (?,?,?,?,?)',
            [name, email, hashedPassword, role, phone]);
        await db.query('INSERT INTO audit_logs (user_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)',
            [req.userId, 'CREATE_USER', 'User', result.insertId, `Created ${role}: ${name} (${email})`]);
        res.status(201).json({ id: result.insertId, message: 'User created' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Send credentials email
router.post('/send-credentials', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const mailOptions = {
            from: '"LawOrbit" <laworbitofficial@gmail.com>',
            to: email,
            subject: 'Welcome to LawOrbit — Your Login Credentials',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
                    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:30px;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">⚖ LawOrbit</h1>
                        <p style="color:rgba(255,255,255,0.8);margin:5px 0 0">Legal Case Management Platform</p>
                    </div>
                    <div style="padding:30px">
                        <h2 style="color:#1e1b4b;margin-top:0">Welcome, ${name}!</h2>
                        <p style="color:#4b5563">Your account has been created on LawOrbit. Use the credentials below to sign in:</p>
                        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:20px;margin:20px 0">
                            <p style="margin:5px 0"><strong>Email:</strong> ${email}</p>
                            <p style="margin:5px 0"><strong>Password:</strong> ${password}</p>
                            <p style="margin:5px 0"><strong>Role:</strong> ${role}</p>
                        </div>
                        <p style="color:#6b7280;font-size:14px">Please change your password after your first login for security.</p>
                        <a href="http://localhost:3000" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px">Sign In to LawOrbit</a>
                    </div>
                    <div style="background:#f9fafb;padding:15px 30px;text-align:center;border-top:1px solid #e5e7eb">
                        <p style="color:#9ca3af;font-size:12px;margin:0">This is an automated email from LawOrbit. Do not reply.</p>
                    </div>
                </div>`
        };
        await transporter.sendMail(mailOptions);
        await db.query('INSERT INTO audit_logs (user_id,action,entity_type,details) VALUES (?,?,?,?)',
            [req.userId, 'SEND_CREDENTIALS', 'Email', `Credentials email sent to ${email} for role: ${role}`]);
        res.json({ message: 'Credentials email sent successfully', to: email });
    } catch (err) {
        console.log('[EMAIL ERROR]', err.message);
        // Still return success but note that email may not have sent (app password might not be set)
        await db.query('INSERT INTO audit_logs (user_id,action,entity_type,details) VALUES (?,?,?,?)',
            [req.userId, 'SEND_CREDENTIALS', 'Email', `Email attempt to ${req.body.email} (${err.message})`]).catch(() => { });
        res.json({ message: 'User created. Email delivery attempted.', note: 'Configure GMAIL_APP_PASSWORD in .env for email delivery', to: req.body.email });
    }
});

// DELETE user
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
