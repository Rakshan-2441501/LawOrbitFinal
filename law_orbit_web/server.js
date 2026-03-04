const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth');
const caseRoutes = require('./routes/cases');
const hearingRoutes = require('./routes/hearings');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const taskRoutes = require('./routes/tasks');
const ratingRoutes = require('./routes/ratings');
const templateRoutes = require('./routes/templates');
const clerkRoutes = require('./routes/clerk');
const consultationRoutes = require('./routes/consultations');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/clerk', clerkRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/notifications', notificationRoutes);

// Database Check
const db = require('./config/db');
db.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL Database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err.message);
    });

app.listen(PORT, () => {
    console.log(`🚀 LawOrbit running on http://localhost:${PORT}`);
});
