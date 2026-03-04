// UI Pages Part 2 - Lawyer, Client, Clerk features
Object.assign(UI, {

    // ===== LAWYER: Tasks =====
    async renderTasksView() {
        const tasks = await ApiService.getTasks();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Track and manage your legal tasks. Organize tasks by priority (Urgent, High, Medium, Low) and status. Link tasks to specific cases, set due dates, and mark them as completed when done. Stay on top of all your deadlines and deliverables.</p></div>
            <div class="flex justify-between items-center mb-lg"><span class="text-muted text-sm">${tasks.length} tasks</span><button class="btn btn-primary btn-sm" onclick="UI._showAddTaskModal()"><i class="ph ph-plus"></i> Add Task</button></div>
            <div class="grid grid-auto">${tasks.map(t => `
                <div class="card" style="border-left:3px solid ${t.priority === 'Urgent' ? 'var(--danger)' : t.priority === 'High' ? 'var(--warning)' : 'var(--accent)'}">
                    <div class="flex justify-between items-center mb-sm">${UI._badge(t.priority)} ${UI._badge(t.status)}</div>
                    <h4 class="text-sm font-semibold mb-xs">${t.title}</h4>
                    ${t.case_title ? `<p class="text-xs text-muted mb-xs"><i class="ph ph-briefcase"></i> ${t.case_title}</p>` : ''}
                    ${t.description ? `<p class="text-xs text-muted mb-sm">${t.description}</p>` : ''}
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-muted"><i class="ph ph-calendar"></i> Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                        <div class="flex gap-xs">
                            ${t.status !== 'Completed' ? `<button class="btn btn-sm btn-success" onclick="UI._completeTask(${t.id})"><i class="ph ph-check"></i> Done</button>` : ''}
                            <button class="btn btn-sm btn-danger" onclick="UI._delTask(${t.id})"><i class="ph ph-trash"></i> Delete</button>
                        </div>
                    </div>
                </div>`).join('')}
                ${tasks.length === 0 ? '<div class="empty-state"><i class="ph ph-check-circle"></i><p>No tasks! All caught up.</p></div>' : ''}
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-list-checks" style="color:var(--primary)"></i> ' + t('tasks');
    },
    _showAddTaskModal() {
        UI._modal('Add Task', `<form onsubmit="UI._submitTask(event)">
            <div class="form-group"><label class="label">Title</label><input class="input" name="title" required></div>
            <div class="form-group"><label class="label">Case ID</label><input class="input" name="case_id" type="number"></div>
            <div class="form-group"><label class="label">Description</label><textarea class="input" name="description" rows="2"></textarea></div>
            <div class="grid grid-2"><div class="form-group"><label class="label">Priority</label><select class="input" name="priority"><option>Medium</option><option>Low</option><option>High</option><option>Urgent</option></select></div>
            <div class="form-group"><label class="label">Due Date</label><input class="input" name="due_date" type="date" required></div></div>
            <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">Create</button></div></form>`);
    },
    async _submitTask(e) { e.preventDefault(); await ApiService.createTask(Object.fromEntries(new FormData(e.target))); document.querySelector('.modal-overlay').remove(); showToast('Task created!'); App.navigate('tasks'); },
    async _completeTask(id) { await ApiService.updateTaskStatus(id, 'Completed'); showToast('Task completed!'); App.navigate('tasks'); },
    async _delTask(id) { await ApiService.deleteTask(id); showToast('Task deleted'); App.navigate('tasks'); },

    // ===== MESSAGES (Chat) =====
    async renderMessagesView(caseId) {
        if (caseId) { return this._renderChat(caseId); }
        const cases = await ApiService.getCases();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Secure, end-to-end encrypted messaging between lawyers and clients. Select a case to view and continue the conversation thread. All messages are logged for legal compliance and future reference.</p></div>
            <div class="card-title mb-md">Select a case to start chatting</div>
            <div class="grid grid-auto">${cases.map(c => `
                <div class="card" style="cursor:pointer" onclick="App.navigate('messages',${c.id})">
                    <div class="flex items-center gap-md"><div class="avatar">${(c.client_name || c.lawyer_name || '?').charAt(0)}</div>
                    <div><div class="text-sm font-semibold">${c.title}</div><div class="text-xs text-muted">${c.client_name || ''} ↔ ${c.lawyer_name || ''}</div></div></div>
                </div>`).join('')}</div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-chat-text" style="color:var(--primary)"></i> ' + t('messages');
    },
    async _renderChat(caseId) {
        const [messages, caseData] = await Promise.all([ApiService.getMessages(caseId), ApiService.getCase(caseId)]);
        const me = AuthService.getCurrentUser();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <button class="btn btn-sm btn-secondary mb-md" onclick="App.navigate('messages')"><i class="ph ph-arrow-left"></i> Back</button>
            <div class="card" style="padding:0;overflow:hidden">
                <div style="padding:12px 16px;background:var(--surface);border-bottom:1px solid var(--border)">
                    <div class="text-sm font-semibold">${caseData ? caseData.title : 'Chat'}</div>
                    <div class="text-xs text-muted">End-to-end encrypted</div>
                </div>
                <div class="chat-container" id="chatBox">${messages.map(m => `
                    <div class="chat-bubble ${m.sender_id === me.id ? 'chat-sent' : 'chat-received'}">
                        <div class="text-xs font-semibold mb-xs">${m.sender_name}</div>
                        ${m.content}
                        <div class="text-xs mt-xs" style="opacity:0.6">${new Date(m.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>`).join('')}
                </div>
                <form onsubmit="UI._sendMsg(event,${caseId})" style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
                    <input class="input" name="content" placeholder="Type a message..." required style="flex:1">
                    <button type="submit" class="btn btn-primary" style="padding:10px 16px"><i class="ph ph-paper-plane-tilt"></i> Send</button>
                </form>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-chat-text" style="color:var(--primary)"></i> Chat';
        const box = document.getElementById('chatBox'); if (box) box.scrollTop = box.scrollHeight;
    },
    async _sendMsg(e, caseId) {
        e.preventDefault();
        const me = AuthService.getCurrentUser(), c = await ApiService.getCase(caseId);
        const receiverId = me.role === 'client' ? c.lawyer_id : c.client_id;
        await ApiService.sendMessage({ case_id: caseId, receiver_id: receiverId, content: e.target.content.value });
        App.navigate('messages', caseId);
    },

    // ===== INVOICES =====
    async renderInvoicesView() {
        const invoices = await ApiService.getInvoices();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Manage invoices with automatic GST (18%) calculation. Lawyers can create and send invoices to clients. Track paid, pending and overdue invoices. All amounts are displayed in INR with Indian locale formatting.</p></div>
            <div class="flex justify-between items-center mb-lg"><span class="text-muted text-sm">${invoices.length} invoices</span>
            ${AuthService.getCurrentUser().role === 'lawyer' ? `<button class="btn btn-primary btn-sm" onclick="UI._showAddInvoiceModal()"><i class="ph ph-plus"></i> Create Invoice</button>` : ''}</div>
            <div class="table-wrap"><table><thead><tr><th>Invoice #</th><th>Case</th><th>Amount</th><th>Tax (GST)</th><th>Total</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>${invoices.map(i => `<tr>
                <td class="text-sm font-semibold">${i.invoice_number}</td><td class="text-xs text-muted">${i.case_title || '-'}</td>
                <td>₹${Number(i.amount).toLocaleString('en-IN')}</td><td class="text-xs">₹${Number(i.tax_amount).toLocaleString('en-IN')}</td>
                <td class="font-bold">₹${Number(i.total_amount).toLocaleString('en-IN')}</td>
                <td>${UI._badge(i.status)}</td><td class="text-xs text-muted">${i.due_date ? new Date(i.due_date).toLocaleDateString('en-IN') : '-'}</td>
            </tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-receipt" style="color:var(--primary)"></i> ' + t('invoices');
    },
    _showAddInvoiceModal() {
        UI._modal('Create Invoice', `<form onsubmit="UI._submitInvoice(event)">
            <div class="form-group"><label class="label">Case ID</label><input class="input" name="case_id" type="number" required></div>
            <div class="form-group"><label class="label">Client User ID</label><input class="input" name="client_id" type="number" required></div>
            <div class="form-group"><label class="label">Amount (₹)</label><input class="input" name="amount" type="number" required placeholder="50000"></div>
            <div class="form-group"><label class="label">Description</label><textarea class="input" name="description" rows="2"></textarea></div>
            <div class="form-group"><label class="label">Due Date</label><input class="input" name="due_date" type="date" required></div>
            <p class="text-xs text-muted mb-md">GST (18%) will be auto-calculated</p>
            <div class="flex justify-between"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">Generate</button></div></form>`);
    },
    async _submitInvoice(e) { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); d.amount = parseFloat(d.amount); await ApiService.createInvoice(d); document.querySelector('.modal-overlay').remove(); showToast('Invoice created!'); App.navigate('invoices'); },

    // ===== PAYMENTS =====
    async renderPaymentsView() {
        const [payments, invoices] = await Promise.all([ApiService.getPayments(), ApiService.getInvoices()]);
        const pending = invoices.filter(i => ['Sent', 'Overdue'].includes(i.status));
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            ${pending.length > 0 ? `<div class="page-desc"><i class="ph ph-info"></i><p>View your payment history and settle pending invoices. Payments are processed securely via UPI, Net Banking, or Card. All transactions are encrypted and comply with RBI regulatory standards.</p></div>` : '<div class="page-desc"><i class="ph ph-info"></i><p>View your payment history. All transactions are securely processed and comply with RBI regulatory standards. Payments support UPI, Net Banking, and Card methods.</p></div>'}
            ${pending.length > 0 ? `<div class="card mb-lg" style="border-color:var(--warning)"><div class="card-title mb-md"><i class="ph ph-hourglass" style="color:var(--warning)"></i> Pending Payments</div>
                ${pending.map(i => `<div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border)">
                    <div><div class="text-sm font-semibold">${i.invoice_number}</div><div class="text-xs text-muted">${i.description || i.case_title || ''}</div></div>
                    <div class="flex items-center gap-md"><span class="font-bold">₹${Number(i.total_amount).toLocaleString('en-IN')}</span>
                    <button class="btn btn-sm btn-success" onclick="UI._payInvoice(${i.id},${i.total_amount})"><i class="ph ph-credit-card"></i> Pay</button></div>
                </div>`).join('')}
            </div>`: ''}
            <div class="card-title mb-md">Payment History</div>
            <div class="table-wrap"><table><thead><tr><th>Transaction</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${payments.map(p => `<tr><td class="text-xs">${p.transaction_id}</td><td class="font-bold text-success">₹${Number(p.amount).toLocaleString('en-IN')}</td><td>${UI._badge(p.payment_method)}</td><td>${UI._badge(p.status)}</td><td class="text-xs text-muted">${new Date(p.paid_at).toLocaleString('en-IN')}</td></tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-credit-card" style="color:var(--primary)"></i> ' + t('payments');
    },
    async _payInvoice(invoiceId, amount) {
        UI._modal('Secure Payment', `<div class="text-center mb-lg"><i class="ph ph-shield-check" style="font-size:3rem;color:var(--success)"></i><p class="text-muted text-sm">256-bit encrypted payment</p></div>
            <div class="card mb-md text-center"><div class="text-2xl font-bold text-gold">₹${Number(amount).toLocaleString('en-IN')}</div><div class="text-xs text-muted">Total payable amount (incl. GST)</div></div>
            <form onsubmit="UI._processPayment(event,${invoiceId},${amount})">
                <div class="form-group"><label class="label">Payment Method</label><select class="input" name="payment_method"><option>UPI</option><option>NetBanking</option><option>Card</option></select></div>
                <button type="submit" class="btn btn-success" style="width:100%"><i class="ph ph-lock"></i> Pay Securely</button>
            </form>`);
    },
    async _processPayment(e, invoiceId, amount) {
        e.preventDefault();
        const method = e.target.payment_method.value;
        await ApiService.makePayment({ invoice_id: invoiceId, amount, payment_method: method });
        document.querySelector('.modal-overlay').remove();
        showToast('Payment successful! ₹' + Number(amount).toLocaleString('en-IN'));
        App.navigate('payments');
    },

    // ===== TEMPLATES =====
    async renderTemplatesView() {
        const templates = await ApiService.getTemplates();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade"><div class="grid grid-auto">${templates.map(t => `
            <div class="card" style="cursor:pointer" onclick="UI._viewTemplate(${t.id})">
                <div class="flex justify-between items-center mb-sm">${UI._badge(t.category)} <span class="text-xs text-muted">${t.usage_count} uses</span></div>
                <h4 class="text-sm font-semibold mb-xs">${t.title}</h4>
                <p class="text-xs text-muted">${UI._badge(t.type)}</p>
            </div>`).join('')}</div></div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-book-open" style="color:var(--primary)"></i> Legal Precedent Library';
    },
    async _viewTemplate(id) {
        const t = await ApiService.getTemplate(id);
        if (!t) return;
        UI._modal(t.title, `<div class="mb-md">${UI._badge(t.category)} ${UI._badge(t.type)}</div><pre style="background:var(--surface-alt);padding:var(--spacing-md);border-radius:var(--radius-md);font-size:0.8rem;white-space:pre-wrap;max-height:400px;overflow-y:auto;color:var(--text-primary);border:1px solid var(--border)">${t.content}</pre>
        <div class="flex justify-between mt-md"><span class="text-xs text-muted">Used ${t.usage_count} times</span><button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText(document.querySelector('.modal-content pre').innerText);showToast('Copied!')">Copy</button></div>`);
    },

    // ===== AI RESEARCH =====
    async renderResearchView(caseId) {
        const data = await ApiService.getCaseResearch(caseId);
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <button class="btn btn-sm btn-secondary mb-md" onclick="App.navigate('cases')"><i class="ph ph-arrow-left"></i> Back</button>
            <div class="card mb-md" style="border-color:var(--accent)"><div class="flex items-center gap-md"><i class="ph ph-robot" style="font-size:2rem;color:var(--accent)"></i><div><div class="text-lg font-bold">AI Legal Research</div><div class="text-sm text-muted">${data.caseTitle || ''} • ${data.caseType || ''}</div></div></div></div>
            <div class="section-title">Relevant Precedents</div>
            ${(data.precedents || []).map(p => `<div class="card">
                <div class="flex justify-between items-center mb-sm"><h4 class="text-sm font-semibold">${p.title}</h4><span class="badge badge-success">${p.relevance}% match</span></div>
                <p class="text-xs text-muted mb-xs"><i class="ph ph-book-open"></i> ${p.citation}</p>
                <p class="text-sm">${p.summary}</p>
            </div>`).join('')}
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-robot" style="color:var(--primary)"></i> AI Research';
    },

    // ===== TIMELINE =====
    async renderTimelineView(caseId) {
        const [events, c] = await Promise.all([ApiService.getCaseTimeline(caseId), ApiService.getCase(caseId)]);
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <button class="btn btn-sm btn-secondary mb-md" onclick="App.navigate('cases')"><i class="ph ph-arrow-left"></i> Back</button>
            <div class="card-title mb-md">${c ? c.title : ''} — Timeline</div>
            <div class="card"><div class="timeline">${events.map(e => `
                <div class="timeline-item"><div class="timeline-dot ${e.event_type === 'Judgment' ? 'completed' : ''}"></div>
                    <div class="flex justify-between items-center"><span class="text-sm font-semibold">${e.event_title}</span>${UI._badge(e.event_type)}</div>
                    <div class="text-xs text-muted">${new Date(e.event_date).toLocaleDateString('en-IN')} • ${e.created_by_name || ''}</div>
                    ${e.event_description ? `<p class="text-xs text-muted mt-xs">${e.event_description}</p>` : ''}
                </div>`).join('')}
                ${events.length === 0 ? '<p class="text-muted text-sm">No events recorded</p>' : ''}
            </div></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-clock-countdown" style="color:var(--primary)"></i> Case Timeline';
    },

    // ===== CONSULTATIONS =====
    async renderConsultationsView() {
        const consults = await ApiService.getConsultations();
        const me = AuthService.getCurrentUser();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            ${me.role === 'client' ? `<button class="btn btn-primary btn-sm mb-lg" onclick="UI._showBookConsult()"><i class="ph ph-video-camera"></i> Book Consultation</button>` : ''}
            <div class="page-desc"><i class="ph ph-info"></i><p>Schedule and manage video, audio, or in-person consultations. Clients can book consultations with lawyers, while lawyers can accept or decline requests. Confirmed consultations include a meeting link for easy access.</p></div>
            <div class="grid grid-auto">${consults.map(c => `
                <div class="card"><div class="flex justify-between items-center mb-sm">${UI._badge(c.type)} ${UI._badge(c.status)}</div>
                    <div class="text-sm font-semibold mb-xs">${me.role === 'client' ? c.lawyer_name : c.client_name}</div>
                    <div class="text-xs text-muted mb-xs"><i class="ph ph-calendar"></i> ${new Date(c.scheduled_date).toLocaleDateString('en-IN')} at ${c.scheduled_time || 'TBD'}</div>
                    <div class="text-xs text-muted mb-xs"><i class="ph ph-clock"></i> ${c.duration} min</div>
                    <div class="text-sm font-bold text-gold mb-sm">₹${Number(c.fee).toLocaleString('en-IN')}</div>
                    ${c.meeting_link && c.status === 'Confirmed' ? `<a href="${c.meeting_link}" target="_blank" class="btn btn-sm btn-primary" style="width:100%"><i class="ph ph-video-camera"></i> Join Meeting</a>` : ''}
                    ${me.role === 'lawyer' && c.status === 'Requested' ? `<div class="flex gap-sm"><button class="btn btn-sm btn-success flex-1" onclick="UI._updateConsult(${c.id},'Confirmed')">Accept</button><button class="btn btn-sm btn-danger flex-1" onclick="UI._updateConsult(${c.id},'Cancelled')">Decline</button></div>` : ''}
                </div>`).join('')}
                ${consults.length === 0 ? '<div class="empty-state"><i class="ph ph-video-camera"></i><p>No consultations</p></div>' : ''}
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-video-camera" style="color:var(--primary)"></i> Video Consultations';
    },
    _showBookConsult() {
        UI._modal('Book Consultation', `<form onsubmit="UI._bookConsult(event)">
            <div class="form-group"><label class="label">Lawyer User ID</label><input class="input" name="lawyer_id" type="number" required></div>
            <div class="form-group"><label class="label">Case ID</label><input class="input" name="case_id" type="number"></div>
            <div class="grid grid-2"><div class="form-group"><label class="label">Date</label><input class="input" name="scheduled_date" type="date" required></div>
            <div class="form-group"><label class="label">Time</label><input class="input" name="scheduled_time" type="time" required></div></div>
            <div class="form-group"><label class="label">Type</label><select class="input" name="type"><option>Video</option><option>Audio</option><option>InPerson</option></select></div>
            <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">Book</button></div></form>`);
    },
    async _bookConsult(e) { e.preventDefault(); await ApiService.bookConsultation(Object.fromEntries(new FormData(e.target))); document.querySelector('.modal-overlay').remove(); showToast('Consultation requested!'); App.navigate('consultations'); },
    async _updateConsult(id, status) { await ApiService.updateConsultStatus(id, status); showToast('Consultation ' + status.toLowerCase()); App.navigate('consultations'); },

    // ===== RATINGS =====
    async renderRatingsView(lawyerId) {
        const cases = await ApiService.getCases();
        const closedCases = cases.filter(c => c.status === 'Closed');
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade"><div class="card-title mb-md">Rate Your Lawyer</div>
            ${closedCases.map(c => `<div class="card"><div class="flex justify-between items-center">
                <div><div class="text-sm font-semibold">${c.title}</div><div class="text-xs text-muted">Lawyer: ${c.lawyer_name || '-'}</div></div>
                <button class="btn btn-sm btn-gold" onclick="UI._showRatingModal(${c.id},${c.lawyer_id})"><i class="ph ph-star"></i> Rate</button>
            </div></div>`).join('')}
            ${closedCases.length === 0 ? '<div class="empty-state"><i class="ph ph-star"></i><p>No closed cases to rate</p></div>' : ''}
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-star" style="color:var(--primary)"></i> Lawyer Ratings';
    },
    _showRatingModal(caseId, lawyerId) {
        UI._modal('Rate Lawyer', `<form onsubmit="UI._submitRating(event,${caseId},${lawyerId})">
            <div class="text-center mb-md"><div id="stars" class="flex justify-center gap-sm mb-md">${[1, 2, 3, 4, 5].map(i => `<span class="star" data-v="${i}" onclick="UI._setStars(${i})">★</span>`).join('')}</div><input type="hidden" name="rating" id="ratingVal" value="5"></div>
            <div class="form-group"><label class="label">Review (optional)</label><textarea class="input" name="review" rows="3" placeholder="Share your experience..."></textarea></div>
            <button type="submit" class="btn btn-gold" style="width:100%">Submit Rating</button></form>`);
        UI._setStars(5);
    },
    _setStars(v) { document.getElementById('ratingVal').value = v; document.querySelectorAll('#stars .star').forEach(s => { s.classList.toggle('active', parseInt(s.dataset.v) <= v); }); },
    async _submitRating(e, caseId, lawyerId) { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); await ApiService.submitRating({ case_id: caseId, lawyer_id: lawyerId, ...fd }); document.querySelector('.modal-overlay').remove(); showToast('Rating submitted!'); },

    // ===== SEARCH LAWYERS =====
    async renderSearchLawyers() {
        const lawyers = await ApiService.getLawyers();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Browse verified lawyers registered on LawOrbit. View their specialization, experience, ratings, and case history. Book a video consultation or start a secure chat directly from this page.</p></div>
            <div class="flex justify-between items-center mb-lg">
                <span class="text-muted text-sm">${lawyers.length} lawyers available</span>
                <div class="flex gap-sm">
                    <input class="input" style="width:200px" placeholder="Search by name..." oninput="UI._filterLawyers(this.value)">
                </div>
            </div>
            <div class="grid grid-auto" id="lawyerGrid">${lawyers.map(l => `
                <div class="lawyer-card" data-name="${(l.name || '').toLowerCase()}">
                    <div class="flex items-center gap-md mb-md">
                        <div class="avatar" style="width:52px;height:52px;font-size:1.1rem">${(l.name || '?').charAt(0)}</div>
                        <div class="flex-1">
                            <div class="font-semibold">${l.name}</div>
                            <div class="text-xs text-muted">${l.email}</div>
                            ${l.bar_council_id ? `<div class="text-xs text-muted"><i class="ph ph-identification-card"></i> Bar ID: ${l.bar_council_id}</div>` : ''}
                        </div>
                        <div class="lawyer-rating"><i class="ph-fill ph-star"></i> ${l.rating ? parseFloat(l.rating).toFixed(1) : 'N/A'}</div>
                    </div>
                    <div class="lawyer-meta">
                        ${l.specialization ? `<span><i class="ph ph-scales"></i> ${l.specialization}</span>` : ''}
                        ${l.experience ? `<span><i class="ph ph-clock"></i> ${l.experience}</span>` : ''}
                        ${l.phone ? `<span><i class="ph ph-phone"></i> ${l.phone}</span>` : ''}
                    </div>
                    ${l.total_cases ? `<div class="flex items-center gap-md mb-md">
                        <div class="flex-1">
                            <div class="text-xs text-muted mb-xs">Cases Won: ${l.cases_won || 0} / ${l.total_cases}</div>
                            <div class="progress-bar"><div class="progress-fill progress-gradient" style="width:${Math.round(((l.cases_won || 0) / l.total_cases) * 100)}%"></div></div>
                        </div>
                        <div class="text-sm font-bold" style="color:var(--primary)">${Math.round(((l.cases_won || 0) / l.total_cases) * 100)}%</div>
                    </div>` : '<div class="text-xs text-muted mb-md">No case records yet</div>'}
                    <div class="flex gap-sm">
                        <button class="btn btn-sm btn-primary flex-1" onclick="App.navigate('consultations')"><i class="ph ph-video-camera"></i> Book Consultation</button>
                        <button class="btn btn-sm btn-secondary flex-1" onclick="App.navigate('messages')"><i class="ph ph-chat-text"></i> Message</button>
                    </div>
                </div>`).join('')}
            </div>
            ${lawyers.length === 0 ? '<div class="empty-state"><i class="ph ph-magnifying-glass"></i><p>No lawyers found</p></div>' : ''}
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-magnifying-glass" style="color:var(--primary)"></i> Find Lawyers';
    },
    _filterLawyers(q) { const lower = q.toLowerCase(); document.querySelectorAll('[data-name]').forEach(c => { c.style.display = c.dataset.name.includes(lower) ? '' : 'none'; }); },

    // ===== COURT MAP =====
    async renderCourtMap() {
        let courts = [];
        try { courts = await ApiService._get('/clerk/courtrooms'); } catch (e) { }
        // Fallback: use hardcoded comprehensive list if API doesn't return courts directly
        // We'll fetch from our courts table via a new endpoint or use the built-in court data
        const allCourts = [
            { name: 'Supreme Court of India', location: 'Tilak Marg', city: 'New Delhi', state: 'Delhi', type: 'Apex Court', lat: 28.6225, lng: 77.2400, phone: '011-23388922' },
            { name: 'Allahabad High Court', location: 'Civil Lines', city: 'Prayagraj', state: 'Uttar Pradesh', type: 'High Court', lat: 25.4358, lng: 81.8463, phone: '0532-2621335' },
            { name: 'Andhra Pradesh High Court', location: 'Nelapadu', city: 'Amaravati', state: 'Andhra Pradesh', type: 'High Court', lat: 16.5150, lng: 80.5180, phone: '0863-2340501' },
            { name: 'Bombay High Court', location: 'Fort', city: 'Mumbai', state: 'Maharashtra', type: 'High Court', lat: 18.9281, lng: 72.8320, phone: '022-22620831' },
            { name: 'Calcutta High Court', location: 'Esplanade Row West', city: 'Kolkata', state: 'West Bengal', type: 'High Court', lat: 22.5726, lng: 88.3497, phone: '033-22133253' },
            { name: 'Chhattisgarh High Court', location: 'Bodri', city: 'Bilaspur', state: 'Chhattisgarh', type: 'High Court', lat: 22.0797, lng: 82.1391, phone: '07752-234001' },
            { name: 'Delhi High Court', location: 'Sher Shah Road', city: 'New Delhi', state: 'Delhi', type: 'High Court', lat: 28.6336, lng: 77.2413, phone: '011-23386442' },
            { name: 'Gauhati High Court', location: 'Panbazar', city: 'Guwahati', state: 'Assam', type: 'High Court', lat: 26.1800, lng: 91.7500, phone: '0361-2732354' },
            { name: 'Gujarat High Court', location: 'Sola', city: 'Ahmedabad', state: 'Gujarat', type: 'High Court', lat: 23.0600, lng: 72.5280, phone: '079-27541450' },
            { name: 'Himachal Pradesh High Court', location: 'The Ridge', city: 'Shimla', state: 'Himachal Pradesh', type: 'High Court', lat: 31.1048, lng: 77.1734, phone: '0177-2656210' },
            { name: 'Jammu & Kashmir High Court', location: 'Janipur', city: 'Jammu', state: 'Jammu & Kashmir', type: 'High Court', lat: 32.7089, lng: 74.8658, phone: '0191-2546041' },
            { name: 'Jharkhand High Court', location: 'Dhurwa', city: 'Ranchi', state: 'Jharkhand', type: 'High Court', lat: 23.3700, lng: 85.3200, phone: '0651-2482125' },
            { name: 'Karnataka High Court', location: 'Dr. Ambedkar Veedhi', city: 'Bangalore', state: 'Karnataka', type: 'High Court', lat: 12.9767, lng: 77.5900, phone: '080-22867400' },
            { name: 'Kerala High Court', location: 'Shornur Road', city: 'Ernakulam', state: 'Kerala', type: 'High Court', lat: 9.9816, lng: 76.2999, phone: '0484-2562570' },
            { name: 'Madhya Pradesh High Court', location: 'Jail Road', city: 'Jabalpur', state: 'Madhya Pradesh', type: 'High Court', lat: 23.1815, lng: 79.9864, phone: '0761-2622345' },
            { name: 'Madras High Court', location: 'Parry Corner', city: 'Chennai', state: 'Tamil Nadu', type: 'High Court', lat: 13.0878, lng: 80.2870, phone: '044-25301344' },
            { name: 'Manipur High Court', location: 'Mantripukhri', city: 'Imphal', state: 'Manipur', type: 'High Court', lat: 24.7900, lng: 93.9500, phone: '0385-2451023' },
            { name: 'Meghalaya High Court', location: 'Lachumiere', city: 'Shillong', state: 'Meghalaya', type: 'High Court', lat: 25.5788, lng: 91.8933, phone: '0364-2224201' },
            { name: 'Orissa High Court', location: 'Cuttack Road', city: 'Cuttack', state: 'Odisha', type: 'High Court', lat: 20.4625, lng: 85.8828, phone: '0671-2504093' },
            { name: 'Patna High Court', location: 'Court Road', city: 'Patna', state: 'Bihar', type: 'High Court', lat: 25.6093, lng: 85.1376, phone: '0612-2233051' },
            { name: 'Punjab & Haryana High Court', location: 'Sector 1', city: 'Chandigarh', state: 'Chandigarh', type: 'High Court', lat: 30.7457, lng: 76.7882, phone: '0172-2741940' },
            { name: 'Rajasthan High Court', location: 'Sardar Patel Marg', city: 'Jodhpur', state: 'Rajasthan', type: 'High Court', lat: 26.2850, lng: 73.0169, phone: '0291-2633276' },
            { name: 'Sikkim High Court', location: 'Development Area', city: 'Gangtok', state: 'Sikkim', type: 'High Court', lat: 27.3389, lng: 88.6065, phone: '03592-202251' },
            { name: 'Telangana High Court', location: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', type: 'High Court', lat: 17.4400, lng: 78.3489, phone: '040-23448222' },
            { name: 'Tripura High Court', location: 'Agartala', city: 'Agartala', state: 'Tripura', type: 'High Court', lat: 23.8315, lng: 91.2868, phone: '0381-2324018' },
            { name: 'Uttarakhand High Court', location: 'Kalagaon', city: 'Nainital', state: 'Uttarakhand', type: 'High Court', lat: 29.3919, lng: 79.4542, phone: '05942-236466' },
            { name: 'Delhi District Court (Tis Hazari)', location: 'Tis Hazari', city: 'New Delhi', state: 'Delhi', type: 'District Court', lat: 28.6666, lng: 77.2264, phone: '011-23911017' },
            { name: 'Patiala House Court', location: 'India Gate', city: 'New Delhi', state: 'Delhi', type: 'District Court', lat: 28.6153, lng: 77.2373, phone: '011-23382666' },
            { name: 'City Civil Court Mumbai', location: 'Fort', city: 'Mumbai', state: 'Maharashtra', type: 'District Court', lat: 18.9340, lng: 72.8360, phone: '022-22617284' },
            { name: 'Sessions Court Bangalore', location: 'Nrupathunga Road', city: 'Bangalore', state: 'Karnataka', type: 'District Court', lat: 12.9780, lng: 77.5870, phone: '080-22961444' },
            { name: 'Chief Metropolitan Court Chennai', location: 'Egmore', city: 'Chennai', state: 'Tamil Nadu', type: 'District Court', lat: 13.0732, lng: 80.2609, phone: '044-28190725' },
            { name: 'Saket District Court', location: 'Saket', city: 'New Delhi', state: 'Delhi', type: 'District Court', lat: 28.5244, lng: 77.2167, phone: '011-26862100' },
            { name: 'City Civil & Sessions Court Hyderabad', location: 'Nampally', city: 'Hyderabad', state: 'Telangana', type: 'District Court', lat: 17.3850, lng: 78.4867, phone: '040-24612345' },
        ];
        const hcCount = allCourts.filter(c => c.type === 'High Court').length;
        const dcCount = allCourts.filter(c => c.type === 'District Court').length;
        const typeColors = { 'Apex Court': '#dc2626', 'High Court': '#7c3aed', 'District Court': '#059669' };
        const typeIcons = { 'Apex Court': 'crown', 'High Court': 'scales', 'District Court': 'buildings' };

        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <!-- Stats Row -->
            <div class="grid grid-3 mb-lg" style="gap:var(--spacing-md)">
                <div class="card" style="text-align:center;border-top:4px solid #dc2626;padding:16px">
                    <div style="font-size:2rem;font-weight:800;color:#dc2626">1</div>
                    <div class="text-xs text-muted">Supreme Court</div>
                </div>
                <div class="card" style="text-align:center;border-top:4px solid #7c3aed;padding:16px">
                    <div style="font-size:2rem;font-weight:800;color:#7c3aed">${hcCount}</div>
                    <div class="text-xs text-muted">High Courts</div>
                </div>
                <div class="card" style="text-align:center;border-top:4px solid #059669;padding:16px">
                    <div style="font-size:2rem;font-weight:800;color:#059669">${dcCount}</div>
                    <div class="text-xs text-muted">District Courts</div>
                </div>
            </div>

            <!-- Search & Filter -->
            <div class="card mb-lg">
                <div class="flex items-center gap-md flex-wrap">
                    <div style="flex:1;min-width:200px;position:relative">
                        <i class="ph ph-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted)"></i>
                        <input type="text" class="input" id="courtSearch" placeholder="Search courts by name, city, or state..." style="padding-left:38px" oninput="UI._filterCourts()">
                    </div>
                    <div class="flex gap-xs" id="courtTypeFilters">
                        <button class="btn btn-sm btn-primary court-filter-btn active" data-type="all" onclick="UI._filterCourtsByType('all',this)">All (${allCourts.length})</button>
                        <button class="btn btn-sm btn-secondary court-filter-btn" data-type="Apex Court" onclick="UI._filterCourtsByType('Apex Court',this)" style="border-color:#dc2626;color:#dc2626">Apex (1)</button>
                        <button class="btn btn-sm btn-secondary court-filter-btn" data-type="High Court" onclick="UI._filterCourtsByType('High Court',this)" style="border-color:#7c3aed;color:#7c3aed">High Courts (${hcCount})</button>
                        <button class="btn btn-sm btn-secondary court-filter-btn" data-type="District Court" onclick="UI._filterCourtsByType('District Court',this)" style="border-color:#059669;color:#059669">District (${dcCount})</button>
                    </div>
                </div>
            </div>

            <!-- Map -->
            <div class="card mb-lg" style="padding:0;overflow:hidden;height:420px;border-radius:var(--radius-lg)">
                <div id="courtMap" style="height:100%;width:100%"></div>
            </div>

            <!-- Court Cards -->
            <div class="grid grid-auto" id="courtList" style="gap:var(--spacing-md)"></div>
            <p class="text-center text-xs text-muted mt-md" id="courtResultCount"></p>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-map-pin" style="color:var(--primary)"></i> Indian Courts Directory';

        // Store courts data globally for filtering
        window._allCourts = allCourts;
        window._currentTypeFilter = 'all';

        setTimeout(() => {
            const map = L.map('courtMap').setView([22.5, 80.0], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
            window._courtMap = map;
            window._courtMarkers = [];

            allCourts.forEach(c => {
                const color = typeColors[c.type] || '#6b7280';
                const icon = L.divIcon({
                    className: 'court-marker',
                    html: `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });
                const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)
                    .bindPopup(`<div style="min-width:180px"><b style="color:${color}">${c.name}</b><br><span style="font-size:11px;color:#666">${c.location}, ${c.city}</span><br><span style="font-size:11px;color:#999">${c.state}</span><br><span style="font-size:11px">📞 ${c.phone}</span></div>`);
                marker._courtData = c;
                window._courtMarkers.push(marker);
            });

            UI._renderCourtCards(allCourts);
        }, 200);
    },

    _renderCourtCards(courtsToShow) {
        const typeColors = { 'Apex Court': '#dc2626', 'High Court': '#7c3aed', 'District Court': '#059669' };
        const typeIcons = { 'Apex Court': 'crown', 'High Court': 'scales', 'District Court': 'buildings' };
        document.getElementById('courtList').innerHTML = courtsToShow.map(c => {
            const col = typeColors[c.type] || '#6b7280';
            return `<div class="card" style="border-left:4px solid ${col};transition:var(--transition);cursor:pointer" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div class="flex justify-between items-start mb-sm">
                    <div class="flex items-center gap-sm">
                        <div style="width:36px;height:36px;border-radius:var(--radius-md);background:${col}12;display:flex;align-items:center;justify-content:center">
                            <i class="ph ph-${typeIcons[c.type] || 'scales'}" style="color:${col};font-size:1.1rem"></i>
                        </div>
                        <div>
                            <div class="text-sm font-semibold">${c.name}</div>
                            <div class="text-xs text-muted">${c.location}, ${c.city}</div>
                        </div>
                    </div>
                    <span class="badge" style="background:${col}12;color:${col};font-size:0.65rem">${c.type}</span>
                </div>
                <div class="flex justify-between items-center text-xs text-muted">
                    <span><i class="ph ph-map-pin"></i> ${c.state}</span>
                    <span><i class="ph ph-phone"></i> ${c.phone}</span>
                </div>
            </div>`;
        }).join('');
        document.getElementById('courtResultCount').textContent = `Showing ${courtsToShow.length} of ${window._allCourts.length} courts`;
    },

    _filterCourts() {
        const query = (document.getElementById('courtSearch').value || '').toLowerCase();
        let filtered = window._allCourts;
        if (window._currentTypeFilter !== 'all') {
            filtered = filtered.filter(c => c.type === window._currentTypeFilter);
        }
        if (query) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.city.toLowerCase().includes(query) ||
                c.state.toLowerCase().includes(query) ||
                c.type.toLowerCase().includes(query)
            );
        }
        UI._renderCourtCards(filtered);
        // Update map markers visibility
        if (window._courtMarkers) {
            window._courtMarkers.forEach(m => {
                const cd = m._courtData;
                const visible = filtered.some(f => f.name === cd.name);
                if (visible) { if (!window._courtMap.hasLayer(m)) window._courtMap.addLayer(m); }
                else { window._courtMap.removeLayer(m); }
            });
            if (filtered.length > 0 && filtered.length <= 5) {
                const bounds = L.latLngBounds(filtered.map(c => [c.lat, c.lng]));
                window._courtMap.fitBounds(bounds, { padding: [40, 40] });
            }
        }
    },

    _filterCourtsByType(type, btn) {
        window._currentTypeFilter = type;
        document.querySelectorAll('.court-filter-btn').forEach(b => { b.classList.remove('active', 'btn-primary'); b.classList.add('btn-secondary'); });
        btn.classList.remove('btn-secondary'); btn.classList.add('active', 'btn-primary');
        if (type !== 'all') { const typeColors = { 'Apex Court': '#dc2626', 'High Court': '#7c3aed', 'District Court': '#059669' }; btn.style.background = typeColors[type]; btn.style.borderColor = typeColors[type]; btn.style.color = 'white'; }
        UI._filterCourts();
    },

    // ===== NOTIFICATIONS =====
    async renderNotificationsView() {
        const notifs = await ApiService.getNotifications();
        await ApiService.markAllRead();
        const badge = document.getElementById('notifBadge'); if (badge) badge.classList.add('hidden');
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">${notifs.map(n => `
            <div class="card" style="border-left:3px solid ${n.type === 'danger' ? 'var(--danger)' : n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : 'var(--info)'}; ${n.is_read ? 'opacity:0.7' : ''}">
                <div class="flex justify-between items-center"><div class="text-sm font-semibold">${n.title}</div><span class="text-xs text-muted">${new Date(n.created_at).toLocaleString('en-IN')}</span></div>
                <p class="text-sm text-muted mt-xs">${n.message || ''}</p>
            </div>`).join('')}
            ${notifs.length === 0 ? '<div class="empty-state"><i class="ph ph-bell-slash"></i><p>No notifications</p></div>' : ''}
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-bell" style="color:var(--primary)"></i> Notifications';
    },

    // ===== CLERK: Doc Verification =====
    async renderDocVerification() {
        const docs = await ApiService.getPendingDocuments();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Review and verify uploaded case documents. Approve legitimate documents or reject ones that don't meet requirements. Document verification ensures legal compliance and maintains the integrity of all case files.</p></div>
            <div class="text-muted text-sm mb-md">${docs.length} documents pending verification</div>
            <div class="table-wrap"><table><thead><tr><th>Document</th><th>Case</th><th>Uploader</th><th>Type</th><th>Size</th><th>Actions</th></tr></thead>
            <tbody>${docs.map(d => `<tr>
                <td class="text-sm">${d.name}</td><td class="text-xs text-muted">${d.case_title || '-'}</td>
                <td class="text-xs">${d.uploader || '-'}</td><td>${UI._badge(d.type)}</td><td class="text-xs">${d.size || '-'}</td>
                <td><div class="flex gap-xs"><button class="btn btn-sm btn-success" onclick="UI._verifyDoc(${d.id},'Verified')"><i class="ph ph-check"></i> Approve</button><button class="btn btn-sm btn-danger" onclick="UI._verifyDoc(${d.id},'Rejected')"><i class="ph ph-x"></i> Reject</button></div></td>
            </tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-check-square" style="color:var(--primary)"></i> Document Verification';
    },
    async _verifyDoc(id, status) { await ApiService.verifyDocument(id, status); showToast(`Document ${status.toLowerCase()}`); App.navigate('doc-verification'); },

    // ===== CLERK: Courtrooms =====
    async renderCourtroomsView() {
        const rooms = await ApiService.getCourtrooms();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade"><div class="grid grid-auto">${rooms.map(r => `
            <div class="card"><div class="flex justify-between items-center mb-sm"><span class="text-sm font-semibold">${r.court_name} - ${r.room_number}</span>
                <span class="badge ${r.is_available ? 'badge-success' : 'badge-danger'}">${r.is_available ? 'Available' : 'Occupied'}</span></div>
                <div class="text-xs text-muted mb-xs"><i class="ph ph-user"></i> ${r.judge_name}</div>
                <div class="text-xs text-muted"><i class="ph ph-map-pin"></i> ${r.city} • Capacity: ${r.capacity}</div>
            </div>`).join('')}</div></div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-buildings" style="color:var(--primary)"></i> Courtroom Availability';
    },

    // ===== CLERK: Cause Lists =====
    async renderCauseListsView() {
        const lists = await ApiService.getCauseLists();
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="flex justify-between items-center mb-lg"><span></span><button class="btn btn-primary btn-sm" onclick="UI._showAddCauseList()"><i class="ph ph-upload"></i> Upload</button></div>
            <div class="table-wrap"><table><thead><tr><th>Court</th><th>Date</th><th>Cases</th><th>Uploaded By</th></tr></thead>
            <tbody>${lists.map(l => `<tr><td class="text-sm">${l.court_name}</td><td class="text-xs">${new Date(l.date).toLocaleDateString('en-IN')}</td><td>${l.total_cases}</td><td class="text-xs text-muted">${l.uploaded_by_name || '-'}</td></tr>`).join('')}</tbody></table></div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-list-numbers" style="color:var(--primary)"></i> Cause Lists';
    },
    _showAddCauseList() {
        UI._modal('Upload Cause List', `<form onsubmit="UI._submitCauseList(event)">
            <div class="form-group"><label class="label">Court ID</label><input class="input" name="court_id" type="number" required></div>
            <div class="form-group"><label class="label">Date</label><input class="input" name="date" type="date" required></div>
            <div class="form-group"><label class="label">Total Cases</label><input class="input" name="total_cases" type="number" required></div>
            <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary">Upload</button></div></form>`);
    },
    async _submitCauseList(e) { e.preventDefault(); await ApiService.createCauseList(Object.fromEntries(new FormData(e.target))); document.querySelector('.modal-overlay').remove(); showToast('Cause list uploaded!'); App.navigate('cause-lists'); },

    // ===== CLERK: Stamp Duty =====
    async renderStampDutyCalc() {
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade"><div class="card" style="max-width:500px">
            <div class="card-title mb-md"><i class="ph ph-calculator" style="color:var(--primary)"></i> Stamp Duty & Fee Calculator</div>
            <form onsubmit="UI._calcStampDuty(event)">
                <div class="form-group"><label class="label">Case Type</label><select class="input" name="case_type"><option>Property</option><option>Criminal</option><option>Civil</option><option>Family</option><option>Corporate</option></select></div>
                <div class="form-group"><label class="label">Property Value (₹)</label><input class="input" name="property_value" type="number" value="5000000"></div>
                <div class="form-group"><label class="label">State</label><select class="input" name="state"><option>Karnataka</option><option>Maharashtra</option><option>Delhi</option><option>Tamil Nadu</option><option>Telangana</option></select></div>
                <button type="submit" class="btn btn-primary" style="width:100%"><i class="ph ph-calculator"></i> Calculate</button>
            </form>
            <div id="stampResult" class="mt-lg"></div>
        </div></div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-calculator" style="color:var(--primary)"></i> Stamp Duty Calculator';
    },
    async _calcStampDuty(e) {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target)); d.property_value = parseFloat(d.property_value);
        const r = await ApiService.calculateStampDuty(d);
        document.getElementById('stampResult').innerHTML = `
            <div class="divider"></div>
            <div class="grid grid-3 text-center">
                <div><div class="text-xs text-muted">Stamp Duty (${r.dutyRate})</div><div class="text-lg font-bold text-gold">₹${r.stampDuty.toLocaleString('en-IN')}</div></div>
                <div><div class="text-xs text-muted">Court Fee</div><div class="text-lg font-bold text-info">₹${r.courtFee.toLocaleString('en-IN')}</div></div>
                <div><div class="text-xs text-muted">Total</div><div class="text-lg font-bold text-success">₹${r.total.toLocaleString('en-IN')}</div></div>
            </div>`;
    },

    // ===== CLERK: Physical Doc Tracking =====
    async renderPhysicalDocsView() {
        const docs = await ApiService.getPhysicalDocs();
        const locColors = { Court: '#7c3aed', Office: '#2563eb', Archive: '#6b7280', InTransit: '#d97706', Client: '#059669' };
        const locIcons = { Court: 'scales', Office: 'buildings', Archive: 'archive-box', InTransit: 'truck', Client: 'user' };
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <div class="page-desc"><i class="ph ph-info"></i><p>Track physical documents across courts, offices, archives, and couriers. Click on any document to view its complete journey with a detailed tracking timeline showing every handoff and location change.</p></div>
            <div class="grid grid-auto">${docs.map(d => `
                <div class="card" style="cursor:pointer;border-left:4px solid ${locColors[d.current_location] || '#6b7280'};transition:var(--transition)" onclick="UI._showDocTracking(${d.id})" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                    <div class="flex justify-between items-center mb-sm">
                        <span class="text-sm font-semibold">${d.document_name}</span>
                        <span class="badge" style="background:${locColors[d.current_location]}15;color:${locColors[d.current_location]}"><i class="ph ph-${locIcons[d.current_location] || 'map-pin'}"></i> ${d.current_location}</span>
                    </div>
                    <div class="text-xs text-muted mb-xs"><i class="ph ph-briefcase"></i> ${d.case_title || 'Case #' + d.case_id}</div>
                    <div class="text-xs text-muted mb-sm"><i class="ph ph-map-pin"></i> ${d.location_detail || '-'}</div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-muted">Updated: ${new Date(d.last_updated).toLocaleDateString('en-IN')}</span>
                        <button class="btn btn-sm btn-primary" style="padding:4px 12px;font-size:0.7rem"><i class="ph ph-path"></i> Track</button>
                    </div>
                </div>`).join('')}</div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-package" style="color:var(--primary)"></i> Physical Document Tracking';
    },

    async _showDocTracking(docId) {
        const d = await ApiService.getPhysicalDocDetail(docId);
        if (!d) { showToast('Could not load document details', 'error'); return; }

        const history = d.history || [];
        const locColors = { Court: '#7c3aed', Office: '#2563eb', Archive: '#6b7280', InTransit: '#d97706', Client: '#059669' };
        const locIcons = { Court: 'scales', Office: 'buildings', Archive: 'archive-box', InTransit: 'truck', Client: 'user' };
        const priorityColors = { Normal: '#059669', Urgent: '#d97706', Critical: '#dc2626' };

        // Calculate journey progress
        const stages = ['Client', 'Office', 'InTransit', 'Court', 'Archive'];
        const currentIdx = stages.indexOf(d.current_location);
        const totalStages = history.length;

        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <button class="btn btn-sm btn-secondary mb-lg" onclick="App.navigate('physical-docs')"><i class="ph ph-arrow-left"></i> Back to Documents</button>

            <!-- HEADER CARD -->
            <div class="card mb-lg" style="background:linear-gradient(135deg, ${locColors[d.current_location]}08, ${locColors[d.current_location]}03);border:1px solid ${locColors[d.current_location]}25;overflow:hidden;position:relative">
                <div style="position:absolute;top:-40px;right:-40px;width:140px;height:140px;background:${locColors[d.current_location]}08;border-radius:50%"></div>
                <div style="position:absolute;top:10px;right:10px;width:80px;height:80px;background:${locColors[d.current_location]}05;border-radius:50%"></div>
                <div class="flex justify-between items-start" style="position:relative;z-index:1">
                    <div>
                        <div class="flex items-center gap-sm mb-xs">
                            <h2 style="font-size:1.5rem;font-weight:800;color:var(--text-primary);margin:0">Track Document</h2>
                            <span class="badge" style="background:${priorityColors[d.priority || 'Normal']}18;color:${priorityColors[d.priority || 'Normal']};font-size:0.7rem">${d.priority || 'Normal'}</span>
                        </div>
                        <div class="text-sm text-muted" style="margin-bottom:4px">${d.document_name}</div>
                        <div class="text-xs text-muted"><i class="ph ph-briefcase"></i> ${d.case_title || 'Case #' + d.case_id} ${d.case_number ? '(' + d.case_number + ')' : ''}</div>
                        <div class="text-xs text-muted mt-xs"><i class="ph ph-tag"></i> ${d.doc_type || 'Legal Document'}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-family:monospace;font-size:0.75rem;color:var(--text-muted);letter-spacing:1px;background:var(--surface);padding:8px 14px;border-radius:var(--radius-md);border:1px dashed var(--border)">${d.barcode || 'LO-DOC-' + d.id}</div>
                        <div class="text-xs text-muted mt-xs">Doc ID: #${d.id}</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-2 mb-lg" style="gap:var(--spacing-lg)">
                <!-- CURRENT STATUS CARD -->
                <div class="card" style="border-top:4px solid ${locColors[d.current_location]}">
                    <div class="flex items-center gap-md mb-md">
                        <div style="width:52px;height:52px;border-radius:var(--radius-lg);background:${locColors[d.current_location]}15;display:flex;align-items:center;justify-content:center;position:relative">
                            <i class="ph ph-${locIcons[d.current_location]}" style="font-size:1.5rem;color:${locColors[d.current_location]}"></i>
                            <span class="doc-track-pulse" style="position:absolute;top:4px;right:4px;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid white"></span>
                        </div>
                        <div>
                            <div class="text-xs text-muted" style="text-transform:uppercase;letter-spacing:1px;font-weight:600">Current Location</div>
                            <div style="font-size:1.15rem;font-weight:700;color:${locColors[d.current_location]}">${d.current_location}</div>
                        </div>
                    </div>
                    <div style="background:var(--surface-alt);border-radius:var(--radius-md);padding:12px 16px;border:1px solid var(--border)">
                        <div class="flex items-center gap-sm"><i class="ph ph-map-pin" style="color:${locColors[d.current_location]}"></i><span class="text-sm">${d.location_detail || 'Details unavailable'}</span></div>
                    </div>
                    <div class="flex justify-between items-center mt-md text-xs text-muted">
                        <span><i class="ph ph-user"></i> Last by: ${d.tracked_by_name || 'Unknown'}</span>
                        <span><i class="ph ph-clock"></i> ${new Date(d.last_updated).toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <!-- JOURNEY SUMMARY CARD -->
                <div class="card">
                    <div class="card-title mb-md"><i class="ph ph-chart-line" style="color:var(--primary)"></i> Journey Summary</div>
                    <div class="grid grid-2" style="gap:var(--spacing-md)">
                        <div style="text-align:center;padding:12px;background:var(--primary-50);border-radius:var(--radius-md)">
                            <div style="font-size:1.5rem;font-weight:800;color:var(--primary)">${totalStages}</div>
                            <div class="text-xs text-muted">Total Stops</div>
                        </div>
                        <div style="text-align:center;padding:12px;background:var(--success-bg);border-radius:var(--radius-md)">
                            <div style="font-size:1.5rem;font-weight:800;color:var(--primary)">${history.length > 0 ? Math.ceil((new Date() - new Date(history[history.length - 1].created_at)) / 86400000) : 0}</div>
                            <div class="text-xs text-muted">Days in Transit</div>
                        </div>
                        <div style="text-align:center;padding:12px;background:var(--warning-bg);border-radius:var(--radius-md)">
                            <div style="font-size:1.5rem;font-weight:800;color:var(--warning)">${new Set(history.map(h => h.handler_name)).size}</div>
                            <div class="text-xs text-muted">Handlers</div>
                        </div>
                        <div style="text-align:center;padding:12px;background:var(--info-bg);border-radius:var(--radius-md)">
                            <div style="font-size:1.5rem;font-weight:800;color:var(--primary-dark)">${new Set(history.map(h => h.location)).size}</div>
                            <div class="text-xs text-muted">Locations</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TRACKING TIMELINE -->
            <div class="card mb-lg" style="padding:0;overflow:hidden">
                <div style="padding:20px 24px;border-bottom:1px solid var(--border);background:var(--surface-alt)">
                    <div class="card-title"><i class="ph ph-path" style="color:var(--primary)"></i> Tracking Timeline</div>
                    <div class="text-xs text-muted mt-xs">${history.length} checkpoint${history.length !== 1 ? 's' : ''} recorded</div>
                </div>
                <div style="padding:24px 24px 24px 32px">
                    ${history.length === 0 ? '<p class="text-muted text-sm text-center" style="padding:20px">No tracking history available yet.</p>' : ''}
                    ${history.map((h, i) => {
            const isFirst = i === 0;
            const isLast = i === history.length - 1;
            const dt = new Date(h.created_at);
            const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            const col = locColors[h.location] || '#6b7280';
            return `
                    <div class="doc-timeline-item animate-fade" style="display:flex;gap:20px;position:relative;padding-bottom:${isLast ? '0' : '28px'};animation-delay:${i * 0.1}s">
                        <!-- Timeline Line & Dot -->
                        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:40px">
                            <div style="width:${isFirst ? '18' : '14'}px;height:${isFirst ? '18' : '14'}px;border-radius:50%;background:${isFirst ? col : col + '30'};border:3px solid ${isFirst ? col : col + '60'};position:relative;z-index:2;flex-shrink:0;${isFirst ? 'box-shadow:0 0 0 4px ' + col + '20' : ''}">
                                ${isFirst ? `<span style="position:absolute;inset:-3px;border-radius:50%;border:2px solid ${col};animation:trackPulse 2s ease-in-out infinite"></span>` : ''}
                            </div>
                            ${!isLast ? `<div style="width:2px;flex:1;background:linear-gradient(to bottom, ${col}40, ${locColors[history[i + 1]?.location] || '#e5e7eb'}40);margin-top:4px"></div>` : ''}
                        </div>

                        <!-- Content -->
                        <div style="flex:1;padding-bottom:4px">
                            <div class="flex justify-between items-start" style="margin-bottom:4px">
                                <div>
                                    <div style="font-size:0.9rem;font-weight:700;color:${isFirst ? col : 'var(--text-primary)'}">${h.action}</div>
                                    <div class="text-xs text-muted" style="margin-top:2px">${h.notes || ''}</div>
                                </div>
                                <div style="text-align:right;flex-shrink:0;margin-left:16px">
                                    <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary)">${timeStr}</div>
                                    <div class="text-xs text-muted">${dateStr}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-md mt-sm flex-wrap" style="font-size:0.75rem">
                                <span class="flex items-center gap-xs" style="color:${col}"><i class="ph ph-${locIcons[h.location] || 'map-pin'}"></i> ${h.location_detail || h.location}</span>
                                ${h.handler_name ? `<span class="flex items-center gap-xs text-muted"><i class="ph ph-user"></i> ${h.handler_name}</span>` : ''}
                            </div>
                        </div>
                    </div>`;
        }).join('')}
                </div>
            </div>

            <!-- CURRENT LOCATION DETAIL CARD -->
            <div class="card mb-lg" style="border-left:4px solid ${locColors[d.current_location]}">
                <div class="flex items-center gap-md mb-md">
                    <div style="width:44px;height:44px;border-radius:var(--radius-md);background:${locColors[d.current_location]}12;display:flex;align-items:center;justify-content:center">
                        <i class="ph ph-map-trifold" style="font-size:1.3rem;color:${locColors[d.current_location]}"></i>
                    </div>
                    <div>
                        <div style="font-weight:700;font-size:0.95rem">Current Location Details</div>
                        <div class="text-xs text-muted">Where the document is right now</div>
                    </div>
                </div>
                <div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius-md);border:1px solid var(--border)">
                    <div class="text-sm" style="line-height:1.8">
                        <div><i class="ph ph-${locIcons[d.current_location]}" style="color:${locColors[d.current_location]};margin-right:6px"></i> <strong>${d.current_location}</strong></div>
                        <div class="text-muted">${d.location_detail || 'No additional details'}</div>
                        ${d.case_title ? `<div class="mt-xs"><i class="ph ph-briefcase" style="margin-right:6px;color:var(--primary)"></i> ${d.case_title}</div>` : ''}
                    </div>
                </div>
            </div>

            <!-- UPDATE LOCATION BUTTON -->
            <div class="flex justify-center">
                <button class="btn btn-primary" onclick="UI._showUpdateLocationModal(${d.id})" style="padding:12px 32px">
                    <i class="ph ph-map-pin-plus"></i> Update Location
                </button>
            </div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-path" style="color:var(--primary)"></i> Document Tracking';
    },

    _showUpdateLocationModal(docId) {
        UI._modal('Update Document Location', `<form onsubmit="UI._updateDocLocation(event,${docId})">
            <div class="form-group"><label class="label">New Location</label><select class="input" name="current_location">
                <option value="Office">Office</option><option value="Court">Court</option><option value="InTransit">In Transit</option>
                <option value="Archive">Archive</option><option value="Client">Client</option>
            </select></div>
            <div class="form-group"><label class="label">Location Detail</label><input class="input" name="location_detail" required placeholder="e.g. Karnataka HC Registry - Rack 12B"></div>
            <div class="flex justify-between mt-md"><button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary"><i class="ph ph-check"></i> Update</button></div>
        </form>`);
    },
    async _updateDocLocation(e, docId) {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.target));
        await ApiService.updatePhysicalDoc(docId, fd);
        document.querySelector('.modal-overlay').remove();
        showToast('Document location updated!');
        UI._showDocTracking(docId);
    },

    // ===== Filing Checklist =====
    async renderFilingChecklist(caseId) {
        if (!caseId) { const cases = await ApiService.getCases(); document.getElementById('pageContent').innerHTML = `<div class="animate-fade"><div class="card-title mb-md">Select a case</div><div class="grid grid-auto">${cases.map(c => `<div class="card" style="cursor:pointer" onclick="App.navigate('filing-checklist',${c.id})"><div class="text-sm font-semibold">${c.title}</div><div class="text-xs text-muted">${c.type}</div></div>`).join('')}</div></div>`; document.getElementById('pageTitle').innerHTML = '<i class="ph ph-clipboard-text" style="color:var(--primary)"></i> Filing Checklist'; return; }
        const data = await ApiService.getFilingChecklist(caseId);
        document.getElementById('pageContent').innerHTML = `
        <div class="animate-fade">
            <button class="btn btn-sm btn-secondary mb-md" onclick="App.navigate('filing-checklist')"><i class="ph ph-arrow-left"></i> Back</button>
            <div class="card-title mb-md">${data.caseType || ''} Case Requirements</div>
            <div class="card">${(data.checklist || []).map(c => `
                <div class="flex justify-between items-center" style="padding:10px 0;border-bottom:1px solid var(--border)">
                    <div class="flex items-center gap-sm"><i class="ph ph-${c.status === 'Verified' ? 'check-circle' : c.status === 'Pending' ? 'clock' : 'x-circle'}" style="color:${c.status === 'Verified' ? 'var(--success)' : c.status === 'Pending' ? 'var(--warning)' : 'var(--danger)'}"></i><span class="text-sm">${c.document}</span></div>
                    ${UI._badge(c.status)}
                </div>`).join('')}</div>
        </div>`;
        document.getElementById('pageTitle').innerHTML = '<i class="ph ph-clipboard-text" style="color:var(--primary)"></i> Filing Checklist';
    },
});
