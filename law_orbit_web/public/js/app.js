let currentLang = localStorage.getItem('lang') || 'en';
const translations = {
    en: { dashboard: 'Dashboard', cases: 'Cases', hearings: 'Hearings', documents: 'Documents', tasks: 'Tasks', messages: 'Messages', invoices: 'Invoices', payments: 'Payments', lawyers: 'Lawyers', settings: 'Settings', logout: 'Logout', search: 'Search...', emergency: 'Emergency Legal Help', welcome: 'Welcome back' },
    hi: { dashboard: 'डैशबोर्ड', cases: 'मामले', hearings: 'सुनवाई', documents: 'दस्तावेज़', tasks: 'कार्य', messages: 'संदेश', invoices: 'बिल', payments: 'भुगतान', lawyers: 'वकील', settings: 'सेटिंग्स', logout: 'लॉग आउट', search: 'खोजें...', emergency: 'आपातकालीन कानूनी सहायता', welcome: 'वापस स्वागत है' }
};
function t(key) { return translations[currentLang]?.[key] || translations.en[key] || key; }

// Cookie Consent
function showCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        const banner = document.getElementById('cookieBanner');
        if (banner) banner.style.display = 'flex';
    }
}
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').style.display = 'none';
    showToast('Cookies accepted. Thank you!');
}
function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieBanner').style.display = 'none';
    showToast('Essential cookies only. Some features may be limited.', 'info');
}

const App = {
    async init() {
        if (AuthService.isAuthenticated()) {
            const user = AuthService.getCurrentUser();
            UI.renderDashboard(user);
            await this.navigate('dashboard');
        } else { UI.renderLogin(); }
        setTimeout(() => showCookieConsent(), 1500);
    },
    async navigate(page, params) {
        const user = AuthService.getCurrentUser();
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div class="flex justify-center p-lg"><i class="ph ph-circle-notch animate-spin text-2xl text-muted"></i></div>';
        try {
            switch (page) {
                case 'dashboard': await UI.renderDashboardHome(user); break;
                case 'cases': await UI.renderCasesView(); break;
                case 'case-detail': await UI.renderCaseDetail(params); break;
                case 'hearings': await UI.renderHearingsView(); break;
                case 'documents': await UI.renderDocumentsView(); break;
                case 'users': if (user.role === 'admin') await UI.renderUsersView(); break;
                case 'analytics': await UI.renderAnalyticsView(); break;
                case 'revenue': await UI.renderRevenueView(); break;
                case 'audit-logs': await UI.renderAuditLogsView(); break;
                case 'compliance': await UI.renderComplianceView(); break;
                case 'backups': await UI.renderBackupsView(); break;
                case 'fraud-alerts': await UI.renderFraudAlertsView(); break;
                case 'broadcast': await UI.renderBroadcastView(); break;
                case 'rbac': await UI.renderRBACView(); break;
                case 'tasks': await UI.renderTasksView(); break;
                case 'messages': await UI.renderMessagesView(params); break;
                case 'invoices': await UI.renderInvoicesView(); break;
                case 'payments': await UI.renderPaymentsView(); break;
                case 'templates': await UI.renderTemplatesView(); break;
                case 'research': await UI.renderResearchView(params); break;
                case 'timeline': await UI.renderTimelineView(params); break;
                case 'consultations': await UI.renderConsultationsView(); break;
                case 'ratings': await UI.renderRatingsView(params); break;
                case 'search-lawyers': await UI.renderSearchLawyers(); break;
                case 'court-map': await UI.renderCourtMap(); break;
                case 'notifications': await UI.renderNotificationsView(); break;
                case 'doc-verification': await UI.renderDocVerification(); break;
                case 'courtrooms': await UI.renderCourtroomsView(); break;
                case 'cause-lists': await UI.renderCauseListsView(); break;
                case 'stamp-duty': await UI.renderStampDutyCalc(); break;
                case 'physical-docs': await UI.renderPhysicalDocsView(); break;
                case 'filing-checklist': await UI.renderFilingChecklist(params); break;
                default: await UI.renderDashboardHome(user);
            }
        } catch (err) {
            console.error('Navigation Error:', err);
            if (content) content.innerHTML = `<div class="card text-center p-lg"><i class="ph ph-warning text-2xl text-danger mb-md"></i><p class="text-muted">Something went wrong. Please try again.</p><button class="btn btn-secondary btn-sm mt-md" onclick="App.navigate('dashboard')"><i class="ph ph-arrow-left"></i> Go Home</button></div>`;
        }
        document.querySelectorAll('.bottom-nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.dataset.page === page) el.classList.add('active');
        });
    }
};

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="ph ph-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => App.init());
