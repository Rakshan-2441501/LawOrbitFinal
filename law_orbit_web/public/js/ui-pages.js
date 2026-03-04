// UI Pages - All Feature Views (Part 1: Cases, Hearings, Documents, Users, Admin features)
Object.assign(UI, {

    // ===== CASES =====
    async renderCasesView() {
        const cases = await ApiService.getCases();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Manage all legal cases across your organization. Track case status, type, priority, assigned lawyer and client. Click the eye icon to view full case details, timeline to see case history, or the robot icon for AI-powered legal research.</p></div>
            <div class="flex justify-between items-center mb-lg"><span></span><button class="btn btn-primary btn-sm" onclick="UI._showAddCaseModal()"><i class="ph ph-plus"></i> New Case</button></div>
            <div class="table-wrap"><table><thead><tr><th>Case #</th><th>Title</th><th>Type</th><th>Status</th><th>Priority</th><th>Client</th><th>Lawyer</th><th>Actions</th></tr></thead>
            <tbody>${cases.map(c => `<tr>
                <td class="text-xs text-muted">${c.case_number || '#' + c.id}</td>
                <td><span class="font-semibold text-sm">${c.title}</span></td>
                <td>${UI._badge(c.type)}</td><td>${UI._badge(c.status)}</td><td>${UI._badge(c.priority)}</td>
                <td class="text-sm">${c.client_name || '-'}</td><td class="text-sm">${c.lawyer_name || '-'}</td>
                <td><div class="flex gap-xs">
                    <button class="btn btn-sm btn-secondary" onclick="App.navigate('case-detail',${c.id})"><i class="ph ph-eye"></i> View</button>
                    <button class="btn btn-sm btn-secondary" onclick="App.navigate('timeline',${c.id})"><i class="ph ph-clock-countdown"></i> Timeline</button>
                    ${AuthService.getCurrentUser().role === 'lawyer' ? `<button class="btn btn-sm btn-secondary" onclick="App.navigate('research',${c.id})" title="AI Research"><i class="ph ph-robot"></i> Research</button>` : ''}
                </div></td>
            </tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerText = t('cases') + ' (' + cases.length + ')';
    },

    async renderCaseDetail(id) {
        const [c, timeline, docs] = await Promise.all([ApiService.getCase(id), ApiService.getCaseTimeline(id), ApiService.getDocuments()]);
        if (!c) return;
        const caseDocs = docs.filter(d => d.case_id === id);
        const stages = ['Filed', 'Hearing', 'Evidence', 'Arguments', 'Reserved', 'Judgment'];
        const idx = stages.indexOf(c.status);
        const pct = Math.round(((idx + 1) / stages.length) * 100);
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <button class="btn btn-sm btn-secondary mb-md" onclick="App.navigate('cases')"><i class="ph ph-arrow-left"></i> Back</button>
            <div class="card mb-md" style="border-color:var(--accent)">
                <div class="flex justify-between items-center mb-md"><h3 class="text-lg">${c.title}</h3>${UI._badge(c.status)}</div>
                <div class="progress-bar mb-sm"><div class="progress-fill progress-gradient" style="width:${pct}%"></div></div>
                <div class="flex justify-between text-xs text-muted mb-md">${stages.map((s, i) => `<span style="${i <= idx ? 'color:var(--accent);font-weight:600' : ''}">${s}</span>`).join('')}</div>
                <div class="grid grid-3 text-sm">
                    <div><span class="text-muted">Case #:</span> ${c.case_number || c.id}</div>
                    <div><span class="text-muted">Type:</span> ${c.type}</div>
                    <div><span class="text-muted">Priority:</span> ${c.priority}</div>
                    <div><span class="text-muted">Client:</span> ${c.client_name || '-'}</div>
                    <div><span class="text-muted">Lawyer:</span> ${c.lawyer_name || '-'}</div>
                    <div><span class="text-muted">Court:</span> ${c.court_name || '-'}</div>
                    <div><span class="text-muted">Filed:</span> ${c.filing_date ? new Date(c.filing_date).toLocaleDateString('en-IN') : '-'}</div>
                    <div><span class="text-muted">Fees:</span> ₹${(c.total_fees || 0).toLocaleString('en-IN')}</div>
                    <div><span class="text-muted">Paid:</span> ₹${(c.paid_amount || 0).toLocaleString('en-IN')}</div>
                </div>
                ${c.description ? `<div class="divider"></div><p class="text-sm text-muted">${c.description}</p>` : ''}
            </div>
            <div class="grid grid-2">
                <div class="card"><div class="card-title mb-md">Timeline (${timeline.length})</div>
                    <div class="timeline">${timeline.map(e => `<div class="timeline-item"><div class="timeline-dot ${e.event_type === 'Judgment' ? 'completed' : ''}"></div><div class="text-sm font-semibold">${e.event_title}</div><div class="text-xs text-muted">${new Date(e.event_date).toLocaleDateString('en-IN')} • ${e.event_type}</div>${e.event_description ? `<div class="text-xs text-muted mt-xs">${e.event_description}</div>` : ''}</div>`).join('')}
                    ${timeline.length === 0 ? '<p class="text-muted text-sm">No timeline events</p>' : ''}</div>
                </div>
                <div class="card"><div class="card-title mb-md">Documents (${caseDocs.length})</div>
                    ${caseDocs.map(d => `<div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border)"><div class="flex items-center gap-sm"><i class="ph ph-file-pdf" style="color:var(--danger)"></i><span class="text-sm">${d.name}</span></div><div class="flex items-center gap-xs">${UI._badge(d.verification_status)}<span class="text-xs text-muted">${d.size || ''}</span></div></div>`).join('')}
                    ${caseDocs.length === 0 ? '<p class="text-muted text-sm">No documents</p>' : ''}
                </div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerText = c.title;
    },

    _showAddCaseModal() {
        UI._modal('File New Case', `
            <form onsubmit="UI._submitCase(event)">
                <div class="form-group"><label class="label">Title</label><input class="input" name="title" required placeholder="e.g. Sharma vs State"></div>
                <div class="grid grid-2"><div class="form-group"><label class="label">Type</label><select class="input" name="type"><option>Criminal</option><option>Civil</option><option>Family</option><option>Corporate</option><option>Property</option><option>Labour</option><option>Consumer</option><option>Tax</option><option>Constitutional</option></select></div>
                <div class="form-group"><label class="label">Priority</label><select class="input" name="priority"><option>Medium</option><option>Low</option><option>High</option><option>Urgent</option></select></div></div>
                <div class="form-group"><label class="label">Court</label><input class="input" name="court_name" placeholder="e.g. Karnataka High Court"></div>
                <div class="form-group"><label class="label">Description</label><textarea class="input" name="description" rows="3"></textarea></div>
                <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">File Case</button></div>
            </form>`);
    },
    async _submitCase(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        await ApiService.createCase(Object.fromEntries(fd));
        document.querySelector('.modal-overlay').remove();
        showToast('Case filed successfully!');
        App.navigate('cases');
    },

    // ===== HEARINGS =====
    async renderHearingsView() {
        const hearings = await ApiService.getHearings();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="flex justify-between items-center mb-lg">
                <span class="text-muted text-sm">${hearings.length} hearings</span>
                <div class="flex gap-sm">
                    <a href="/api/hearings/calendar-export" class="btn btn-sm btn-secondary" target="_blank"><i class="ph ph-calendar"></i> Export Calendar</a>
                    <button class="btn btn-primary btn-sm" onclick="UI._showAddHearingModal()"><i class="ph ph-plus"></i> Schedule</button>
                </div>
            </div>
            <div class="grid grid-auto">${hearings.map(h => `
                <div class="card"><div class="flex justify-between items-center mb-sm"><span class="text-xs text-muted">${new Date(h.date).toLocaleDateString('en-IN')}</span>${UI._badge(h.status)}</div>
                <h4 class="text-sm font-semibold mb-xs">${h.title}</h4>
                <p class="text-xs text-muted mb-xs"><i class="ph ph-briefcase"></i> ${h.case_title || 'Case #' + h.case_id}</p>
                <p class="text-xs text-muted mb-xs"><i class="ph ph-clock"></i> ${h.time || 'TBD'}</p>
                <p class="text-xs text-muted"><i class="ph ph-map-pin"></i> ${h.venue || 'TBD'}</p>
                ${h.notes ? `<div class="divider"></div><p class="text-xs text-muted">${h.notes}</p>` : ''}
                </div>`).join('')}
            </div>
        </div>`;
        document.getElementById('pageTitle').innerText = t('hearings');
    },

    _showAddHearingModal() {
        UI._modal('Schedule Hearing', `
            <form onsubmit="UI._submitHearing(event)">
                <div class="form-group"><label class="label">Title</label><input class="input" name="title" required></div>
                <div class="form-group"><label class="label">Case ID</label><input class="input" name="case_id" type="number" required></div>
                <div class="grid grid-2"><div class="form-group"><label class="label">Date</label><input class="input" name="date" type="date" required></div>
                <div class="form-group"><label class="label">Time</label><input class="input" name="time" type="time" required></div></div>
                <div class="form-group"><label class="label">Venue</label><input class="input" name="venue" placeholder="e.g. Karnataka High Court, Room 1"></div>
                <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">Schedule</button></div>
            </form>`);
    },
    async _submitHearing(e) { e.preventDefault(); const fd = new FormData(e.target); await ApiService.createHearing(Object.fromEntries(fd)); document.querySelector('.modal-overlay').remove(); showToast('Hearing scheduled!'); App.navigate('hearings'); },

    // ===== DOCUMENTS =====
    async renderDocumentsView() {
        const docs = await ApiService.getDocuments();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="table-wrap"><table><thead><tr><th>Name</th><th>Case</th><th>Type</th><th>Size</th><th>Status</th><th>Signed</th><th>Date</th></tr></thead>
            <tbody>${docs.map(d => `<tr>
                <td class="flex items-center gap-sm"><i class="ph ph-file-${d.type === 'PDF' ? 'pdf' : 'doc'}" style="color:${d.type === 'PDF' ? 'var(--danger)' : 'var(--info)'}"></i><span class="text-sm">${d.name}</span></td>
                <td class="text-xs text-muted">${d.caseTitle || '#' + d.case_id}</td>
                <td>${UI._badge(d.type)}</td><td class="text-xs text-muted">${d.size || '-'}</td>
                <td>${UI._badge(d.verification_status)}</td>
                <td>${d.is_signed ? '<span class="badge badge-success"><i class="ph ph-seal-check"></i> Signed</span>' : '<span class="badge badge-neutral">Not Signed</span>'}</td>
                <td class="text-xs text-muted">${d.upload_date ? new Date(d.upload_date).toLocaleDateString('en-IN') : '-'}</td>
            </tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerText = t('documents') + ' (' + docs.length + ')';
    },

    // ===== USERS (Admin) =====
    async renderUsersView() {
        const users = await ApiService.getUsers();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="flex justify-between items-center mb-lg"><span class="text-muted text-sm">${users.length} users</span><button class="btn btn-primary btn-sm" onclick="UI._showAddUserModal()"><i class="ph ph-user-plus"></i> Add User</button></div>
            <div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>${users.map(u => `<tr>
                <td><div class="flex items-center gap-sm"><div class="avatar avatar-sm">${u.name.charAt(0)}</div><span class="text-sm">${u.name}</span></div></td>
                <td class="text-sm text-muted">${u.email}</td>
                <td>${UI._badge(u.role.charAt(0).toUpperCase() + u.role.slice(1))}</td>
                <td><div class="flex gap-xs"><button class="btn btn-sm btn-secondary" onclick="App.navigate('rbac')"><i class="ph ph-key"></i> Permissions</button><button class="btn btn-sm btn-danger" onclick="UI._deleteUser(${u.id},'${u.name}')"><i class="ph ph-trash"></i> Delete</button></div></td>
            </tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerText = 'User Management';
    },
    _showAddUserModal() {
        UI._modal('Create User & Send Credentials', `<form onsubmit="UI._submitUser(event)">
            <p class="text-sm text-muted mb-md"><i class="ph ph-info"></i> An email with login credentials will be sent to the user after creation.</p>
            <div class="form-group"><label class="label">Full Name</label><input class="input" name="name" required placeholder="e.g. Amit Patel"></div>
            <div class="form-group"><label class="label">Email Address</label><input class="input" name="email" type="email" required placeholder="user@example.com"></div>
            <div class="form-group"><label class="label">Password</label><input class="input" name="password" id="newUserPwd" value="" required placeholder="Set initial password">
                <button type="button" class="text-xs text-primary mt-xs" style="background:none;border:none;cursor:pointer" onclick="document.getElementById('newUserPwd').value='LO'+Math.random().toString(36).slice(-8);showToast('Password auto-generated')"><i class="ph ph-arrow-clockwise"></i> Auto-generate</button>
            </div>
            <div class="form-group"><label class="label">Role</label><select class="input" name="role"><option value="lawyer">Lawyer</option><option value="client">Client</option><option value="clerk">Clerk</option><option value="admin">Admin</option></select></div>
            <div class="form-group"><label class="label">Phone (optional)</label><input class="input" name="phone" placeholder="+91 98765 43210"></div>
            <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary"><i class="ph ph-paper-plane-tilt"></i> Create & Send Email</button></div></form>`);
    },
    async _submitUser(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        const btn = e.target.querySelector('button[type=submit]');
        btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Creating...';
        try {
            await ApiService.createUser(data);
            // Simulate email sent
            await ApiService.sendCredentialEmail(data);
            document.querySelector('.modal-overlay').remove();
            UI._modal('Credentials Sent', `<div class="text-center"><i class="ph ph-envelope-simple" style="font-size:3rem;color:var(--primary);margin-bottom:var(--spacing-md)"></i><h3 class="mb-md">User Created Successfully</h3><div class="card" style="text-align:left;background:var(--primary-50)"><p class="text-sm mb-xs"><strong>Name:</strong> ${data.name}</p><p class="text-sm mb-xs"><strong>Email:</strong> ${data.email}</p><p class="text-sm mb-xs"><strong>Password:</strong> ${data.password}</p><p class="text-sm"><strong>Role:</strong> ${data.role}</p></div><p class="text-xs text-muted mt-md"><i class="ph ph-check-circle" style="color:var(--primary)"></i> Login credentials have been emailed to ${data.email}</p><button class="btn btn-primary mt-md" onclick="this.closest('.modal-overlay').remove();App.navigate('users')">Done</button></div>`);
        } catch (err) { showToast('Error creating user', 'error'); btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Create & Send Email'; }
    },
    async _deleteUser(id, name) { if (confirm('Delete ' + name + '?')) { await ApiService.deleteUser(id); showToast('User deleted'); App.navigate('users'); } },

    // ===== ADMIN: Analytics =====
    async renderAnalyticsView() {
        const data = await ApiService.getAnalytics();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="grid grid-4 mb-lg">
                ${UI._stat('briefcase', 'Total Cases', data.totalCases || 0, '#2563eb', '#eff6ff')}
                ${UI._stat('check-circle', 'Closed', data.closedCases || 0, '#059669', '#ecfdf5')}
                ${UI._stat('percent', 'Success Rate', (data.successRate || 0) + '%', '#b45309', '#fffbeb')}
                ${UI._stat('clock', 'Avg Duration', (data.avgDurationDays || 0) + ' days', '#2563eb', '#eff6ff')}
            </div>
            <div class="grid grid-2 mb-lg">
                <div class="card"><div class="card-title mb-md">Lawyer Performance</div>
                    <div class="table-wrap"><table><thead><tr><th>Lawyer</th><th>Specialization</th><th>Cases</th><th>Won</th><th>Rate</th><th>Rating</th></tr></thead>
                    <tbody>${(data.lawyerPerformance || []).map(l => `<tr><td class="text-sm">${l.name}</td><td class="text-xs text-muted">${l.specialization}</td><td>${l.total_cases}</td><td>${l.won_cases}</td><td class="text-success">${l.success_rate}%</td><td><span class="text-gold">★ ${l.rating}</span></td></tr>`).join('')}</tbody></table></div>
                </div>
                <div class="card"><div class="card-title mb-md">Cases by Type</div><div class="chart-container"><canvas id="typeChart"></canvas></div></div>
            </div>
            <div class="card"><div class="card-title mb-md">Cases by Priority</div>
                <div class="flex gap-lg">${(data.casesByPriority || []).map(p => `<div class="flex items-center gap-sm">${UI._badge(p.priority)}<span class="font-bold">${p.count}</span></div>`).join('')}</div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-chart-bar" style="color:var(--primary)"></i> Analytics & Insights';
        setTimeout(() => {
            const types = data.casesByType || [];
            new Chart(document.getElementById('typeChart'), { type: 'doughnut', data: { labels: types.map(t => t.type), datasets: [{ data: types.map(t => t.count), backgroundColor: ['#7c3aed', '#059669', '#d97706', '#dc2626', '#2563eb', '#0891b2', '#db2777', '#ea580c'], borderWidth: 0, hoverOffset: 12, hoverBorderWidth: 3, hoverBorderColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '65%', animation: { duration: 1800, easing: 'easeOutBounce', animateRotate: true, animateScale: true }, plugins: { legend: { labels: { color: '#475569', padding: 14, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { backgroundColor: 'rgba(30,27,75,0.9)', padding: 12, cornerRadius: 8 } } } });
        }, 100);
    },

    // ===== ADMIN: Revenue =====
    async renderRevenueView() {
        const r = await ApiService.getRevenue();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="grid grid-4 mb-lg">
                ${UI._stat('currency-inr', 'Total Revenue', '₹' + UI._fmt(r.totalRevenue || 0), '#059669', '#ecfdf5')}
                ${UI._stat('hourglass', 'Pending', '₹' + UI._fmt(r.pendingInvoices || 0), '#d97706', '#fffbeb')}
                ${UI._stat('percent', 'Commission (10%)', '₹' + UI._fmt(r.commission || 0), '#b45309', '#fffbeb')}
                ${UI._stat('chart-line-up', 'Net', '₹' + UI._fmt((r.totalRevenue || 0) - (r.commission || 0)), '#2563eb', '#eff6ff')}
            </div>
            <div class="grid grid-2 mb-lg">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="ph ph-chart-line-up" style="color:var(--primary)"></i> Revenue Trend</span>
                        <span class="badge badge-success" style="font-size:0.8rem">▲ +18.5% YoY</span>
                    </div>
                    <div class="chart-container" style="height:260px"><canvas id="revenueTrendChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title"><i class="ph ph-chart-bar" style="color:var(--primary)"></i> Monthly Collections</span></div>
                    <div class="chart-container" style="height:260px"><canvas id="monthlyCollChart"></canvas></div>
                </div>
            </div>
            <div class="card mb-lg"><div class="card-title mb-md">Lawyer Earnings</div>
                <div class="table-wrap"><table><thead><tr><th>Lawyer</th><th>Earnings</th><th>Invoices</th></tr></thead>
                <tbody>${(r.lawyerEarnings || []).map(l => `<tr><td class="text-sm">${l.name}</td><td class="text-success font-semibold">₹${Number(l.earnings).toLocaleString('en-IN')}</td><td>${l.invoice_count}</td></tr>`).join('')}</tbody></table></div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-currency-inr" style="color:var(--primary)"></i> Revenue & Billing';

        setTimeout(() => {
            // Stock-like Revenue Trend
            new Chart(document.getElementById('revenueTrendChart'), {
                type: 'line',
                data: {
                    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                    datasets: [{
                        label: 'Revenue (₹L)',
                        data: [2.8, 3.2, 4.1, 3.8, 5.2, 4.9, 6.1, 5.8, 7.2, 6.8, 7.5, 8.2],
                        borderColor: '#059669',
                        backgroundColor: (ctx) => {
                            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                            g.addColorStop(0, 'rgba(5,150,105,0.25)');
                            g.addColorStop(1, 'rgba(5,150,105,0)');
                            return g;
                        },
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#059669',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 2000, easing: 'easeOutCubic' },
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, displayColors: false, callbacks: { label: (ctx) => `₹${ctx.raw}L` } } },
                    scales: { y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#9ca3af', callback: (v) => '₹' + v + 'L' } }, x: { grid: { display: false }, ticks: { color: '#9ca3af' } } },
                    interaction: { intersect: false, mode: 'index' }
                }
            });
            // Monthly Collections bar chart
            new Chart(document.getElementById('monthlyCollChart'), {
                type: 'bar',
                data: {
                    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                    datasets: [{
                        label: 'Collected',
                        data: [320000, 450000, 380000, 520000, 480000, 610000],
                        backgroundColor: 'rgba(124,58,237,0.8)',
                        borderRadius: 8,
                        borderSkipped: false,
                        hoverBackgroundColor: 'rgba(124,58,237,1)'
                    }, {
                        label: 'Pending',
                        data: [120000, 80000, 150000, 90000, 180000, 100000],
                        backgroundColor: 'rgba(217,119,6,0.5)',
                        borderRadius: 8,
                        borderSkipped: false,
                        hoverBackgroundColor: 'rgba(217,119,6,0.8)'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1800, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 150 },
                    plugins: { legend: { labels: { color: '#6b7280', padding: 14, usePointStyle: true, pointStyle: 'rectRounded' } }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, callbacks: { label: (ctx) => `${ctx.dataset.label}: ₹${(ctx.raw / 1000).toFixed(0)}K` } } },
                    scales: { y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#9ca3af', callback: (v) => '₹' + (v / 100000).toFixed(1) + 'L' } }, x: { grid: { display: false }, ticks: { color: '#9ca3af' } } }
                }
            });
        }, 150);
    },

    // ===== ADMIN: Audit Logs =====
    async renderAuditLogsView() {
        const logs = await ApiService.getAuditLogs();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade"><div class="table-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr></thead>
        <tbody>${logs.map(l => `<tr><td class="text-xs text-muted">${new Date(l.created_at).toLocaleString('en-IN')}</td><td class="text-sm">${l.user_name || '-'}</td><td>${UI._badge(l.action)}</td><td class="text-xs">${l.entity_type} #${l.entity_id || ''}</td><td class="text-xs text-muted">${l.details || '-'}</td><td class="text-xs text-muted">${l.ip_address || '-'}</td></tr>`).join('')}</tbody></table></div></div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-clipboard-text" style="color:var(--primary)"></i> Audit Logs';
    },

    // ===== ADMIN: Compliance =====
    async renderComplianceView() {
        const checks = await ApiService.getCompliance();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade"><div class="grid grid-auto">${checks.map(c => `
            <div class="card"><div class="flex justify-between items-center mb-sm"><span class="font-semibold text-sm">${c.check_type}</span>${UI._badge(c.status)}</div>
            <p class="text-xs text-muted mb-xs">${UI._badge(c.category)}</p>
            <p class="text-xs text-muted">${c.details || ''}</p>
            <div class="text-xs text-muted mt-sm">Next review: ${c.next_review ? new Date(c.next_review).toLocaleDateString('en-IN') : 'N/A'}</div></div>
        `).join('')}</div></div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-shield-check" style="color:var(--primary)"></i> Compliance Monitoring';
    },

    // ===== ADMIN: Backups =====
    async renderBackupsView() {
        const backups = await ApiService.getBackups();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="flex justify-between items-center mb-lg"><span></span><button class="btn btn-primary btn-sm" onclick="UI._createBackup()"><i class="ph ph-database"></i> Create Backup</button></div>
            <div class="table-wrap"><table><thead><tr><th>Name</th><th>Size</th><th>Type</th><th>Status</th><th>Created</th><th>By</th></tr></thead>
            <tbody>${backups.map(b => `<tr><td class="text-sm">${b.backup_name}</td><td class="text-xs">${b.size}</td><td>${UI._badge(b.type)}</td><td>${UI._badge(b.status)}</td><td class="text-xs text-muted">${new Date(b.created_at).toLocaleString('en-IN')}</td><td class="text-sm">${b.created_by_name || '-'}</td></tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-database" style="color:var(--primary)"></i> Backup & Recovery';
    },
    async _createBackup() { await ApiService.createBackup(); showToast('Backup created!'); App.navigate('backups'); },

    // ===== ADMIN: Fraud Alerts / Security Dashboard =====
    async renderFraudAlertsView() {
        const [alerts, lockedAccounts, secStats] = await Promise.all([
            ApiService.getFraudAlerts(),
            ApiService.getLockedAccounts(),
            ApiService.getSecurityStats()
        ]);
        const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
        const resolvedAlerts = alerts.filter(a => a.is_resolved);

        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <!-- Security Overview Stats -->
            <div class="grid grid-4 mb-lg">
                ${UI._stat('lock', 'Locked Accounts', secStats.lockedAccounts || lockedAccounts.length, '#dc2626', '#fef2f2')}
                ${UI._stat('shield-warning', 'Threat Level', (secStats.unresolvedAlerts || unresolvedAlerts.length) > 3 ? 'Critical' : (secStats.unresolvedAlerts || unresolvedAlerts.length) > 1 ? 'Medium' : 'Low', (secStats.unresolvedAlerts || unresolvedAlerts.length) > 3 ? '#dc2626' : (secStats.unresolvedAlerts || unresolvedAlerts.length) > 1 ? '#d97706' : '#059669', (secStats.unresolvedAlerts || unresolvedAlerts.length) > 3 ? '#fef2f2' : (secStats.unresolvedAlerts || unresolvedAlerts.length) > 1 ? '#fffbeb' : '#ecfdf5')}
                ${UI._stat('warning', 'Unresolved Alerts', secStats.unresolvedAlerts || unresolvedAlerts.length, '#d97706', '#fffbeb')}
                ${UI._stat('check-circle', 'Resolved', secStats.resolvedAlerts || resolvedAlerts.length, '#7c3aed', '#f5f3ff')}
            </div>

            <!-- Security Charts -->
            <div class="grid grid-2 mb-lg">
                <div class="card"><div class="card-header"><span class="card-title"><i class="ph ph-chart-line" style="color:var(--danger)"></i> Security Threat Trend</span></div><div class="chart-container"><canvas id="securityTrendChart"></canvas></div></div>
                <div class="card"><div class="card-header"><span class="card-title"><i class="ph ph-chart-pie" style="color:var(--primary)"></i> Alerts by Severity</span></div><div class="chart-container"><canvas id="severityChart"></canvas></div></div>
            </div>

            <!-- Stock-like Security Index Chart -->
            <div class="card mb-lg">
                <div class="card-header">
                    <span class="card-title"><i class="ph ph-chart-line-up" style="color:var(--primary)"></i> Security Health Index</span>
                    <div class="flex gap-xs">
                        <button class="btn btn-sm ${true ? 'btn-primary' : 'btn-secondary'}" onclick="UI._updateStockChart('1W')">1W</button>
                        <button class="btn btn-sm btn-secondary" onclick="UI._updateStockChart('1M')">1M</button>
                        <button class="btn btn-sm btn-secondary" onclick="UI._updateStockChart('3M')">3M</button>
                        <button class="btn btn-sm btn-secondary" onclick="UI._updateStockChart('1Y')">1Y</button>
                    </div>
                </div>
                <div class="flex items-center gap-lg mb-md">
                    <div><span class="stat-value" style="color:var(--primary)" id="stockValue">87.4</span><span class="text-sm text-muted"> / 100</span></div>
                    <div id="stockChange" class="badge badge-success" style="font-size:0.85rem;padding:4px 12px">▲ +2.3%</div>
                </div>
                <div class="chart-container" style="height:250px"><canvas id="stockChart"></canvas></div>
            </div>

            <!-- Tabs: Locked Accounts & Fraud Alerts -->
            <div class="card mb-lg" style="padding:0;overflow:hidden">
                <div class="flex" style="border-bottom:2px solid var(--border)">
                    <button id="tabLocked" class="security-tab active" onclick="UI._switchSecurityTab('locked')" style="flex:1;padding:14px;background:none;border:none;cursor:pointer;font-weight:600;font-size:0.85rem;color:var(--danger);border-bottom:2px solid var(--danger);margin-bottom:-2px;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--transition)">
                        <i class="ph ph-lock"></i> Locked Accounts (${lockedAccounts.length})
                    </button>
                    <button id="tabAlerts" class="security-tab" onclick="UI._switchSecurityTab('alerts')" style="flex:1;padding:14px;background:none;border:none;cursor:pointer;font-weight:600;font-size:0.85rem;color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-2px;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--transition)">
                        <i class="ph ph-shield-warning"></i> Fraud Alerts (${alerts.length})
                    </button>
                </div>
                
                <!-- Locked Accounts Tab -->
                <div id="panelLocked" style="padding:var(--spacing-lg)">
                    ${lockedAccounts.length === 0 ? `
                        <div style="text-align:center;padding:var(--spacing-2xl)">
                            <i class="ph ph-shield-check" style="font-size:3rem;color:var(--primary);opacity:0.5"></i>
                            <p class="text-muted mt-md">No locked accounts. All users can access the platform.</p>
                        </div>
                    ` : `
                        <div class="grid grid-auto">${lockedAccounts.map((u, i) => `
                            <div class="card animate-fade" style="border-color:var(--danger);border-left:4px solid var(--danger);animation-delay:${i * 0.1}s">
                                <div class="flex justify-between items-center mb-sm">
                                    <div class="flex items-center gap-md">
                                        <div class="avatar" style="background:var(--danger);color:white;position:relative">
                                            ${u.name.charAt(0)}
                                            <i class="ph ph-lock-simple" style="position:absolute;bottom:-2px;right:-2px;font-size:0.7rem;background:var(--danger);color:white;border-radius:50%;padding:2px"></i>
                                        </div>
                                        <div>
                                            <div class="font-semibold text-sm">${u.name}</div>
                                            <div class="text-xs text-muted">${u.email}</div>
                                        </div>
                                    </div>
                                    ${UI._badge(u.role.charAt(0).toUpperCase() + u.role.slice(1))}
                                </div>
                                <div class="flex justify-between items-center" style="padding-top:var(--spacing-sm);border-top:1px solid var(--border)">
                                    <div class="text-xs text-muted">
                                        <i class="ph ph-warning" style="color:var(--danger)"></i> 
                                        ${u.failed_login_attempts} failed attempts • 
                                        Locked ${u.locked_at ? new Date(u.locked_at).toLocaleString('en-IN') : 'recently'}
                                    </div>
                                    <button class="btn btn-sm btn-primary" onclick="UI._unlockAccount(${u.id}, '${u.name}')" style="background:linear-gradient(135deg,#059669,#047857)">
                                        <i class="ph ph-lock-simple-open"></i> Unlock
                                    </button>
                                </div>
                            </div>
                        `).join('')}</div>
                    `}
                </div>

                <!-- Fraud Alerts Tab -->
                <div id="panelAlerts" style="padding:var(--spacing-lg);display:none">
                    <div class="grid grid-auto">${alerts.map((a, i) => `
                        <div class="card animate-fade" style="border-color:${a.severity === 'Critical' ? 'var(--danger)' : a.severity === 'High' ? 'var(--warning)' : 'var(--glass-border)'};border-left:4px solid ${a.severity === 'Critical' ? 'var(--danger)' : a.severity === 'High' ? '#d97706' : a.severity === 'Medium' ? '#2563eb' : '#6b7280'};animation-delay:${i * 0.08}s">
                            <div class="flex justify-between items-center mb-sm">${UI._badge(a.alert_type)} ${UI._badge(a.severity)}</div>
                            <p class="text-sm mb-xs">${a.description || 'No details'}</p>
                            <div class="flex justify-between items-center text-xs text-muted">
                                <span><i class="ph ph-user"></i> ${a.user_name || 'Unknown'} • <i class="ph ph-map-pin"></i> ${a.ip_address || '-'} • ${a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : ''}</span>
                                ${a.is_resolved ? '<span class="badge badge-success"><i class="ph ph-check"></i> Resolved</span>' : `<button class="btn btn-sm btn-success" onclick="UI._resolveAlert(${a.id})"><i class="ph ph-check"></i> Resolve</button>`}
                            </div>
                        </div>
                    `).join('')}</div>
                </div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-shield-warning" style="color:var(--danger)"></i> Security Command Center';

        // Initialize security charts
        setTimeout(() => UI._initSecurityCharts(secStats, alerts), 150);
    },

    _switchSecurityTab(tab) {
        const tabLocked = document.getElementById('tabLocked');
        const tabAlerts = document.getElementById('tabAlerts');
        const panelLocked = document.getElementById('panelLocked');
        const panelAlerts = document.getElementById('panelAlerts');
        if (tab === 'locked') {
            tabLocked.style.color = 'var(--danger)'; tabLocked.style.borderBottom = '2px solid var(--danger)';
            tabAlerts.style.color = 'var(--text-muted)'; tabAlerts.style.borderBottom = '2px solid transparent';
            panelLocked.style.display = 'block'; panelAlerts.style.display = 'none';
        } else {
            tabAlerts.style.color = 'var(--primary)'; tabAlerts.style.borderBottom = '2px solid var(--primary)';
            tabLocked.style.color = 'var(--text-muted)'; tabLocked.style.borderBottom = '2px solid transparent';
            panelAlerts.style.display = 'block'; panelLocked.style.display = 'none';
        }
    },

    async _unlockAccount(id, name) {
        if (confirm(`Unlock account for ${name}? This will reset their failed login attempts and allow them to log in again.`)) {
            await ApiService.unlockAccount(id);
            showToast(`${name}'s account has been unlocked successfully!`);
            App.navigate('fraud-alerts');
        }
    },

    _initSecurityCharts(stats, alerts) {
        // Security Trend - stock-like line chart
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const trendData = [3, 5, 2, 7, 4, alerts.filter(a => !a.is_resolved).length || 3];
        new Chart(document.getElementById('securityTrendChart'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Security Incidents',
                    data: trendData,
                    borderColor: '#dc2626',
                    backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(220,38,38,0.25)');
                        gradient.addColorStop(1, 'rgba(220,38,38,0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#dc2626',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 2000, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 200 },
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#6b7280' } }, x: { grid: { display: false }, ticks: { color: '#6b7280' } } },
                interaction: { intersect: false, mode: 'index' }
            }
        });

        // Severity Distribution
        const sevCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        alerts.forEach(a => { if (sevCounts[a.severity] !== undefined) sevCounts[a.severity]++; });
        new Chart(document.getElementById('severityChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(sevCounts),
                datasets: [{
                    data: Object.values(sevCounts),
                    backgroundColor: ['#dc2626', '#d97706', '#2563eb', '#6b7280'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '68%',
                animation: { duration: 1800, easing: 'easeOutBounce', animateRotate: true, animateScale: true },
                plugins: { legend: { labels: { color: '#6b7280', padding: 12, usePointStyle: true, pointStyle: 'circle' } } }
            }
        });

        // Stock-like Security Index Chart
        UI._renderStockChart('1W');
    },

    _stockChartInstance: null,
    _renderStockChart(period) {
        const canvas = document.getElementById('stockChart');
        if (!canvas) return;
        if (UI._stockChartInstance) UI._stockChartInstance.destroy();

        let labels, data, baseValue;
        const now = new Date();

        if (period === '1W') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [82.1, 84.5, 83.2, 86.8, 85.1, 87.9, 87.4];
            baseValue = 82.1;
        } else if (period === '1M') {
            labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
            data = [78, 79.2, 80.5, 79.8, 81.3, 82.1, 83.5, 82.8, 84.2, 85.1, 84.5, 86.2, 85.8, 87.1, 86.5, 88.2, 87.4, 86.9, 88.5, 89.1, 88.3, 87.8, 88.9, 89.5, 88.8, 87.2, 88.1, 87.9, 88.5, 87.4];
            baseValue = 78;
        } else if (period === '3M') {
            labels = ['Jan W1', 'W2', 'W3', 'W4', 'Feb W1', 'W2', 'W3', 'W4', 'Mar W1', 'W2', 'W3', 'W4'];
            data = [72.5, 74.8, 73.2, 76.5, 78.1, 80.3, 79.5, 82.1, 84.5, 85.8, 86.2, 87.4];
            baseValue = 72.5;
        } else {
            labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            data = [65.2, 68.5, 70.1, 72.8, 71.5, 74.2, 76.8, 78.5, 80.2, 82.5, 85.1, 87.4];
            baseValue = 65.2;
        }

        const changePercent = ((data[data.length - 1] - baseValue) / baseValue * 100).toFixed(1);
        const isUp = changePercent >= 0;
        const changeEl = document.getElementById('stockChange');
        const valueEl = document.getElementById('stockValue');
        if (changeEl) {
            changeEl.className = `badge ${isUp ? 'badge-success' : 'badge-danger'}`;
            changeEl.style.fontSize = '0.85rem'; changeEl.style.padding = '4px 12px';
            changeEl.textContent = `${isUp ? '▲' : '▼'} ${isUp ? '+' : ''}${changePercent}%`;
        }
        if (valueEl) valueEl.textContent = data[data.length - 1];

        // Update button states
        document.querySelectorAll('.card-header .btn-sm').forEach(btn => {
            btn.className = 'btn btn-sm btn-secondary';
        });

        UI._stockChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Security Index',
                    data,
                    borderColor: isUp ? '#059669' : '#dc2626',
                    backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
                        if (isUp) {
                            gradient.addColorStop(0, 'rgba(5,150,105,0.2)');
                            gradient.addColorStop(1, 'rgba(5,150,105,0)');
                        } else {
                            gradient.addColorStop(0, 'rgba(220,38,38,0.2)');
                            gradient.addColorStop(1, 'rgba(220,38,38,0)');
                        }
                        return gradient;
                    },
                    fill: true,
                    tension: 0.35,
                    pointRadius: period === '1M' ? 0 : 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: isUp ? '#059669' : '#dc2626',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderWidth: 2.5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1500, easing: 'easeOutCubic' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 12 },
                        bodyFont: { size: 13, weight: 'bold' },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `Security Index: ${ctx.raw} / 100`
                        }
                    }
                },
                scales: {
                    y: { min: Math.min(...data) - 5, max: 100, grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 }, maxTicksLimit: 12 } }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    },

    _updateStockChart(period) {
        UI._renderStockChart(period);
    },

    async _resolveAlert(id) { await ApiService.resolveFraudAlert(id); showToast('Alert resolved'); App.navigate('fraud-alerts'); },

    // ===== ADMIN: Broadcast =====
    async renderBroadcastView() {
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="card" style="max-width:600px">
                <div class="card-title mb-md"><i class="ph ph-megaphone" style="color:var(--primary)"></i> System-wide Notification</div>
                <form onsubmit="UI._sendBroadcast(event)">
                    <div class="form-group"><label class="label">Title</label><input class="input" name="title" required placeholder="e.g. Court Holiday Notice"></div>
                    <div class="form-group"><label class="label">Message</label><textarea class="input" name="message" rows="3" required placeholder="All courts will be closed on..."></textarea></div>
                    <div class="form-group"><label class="label">Type</label><select class="input" name="type"><option value="broadcast">General</option><option value="warning">Warning</option><option value="danger">Urgent</option></select></div>
                    <button type="submit" class="btn btn-primary"><i class="ph ph-megaphone"></i> Send to All Users</button>
                </form>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-megaphone" style="color:var(--primary)"></i> Broadcast';
    },
    async _sendBroadcast(e) { e.preventDefault(); await ApiService.broadcastNotification(Object.fromEntries(new FormData(e.target))); showToast('Broadcast sent to all users!'); },

    // ===== ADMIN: RBAC =====
    async renderRBACView() {
        const [users, perms] = await Promise.all([ApiService.getUsers(), ApiService.getPermissions()]);
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="card mb-lg"><div class="card-title mb-md"><i class="ph ph-key" style="color:var(--primary)"></i> Role-Based Access Control</div>
                <div class="form-group"><label class="label">Select User</label>
                    <select class="input" id="rbacUser" onchange="UI._loadUserPerms(this.value)">
                        <option value="">-- Select --</option>
                        ${users.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
                    </select>
                </div>
                <div id="rbacPerms"></div>
            </div>
            <div class="card"><div class="card-title mb-md">All Permissions</div>
                <div class="table-wrap"><table><thead><tr><th>Permission</th><th>Description</th><th>Category</th></tr></thead>
                <tbody>${perms.map(p => `<tr><td class="text-sm font-semibold">${p.name}</td><td class="text-xs text-muted">${p.description || ''}</td><td>${UI._badge(p.category)}</td></tr>`).join('')}</tbody></table></div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-key" style="color:var(--primary)"></i> Access Control';
    },
    async _loadUserPerms(uid) {
        if (!uid) return;
        const perms = await ApiService.getUserPermissions(uid);
        document.getElementById('rbacPerms').innerHTML = `
            <form onsubmit="UI._savePerms(event,${uid})">
                <div class="grid grid-2 mb-md">${perms.map(p => `<label class="flex items-center gap-sm text-sm" style="cursor:pointer;padding:6px"><input type="checkbox" name="perm" value="${p.id}" ${p.assigned ? 'checked' : ''}> ${p.name}</label>`).join('')}</div>
                <button type="submit" class="btn btn-primary btn-sm"><i class="ph ph-floppy-disk"></i> Save Permissions</button>
            </form>`;
    },
    async _savePerms(e, uid) {
        e.preventDefault();
        const checked = [...e.target.querySelectorAll('input[name=perm]:checked')].map(i => parseInt(i.value));
        await ApiService.updateRBAC(uid, checked);
        showToast('Permissions updated!');
    },
});
