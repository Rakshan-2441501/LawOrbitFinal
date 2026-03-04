const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('../config/db');

const MAX_LOGIN_ATTEMPTS = 3;

// Gmail SMTP transporter for admin OTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'laworbitofficial@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || ''
    }
});

// In-memory OTP store (for simplicity; use DB/Redis in production)
const otpStore = {};

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // For NON-admin users: check if account is locked
        if (user.is_locked && user.role !== 'admin') {
            return res.status(423).json({
                message: 'Account is locked due to multiple failed login attempts. Please contact the administrator to unlock your account.',
                locked: true
            });
        }

        // For admin users: check if OTP verification is required
        if (user.role === 'admin' && user.is_locked) {
            return res.status(423).json({
                message: 'Admin account requires OTP verification. An OTP has been sent to the admin email.',
                requireOtp: true,
                adminEmail: 'laworbitofficial@gmail.com'
            });
        }

        // Try bcrypt comparison first (for hashed passwords)
        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            passwordMatch = (password === user.password);
        }

        // Also allow plain text match for existing seed data
        if (!passwordMatch) {
            passwordMatch = (password === user.password);
        }

        if (!passwordMatch) {
            const newAttempts = (user.failed_login_attempts || 0) + 1;
            const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;

            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                if (user.role === 'admin') {
                    // ADMIN: Don't lock — send OTP instead
                    const otp = generateOTP();
                    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
                    otpStore[user.id] = { otp, expiresAt, email: user.email };

                    // Mark admin as requiring OTP
                    await db.query(
                        'UPDATE users SET failed_login_attempts = ?, is_locked = 1, locked_at = NOW() WHERE id = ?',
                        [newAttempts, user.id]
                    );

                    // Send OTP email
                    try {
                        await transporter.sendMail({
                            from: '"LawOrbit Security" <laworbitofficial@gmail.com>',
                            to: 'laworbitofficial@gmail.com',
                            subject: '🔐 LawOrbit Admin Login OTP',
                            html: `
                                <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
                                    <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px;text-align:center">
                                        <h1 style="color:white;margin:0;font-size:22px">🔐 Security Alert</h1>
                                        <p style="color:rgba(255,255,255,0.8);margin:5px 0 0;font-size:14px">Admin Login Verification Required</p>
                                    </div>
                                    <div style="padding:30px;text-align:center">
                                        <p style="color:#4b5563;margin-bottom:5px">3 failed login attempts detected for</p>
                                        <p style="color:#1e1b4b;font-weight:700;font-size:16px;margin-top:0">${user.name} (${user.email})</p>
                                        <div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:12px;padding:24px;margin:20px 0">
                                            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:2px">Your OTP Code</p>
                                            <h2 style="margin:0;font-size:36px;letter-spacing:8px;color:#7c3aed;font-weight:800">${otp}</h2>
                                        </div>
                                        <p style="color:#ef4444;font-size:13px;font-weight:600">⏰ This OTP expires in 5 minutes</p>
                                        <p style="color:#9ca3af;font-size:12px;margin-top:20px">If you did not attempt to login, someone may be trying to access your admin account. Please change your password immediately.</p>
                                    </div>
                                    <div style="background:#f9fafb;padding:12px;text-align:center;border-top:1px solid #e5e7eb">
                                        <p style="color:#9ca3af;font-size:11px;margin:0">LawOrbit Security System • ${new Date().toLocaleString('en-IN')}</p>
                                    </div>
                                </div>`
                        });
                        console.log(`[OTP] Admin OTP sent: ${otp} for user ${user.email}`);
                    } catch (emailErr) {
                        console.log('[OTP EMAIL ERROR]', emailErr.message);
                        // Still allow OTP verification even if email fails (log OTP for development)
                        console.log(`[OTP FALLBACK] Use this OTP: ${otp}`);
                    }

                    return res.status(423).json({
                        message: 'Too many failed attempts. An OTP has been sent to the admin email for verification.',
                        requireOtp: true,
                        adminEmail: 'laworbitofficial@gmail.com',
                        attempts: newAttempts
                    });
                } else {
                    // NON-ADMIN: Lock the account as before
                    await db.query(
                        'UPDATE users SET failed_login_attempts = ?, is_locked = 1, locked_at = NOW() WHERE id = ?',
                        [newAttempts, user.id]
                    );
                    await db.query(
                        `INSERT INTO fraud_alerts (user_id, alert_type, severity, description, ip_address, is_resolved) 
                         VALUES (?, 'MultipleFailedLogins', 'Critical', ?, ?, 0)`,
                        [user.id, `Account locked after ${MAX_LOGIN_ATTEMPTS} failed login attempts for user ${user.name} (${user.email})`, req.ip || req.connection.remoteAddress]
                    );
                    return res.status(423).json({
                        message: 'Account has been locked after 3 failed attempts. Please contact the administrator.',
                        locked: true,
                        attempts: newAttempts
                    });
                }
            } else {
                await db.query(
                    'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
                    [newAttempts, user.id]
                );
                return res.status(401).json({
                    message: `Invalid password. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before ${user.role === 'admin' ? 'OTP verification is required' : 'account lockout'}.`,
                    attempts: newAttempts,
                    remaining: remainingAttempts
                });
            }
        }

        // Successful login - reset failed attempts
        await db.query(
            'UPDATE users SET failed_login_attempts = 0, is_locked = 0, locked_at = NULL WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: 86400 });

        res.status(200).json({
            auth: true,
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Admin OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'OTP verification is only for admin accounts' });
        }

        const storedOtp = otpStore[user.id];

        if (!storedOtp) {
            return res.status(400).json({ message: 'No OTP found. Please try logging in again.' });
        }

        if (Date.now() > storedOtp.expiresAt) {
            delete otpStore[user.id];
            return res.status(400).json({ message: 'OTP has expired. Please try logging in again to receive a new OTP.' });
        }

        if (storedOtp.otp !== otp) {
            return res.status(401).json({ message: 'Invalid OTP. Please check the email and try again.' });
        }

        // OTP verified successfully — unlock admin account and generate token
        delete otpStore[user.id];
        await db.query(
            'UPDATE users SET failed_login_attempts = 0, is_locked = 0, locked_at = NULL WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: 86400 });

        res.status(200).json({
            auth: true,
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            message: 'OTP verified successfully. Admin access granted.'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND role = "admin"', [email]);

        if (users.length === 0) return res.status(404).json({ message: 'Admin user not found' });

        const user = users[0];
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        otpStore[user.id] = { otp, expiresAt, email: user.email };

        try {
            await transporter.sendMail({
                from: '"LawOrbit Security" <laworbitofficial@gmail.com>',
                to: 'laworbitofficial@gmail.com',
                subject: '🔐 LawOrbit Admin Login OTP (Resent)',
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
                        <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:25px;text-align:center">
                            <h1 style="color:white;margin:0;font-size:20px">🔐 New OTP Code</h1>
                        </div>
                        <div style="padding:25px;text-align:center">
                            <div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:12px;padding:20px;margin:15px 0">
                                <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px">Your New OTP</p>
                                <h2 style="margin:0;font-size:32px;letter-spacing:8px;color:#7c3aed;font-weight:800">${otp}</h2>
                            </div>
                            <p style="color:#ef4444;font-size:12px;font-weight:600">⏰ Expires in 5 minutes</p>
                        </div>
                    </div>`
            });
            console.log(`[OTP RESEND] New OTP sent: ${otp}`);
        } catch (emailErr) {
            console.log('[OTP RESEND ERROR]', emailErr.message);
            console.log(`[OTP FALLBACK] Use this OTP: ${otp}`);
        }

        res.json({ message: 'New OTP sent to admin email', adminEmail: 'laworbitofficial@gmail.com' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
