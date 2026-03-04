// UI Core - Layout, Login, Dashboard, Navigation
const UI = {
    app: document.getElementById('app'),
    clear() { this.app.innerHTML = ''; },

    renderLogin() {
        this.clear();
        this.app.innerHTML = `
        <div class="login-split">
            <div class="login-image-panel">
                <img src="img/login-hero.png" alt="Supreme Court of India" />
                <div class="login-image-overlay"></div>
                <div class="login-image-content">
                    <div class="login-brand"><i class="ph ph-scales"></i> LawOrbit</div>
                    <h2>Justice Delivered,<br>Digitally.</h2>
                    <p>India's Premier Legal Case Management Platform</p>
                </div>
            </div>
            <div class="login-form-panel">
                <div class="login-form-box">
                    <h1>Welcome Back</h1>
                    <p class="login-subtitle">Sign in with your registered credentials</p>
                    <form id="loginForm">
                        <div class="form-group">
                            <label class="label">Email Address</label>
                            <input type="email" class="login-input" id="email" placeholder="you@laworbit.com" required>
                        </div>
                        <div class="form-group" style="position:relative">
                            <label class="label">Password</label>
                            <input type="password" class="login-input" id="password" placeholder="Enter your password" required>
                            <button type="button" class="pwd-toggle" onclick="const p=document.getElementById('password');p.type=p.type==='password'?'text':'password';this.innerHTML=p.type==='password'?'<i class=\\'ph ph-eye\\'></i>':'<i class=\\'ph ph-eye-slash\\'></i>'"><i class="ph ph-eye"></i></button>
                        </div>
                        <button type="submit" class="login-btn"><i class="ph ph-sign-in" style="margin-right:6px"></i> Sign In</button>
                    </form>
                    <div class="login-demo">
                        <strong>Demo Accounts</strong><br>
                        Admin: admin@laworbit.com<br>
                        Lawyer: rajesh@laworbit.com<br>
                        Client: priya@client.com<br>
                        Clerk: suresh@laworbit.com<br>
                        <strong>Password:</strong> password
                    </div>
                </div>
            </div>
        </div>`;
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type=submit]');
            const existingAlert = document.getElementById('loginAlert');
            if (existingAlert) existingAlert.remove();
            btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Signing in...';
            try {
                const r = await AuthService.login(document.getElementById('email').value, document.getElementById('password').value);
                if (r && r.success) App.init(); else {
                    const msg = r.message || 'Login failed';
                    if (msg.toLowerCase().includes('locked')) {
                        const alertDiv = document.createElement('div');
                        alertDiv.id = 'loginAlert';
                        alertDiv.innerHTML = `<div style="background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);border-radius:var(--radius-md);padding:16px;margin-bottom:16px;color:#fca5a5;display:flex;align-items:flex-start;gap:12px;animation:fadeIn 0.3s ease">
                            <i class="ph ph-shield-warning" style="font-size:1.5rem;color:#ef4444;flex-shrink:0;margin-top:2px"></i>
                            <div><strong style="color:#f87171;display:block;margin-bottom:4px">Account Locked</strong>
                            <span style="font-size:0.8rem;opacity:0.8">${msg}</span></div>
                        </div>`;
                        e.target.insertBefore(alertDiv, e.target.firstChild);
                    } else {
                        showToast(msg, 'error');
                        // Shake the form on failure
                        const formBox = document.querySelector('.login-form-box');
                        if (formBox) { formBox.style.animation = 'shake 0.5s ease'; setTimeout(() => formBox.style.animation = '', 500); }
                    }
                    btn.innerHTML = '<i class="ph ph-sign-in" style="margin-right:6px"></i> Sign In';
                }
            } catch (err) {
                const msg = err.message || 'Login failed';
                if (msg.toLowerCase().includes('locked')) {
                    const alertDiv = document.createElement('div');
                    alertDiv.id = 'loginAlert';
                    alertDiv.innerHTML = `<div style="background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);border-radius:var(--radius-md);padding:16px;margin-bottom:16px;color:#fca5a5;display:flex;align-items:flex-start;gap:12px;animation:fadeIn 0.3s ease">
                        <i class="ph ph-shield-warning" style="font-size:1.5rem;color:#ef4444;flex-shrink:0;margin-top:2px"></i>
                        <div><strong style="color:#f87171;display:block;margin-bottom:4px">Account Locked</strong>
                        <span style="font-size:0.8rem;opacity:0.8">${msg}</span></div>
                    </div>`;
                    e.target.insertBefore(alertDiv, e.target.firstChild);
                } else {
                    showToast(msg, 'error');
                    const formBox = document.querySelector('.login-form-box');
                    if (formBox) { formBox.style.animation = 'shake 0.5s ease'; setTimeout(() => formBox.style.animation = '', 500); }
                }
                btn.innerHTML = '<i class="ph ph-sign-in" style="margin-right:6px"></i> Sign In';
            }
        });
    },

    renderDashboard(user) {
        this.clear();
        const r = user.role;
        let navItems = [
            { icon: 'squares-four', label: 'Home', page: 'dashboard' },
            { icon: 'briefcase', label: 'Cases', page: 'cases' },
            { icon: 'gavel', label: 'Hearings', page: 'hearings' },
            { icon: 'files', label: 'Docs', page: 'documents' },
        ];
        if (r === 'admin') navItems.push({ icon: 'chart-bar', label: 'Analytics', page: 'analytics' }, { icon: 'currency-inr', label: 'Revenue', page: 'revenue' }, { icon: 'users', label: 'Users', page: 'users' }, { icon: 'shield-check', label: 'Security', page: 'fraud-alerts' });
        if (r === 'lawyer') navItems.push({ icon: 'list-checks', label: 'Tasks', page: 'tasks' }, { icon: 'chat-text', label: 'Chat', page: 'messages' }, { icon: 'receipt', label: 'Invoices', page: 'invoices' }, { icon: 'book-open', label: 'Library', page: 'templates' });
        if (r === 'client') navItems.push({ icon: 'chat-text', label: 'Chat', page: 'messages' }, { icon: 'credit-card', label: 'Pay', page: 'payments' }, { icon: 'video-camera', label: 'Consult', page: 'consultations' }, { icon: 'map-pin', label: 'Courts', page: 'court-map' });
        if (r === 'clerk') navItems.push({ icon: 'check-square', label: 'Verify', page: 'doc-verification' }, { icon: 'buildings', label: 'Rooms', page: 'courtrooms' }, { icon: 'calculator', label: 'Fees', page: 'stamp-duty' }, { icon: 'package', label: 'Track', page: 'physical-docs' });

        this.app.innerHTML = `
        <div class="bg-orbs"><div class="bg-orb"></div><div class="bg-orb"></div><div class="bg-orb"></div><div class="bg-orb"></div></div>
        <div class="app-layout">
            <nav class="top-nav">
                <div class="flex items-center gap-md">
                    <i class="ph ph-scales" style="font-size:1.5rem;color:var(--primary)"></i>
                    <span class="brand">LawOrbit</span>
                </div>
                <div class="flex items-center gap-lg">
                    ${r === 'client' ? `<button onclick="App.navigate('search-lawyers')" class="btn btn-sm btn-secondary hide-mobile"><i class="ph ph-magnifying-glass"></i> Find Lawyer</button>` : ''}
                    ${r === 'client' ? `<button onclick="UI.showEmergencyHelp()" class="btn btn-sm btn-danger"><i class="ph ph-siren"></i> <span class="hide-mobile">SOS</span></button>` : ''}
                    <button style="position:relative;cursor:pointer;background:none;border:1px solid var(--border);border-radius:var(--radius-full);padding:6px 14px;display:flex;align-items:center;gap:6px;font-family:inherit;font-size:0.8rem;color:var(--text-muted);transition:var(--transition)" onclick="App.navigate('notifications')" onmouseover="this.style.borderColor='var(--primary-200)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'">
                        <i class="ph ph-bell" style="font-size:1.1rem"></i> <span class="hide-mobile">Alerts</span>
                        <span id="notifBadge" class="hidden" style="position:absolute;top:-2px;right:-2px;width:9px;height:9px;background:var(--danger);border-radius:50%;border:2px solid white"></span>
                    </button>
                    <div class="flex items-center gap-sm" style="cursor:pointer" onclick="document.getElementById('userMenu').classList.toggle('hidden')">
                        <div class="avatar">${user.name.charAt(0)}</div>
                        <div class="hide-mobile">
                            <div class="text-sm font-semibold">${user.name}</div>
                            <div class="text-xs text-muted" style="text-transform:uppercase">${user.role}</div>
                        </div>
                    </div>
                    <div id="userMenu" class="hidden" style="position:absolute;top:60px;right:20px;background:var(--bg-white);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--spacing-md);min-width:200px;z-index:2000;box-shadow:var(--shadow-lg)">
                        <div class="flex items-center gap-md mb-md" style="padding-bottom:var(--spacing-md);border-bottom:1px solid var(--border)">
                            <div class="avatar">${user.name.charAt(0)}</div>
                            <div><div class="text-sm font-bold">${user.name}</div><div class="text-xs text-muted">${user.email}</div></div>
                        </div>
                        <div style="cursor:pointer;padding:8px;border-radius:var(--radius-sm);display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-body)" onmouseover="this.style.background='var(--primary-50)'" onmouseout="this.style.background='transparent'" onclick="currentLang=currentLang==='en'?'hi':'en';localStorage.setItem('lang',currentLang);App.init()"><i class="ph ph-translate"></i> ${currentLang === 'en' ? 'हिन्दी' : 'English'}</div>
                        <div style="cursor:pointer;padding:8px;border-radius:var(--radius-sm);display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--danger);margin-top:4px;border-top:1px solid var(--border);padding-top:12px" onmouseover="this.style.background='var(--danger-bg)'" onmouseout="this.style.background='transparent'" onclick="AuthService.logout()"><i class="ph ph-sign-out"></i> ${t('logout')}</div>
                    </div>
                </div>
            </nav>
            <main class="main-content"><h2 id="pageTitle" class="page-title">${t('dashboard')}</h2><div id="pageContent"></div></main>
            <nav class="bottom-nav">
                ${navItems.map(n => `<div class="bottom-nav-item" data-page="${n.page}" onclick="App.navigate('${n.page}');UI.setNav(this)"><i class="ph ph-${n.icon}"></i><span>${n.label}</span></div>`).join('')}
            </nav>
        </div>`;
        document.addEventListener('click', (e) => { const m = document.getElementById('userMenu'); if (m && !m.classList.contains('hidden') && !e.target.closest('.avatar') && !e.target.closest('#userMenu')) m.classList.add('hidden'); });
        ApiService.getUnreadCount().then(r => { if (r && r.count > 0) { const b = document.getElementById('notifBadge'); if (b) b.classList.remove('hidden'); } }).catch(() => { });
    },

    setNav(el) { document.querySelectorAll('.bottom-nav-item').forEach(e => e.classList.remove('active')); el.classList.add('active'); },

    showEmergencyHelp() {
        document.getElementById('pageContent').innerHTML = `
        <div class="card animate-fade" style="text-align:center;padding:var(--spacing-2xl);border:2px solid var(--danger)">
            <i class="ph ph-siren" style="font-size:4rem;color:var(--danger);margin-bottom:var(--spacing-md)"></i>
            <h2 style="color:var(--danger);margin-bottom:var(--spacing-md)">Emergency Legal Help</h2>
            <p class="text-muted mb-lg">Connect immediately with an available lawyer for urgent legal matters</p>
            <div class="grid grid-3 mb-lg" style="max-width:600px;margin:0 auto">
                <div class="card" style="cursor:pointer;border-color:var(--danger)" onclick="showToast('Connecting to Adv. Rajesh Kumar...','info')"><i class="ph ph-phone text-xl text-danger"></i><p class="text-sm mt-md font-semibold">Call Lawyer</p><p class="text-xs text-muted">+91 98765 43211</p></div>
                <div class="card" style="cursor:pointer;border-color:var(--primary)" onclick="showToast('Opening WhatsApp...','info')"><i class="ph ph-whatsapp-logo text-xl text-primary"></i><p class="text-sm mt-md font-semibold">WhatsApp</p><p class="text-xs text-muted">Instant Chat</p></div>
                <div class="card" style="cursor:pointer;border-color:var(--info)" onclick="showToast('Police helpline: 100','info')"><i class="ph ph-shield-star text-xl text-primary"></i><p class="text-sm mt-md font-semibold">Police: 100</p><p class="text-xs text-muted">Emergency</p></div>
            </div>
            <p class="text-xs text-muted">Available 24/7 | Women Helpline: 1091 | Legal Aid: 15100</p>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-siren" style="color:var(--danger)"></i> Emergency Help';
    },

    async renderDashboardHome(user) {
        const pc = document.getElementById('pageContent');
        pc.innerHTML = '<div class="flex justify-center p-lg"><i class="ph ph-circle-notch animate-spin text-2xl" style="color:var(--primary)"></i></div>';
        try {
            const [stats, cases, hearings] = await Promise.all([ApiService.getDashboardStats(), ApiService.getCases(), ApiService.getHearings()]);
            if (user.role === 'admin') this._adminDash(stats, cases);
            else if (user.role === 'lawyer') this._lawyerDash(stats, cases, hearings);
            else if (user.role === 'client') this._clientDash(stats, cases, hearings);
            else if (user.role === 'clerk') this._clerkDash(stats);
        } catch (err) { pc.innerHTML = '<div class="card text-center"><p class="text-muted">Error loading dashboard.</p></div>'; }
    },

    _adminDash(s, cases) {
        const pc = document.getElementById('pageContent');
        pc.innerHTML = `
        <div class="animate-fade">
            <div class="grid grid-4 mb-lg">
                ${this._stat('briefcase', 'Total Cases', s.totalCases || 0, '#7c3aed', '#f5f3ff')}
                ${this._stat('users', 'Total Users', s.totalUsers || 0, '#6d28d9', '#ede9fe')}
                ${this._stat('currency-inr', 'Revenue', '₹' + this._fmt(s.totalRevenue || 0), '#8b5cf6', '#f5f3ff')}
                ${this._stat('shield-warning', 'Fraud Alerts', s.fraudAlerts || 0, '#dc2626', '#fef2f2')}
            </div>
            <div class="grid grid-2 mb-lg">
                <div class="card"><div class="card-header"><span class="card-title">Case Filings (Monthly)</span></div><div class="chart-container"><canvas id="adminChart1"></canvas></div></div>
                <div class="card"><div class="card-header"><span class="card-title">Case Status Distribution</span></div><div class="chart-container"><canvas id="adminChart2"></canvas></div></div>
            </div>
            <div class="card"><div class="card-header"><span class="card-title"><i class="ph ph-lightning" style="color:var(--primary)"></i> Quick Actions</span></div>
                <div class="flex gap-sm flex-wrap">
                    <button class="btn btn-primary btn-sm" onclick="App.navigate('rbac')"><i class="ph ph-key"></i> RBAC</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('audit-logs')"><i class="ph ph-clipboard-text"></i> Audit Logs</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('compliance')"><i class="ph ph-shield-check"></i> Compliance</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('backups')"><i class="ph ph-database"></i> Backups</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('broadcast')"><i class="ph ph-megaphone"></i> Broadcast</button>
                    <button class="btn btn-gold btn-sm" onclick="UI._aiCategorize()"><i class="ph ph-robot"></i> AI Categorize</button>
                </div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-crown" style="color:var(--primary)"></i> Admin Dashboard';
        setTimeout(() => {
            const active = cases.filter(c => !['Closed', 'Dismissed'].includes(c.status)).length;
            const closed = cases.filter(c => c.status === 'Closed').length;
            const other = cases.length - active - closed;
            new Chart(document.getElementById('adminChart1'), { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Filed', data: [12, 19, 15, 25, 22, 30], backgroundColor: 'rgba(124,58,237,0.8)', borderRadius: 8, borderSkipped: false, hoverBackgroundColor: 'rgba(124,58,237,1)' }, { label: 'Closed', data: [8, 12, 10, 15, 18, 20], backgroundColor: 'rgba(139,92,246,0.45)', borderRadius: 8, borderSkipped: false, hoverBackgroundColor: 'rgba(139,92,246,0.75)' }] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 2000, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 150 + ctx.datasetIndex * 300 }, plugins: { legend: { labels: { color: '#6b7280', padding: 16, usePointStyle: true, pointStyle: 'rectRounded' } }, tooltip: { backgroundColor: 'rgba(30,27,75,0.9)', titleFont: { size: 13 }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 8 } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#6b7280', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } } } } });
            new Chart(document.getElementById('adminChart2'), { type: 'doughnut', data: { labels: ['Active', 'Closed', 'Other'], datasets: [{ data: [active, closed, other], backgroundColor: ['#7c3aed', '#a78bfa', '#ddd6fe'], borderWidth: 0, hoverOffset: 12, hoverBorderWidth: 3, hoverBorderColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', animation: { duration: 1800, easing: 'easeOutBounce', animateRotate: true, animateScale: true }, plugins: { legend: { labels: { color: '#6b7280', padding: 16, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { backgroundColor: 'rgba(30,27,75,0.9)', padding: 12, cornerRadius: 8 } } } });
        }, 100);
    },

    async _aiCategorize() { const cases = await ApiService.getCases(); for (const c of cases) { await ApiService.categorizeCase(c.id); } showToast('AI categorized ' + cases.length + ' cases'); },

    _lawyerDash(s, cases, hearings) {
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="grid grid-4 mb-lg">
                ${this._stat('briefcase', 'My Cases', s.myCases || 0, '#7c3aed', '#f5f3ff')}
                ${this._stat('trophy', 'Win Rate', (s.winRate || 0) + '%', '#6d28d9', '#ede9fe')}
                ${this._stat('currency-inr', 'Earnings', '₹' + this._fmt(s.totalEarnings || 0), '#b45309', '#fffbeb')}
                ${this._stat('list-checks', 'Pending Tasks', s.pendingTasks || 0, '#d97706', '#fffbeb')}
            </div>
            <div class="grid grid-2 mb-lg">
                ${this._stat('calendar', 'Upcoming Hearings', s.upcomingHearings || 0, '#7c3aed', '#f5f3ff')}
                ${this._stat('chat-text', 'Unread Messages', s.unreadMessages || 0, '#dc2626', '#fef2f2')}
                ${this._stat('currency-inr', 'Pending Payments', '₹' + this._fmt(s.pendingPayments || 0), '#d97706', '#fffbeb')}
                ${this._stat('check-circle', 'Closed Cases', s.closedCases || 0, '#8b5cf6', '#f5f3ff')}
            </div>
            <div class="card"><div class="card-header"><span class="card-title">Case Performance</span></div><div class="chart-container"><canvas id="lawyerChart"></canvas></div></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-scales" style="color:var(--primary)"></i> Lawyer Dashboard';
        setTimeout(() => { new Chart(document.getElementById('lawyerChart'), { type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Active Cases', data: [8, 10, 9, 12, 11, 14], borderColor: '#7c3aed', backgroundColor: (ctx) => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(124,58,237,0.2)'); g.addColorStop(1, 'rgba(124,58,237,0)'); return g; }, fill: true, tension: 0.45, borderWidth: 3, pointRadius: 5, pointHoverRadius: 8, pointBackgroundColor: '#7c3aed', pointBorderColor: '#fff', pointBorderWidth: 2 }, { label: 'Won', data: [3, 5, 4, 7, 6, 9], borderColor: '#a78bfa', backgroundColor: (ctx) => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(167,139,250,0.15)'); g.addColorStop(1, 'rgba(167,139,250,0)'); return g; }, fill: true, tension: 0.45, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 7, pointBackgroundColor: '#a78bfa', pointBorderColor: '#fff', pointBorderWidth: 2, borderDash: [5, 3] }] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 2000, easing: 'easeOutElastic', delay: (ctx) => ctx.dataIndex * 120 }, plugins: { legend: { labels: { color: '#6b7280', padding: 16, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { backgroundColor: 'rgba(30,27,75,0.9)', padding: 12, cornerRadius: 8, displayColors: true } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#6b7280', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } } }, interaction: { intersect: false, mode: 'index' } } }); }, 100);
    },

    _clientDash(s, cases, hearings) {
        const activeCase = cases.find(c => !['Closed', 'Dismissed'].includes(c.status));
        const stages = ['Filed', 'Hearing', 'Evidence', 'Arguments', 'Reserved', 'Judgment'];
        const currentIdx = activeCase ? stages.indexOf(activeCase.status) : 0;
        const pct = activeCase ? Math.round(((currentIdx + 1) / stages.length) * 100) : 0;
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            ${activeCase ? `<div class="card mb-lg" style="border-color:var(--primary-200)">
                <div class="card-header"><span class="card-title"><i class="ph ph-chart-line-up" style="color:var(--primary)"></i> Case Progress</span><span class="badge badge-info">${activeCase.status}</span></div>
                <h3 class="text-sm font-semibold mb-sm">${activeCase.title}</h3>
                <div class="progress-bar mb-sm"><div class="progress-fill progress-gradient" style="width:${pct}%"></div></div>
                <div class="flex justify-between text-xs text-muted">${stages.map((st, i) => `<span style="${i <= currentIdx ? 'color:var(--primary);font-weight:600' : ''}">${st}</span>`).join('')}</div>
            </div>` : ''}
            <div class="grid grid-4 mb-lg">
                ${this._stat('briefcase', 'My Cases', s.totalCases || 0, '#7c3aed', '#f5f3ff')}
                ${this._stat('calendar', 'Hearings', s.upcomingHearings || 0, '#6d28d9', '#ede9fe')}
                ${this._stat('currency-inr', 'Total Paid', '₹' + this._fmt(s.totalPaid || 0), '#8b5cf6', '#f5f3ff')}
                ${this._stat('currency-inr', 'Pending', '₹' + this._fmt(s.pendingPayments || 0), '#d97706', '#fffbeb')}
            </div>
            <div class="grid grid-2">
                <div class="card"><div class="card-title mb-md"><i class="ph ph-lightning" style="color:var(--primary)"></i> Quick Actions</div>
                    <div class="flex flex-col gap-sm">
                        <button class="btn btn-primary btn-sm" style="width:100%" onclick="App.navigate('search-lawyers')"><i class="ph ph-magnifying-glass"></i> Find a Lawyer</button>
                        <button class="btn btn-secondary btn-sm" style="width:100%" onclick="App.navigate('consultations')"><i class="ph ph-video-camera"></i> Book Consultation</button>
                        <button class="btn btn-secondary btn-sm" style="width:100%" onclick="App.navigate('court-map')"><i class="ph ph-map-pin"></i> Court Map</button>
                        <button class="btn btn-secondary btn-sm" style="width:100%" onclick="App.navigate('ratings')"><i class="ph ph-star"></i> Rate Lawyer</button>
                    </div>
                </div>
                <div class="card"><div class="card-title mb-md"><i class="ph ph-calendar" style="color:var(--primary)"></i> Next Hearing</div>
                    ${hearings.length > 0 ? `<div class="flex items-center gap-md"><div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)"><i class="ph ph-calendar"></i></div><div><div class="font-semibold text-sm">${hearings[0].title}</div><div class="text-xs text-muted">${new Date(hearings[0].date).toLocaleDateString('en-IN')} | ${hearings[0].venue || ''}</div></div></div>` : '<p class="text-muted text-sm">No upcoming hearings</p>'}
                </div>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-user" style="color:var(--primary)"></i> Welcome, ' + AuthService.getCurrentUser().name.split(' ')[0];
    },

    _clerkDash(s) {
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="grid grid-4 mb-lg">
                ${this._stat('file-search', 'Pending Verify', s.pendingVerification || 0, '#d97706', '#fffbeb')}
                ${this._stat('calendar', 'Hearings', s.upcomingHearings || 0, '#7c3aed', '#f5f3ff')}
                ${this._stat('files', 'Docs Today', s.docsToday || 0, '#6d28d9', '#ede9fe')}
                ${this._stat('truck', 'In Transit', s.docsInTransit || 0, '#dc2626', '#fef2f2')}
            </div>
            <div class="card mb-lg"><div class="card-title mb-md"><i class="ph ph-lightning" style="color:var(--primary)"></i> Clerk Actions</div>
                <div class="flex gap-sm flex-wrap">
                    <button class="btn btn-primary btn-sm" onclick="App.navigate('doc-verification')"><i class="ph ph-check-square"></i> Verify Documents</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('cause-lists')"><i class="ph ph-list-numbers"></i> Cause Lists</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('stamp-duty')"><i class="ph ph-calculator"></i> Stamp Duty Calc</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('physical-docs')"><i class="ph ph-package"></i> Track Documents</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('courtrooms')"><i class="ph ph-buildings"></i> Courtroom Status</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('filing-checklist')"><i class="ph ph-clipboard-text"></i> Filing Checklist</button>
                </div>
            </div>
            <div class="card"><div class="card-header"><span class="card-title">Weekly Activity</span></div><div class="chart-container"><canvas id="clerkChart"></canvas></div></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-folder-open" style="color:var(--primary)"></i> Clerk Workspace';
        setTimeout(() => { new Chart(document.getElementById('clerkChart'), { type: 'bar', data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], datasets: [{ label: 'Docs Verified', data: [18, 25, 20, 30, 22], backgroundColor: 'rgba(124,58,237,0.8)', borderRadius: 8, borderSkipped: false, hoverBackgroundColor: 'rgba(124,58,237,1)' }, { label: 'Hearings', data: [5, 8, 6, 10, 7], backgroundColor: 'rgba(139,92,246,0.45)', borderRadius: 8, borderSkipped: false, hoverBackgroundColor: 'rgba(139,92,246,0.75)' }] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1800, easing: 'easeInOutQuart', delay: (ctx) => ctx.dataIndex * 180 + ctx.datasetIndex * 250 }, plugins: { legend: { labels: { color: '#6b7280', padding: 16, usePointStyle: true, pointStyle: 'rectRounded' } }, tooltip: { backgroundColor: 'rgba(30,27,75,0.9)', padding: 12, cornerRadius: 8 } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#6b7280', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } } } } }); }, 100);
    },

    // Helpers
    _stat(icon, label, value, color, bg) {
        return `<div class="stat-card"><div class="flex items-center gap-md"><div class="stat-icon" style="background:${bg || '#f5f3ff'};color:${color}"><i class="ph ph-${icon}"></i></div><div><div class="stat-label">${label}</div><div class="stat-value" style="color:${color}">${value}</div></div></div></div>`;
    },
    _fmt(n) { n = Number(n); if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr'; if (n >= 100000) return (n / 100000).toFixed(1) + 'L'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return n.toString(); },
    _badge(status) {
        const m = { Active: 'info', Filed: 'info', Hearing: 'warning', Evidence: 'warning', Arguments: 'warning', Reserved: 'info', Judgment: 'success', Closed: 'success', Dismissed: 'neutral', Pending: 'warning', Completed: 'success', Scheduled: 'info', Adjourned: 'warning', Cancelled: 'danger', Verified: 'success', Rejected: 'danger', Paid: 'success', Sent: 'info', Overdue: 'danger', Draft: 'neutral', InProgress: 'warning', Urgent: 'danger', High: 'warning', Medium: 'info', Low: 'neutral', Compliant: 'success', NonCompliant: 'danger', Review: 'warning', Success: 'success', Failed: 'danger', Missing: 'danger', Confirmed: 'success', Requested: 'warning', Critical: 'danger', Criminal: 'danger', Civil: 'info', Family: 'warning', Corporate: 'info', Property: 'gold', Labour: 'warning', Consumer: 'info', Tax: 'neutral', Constitutional: 'gold', Office: 'info', Court: 'warning', Archive: 'neutral', InTransit: 'danger', Client: 'success', Full: 'info', Incremental: 'neutral', Differential: 'warning', UPI: 'success', NetBanking: 'info', Card: 'info', Cash: 'neutral', Cheque: 'neutral', Video: 'info', Audio: 'neutral', InPerson: 'success', Document: 'info', Photo: 'warning', Digital: 'info', admin: 'danger', lawyer: 'info', client: 'success', clerk: 'warning', Admin: 'danger', Lawyer: 'info', Client: 'success', Clerk: 'warning' };
        return `<span class="badge badge-${m[status] || 'neutral'}">${status}</span>`;
    },
    _modal(title, bodyHtml) {
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'modal-overlay';
        div.onclick = (e) => { if (e.target === div) div.remove(); };
        div.innerHTML = `<div class="modal-content"><div class="modal-header"><h3 class="modal-title">${title}</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button></div>${bodyHtml}</div>`;
        document.body.appendChild(div);
    },
};

window.UI = UI;
