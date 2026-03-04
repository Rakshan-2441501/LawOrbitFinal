const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        let stats = {};

        if (role === 'admin') {
            const [users] = await db.query('SELECT COUNT(*) as c FROM users');
            const [cases] = await db.query('SELECT COUNT(*) as c FROM cases');
            const [active] = await db.query("SELECT COUNT(*) as c FROM cases WHERE status NOT IN ('Closed','Dismissed')");
            const [hearings] = await db.query("SELECT COUNT(*) as c FROM hearings WHERE date >= CURDATE() AND status='Scheduled'");
            const [revenue] = await db.query("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE status='Success'");
            const [pending] = await db.query("SELECT COALESCE(SUM(total_amount),0) as t FROM invoices WHERE status IN ('Sent','Overdue')");
            const [lawyers] = await db.query("SELECT COUNT(*) as c FROM users WHERE role='lawyer'");
            const [clients] = await db.query("SELECT COUNT(*) as c FROM users WHERE role='client'");
            const [unreadAlerts] = await db.query("SELECT COUNT(*) as c FROM fraud_alerts WHERE is_resolved=0");
            stats = {
                totalUsers: users[0].c, totalCases: cases[0].c, activeCases: active[0].c,
                upcomingHearings: hearings[0].c, totalRevenue: revenue[0].t, pendingAmount: pending[0].t,
                totalLawyers: lawyers[0].c, totalClients: clients[0].c, fraudAlerts: unreadAlerts[0].c
            };
        } else if (role === 'lawyer') {
            const [myCases] = await db.query('SELECT COUNT(*) as c FROM cases WHERE lawyer_id=?', [userId]);
            const [active] = await db.query("SELECT COUNT(*) as c FROM cases WHERE lawyer_id=? AND status NOT IN ('Closed','Dismissed')", [userId]);
            const [won] = await db.query("SELECT COUNT(*) as c FROM cases WHERE lawyer_id=? AND status='Closed'", [userId]);
            const [hearings] = await db.query("SELECT COUNT(*) as c FROM hearings h JOIN cases c ON h.case_id=c.id WHERE c.lawyer_id=? AND h.date >= CURDATE() AND h.status='Scheduled'", [userId]);
            const [tasks] = await db.query("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status NOT IN ('Completed')", [userId]);
            const [earnings] = await db.query("SELECT COALESCE(SUM(p.amount),0) as t FROM payments p JOIN invoices i ON p.invoice_id=i.id WHERE i.lawyer_id=? AND p.status='Success'", [userId]);
            const [pendingInv] = await db.query("SELECT COALESCE(SUM(total_amount),0) as t FROM invoices WHERE lawyer_id=? AND status IN ('Sent','Overdue')", [userId]);
            const [unread] = await db.query("SELECT COUNT(*) as c FROM messages WHERE receiver_id=? AND is_read=0", [userId]);
            stats = {
                myCases: myCases[0].c, activeCases: active[0].c, closedCases: won[0].c,
                winRate: myCases[0].c > 0 ? (won[0].c / myCases[0].c * 100).toFixed(1) : 0,
                upcomingHearings: hearings[0].c, pendingTasks: tasks[0].c,
                totalEarnings: earnings[0].t, pendingPayments: pendingInv[0].t, unreadMessages: unread[0].c
            };
        } else if (role === 'client') {
            const [myCases] = await db.query('SELECT COUNT(*) as c FROM cases WHERE client_id=?', [userId]);
            const [active] = await db.query("SELECT COUNT(*) as c FROM cases WHERE client_id=? AND status NOT IN ('Closed','Dismissed')", [userId]);
            const [hearings] = await db.query("SELECT COUNT(*) as c FROM hearings h JOIN cases c ON h.case_id=c.id WHERE c.client_id=? AND h.date >= CURDATE()", [userId]);
            const [paid] = await db.query("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE client_id=? AND status='Success'", [userId]);
            const [pending] = await db.query("SELECT COALESCE(SUM(total_amount),0) as t FROM invoices WHERE client_id=? AND status IN ('Sent','Overdue')", [userId]);
            const [unread] = await db.query("SELECT COUNT(*) as c FROM messages WHERE receiver_id=? AND is_read=0", [userId]);
            stats = {
                totalCases: myCases[0].c, activeCases: active[0].c, upcomingHearings: hearings[0].c,
                totalPaid: paid[0].t, pendingPayments: pending[0].t, unreadMessages: unread[0].c
            };
        } else if (role === 'clerk') {
            const [pendingDocs] = await db.query("SELECT COUNT(*) as c FROM documents WHERE verification_status='Pending'");
            const [todayDocs] = await db.query("SELECT COUNT(*) as c FROM documents WHERE upload_date=CURDATE()");
            const [hearings] = await db.query("SELECT COUNT(*) as c FROM hearings WHERE date >= CURDATE() AND status='Scheduled'");
            const [totalCases] = await db.query('SELECT COUNT(*) as c FROM cases');
            const [causeLists] = await db.query("SELECT COUNT(*) as c FROM cause_lists WHERE date >= CURDATE()");
            const [physDocs] = await db.query("SELECT COUNT(*) as c FROM physical_docs WHERE current_location='InTransit'");
            stats = {
                pendingVerification: pendingDocs[0].c, docsToday: todayDocs[0].c,
                upcomingHearings: hearings[0].c, totalCases: totalCases[0].c,
                activeCauseLists: causeLists[0].c, docsInTransit: physDocs[0].c
            };
        }
        res.json(stats);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
