const API_URL = 'http://localhost:3000/api';
const ApiService = {
    getToken() { return localStorage.getItem('token'); },
    getHeaders() { return { 'Content-Type': 'application/json', 'Authorization': this.getToken() ? `Bearer ${this.getToken()}` : '' }; },

    async _get(url) { const r = await fetch(`${API_URL}${url}`, { headers: this.getHeaders() }); if (!r.ok) throw new Error('Request failed'); return r.json(); },
    async _post(url, body) { const r = await fetch(`${API_URL}${url}`, { method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body) }); return r.json(); },
    async _put(url, body) { const r = await fetch(`${API_URL}${url}`, { method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(body) }); return r.json(); },
    async _delete(url) { const r = await fetch(`${API_URL}${url}`, { method: 'DELETE', headers: this.getHeaders() }); return r.json(); },

    // Auth
    async login(email, password) {
        const r = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await r.json();
        if (data.auth) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); return data.user; }
        if (data.requireOtp) { const err = new Error(data.message || 'OTP required'); err.requireOtp = true; err.adminEmail = data.adminEmail; throw err; }
        throw new Error(data.message || 'Login failed');
    },
    async verifyOtp(email, otp) {
        const r = await fetch(`${API_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
        const data = await r.json();
        if (data.auth) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); return data.user; }
        throw new Error(data.message || 'OTP verification failed');
    },
    async resendOtp(email) {
        const r = await fetch(`${API_URL}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        return r.json();
    },
    logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); },
    currentUser() { return JSON.parse(localStorage.getItem('user')); },

    // Dashboard
    async getDashboardStats() { try { return await this._get('/dashboard/stats'); } catch (e) { return {}; } },

    // Cases
    async getCases() { try { return await this._get('/cases'); } catch (e) { return []; } },
    async getCase(id) { try { return await this._get(`/cases/${id}`); } catch (e) { return null; } },
    async getCaseTimeline(id) { try { return await this._get(`/cases/${id}/timeline`); } catch (e) { return []; } },
    async getCaseResearch(id) { try { return await this._get(`/cases/${id}/research`); } catch (e) { return { precedents: [] }; } },
    async createCase(data) { return this._post('/cases', data); },
    async updateCaseStatus(id, status) { return this._put(`/cases/${id}/status`, { status }); },

    // Hearings
    async getHearings() { try { return await this._get('/hearings'); } catch (e) { return []; } },
    async createHearing(data) { return this._post('/hearings', data); },

    // Documents
    async getDocuments() { try { return await this._get('/documents'); } catch (e) { return []; } },

    // Users
    async getUsers() { try { return await this._get('/users'); } catch (e) { return []; } },
    async createUser(data) { return this._post('/users', data); },
    async deleteUser(id) { return this._delete(`/users/${id}`); },
    async sendCredentialEmail(data) { return this._post('/users/send-credentials', data); },

    // Lawyers (public endpoint)
    async getLawyers() { try { return await this._get('/users/lawyers'); } catch (e) { return []; } },

    // Courts
    async getCourts() { try { return await this._get('/courts'); } catch (e) { return []; } },

    // Admin
    async getAnalytics() { try { return await this._get('/admin/analytics'); } catch (e) { return {}; } },
    async getRevenue() { try { return await this._get('/admin/revenue'); } catch (e) { return {}; } },
    async getAuditLogs() { try { return await this._get('/admin/audit-logs'); } catch (e) { return []; } },
    async broadcastNotification(data) { return this._post('/admin/broadcast', data); },
    async getFraudAlerts() { try { return await this._get('/admin/fraud-alerts'); } catch (e) { return []; } },
    async resolveFraudAlert(id) { return this._put(`/admin/fraud-alerts/${id}/resolve`, {}); },
    async getCompliance() { try { return await this._get('/admin/compliance'); } catch (e) { return []; } },
    async getBackups() { try { return await this._get('/admin/backups'); } catch (e) { return []; } },
    async createBackup() { return this._post('/admin/backup', {}); },
    async getPermissions() { try { return await this._get('/admin/permissions'); } catch (e) { return []; } },
    async getUserPermissions(uid) { try { return await this._get(`/admin/user-permissions/${uid}`); } catch (e) { return []; } },
    async updateRBAC(userId, permissionIds) { return this._post('/admin/rbac', { userId, permissionIds }); },
    async categorizeCase(caseId) { return this._post('/admin/categorize-case', { caseId }); },
    async getLockedAccounts() { try { return await this._get('/admin/locked-accounts'); } catch (e) { return []; } },
    async unlockAccount(id) { return this._put(`/admin/unlock-account/${id}`, {}); },
    async getSecurityStats() { try { return await this._get('/admin/security-stats'); } catch (e) { return {}; } },

    // Invoices
    async getInvoices() { try { return await this._get('/invoices'); } catch (e) { return []; } },
    async createInvoice(data) { return this._post('/invoices', data); },

    // Payments
    async getPayments() { try { return await this._get('/payments'); } catch (e) { return []; } },
    async makePayment(data) { return this._post('/payments', data); },

    // Messages
    async getMessages(caseId) { try { return await this._get(`/messages/${caseId}`); } catch (e) { return []; } },
    async sendMessage(data) { return this._post('/messages', data); },
    async getConversations() { try { return await this._get('/messages/conversations/list'); } catch (e) { return []; } },

    // Tasks
    async getTasks() { try { return await this._get('/tasks'); } catch (e) { return []; } },
    async createTask(data) { return this._post('/tasks', data); },
    async updateTaskStatus(id, status) { return this._put(`/tasks/${id}/status`, { status }); },
    async deleteTask(id) { return this._delete(`/tasks/${id}`); },

    // Ratings
    async getRatings(lawyerId) { try { return await this._get(`/ratings/${lawyerId}`); } catch (e) { return { ratings: [], average: 0, totalReviews: 0 }; } },
    async submitRating(data) { return this._post('/ratings', data); },

    // Templates
    async getTemplates() { try { return await this._get('/templates'); } catch (e) { return []; } },
    async getTemplate(id) { try { return await this._get(`/templates/${id}`); } catch (e) { return null; } },

    // Clerk
    async getPendingDocuments() { try { return await this._get('/clerk/pending-documents'); } catch (e) { return []; } },
    async verifyDocument(id, status) { return this._put(`/clerk/verify-document/${id}`, { status }); },
    async getCourtrooms() { try { return await this._get('/clerk/courtrooms'); } catch (e) { return []; } },
    async getCauseLists() { try { return await this._get('/clerk/cause-lists'); } catch (e) { return []; } },
    async createCauseList(data) { return this._post('/clerk/cause-lists', data); },
    async calculateStampDuty(data) { return this._post('/clerk/stamp-duty', data); },
    async getEvidence(caseId) { try { return await this._get(`/clerk/evidence/${caseId}`); } catch (e) { return []; } },
    async getPhysicalDocs() { try { return await this._get('/clerk/physical-docs'); } catch (e) { return []; } },
    async getPhysicalDocDetail(id) { try { return await this._get(`/clerk/physical-docs/${id}`); } catch (e) { return null; } },
    async updatePhysicalDoc(id, data) { return this._put(`/clerk/physical-docs/${id}`, data); },
    async getFilingChecklist(caseId) { try { return await this._get(`/clerk/filing-checklist/${caseId}`); } catch (e) { return { checklist: [] }; } },
    async bulkSchedule(hearings) { return this._post('/clerk/bulk-hearings', { hearings }); },

    // Consultations
    async getConsultations() { try { return await this._get('/consultations'); } catch (e) { return []; } },
    async bookConsultation(data) { return this._post('/consultations', data); },
    async updateConsultStatus(id, status) { return this._put(`/consultations/${id}/status`, { status }); },

    // Notifications
    async getNotifications() { try { return await this._get('/notifications'); } catch (e) { return []; } },
    async markNotifRead(id) { return this._put(`/notifications/${id}/read`, {}); },
    async markAllRead() { return this._put('/notifications/read-all', {}); },
    async getUnreadCount() { try { return await this._get('/notifications/unread-count'); } catch (e) { return { count: 0 }; } },
};

window.ApiService = ApiService;
