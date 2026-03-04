const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Analytics & Insights
router.get('/analytics', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [totalCases] = await db.query('SELECT COUNT(*) as count FROM cases');
        const [closedCases] = await db.query("SELECT COUNT(*) as count FROM cases WHERE status='Closed'");
        const [dismissedCases] = await db.query("SELECT COUNT(*) as count FROM cases WHERE status='Dismissed'");
        const [avgDuration] = await db.query("SELECT AVG(DATEDIFF(updated_at, created_at)) as avg_days FROM cases WHERE status IN ('Closed','Judgment')");
        const [casesByType] = await db.query('SELECT type, COUNT(*) as count FROM cases GROUP BY type ORDER BY count DESC');
        const [casesByStatus] = await db.query('SELECT status, COUNT(*) as count FROM cases GROUP BY status');
        const [lawyerPerformance] = await db.query(`
            SELECT u.name, l.specialization, l.total_cases, l.won_cases, l.rating,
                   ROUND(l.won_cases/GREATEST(l.total_cases,1)*100,1) as success_rate
            FROM lawyers l JOIN users u ON l.user_id = u.id ORDER BY l.rating DESC
        `);
        const [monthlyFilings] = await db.query(`
            SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as count 
            FROM cases WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month
        `);
        const [casesByPriority] = await db.query('SELECT priority, COUNT(*) as count FROM cases GROUP BY priority');
        res.json({
            totalCases: totalCases[0].count, closedCases: closedCases[0].count,
            dismissedCases: dismissedCases[0].count,
            avgDurationDays: Math.round(avgDuration[0].avg_days || 0),
            successRate: totalCases[0].count > 0 ? ((closedCases[0].count / totalCases[0].count) * 100).toFixed(1) : 0,
            casesByType, casesByStatus, lawyerPerformance, monthlyFilings, casesByPriority
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Revenue & Billing
router.get('/revenue', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [totalRevenue] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='Success'");
        const [pendingInvoices] = await db.query("SELECT COALESCE(SUM(total_amount),0) as total FROM invoices WHERE status IN ('Sent','Overdue')");
        const [monthlyRevenue] = await db.query(`
            SELECT DATE_FORMAT(paid_at,'%Y-%m') as month, SUM(amount) as total 
            FROM payments WHERE status='Success' AND paid_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month
        `);
        const [lawyerEarnings] = await db.query(`
            SELECT u.name, COALESCE(SUM(p.amount),0) as earnings, COUNT(DISTINCT i.id) as invoice_count
            FROM users u LEFT JOIN invoices i ON u.id = i.lawyer_id LEFT JOIN payments p ON i.id = p.invoice_id AND p.status='Success'
            WHERE u.role='lawyer' GROUP BY u.id, u.name ORDER BY earnings DESC
        `);
        const commission = totalRevenue[0].total * 0.10;
        res.json({ totalRevenue: totalRevenue[0].total, pendingInvoices: pendingInvoices[0].total, commission, monthlyRevenue, lawyerEarnings });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Audit Logs
router.get('/audit-logs', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [logs] = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
        res.json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Broadcast Notification
router.post('/broadcast', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { title, message, type } = req.body;
        await db.query('INSERT INTO notifications (user_id,title,message,type) VALUES (NULL,?,?,?)', [title, message, type || 'broadcast']);
        await db.query(`INSERT INTO audit_logs (user_id,user_name,action,entity_type,details) VALUES (?,?,'BROADCAST','Notification',?)`,
            [req.userId, 'Admin', `Broadcast: ${title}`]);
        res.json({ message: 'Broadcast sent successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fraud Alerts
router.get('/fraud-alerts', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [alerts] = await db.query('SELECT f.*, u.name as user_name FROM fraud_alerts f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC');
        res.json(alerts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/fraud-alerts/:id/resolve', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('UPDATE fraud_alerts SET is_resolved=1, resolved_by=? WHERE id=?', [req.userId, req.params.id]);
        res.json({ message: 'Alert resolved' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Compliance
router.get('/compliance', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [checks] = await db.query('SELECT * FROM compliance_checks ORDER BY checked_at DESC');
        res.json(checks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Backups
router.get('/backups', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [backups] = await db.query('SELECT b.*, u.name as created_by_name FROM backups b LEFT JOIN users u ON b.created_by = u.id ORDER BY b.created_at DESC');
        res.json(backups);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/backup', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const name = `backup_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_manual`;
        await db.query("INSERT INTO backups (backup_name,size,type,status,created_by) VALUES (?,'0 MB','Full','Completed',?)", [name, req.userId]);
        res.json({ message: 'Backup created successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// RBAC
router.get('/permissions', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [perms] = await db.query('SELECT * FROM permissions ORDER BY category, name');
        res.json(perms);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user-permissions/:userId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [perms] = await db.query(`
            SELECT p.*, up.id as assigned FROM permissions p 
            LEFT JOIN user_permissions up ON p.id = up.permission_id AND up.user_id = ?
            ORDER BY p.category, p.name`, [req.params.userId]);
        res.json(perms);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rbac', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { userId, permissionIds } = req.body;
        await db.query('DELETE FROM user_permissions WHERE user_id = ?', [userId]);
        if (permissionIds && permissionIds.length > 0) {
            const values = permissionIds.map(pid => `(${userId},${pid},${req.userId})`).join(',');
            await db.query(`INSERT INTO user_permissions (user_id,permission_id,granted_by) VALUES ${values}`);
        }
        res.json({ message: 'Permissions updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Case Categorization (simulated)
router.post('/categorize-case', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { caseId } = req.body;
        const [cases] = await db.query('SELECT * FROM cases WHERE id=?', [caseId]);
        if (cases.length === 0) return res.status(404).json({ message: 'Case not found' });
        const c = cases[0];
        const titleLower = (c.title + ' ' + (c.description || '')).toLowerCase();
        let category = 'General';
        if (titleLower.includes('murder') || titleLower.includes('theft') || titleLower.includes('fraud') || titleLower.includes('fir')) category = 'White Collar Crime';
        else if (titleLower.includes('divorce') || titleLower.includes('custody') || titleLower.includes('maintenance')) category = 'Family Dispute';
        else if (titleLower.includes('merger') || titleLower.includes('company') || titleLower.includes('corporate')) category = 'Corporate';
        else if (titleLower.includes('property') || titleLower.includes('land') || titleLower.includes('sale deed')) category = 'Property';
        else if (titleLower.includes('labour') || titleLower.includes('termination') || titleLower.includes('worker')) category = 'Labour & Employment';
        else if (titleLower.includes('consumer') || titleLower.includes('refund') || titleLower.includes('defective')) category = 'Consumer Protection';
        else if (titleLower.includes('pil') || titleLower.includes('constitutional') || titleLower.includes('fundamental')) category = 'Constitutional';
        else if (titleLower.includes('drug') || titleLower.includes('ndps') || titleLower.includes('narcotic')) category = 'Narcotics';
        await db.query('UPDATE cases SET category=? WHERE id=?', [category, caseId]);
        res.json({ caseId, category, message: 'Case categorized by AI' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Locked Accounts - Get all locked users
router.get('/locked-accounts', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [locked] = await db.query(`
            SELECT id, name, email, role, phone, failed_login_attempts, locked_at, created_at
            FROM users WHERE is_locked = 1 ORDER BY locked_at DESC
        `);
        res.json(locked);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Unlock Account - Admin resolves locked account
router.put('/unlock-account/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await db.query(
            'UPDATE users SET is_locked = 0, failed_login_attempts = 0, locked_at = NULL WHERE id = ?',
            [userId]
        );
        // Log the action
        await db.query(
            `INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details, ip_address) 
             VALUES (?, 'Admin', 'UNLOCK_ACCOUNT', 'User', ?, ?, ?)`,
            [req.userId, userId, `Admin unlocked user account #${userId}`, req.ip || '']
        );
        res.json({ message: 'Account unlocked successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Security Stats
router.get('/security-stats', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [lockedCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_locked = 1');
        const [totalAlerts] = await db.query('SELECT COUNT(*) as count FROM fraud_alerts');
        const [unresolvedAlerts] = await db.query('SELECT COUNT(*) as count FROM fraud_alerts WHERE is_resolved = 0');
        const [resolvedAlerts] = await db.query('SELECT COUNT(*) as count FROM fraud_alerts WHERE is_resolved = 1');
        const [recentLogins] = await db.query(`
            SELECT COUNT(*) as count FROM audit_logs 
            WHERE action = 'LOGIN' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);
        const [alertsByType] = await db.query(`
            SELECT alert_type, COUNT(*) as count FROM fraud_alerts GROUP BY alert_type
        `);
        const [alertsBySeverity] = await db.query(`
            SELECT severity, COUNT(*) as count FROM fraud_alerts GROUP BY severity
        `);
        const [monthlyAlerts] = await db.query(`
            SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as count 
            FROM fraud_alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
            GROUP BY month ORDER BY month
        `);
        res.json({
            lockedAccounts: lockedCount[0].count,
            totalAlerts: totalAlerts[0].count,
            unresolvedAlerts: unresolvedAlerts[0].count,
            resolvedAlerts: resolvedAlerts[0].count,
            recentLogins: recentLogins[0].count,
            alertsByType,
            alertsBySeverity,
            monthlyAlerts
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
