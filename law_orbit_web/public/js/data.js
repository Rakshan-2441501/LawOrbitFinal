const MOCK_DATA = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@laworbit.com', password: 'password', role: 'admin' },
        { id: 2, name: 'Rajesh Kumar', email: 'rajesh@laworbit.com', password: 'password', role: 'lawyer' },
        { id: 3, name: 'Priya Sharma', email: 'priya@client.com', password: 'password', role: 'client' },
        { id: 4, name: 'Suresh Patel', email: 'suresh@laworbit.com', password: 'password', role: 'clerk' }
    ],
    cases: [
        { id: 101, title: 'Sharma vs. State of Karnataka', type: 'Criminal', status: 'Active', client: 'Priya Sharma', lawyer: 'Rajesh Kumar', lastUpdate: '2023-10-25' },
        { id: 102, title: 'Estate of Ramesh Gupta', type: 'Probate', status: 'Pending', client: 'Priya Sharma', lawyer: 'Rajesh Kumar', lastUpdate: '2023-10-20' },
        { id: 103, title: 'TechIndia Pvt Ltd Merger', type: 'Corporate', status: 'Closed', client: 'TechIndia', lawyer: 'Rajesh Kumar', lastUpdate: '2023-09-15' }
    ],
    hearings: [
        { id: 201, caseId: 101, title: 'Bail Hearing', date: '2023-11-15', time: '10:00 AM', venue: 'High Court, Bangalore' },
        { id: 202, caseId: 102, title: 'Document Verification', date: '2023-11-20', time: '02:00 PM', venue: 'Civil Court, Chamber 3B' }
    ],
    documents: [
        { id: 301, name: 'FIR Copy.pdf', type: 'PDF', size: '2.4 MB', caseId: 101, uploadedBy: 'Rajesh Kumar', date: '2023-10-01' },
        { id: 302, name: 'Witness List.docx', type: 'DOCX', size: '150 KB', caseId: 101, uploadedBy: 'Rajesh Kumar', date: '2023-10-05' },
        { id: 303, name: 'Affidavit.pdf', type: 'PDF', size: '1.2 MB', caseId: 102, uploadedBy: 'Priya Sharma', date: '2023-10-10' }
    ],
    lawyers: [
        { id: 401, name: 'Adv. Anjali Desai', specialization: 'Criminal Law', experience: '15 Years', location: 'Mumbai', rating: 4.8 },
        { id: 402, name: 'Adv. Vikram Singh', specialization: 'Corporate Law', experience: '12 Years', location: 'Delhi', rating: 4.5 },
        { id: 403, name: 'Adv. Meera Reddy', specialization: 'Family Law', experience: '8 Years', location: 'Bangalore', rating: 4.7 },
        { id: 404, name: 'Adv. Rohan Mehta', specialization: 'Intellectual Property', experience: '20 Years', location: 'Hyderabad', rating: 4.9 }
    ],
    courts: [
        { id: 501, name: 'Supreme Court of India', location: 'New Delhi', type: 'Apex Court' },
        { id: 502, name: 'Karnataka High Court', location: 'Bangalore', type: 'High Court' },
        { id: 503, name: 'Bombay High Court', location: 'Mumbai', type: 'High Court' },
        { id: 504, name: 'District Court, Pune', location: 'Pune', type: 'District Court' }
    ]
};

const DataService = {
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify(MOCK_DATA.users));
        }
        // Force refresh cases/hearings/docs if they are default to update names
        const currentCases = JSON.parse(localStorage.getItem('cases') || '[]');
        if (currentCases.length > 0 && currentCases[0].client === 'Jane Smith') {
            localStorage.setItem('cases', JSON.stringify(MOCK_DATA.cases));
            localStorage.setItem('hearings', JSON.stringify(MOCK_DATA.hearings));
            localStorage.setItem('documents', JSON.stringify(MOCK_DATA.documents));
        }

        if (!localStorage.getItem('cases')) {
            localStorage.setItem('cases', JSON.stringify(MOCK_DATA.cases));
        }
        if (!localStorage.getItem('hearings')) {
            localStorage.setItem('hearings', JSON.stringify(MOCK_DATA.hearings));
        }
        if (!localStorage.getItem('documents')) {
            localStorage.setItem('documents', JSON.stringify(MOCK_DATA.documents));
        }
        if (!localStorage.getItem('lawyers')) {
            localStorage.setItem('lawyers', JSON.stringify(MOCK_DATA.lawyers));
        }
        if (!localStorage.getItem('courts')) {
            localStorage.setItem('courts', JSON.stringify(MOCK_DATA.courts));
        }
    },

    getUsers() { return JSON.parse(localStorage.getItem('users')) || []; },
    getCases() { return JSON.parse(localStorage.getItem('cases')) || []; },
    getHearings() { return JSON.parse(localStorage.getItem('hearings')) || []; },
    getDocuments() { return JSON.parse(localStorage.getItem('documents')) || []; },
    getLawyers() { return JSON.parse(localStorage.getItem('lawyers')) || []; },
    getCourts() { return JSON.parse(localStorage.getItem('courts')) || []; },

    uploadDocument(doc) {
        const docs = this.getDocuments();
        doc.id = Date.now();
        doc.date = new Date().toISOString().split('T')[0];
        docs.push(doc);
        localStorage.setItem('documents', JSON.stringify(docs));
        return doc;
    },

    addUser(newUser) {
        const users = this.getUsers();
        newUser.id = Date.now();
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    },

    deleteUser(userId) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
    },

    addCase(newCase) {
        const cases = this.getCases();
        newCase.id = Date.now();
        cases.push(newCase);
        localStorage.setItem('cases', JSON.stringify(cases));
        return newCase;
    },

    addHearing(newHearing) {
        const hearings = this.getHearings();
        newHearing.id = Date.now();
        hearings.push(newHearing);
        localStorage.setItem('hearings', JSON.stringify(hearings));
        return newHearing;
    }
};
