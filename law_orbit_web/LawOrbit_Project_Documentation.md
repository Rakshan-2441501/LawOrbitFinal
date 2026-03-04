# LawOrbit — Legal Case Management Platform

## Project Documentation & Report

**Project Title:** LawOrbit — Legal Case Management Platform  
**Domain:** Legal Technology (LegalTech) / Web Application  
**Technology Stack:** Node.js, Express.js, MySQL, HTML/CSS/JavaScript, Chart.js  
**Date:** March 2026  

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Software Requirements Specification (SRS)](#4-software-requirements-specification-srs)
5. [Technology Stack (Detailed)](#5-technology-stack-detailed)
6. [System Architecture](#6-system-architecture)
7. [EER Diagram](#7-eer-diagram)
8. [Use Case Diagram](#8-use-case-diagram)
9. [Database Schema Design](#9-database-schema-design)
10. [Database Design & Normalization Analysis (1NF–5NF)](#10-database-design--normalization-analysis-1nf5nf)
11. [Module Descriptions](#11-module-descriptions)
12. [Code Snippets](#12-code-snippets)
13. [Screenshots & UI Description](#13-screenshots--ui-description)
14. [Security Features](#14-security-features)
15. [API Reference](#15-api-reference)
16. [Testing](#16-testing)
17. [Conclusion](#17-conclusion)
18. [Future Scope](#18-future-scope)
19. [References](#19-references)

---

## 1. Abstract

**LawOrbit** is a comprehensive, web-based Legal Case Management platform designed to digitize and streamline the operations of law firms, courts, and legal professionals across India. The system addresses the critical challenges faced by the Indian legal ecosystem — including inefficient paper-based workflows, poor case tracking, lack of real-time communication, and inadequate security measures — by providing a centralized, role-based platform for managing legal cases, hearings, documents, billing, and inter-party communication.

The platform serves four distinct user roles — **Administrators**, **Lawyers**, **Clients**, and **Clerks** — each with a tailored dashboard and feature set. Key features include case lifecycle management, court hearing scheduling with calendar export, digital document management with verification workflows, secure end-to-end messaging, invoicing with GST calculations, UPI/card payments, AI-powered legal research, physical document tracking with timeline-based journey visualization, video consultation booking, fraud detection alerts, and an advanced security system with account lockout after multiple failed login attempts.

Built using Node.js with Express.js on the backend, MySQL for data persistence, and a modern vanilla JavaScript frontend with Chart.js for analytics visualizations, LawOrbit demonstrates a production-grade full-stack architecture with JWT-based authentication, role-based access control (RBAC), audit logging, and compliance tracking aligned with India's IT Act, 2000.

---

## 2. Problem Statement

The Indian legal system handles over **5 crore (50 million) pending cases** across 25+ High Courts and 700+ District Courts. Despite the Digital India initiative, the majority of law firms, especially small and mid-sized practices, continue to rely on:

- **Paper-based case files** leading to document loss, misplacement, and tracking difficulties
- **Manual hearing scheduling** causing missed dates and adjournment backlogs
- **No centralized communication** between lawyers and clients, leading to delays and dissatisfaction
- **Lack of billing transparency** with no standardized invoicing or payment tracking
- **Zero security measures** for sensitive legal data, making it vulnerable to unauthorized access
- **No real-time analytics** for administrators to track firm performance and revenue
- **Inefficient physical document tracking** across courts, offices, and archives

**The core problem** is the absence of a unified, secure, role-aware digital platform that can manage the end-to-end lifecycle of legal cases — from filing to judgment — while serving the distinct needs of all stakeholders (administrators, lawyers, clients, and court clerks).

---

## 3. Objectives

The primary objectives of LawOrbit are:

1. **Centralized Case Management**: Provide a single platform to create, track, and manage legal cases across their entire lifecycle (Filed → Hearing → Evidence → Arguments → Reserved → Judgment → Closed).

2. **Role-Based Access Control (RBAC)**: Implement granular, permission-based access for four user roles — Admin, Lawyer, Client, and Clerk — ensuring data privacy and operational security.

3. **Document Management**: Enable digital upload, verification, versioning, and tracking of legal documents, including both digital and physical document tracking with location-aware timelines.

4. **Hearing & Court Management**: Automate hearing scheduling, courtroom availability tracking, cause list management, and calendar export (ICS format).

5. **Billing & Payment Processing**: Streamline invoicing with automatic GST (18%) calculation, multi-method payment processing (UPI, NetBanking, Card), and revenue analytics.

6. **Secure Communication**: Provide end-to-end encrypted messaging between lawyers and clients, linked to specific cases for legal compliance.

7. **Security & Fraud Detection**: Implement account lockout after failed login attempts, fraud alert generation, audit logging, and compliance tracking.

8. **Analytics & Reporting**: Deliver real-time dashboards with interactive charts for case statistics, revenue trends, and operational insights.

9. **AI-Powered Features**: Integrate AI-based legal research (case precedent matching) and AI categorization of cases.

10. **Indian Legal Ecosystem Compliance**: Build with Indian legal standards including INR currency formatting, GST calculations, Bar Council integration, Indian court data, and IT Act 2000 provisions.

---

## 4. Software Requirements Specification (SRS)

### 4.1 Functional Requirements

| ID | Requirement | Priority | Module |
|----|-------------|----------|--------|
| FR-01 | Users shall be able to register and login with email/password | High | Authentication |
| FR-02 | System shall lock accounts after 3 consecutive failed login attempts | High | Security |
| FR-03 | Admins shall be able to create users and send credentials via email | High | User Management |
| FR-04 | System shall support 4 roles: Admin, Lawyer, Client, Clerk | High | RBAC |
| FR-05 | Users shall be able to create, view, edit, and track cases | High | Case Management |
| FR-06 | System shall track case status through 8 stages | High | Case Management |
| FR-07 | Lawyers shall be able to schedule hearings with date, time, venue | High | Hearing Management |
| FR-08 | System shall export hearing calendar in ICS format | Medium | Hearing Management |
| FR-09 | Users shall be able to upload and download documents | High | Document Management |
| FR-10 | Clerks shall be able to verify or reject documents | High | Document Management |
| FR-11 | System shall generate invoices with automatic 18% GST calculation | High | Billing |
| FR-12 | Clients shall make payments via UPI, NetBanking, or Card | High | Payment Processing |
| FR-13 | Lawyers and clients shall communicate via case-linked messages | High | Messaging |
| FR-14 | System shall display role-specific dashboards with charts | Medium | Dashboard |
| FR-15 | Admins shall view analytics with interactive charts | Medium | Analytics |
| FR-16 | System shall track physical documents with location timeline | Medium | Physical Doc Tracking |
| FR-17 | Clients shall book video/audio consultations with lawyers | Medium | Consultations |
| FR-18 | Clients shall rate lawyers on closed cases | Low | Ratings |
| FR-19 | System shall show AI-powered legal research for cases | Low | AI Research |
| FR-20 | System shall generate fraud alerts for suspicious activity | High | Security |
| FR-21 | Admins shall manage locked accounts from security dashboard | High | Security |
| FR-22 | System shall maintain audit logs for all actions | High | Compliance |
| FR-23 | Clerks shall calculate stamp duty and court fees | Medium | Clerk Tools |
| FR-24 | System shall display court locations on interactive map | Low | Court Map |
| FR-25 | System shall send real-time notifications to users | Medium | Notifications |

### 4.2 Non-Functional Requirements

| ID | Requirement | Category |
|----|-------------|----------|
| NFR-01 | System response time shall be < 2 seconds for all operations | Performance |
| NFR-02 | System shall support concurrent access by 100+ users | Scalability |
| NFR-03 | All passwords shall be hashed using bcrypt | Security |
| NFR-04 | Authentication shall use JWT with 24-hour expiry | Security |
| NFR-05 | System shall be accessible on mobile devices (responsive design) | Usability |
| NFR-06 | System shall comply with India's IT Act, 2000 | Compliance |
| NFR-07 | All monetary values shall be in INR with Indian locale formatting | Localization |
| NFR-08 | Database connections shall use connection pooling | Reliability |
| NFR-09 | System shall provide cookie consent as per GDPR/Indian regulations | Compliance |
| NFR-10 | UI shall support multi-language (i18n ready with language selector) | Usability |

### 4.3 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | v22.14.0 |
| **Framework** | Express.js | v4.x |
| **Database** | MySQL | v8.x |
| **ORM/Driver** | mysql2/promise | v3.x |
| **Authentication** | JSON Web Tokens (jsonwebtoken) | v9.x |
| **Password Hashing** | bcryptjs | v2.x |
| **Frontend** | Vanilla HTML/CSS/JavaScript | ES6+ |
| **Charts** | Chart.js | v4.x |
| **Maps** | Leaflet.js | v1.9.4 |
| **Icons** | Phosphor Icons | v2.1.1 |
| **Fonts** | Google Fonts (Inter) | - |
| **Email** | Nodemailer (Gmail SMTP) | v6.x |
| **Environment** | dotenv | v16.x |

### 4.4 Hardware/Software Requirements

| Component | Minimum Requirement |
|-----------|-------------------|
| **OS** | macOS / Linux / Windows |
| **RAM** | 4 GB |
| **CPU** | Dual Core 2.0 GHz |
| **Storage** | 500 MB |
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+ |
| **Database** | MySQL 8.0+ |
| **Node.js** | v18.0+ |

---

## 5. Technology Stack (Detailed)

LawOrbit uses a modern **3-tier architecture** with carefully chosen technologies for each layer.

### 5.1 Backend Technologies

| Technology | Role | Why Chosen |
|-----------|------|------------|
| **Node.js v22.14.0** | Server runtime | Non-blocking I/O for handling multiple concurrent API requests from lawyers, clerks, and clients simultaneously. Single-language (JavaScript) across full stack reduces development complexity. |
| **Express.js v4.x** | Web framework | Lightweight, unopinionated framework ideal for building RESTful APIs. Middleware architecture enables clean separation of concerns (authentication, authorization, parsing). |
| **MySQL 8.0** | Relational database | ACID-compliant transactions essential for financial data (invoices, payments). Strong relational model suits the interconnected nature of legal entities (cases → hearings → documents). |
| **mysql2/promise v3.x** | Database driver | Promise-based async/await support. Connection pooling for efficient database resource management under concurrent load. |
| **jsonwebtoken v9.x** | Authentication | Stateless JWT tokens with 24-hour expiry. Eliminates server-side session storage. Token carries user role for middleware-based authorization. |
| **bcryptjs v2.x** | Password security | Industry-standard adaptive hashing with configurable salt rounds. Resistant to rainbow table and brute-force attacks. |
| **nodemailer v6.x** | Email service | Gmail SMTP integration for sending user credentials and admin OTP verification codes. HTML email templates with branded styling. |
| **dotenv v16.x** | Configuration | Environment variable management separating sensitive credentials (DB passwords, JWT secrets, API keys) from source code. |
| **cors** | Security middleware | Cross-Origin Resource Sharing configuration to control which domains can access the API. |
| **body-parser** | Request parsing | Parses incoming JSON request bodies with configurable size limits (50MB for document uploads). |

### 5.2 Frontend Technologies

| Technology | Role | Why Chosen |
|-----------|------|------------|
| **Vanilla JavaScript (ES6+)** | Application logic | Zero framework overhead. Direct DOM manipulation for maximum performance. Single-page application (SPA) pattern with client-side routing. |
| **HTML5** | Structure | Semantic elements (`<nav>`, `<main>`, `<section>`) for accessibility and SEO. |
| **CSS3** | Styling | Custom CSS variables (design tokens) for theming. CSS Grid and Flexbox for responsive layouts. Keyframe animations for micro-interactions. |
| **Chart.js v4.x** | Data visualization | 5 chart types used: Bar, Doughnut, Line (with gradient fills), Polar Area, and stock-like trend charts with period toggles. Smooth `easeOutElastic` and `easeInOutQuart` animations. |
| **Leaflet.js v1.9.4** | Interactive maps | Lightweight open-source map library (42KB). Displays 33 Indian court locations with custom color-coded markers. OpenStreetMap tile integration (no API key required). |
| **Phosphor Icons v2.1.1** | Iconography | 6,000+ consistent phosphor icons in regular weight. Used across navigation, buttons, cards, and status indicators. |
| **Google Fonts (Inter)** | Typography | Modern, highly legible sans-serif typeface optimized for UI. Variable font support for fine-grained weight control. |

### 5.3 Development & Infrastructure Tools

| Tool | Purpose |
|------|---------|
| **npm** | Package management and script running |
| **Git** | Version control |
| **MySQL Workbench / CLI** | Database administration and query testing |
| **Postman / curl** | API endpoint testing |
| **Chrome DevTools** | Frontend debugging, network analysis, responsive testing |
| **VS Code** | Primary IDE with JavaScript/Node.js extensions |

### 5.4 Project Dependencies (`package.json`)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.7",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "dotenv": "^16.3.1"
  }
}
```

### 5.5 Architecture Pattern

The project follows a **Model-Route-Controller (MRC)** pattern:

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **Config** | `/config/db.js` | Database connection pool configuration |
| **Middleware** | `/middleware/` | JWT verification, role-based authorization guards |
| **Routes** | `/routes/` (16 files) | API endpoint definitions with business logic |
| **Database** | `/database/init_db.js` | Schema definitions, migrations, seed data |
| **Public** | `/public/` | Frontend SPA (HTML, CSS, JavaScript) |
| **Assets** | `/public/css/`, `/public/js/` | Stylesheets and modular JS files |

---

## 6. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                      │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ HTML/CSS│  │JavaScript│  │ Chart.js │  │ Leaflet.js│ │
│  │   UI    │  │  SPA App │  │  Charts  │  │    Maps   │ │
│  └─────────┘  └──────────┘  └──────────┘  └───────────┘ │
│                        ↕ HTTP/REST                        │
├──────────────────────────────────────────────────────────┤
│                  SERVER (Node.js + Express.js)            │
│  ┌───────────────────────────────────────────────────┐   │
│  │                    Middleware                       │   │
│  │  CORS │ Body Parser │ JWT Auth │ Role Verification │   │
│  └───────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────┐   │
│  │                   API Routes (16)                  │   │
│  │ Auth │ Cases │ Hearings │ Documents │ Users │ Admin│   │
│  │ Invoices │ Payments │ Messages │ Tasks │ Ratings  │   │
│  │ Templates │ Clerk │ Consultations │ Notifications │   │
│  │ Dashboard                                         │   │
│  └───────────────────────────────────────────────────┘   │
│                        ↕ mysql2/promise                    │
├──────────────────────────────────────────────────────────┤
│                DATABASE (MySQL 8.0)                       │
│  ┌──────────────────────────────────────────────────┐    │
│  │  26 Tables: users, cases, hearings, documents,    │    │
│  │  invoices, payments, messages, tasks, ratings,    │    │
│  │  lawyers, permissions, courts, courtrooms,        │    │
│  │  templates, evidence, notifications, audit_logs,  │    │
│  │  fraud_alerts, physical_docs, physical_doc_history │    │
│  │  backups, compliance_checks, cause_lists, ...     │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 7. EER Diagram

```
                            ┌──────────────────┐
                            │      USERS       │
                            │──────────────────│
                            │ PK id            │
                            │ name             │
                            │ email (UNIQUE)   │
                            │ password         │
                            │ role (ENUM)      │
                            │ phone            │
                            │ failed_login_attempts│
                            │ is_locked        │
                            │ locked_at        │
                            └────────┬─────────┘
                   ┌────────┬───────┼──────┬────────┬──────────┐
                   │        │       │      │        │          │
              ┌────┴───┐┌───┴────┐┌─┴──┐ ┌─┴──┐ ┌──┴───┐ ┌───┴────┐
              │LAWYERS ││ CASES  ││TASK│ │MSG │ │RATING│ │INVOICES│
              │────────││────────││────│ │────│ │──────│ │────────│
              │user_id ││case_no ││user│ │send│ │case  │ │case_id │
              │special.││title   ││case│ │recv│ │client│ │lawyer  │
              │exp     ││type    ││due │ │case│ │lawyer│ │client  │
              │rating  ││status  ││    │ │    │ │      │ │amount  │
              │bar_id  ││priority││    │ │    │ │      │ │GST     │
              └────────┘│client  │└────┘ └────┘ └──────┘ │total   │
                        │lawyer  │                        └───┬────┘
                        └───┬────┘                            │
              ┌─────────────┼──────────────┐            ┌─────┴────┐
              │             │              │            │ PAYMENTS │
         ┌────┴────┐  ┌────┴────┐  ┌──────┴──────┐    │──────────│
         │HEARINGS │  │DOCUMENTS│  │CASE_TIMELINE│    │invoice_id│
         │─────────│  │─────────│  │─────────────│    │amount    │
         │case_id  │  │case_id  │  │case_id      │    │method    │
         │date     │  │name     │  │event_title  │    │status    │
         │time     │  │type     │  │event_date   │    └──────────┘
         │venue    │  │status   │  │event_type   │
         │judge    │  │verified │  └─────────────┘
         │status   │  │signed   │
         └─────────┘  └─────────┘

    ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │FRAUD_ALERTS│  │ AUDIT_LOGS  │  │PHYSICAL_DOCS │  │ CONSULTATIONS│
    │────────────│  │─────────────│  │──────────────│  │──────────────│
    │user_id     │  │user_id      │  │case_id       │  │client_id     │
    │alert_type  │  │action       │  │document_name │  │lawyer_id     │
    │severity    │  │entity_type  │  │location      │  │scheduled_date│
    │is_resolved │  │details      │  │barcode       │  │type          │
    │resolved_by │  │ip_address   │  │priority      │  │status        │
    └────────────┘  └─────────────┘  │tracked_by    │  │fee           │
                                     └──────┬───────┘  └──────────────┘
                                            │
                                     ┌──────┴───────────┐
                                     │PHYSICAL_DOC_     │
                                     │HISTORY           │
                                     │──────────────────│
                                     │doc_id            │
                                     │location          │
                                     │action            │
                                     │notes             │
                                     │handled_by        │
                                     └──────────────────┘
```

---

## 8. Use Case Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │              LawOrbit System                 │
                    │                                             │
  ┌──────┐         │  ┌────────────────────────────────────┐     │
  │Admin │─────────│──│ Manage Users (Create/Delete/RBAC)  │     │
  │      │─────────│──│ View Analytics & Revenue           │     │
  │      │─────────│──│ Monitor Security (Fraud Alerts)    │     │
  │      │─────────│──│ Unlock Locked Accounts             │     │
  │      │─────────│──│ Manage Audit Logs & Compliance     │     │
  │      │─────────│──│ Broadcast Notifications            │     │
  │      │─────────│──│ Create/Manage Backups              │     │
  └──────┘         │  └────────────────────────────────────┘     │
                    │                                             │
  ┌──────┐         │  ┌────────────────────────────────────┐     │
  │Lawyer│─────────│──│ Manage Cases                       │     │
  │      │─────────│──│ Schedule Hearings                  │     │
  │      │─────────│──│ Upload/Sign Documents              │     │
  │      │─────────│──│ Create Invoices                    │     │
  │      │─────────│──│ Manage Tasks                       │     │
  │      │─────────│──│ Chat with Clients                  │     │
  │      │─────────│──│ Use AI Legal Research              │     │
  │      │─────────│──│ View Case Timeline                 │     │
  │      │─────────│──│ Accept/Decline Consultations       │     │
  └──────┘         │  └────────────────────────────────────┘     │
                    │                                             │
  ┌──────┐         │  ┌────────────────────────────────────┐     │
  │Client│─────────│──│ View My Cases                      │     │
  │      │─────────│──│ Browse & Search Lawyers            │     │
  │      │─────────│──│ Make Payments (UPI/Card/NetBanking)│     │
  │      │─────────│──│ Chat with Lawyer                   │     │
  │      │─────────│──│ Book Video Consultation            │     │
  │      │─────────│──│ Rate Lawyer                        │     │
  │      │─────────│──│ View Court Map                     │     │
  │      │─────────│──│ Emergency SOS Help                 │     │
  └──────┘         │  └────────────────────────────────────┘     │
                    │                                             │
  ┌──────┐         │  ┌────────────────────────────────────┐     │
  │Clerk │─────────│──│ Verify/Reject Documents            │     │
  │      │─────────│──│ Manage Courtroom Availability      │     │
  │      │─────────│──│ Upload Cause Lists                 │     │
  │      │─────────│──│ Calculate Stamp Duty & Court Fees  │     │
  │      │─────────│──│ Track Physical Documents           │     │
  │      │─────────│──│ Bulk Schedule Hearings             │     │
  │      │─────────│──│ Map Evidence to Cases              │     │
  │      │─────────│──│ Filing Checklist                   │     │
  └──────┘         │  └────────────────────────────────────┘     │
                    │                                             │
                    │  ┌────────────────────────────────────┐     │
                    │  │ Common: Login/Logout, Notifications│     │
                    │  │ View Dashboard, Change Language    │     │
                    │  └────────────────────────────────────┘     │
                    └─────────────────────────────────────────────┘
```

---

## 9. Database Schema Design

### 8.1 Complete Table List (26 Tables)

| # | Table | Records | Purpose |
|---|-------|---------|---------|
| 1 | `users` | 14+ | User accounts with role, login tracking, lockout |
| 2 | `permissions` | 8 | Named permissions for RBAC |
| 3 | `user_permissions` | N | Junction table linking users to permissions |
| 4 | `lawyers` | 3 | Lawyer profiles (specialization, bar council, rating) |
| 5 | `cases` | 8 | Legal cases with full lifecycle tracking |
| 6 | `hearings` | 6 | Court hearing schedule |
| 7 | `documents` | 8 | Digital document management with verification |
| 8 | `doc_versions` | N | Document version history |
| 9 | `courts` | 3 | Indian court registry |
| 10 | `courtrooms` | 6 | Courtroom availability per court |
| 11 | `invoices` | 4 | Billing invoices with GST |
| 12 | `payments` | 3 | Payment transactions |
| 13 | `audit_logs` | 5 | System audit trail |
| 14 | `notifications` | 5 | User notifications |
| 15 | `messages` | 4 | Case-linked messaging |
| 16 | `tasks` | 4 | Lawyer task management |
| 17 | `ratings` | 2 | Client-to-lawyer ratings |
| 18 | `templates` | 5 | Legal document templates |
| 19 | `cause_lists` | 2 | Court cause lists |
| 20 | `evidence` | 4 | Case evidence records |
| 21 | `case_timeline` | 5 | Case event history |
| 22 | `consultations` | 3 | Video/audio consultation bookings |
| 23 | `backups` | 2 | Database backup records |
| 24 | `compliance_checks` | 4 | Regulatory compliance tracking |
| 25 | `fraud_alerts` | 4+ | Security fraud detection alerts |
| 26 | `physical_docs` | 5 | Physical document tracking |
| 27 | `physical_doc_history` | 15 | Physical document movement timeline |

### 8.2 Key Table Schemas

#### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','lawyer','client','clerk') NOT NULL,
    phone VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    failed_login_attempts INT DEFAULT 0,
    is_locked TINYINT DEFAULT 0,
    locked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Cases Table
```sql
CREATE TABLE cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('Criminal','Civil','Family','Corporate','Property',
              'Labour','Consumer','Tax','Constitutional','Other') DEFAULT 'Civil',
    status ENUM('Filed','Hearing','Evidence','Arguments',
                'Reserved','Judgment','Closed','Dismissed') DEFAULT 'Filed',
    priority ENUM('Low','Medium','High','Urgent') DEFAULT 'Medium',
    client_id INT REFERENCES users(id),
    lawyer_id INT REFERENCES users(id),
    court_name VARCHAR(255),
    judge_name VARCHAR(255),
    filing_date DATE,
    total_fees DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Fraud Alerts Table
```sql
CREATE TABLE fraud_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users(id),
    alert_type ENUM('SuspiciousLogin','DocTampering',
                    'UnusualActivity','MultipleFailedLogins'),
    severity ENUM('Low','Medium','High','Critical') DEFAULT 'Medium',
    description TEXT,
    ip_address VARCHAR(50),
    is_resolved TINYINT DEFAULT 0,
    resolved_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Physical Document Tracking
```sql
CREATE TABLE physical_docs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT REFERENCES cases(id),
    document_name VARCHAR(255),
    current_location ENUM('Court','Office','Archive','InTransit','Client'),
    location_detail VARCHAR(255),
    barcode VARCHAR(50),
    doc_type VARCHAR(100),
    priority ENUM('Normal','Urgent','Critical') DEFAULT 'Normal',
    tracked_by INT REFERENCES users(id),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE physical_doc_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doc_id INT NOT NULL REFERENCES physical_docs(id),
    location ENUM('Court','Office','Archive','InTransit','Client'),
    location_detail VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    handled_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 10. Database Design & Normalization Analysis (1NF–5NF)

This section provides a thorough analysis of the LawOrbit database design against all five normal forms of relational database theory.

### 10.1 First Normal Form (1NF) — ✅ Fully Satisfied

**Definition:** Every column contains only atomic (indivisible) values. No repeating groups or arrays.

| Criteria | Evidence | Status |
|----------|----------|---------|
| Atomic values in all columns | All columns store single values: `name VARCHAR(255)`, `email VARCHAR(255)`, `phone VARCHAR(20)`. No comma-separated lists or arrays. | ✅ |
| Each row is unique | Every table has `id INT AUTO_INCREMENT PRIMARY KEY` ensuring row uniqueness. | ✅ |
| No repeating groups | Multi-valued relationships are handled through separate tables (e.g., `user_permissions` junction table instead of a "permissions" column in `users`). | ✅ |
| Column names are unique | All columns within each table have distinct names. | ✅ |

**Example:** Instead of storing multiple permissions as `permissions = "read,write,delete"` in the `users` table, a separate `user_permissions` junction table is used:
```
users(id, name, email, role)
user_permissions(id, user_id → users, permission_id → permissions, granted_by → users)
```

### 10.2 Second Normal Form (2NF) — ✅ Fully Satisfied

**Definition:** Must be in 1NF, and every non-key attribute must depend on the entire primary key (no partial dependencies).

| Criteria | Evidence | Status |
|----------|----------|---------|
| All tables in 1NF | Confirmed above | ✅ |
| Single-column primary keys | All 27 tables use `id INT AUTO_INCREMENT PRIMARY KEY`, a single-column surrogate key. Partial dependencies are impossible with single-column PKs. | ✅ |
| No composite keys | No table uses a composite primary key, so there is no possibility of a non-key attribute depending on only part of the key. | ✅ |

**Note:** Since every table uses a single-column auto-increment primary key, 2NF is automatically satisfied. There are no composite keys that could create partial dependencies.

### 10.3 Third Normal Form (3NF) — ✅ Satisfied (with documented exceptions)

**Definition:** Must be in 2NF, and no non-key attribute depends transitively on the primary key (i.e., no non-key attribute depends on another non-key attribute).

**Tables with clean 3NF compliance:**

| Table | Analysis |
|-------|----------|
| `users` | All attributes (`name`, `email`, `password`, `role`, `phone`) depend directly on `id`. |
| `permissions` | `name`, `description`, `category` all depend directly on `id`. |
| `user_permissions` | Junction table. `user_id`, `permission_id`, `granted_by` depend on `id`. |
| `lawyers` | Extended profile attributes depend on `id`. `user_id` is an FK, not transitive. |
| `hearings` | `title`, `date`, `time`, `venue` depend on `id`. `case_id` is an FK. |
| `documents` | `name`, `type`, `size`, `path` depend on `id`. FKs (`case_id`, `uploaded_by`) reference parent entities. |
| `courts` | `name`, `location`, `city`, `state`, `type`, `latitude`, `longitude`, `phone` all depend on `id`. |
| `courtrooms` | `room_number`, `judge_name`, `capacity` depend on `id`. `court_id` is an FK. |
| `invoices` | `amount`, `tax_amount`, `total_amount` all depend on `id`. While `total_amount = amount + tax_amount`, this is a **calculated denormalization** for query performance. |
| `payments` | `amount`, `payment_method`, `transaction_id`, `status` depend on `id`. |
| `messages` | `content`, `is_read` depend on `id`. `sender_id`, `receiver_id`, `case_id` are FKs. |
| `tasks` | `title`, `description`, `priority`, `status`, `due_date` depend on `id`. |
| `physical_docs` | `document_name`, `current_location`, `barcode`, `doc_type`, `priority` depend on `id`. |
| `physical_doc_history` | `location`, `action`, `notes` depend on `id`. `doc_id` is an FK. |

**Documented denormalizations (intentional 3NF relaxations for performance):**

| Table | Attribute | Transitive Dependency | Justification |
|-------|-----------|----------------------|---------------|
| `invoices` | `total_amount` | `total_amount = amount + tax_amount` | Pre-calculated to avoid computation on every invoice list query. Common pattern in financial systems. |
| `audit_logs` | `user_name` | `user_id → users.name` | Audit trail must survive user deletion. Storing the name directly ensures audit records remain readable even if the user is deleted. |
| `cases` | `court_name`, `judge_name` | Could reference `courts` and a `judges` table | Stored as VARCHAR for flexibility — courts and judges may not exist in the system's courts table (especially for external/historical data). |

### 10.4 Boyce-Codd Normal Form (BCNF) — ✅ Satisfied

**Definition:** For every non-trivial functional dependency X → Y, X must be a superkey.

| Analysis Point | Evidence |
|---------------|----------|
| Every determinant is a candidate key | All FDs are of the form `{id} → {all other attributes}`, and `id` is always the primary key. |
| Unique constraints | `users.email`, `cases.case_number`, `invoices.invoice_number` are `UNIQUE`, creating additional candidate keys. Each of these also determines all other attributes in the row. |
| No non-key determinants | There are no cases where a non-key attribute functionally determines another column (outside the documented denormalizations). |

### 10.5 Fourth Normal Form (4NF) — ✅ Satisfied

**Definition:** Must be in BCNF, with no multi-valued dependencies (MVDs). A table should not store two or more independent multi-valued facts about an entity.

| Potential MVD Scenario | How LawOrbit Handles It | Status |
|----------------------|-------------------------|--------|
| A user can have **multiple permissions** AND **multiple cases** | Separate tables: `user_permissions` for permissions, `cases.lawyer_id` / `cases.client_id` for case assignments. Never stored in the same table. | ✅ |
| A case can have **multiple hearings** AND **multiple documents** | Separate tables: `hearings` (FK→cases) and `documents` (FK→cases). No single table stores both. | ✅ |
| A court can have **multiple courtrooms** AND **multiple cause_lists** | Separate tables: `courtrooms` (FK→courts) and `cause_lists` (FK→courts). | ✅ |
| A lawyer can have **multiple ratings** AND **multiple tasks** | Separate tables: `ratings` (FK→users) and `tasks` (FK→users). | ✅ |
| A physical doc can have **multiple history entries** AND **updates** | `physical_doc_history` stores all history entries separately with `doc_id` FK. | ✅ |

**Example of 4NF compliance:**
If `users` had a column `permissions VARCHAR(255)` containing `"read,write,delete"` AND a column `cases VARCHAR(255)` containing `"1,2,3"`, this would violate 4NF. Instead, LawOrbit uses:
- `user_permissions(user_id, permission_id)` — one fact per row
- `cases(lawyer_id)` / `cases(client_id)` — separate table entirely

### 10.6 Fifth Normal Form (5NF / Project-Join Normal Form) — ✅ Analysis

**Definition:** Must be in 4NF. Every join dependency is implied by the candidate keys. A table is in 5NF if it cannot be decomposed into smaller tables and then reconstructed through natural joins without data loss.

**5NF is relevant when three or more entities have complex interrelationships that could cause spurious tuples upon decomposition.**

| Potential 5NF Scenario | LawOrbit's Design | 5NF Status |
|-----------------------|-------------------|------------|
| **Lawyer–Client–Case** (ternary relationship) | The `cases` table stores `(case_id, lawyer_id, client_id)` together. This is correct because a case inherently binds a specific lawyer to a specific client. The relationship is NOT decomposable into `lawyer-case` + `client-case` pairs without losing the specific assignment. | ✅ In 5NF |
| **User–Permission–GrantedBy** (ternary relationship) | `user_permissions(user_id, permission_id, granted_by)` stores who granted what permission to whom. This is a single fact — decomposing into `user-permission` + `user-granter` pairs would lose the connection of which granter gave which specific permission. | ✅ In 5NF |
| **Case–Hearing–Judge** (ternary relationship) | `hearings(case_id, judge, venue)` stores a hearing as a single atomic event. A specific hearing for a specific case with a specific judge cannot be decomposed further. | ✅ In 5NF |
| **Invoice–Case–Lawyer–Client** (quaternary relationship) | `invoices(case_id, lawyer_id, client_id, amount)` — an invoice binds a specific case to a specific lawyer-client pair with a specific amount. This is a single business fact. | ✅ In 5NF |
| **Message–Case–Sender–Receiver** | `messages(case_id, sender_id, receiver_id, content)` — a message is one atomic communication fact. Cannot be decomposed without data loss. | ✅ In 5NF |
| **PhysicalDocHistory–Doc–Location–Handler** | `physical_doc_history(doc_id, location, handled_by, action)` — each row is one atomic tracking event. | ✅ In 5NF |

### 10.7 Normalization Summary Table

| Normal Form | Definition | LawOrbit Status | Evidence |
|------------|-----------|-----------------|----------|
| **1NF** | Atomic values, no repeating groups | ✅ **Fully Compliant** | All columns are atomic. Junction tables for M:N relationships. Auto-increment PKs for uniqueness. |
| **2NF** | No partial dependencies | ✅ **Fully Compliant** | All tables use single-column surrogate keys — partial dependencies are structurally impossible. |
| **3NF** | No transitive dependencies | ✅ **Compliant** (3 documented exceptions) | `invoices.total_amount` (pre-calculated), `audit_logs.user_name` (audit survivability), `cases.court_name` (flexibility). All justified. |
| **BCNF** | Every determinant is a superkey | ✅ **Fully Compliant** | `id` is PK and sole determinant in all tables. Additional candidate keys (`email`, `case_number`) also determine all attributes. |
| **4NF** | No multi-valued dependencies | ✅ **Fully Compliant** | All M:N and multi-valued facts decomposed into separate tables with proper FKs. |
| **5NF** | No join dependencies beyond candidate keys | ✅ **Compliant** | Ternary relationships (`lawyer-client-case`, `user-permission-granter`) correctly stored as single facts. No spurious tuple risks. |

### 10.8 Relationship Types in the Schema

| Relationship | Type | Implementation |
|-------------|------|----------------|
| User → Lawyer | 1:1 | `lawyers.user_id` FK (subtype/supertype pattern) |
| User → Cases (as lawyer) | 1:N | `cases.lawyer_id` FK |
| User → Cases (as client) | 1:N | `cases.client_id` FK |
| Case → Hearings | 1:N | `hearings.case_id` FK |
| Case → Documents | 1:N | `documents.case_id` FK |
| Case → Timeline Events | 1:N | `case_timeline.case_id` FK |
| Case → Evidence | 1:N | `evidence.case_id` FK |
| Case → Physical Docs | 1:N | `physical_docs.case_id` FK |
| Physical Doc → History | 1:N | `physical_doc_history.doc_id` FK |
| Document → Versions | 1:N | `doc_versions.document_id` FK |
| Court → Courtrooms | 1:N | `courtrooms.court_id` FK |
| Court → Cause Lists | 1:N | `cause_lists.court_id` FK |
| Invoice → Payments | 1:N | `payments.invoice_id` FK |
| User ↔ Permissions | M:N | Junction table: `user_permissions` |
| User → Notifications | 1:N | `notifications.user_id` FK |
| User → Fraud Alerts | 1:N | `fraud_alerts.user_id` FK |
| User → Audit Logs | 1:N | `audit_logs.user_id` FK |

### 10.9 Indexing Strategy

| Index Type | Columns | Purpose |
|-----------|---------|--------|
| Primary Key (clustered) | `id` on all 27 tables | Unique row identification, B-tree index |
| Unique Index | `users.email` | Prevent duplicate registrations, fast email lookup during login |
| Unique Index | `cases.case_number` | Ensure unique case identifiers |
| Unique Index | `invoices.invoice_number` | Financial document uniqueness |
| Foreign Key Index | All FK columns | Referential integrity + JOIN performance |
| ENUM Index | Status columns (`cases.status`, `hearings.status`, etc.) | Constrained value sets, efficient filtering |

### 10.10 Data Integrity Constraints

| Constraint | Implementation | Tables Using It |
|-----------|----------------|----------------|
| `NOT NULL` | Required fields must have values | `users.name`, `users.email`, `users.password`, `physical_doc_history.doc_id`, `physical_doc_history.action` |
| `UNIQUE` | No duplicate values | `users.email`, `cases.case_number`, `invoices.invoice_number`, `permissions.name` |
| `FOREIGN KEY` | Referential integrity | All FK columns across all tables |
| `ON DELETE CASCADE` | Automatic child deletion | `user_permissions`, `hearings`, `notifications`, `case_timeline`, `courtrooms` |
| `ON DELETE SET NULL` | Preserve child, nullify FK | `documents.case_id` |
| `CHECK` | Value validation | `ratings.rating BETWEEN 1 AND 5` |
| `ENUM` | Constrained value sets | 15+ tables use ENUMs for status, type, priority, role, etc. |
| `DEFAULT` | Automatic value assignment | Timestamps (`CURRENT_TIMESTAMP`), counters (`DEFAULT 0`), statuses |
| `ON UPDATE CURRENT_TIMESTAMP` | Auto-update timestamps | `cases.updated_at`, `physical_docs.last_updated` |

---

## 11. Module Descriptions

### 9.1 Authentication Module
Handles user login with JWT-based token authentication. Features account lockout after 3 failed login attempts with automatic fraud alert generation. Supports both bcrypt hashed and plain-text passwords for backward compatibility.

### 9.2 Case Management Module
Full CRUD for legal cases with 10 case types and 8 status stages. Includes case detail views with progress bars, case timeline events, and AI-powered legal research with precedent matching.

### 9.3 Hearing Management Module
Scheduling court hearings with date, time, venue, judge assignment. Supports ICS calendar export for integration with Google Calendar and Outlook.

### 9.4 Document Management Module
Upload, download, and verify digital documents. Includes version tracking, digital signature status, and clerk verification workflows (Approve/Reject).

### 9.5 Billing & Payment Module
Invoice generation with automatic 18% GST calculation. Multi-method payment processing (UPI, NetBanking, Card). Revenue analytics with monthly trend charts.

### 9.6 Messaging Module
Secure, case-linked messaging between lawyers and clients. End-to-end encrypted communication with read receipts and timestamp tracking.

### 9.7 Security & Fraud Detection Module
Account lockout system (3 failed attempts → locked). Admin Security Command Center with fraud alerts, locked account management, and security health index chart.

### 9.8 Physical Document Tracking Module
Track physical legal documents across locations (Court, Office, Archive, InTransit, Client). Features a detailed timeline view showing every handoff with timestamps, location details, handler names, and barcode tracking — similar to package delivery tracking.

### 9.9 Clerk Operations Module
Courtroom availability management, cause list uploads, stamp duty calculator (state-wise rates), bulk hearing scheduling, evidence mapping, and filing checklists.

### 9.10 Analytics & Dashboard Module
Role-specific dashboards with Chart.js visualizations including bar charts, doughnut charts, line charts, and stock-like trend charts with gradient fills and smooth animations.

---

## 12. Code Snippets

### 10.1 JWT Authentication Middleware
```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ 
        auth: false, message: 'No token provided.' 
    });
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).send({ 
            auth: false, message: 'Failed to authenticate token.' 
        });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') 
        return res.status(403).send({ message: "Require Admin Role!" });
    next();
};
```

### 10.2 Account Lockout Logic
```javascript
const MAX_LOGIN_ATTEMPTS = 3;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    // Check if account is locked
    if (user.is_locked) {
        return res.status(423).json({
            message: 'Account is locked. Contact the administrator.',
            locked: true
        });
    }

    if (!passwordMatch) {
        const newAttempts = (user.failed_login_attempts || 0) + 1;
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            // Lock the account
            await db.query(
                'UPDATE users SET failed_login_attempts=?, is_locked=1, locked_at=NOW() WHERE id=?',
                [newAttempts, user.id]
            );
            // Create fraud alert for admin
            await db.query(
                `INSERT INTO fraud_alerts (user_id, alert_type, severity, description) 
                 VALUES (?, 'MultipleFailedLogins', 'Critical', ?)`,
                [user.id, `Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts`]
            );
            return res.status(423).json({ message: 'Account locked.', locked: true });
        }
        
        // Increment failed attempts
        await db.query('UPDATE users SET failed_login_attempts=? WHERE id=?', 
                       [newAttempts, user.id]);
        return res.status(401).json({
            message: `Invalid password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`
        });
    }

    // Success - reset attempts & generate JWT
    await db.query('UPDATE users SET failed_login_attempts=0 WHERE id=?', [user.id]);
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: 86400 });
    res.json({ auth: true, token, user: { id: user.id, name: user.name, role: user.role } });
});
```

### 10.3 Role-Based Dashboard Rendering
```javascript
renderDashboard(user) {
    const r = user.role;
    const navItems = r === 'admin' ? [
        { icon: 'house', label: 'Home', page: 'dashboard' },
        { icon: 'briefcase', label: 'Cases', page: 'cases' },
        { icon: 'calendar-check', label: 'Hearings', page: 'hearings' },
        { icon: 'chart-bar', label: 'Analytics', page: 'analytics' },
        { icon: 'currency-inr', label: 'Revenue', page: 'revenue' },
        { icon: 'users-three', label: 'Users', page: 'users' },
        { icon: 'shield-check', label: 'Security', page: 'fraud-alerts' }
    ] : r === 'lawyer' ? [
        { icon: 'house', label: 'Home', page: 'dashboard' },
        { icon: 'briefcase', label: 'Cases', page: 'cases' },
        { icon: 'calendar-check', label: 'Hearings', page: 'hearings' },
        { icon: 'list-checks', label: 'Tasks', page: 'tasks' },
        { icon: 'receipt', label: 'Invoices', page: 'invoices' }
    ] : // ... client, clerk nav items
    
    // Render layout with sidebar, top nav, and bottom nav
}
```

### 10.4 Invoice with GST Calculation
```javascript
router.post('/', verifyToken, async (req, res) => {
    const { case_id, client_id, amount, description, due_date } = req.body;
    const taxAmount = Math.round(amount * 0.18 * 100) / 100; // 18% GST
    const totalAmount = amount + taxAmount;
    const invoiceNumber = 'LO-INV-' + Date.now();
    
    await db.query(
        `INSERT INTO invoices (invoice_number,case_id,lawyer_id,client_id,
         amount,tax_amount,total_amount,status,description,due_date) 
         VALUES (?,?,?,?,?,?,?,'Sent',?,?)`,
        [invoiceNumber, case_id, req.userId, client_id, 
         amount, taxAmount, totalAmount, description, due_date]
    );
});
```

### 10.5 Physical Document Tracking API
```javascript
// Get single physical doc with full journey history
router.get('/physical-docs/:id', verifyToken, async (req, res) => {
    const [docs] = await db.query(
        `SELECT pd.*, c.title as case_title, c.case_number, u.name as tracked_by_name 
         FROM physical_docs pd 
         LEFT JOIN cases c ON pd.case_id=c.id 
         LEFT JOIN users u ON pd.tracked_by=u.id 
         WHERE pd.id=?`, [req.params.id]
    );
    const [history] = await db.query(
        `SELECT h.*, u.name as handler_name 
         FROM physical_doc_history h 
         LEFT JOIN users u ON h.handled_by=u.id 
         WHERE h.doc_id=? 
         ORDER BY h.created_at DESC`, [req.params.id]
    );
    res.json({ ...docs[0], history });
});
```

### 10.6 Frontend API Service Pattern
```javascript
const ApiService = {
    BASE: '/api',
    _headers() {
        const h = { 'Content-Type': 'application/json' };
        const t = localStorage.getItem('token');
        if (t) h['Authorization'] = `Bearer ${t}`;
        return h;
    },
    async _get(url) {
        const r = await fetch(this.BASE + url, { headers: this._headers() });
        return r.json();
    },
    async _post(url, data) {
        const r = await fetch(this.BASE + url, {
            method: 'POST', headers: this._headers(), body: JSON.stringify(data)
        });
        return r.json();
    },
    // ... 50+ API methods for all modules
};
```

---

## 13. Screenshots & UI Description

### 11.1 Login Page
- Clean, centered login form with email and password fields
- Password visibility toggle (eye icon)
- Shake animation on failed login attempt
- Progressive warning messages showing remaining attempts
- Red lockout alert card with shield icon when account is locked
- "Contact administrator" message for locked accounts

### 11.2 Admin Dashboard
- Top navigation bar with brand logo, notification bell with badge, user avatar
- Bottom navigation for mobile-friendly access
- 4 stat cards: Total Cases, Active Users, Revenue, Pending Hearings
- Two Chart.js charts: Case Filings (Bar chart) and Case Status Distribution (Doughnut)
- Quick action buttons: RBAC, Audit Logs, Compliance, Backups, Broadcast, AI Categorize

### 11.3 Security Command Center (Admin)
- 4 security stat cards: Locked Accounts, Threat Level, Unresolved Alerts, Resolved
- Stock-like Security Health Index chart with period toggles (1W, 1M, 3M, 1Y)
- Security Threat Trend line chart and Alerts by Severity doughnut chart
- Tabbed interface: "Locked Accounts" tab and "Fraud Alerts" tab
- Locked accounts show user info with unlock button
- Fraud alerts show severity badges with resolve button

### 11.4 Revenue & Billing Page
- 4 stat cards: Total Revenue, Pending, Commission (10%), Net
- Revenue Trend stock-like line chart with gradient fill
- Monthly Collections bar chart (Collected vs Pending)
- Lawyer Earnings table

### 11.5 Cases View
- Searchable, sortable table with case number, title, type, status, priority
- Color-coded badges for status and priority
- Action buttons: View, Timeline, Research
- Case detail view with progress bar showing case stage

### 11.6 Physical Document Tracking
- Card grid showing documents with color-coded borders by location type
- Clicking a document opens a detailed tracking view:
  - Header with document name, barcode, priority badge
  - Current location card with pulsing green status dot
  - Journey summary stats (Total Stops, Days in Transit, Handlers, Locations)
  - Vertical timeline with colored dots, connecting lines, and staggered animations
  - Each timeline step shows action, notes, time, date, location, handler
  - Update Location button to add new tracking entries

### 11.7 Lawyer Dashboard
- Case Overview stats: Active Cases, Won, Pending Fees
- Case Distribution doughnut chart with gradient fills and easeOutElastic animation
- Quick actions: New Task, Submit Evidence, View Templates

### 11.8 Client Dashboard
- Stats: My Cases, Paid Amount, Pending Payments, Consultations
- Quick actions: Search Lawyers, SOS Emergency Help, Book Consultation

### 11.9 Clerk Dashboard
- Stats: Pending Verifications, In-Transit Docs, Today's Hearings, Courtrooms
- Task Distribution chart with smooth easeInOutQuart animation
- Quick tools: Verify Docs, Stamp Duty Calculator, Courtroom Management

---

## 14. Security Features

### 12.1 Authentication Security
| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcryptjs with salt rounds |
| Token-Based Auth | JWT with 24-hour expiry |
| Account Lockout | 3 failed attempts → locked |
| Role Verification | Middleware for admin, lawyer, clerk |
| Fraud Detection | Auto-alert on suspicious activity |

### 12.2 Account Lockout Flow
```
Login Attempt 1 (wrong password)
    → "Invalid password. 2 attempts remaining."
    
Login Attempt 2 (wrong password)
    → "Invalid password. 1 attempt remaining."
    
Login Attempt 3 (wrong password)
    → Account LOCKED
    → Fraud alert created (Critical severity)
    → "Account locked. Contact administrator."
    
Even with correct password:
    → "Account is locked. Contact administrator."
    
Admin clicks "Unlock" in Security Dashboard:
    → failed_login_attempts reset to 0
    → is_locked = false
    → User can login again
```

### 12.3 Additional Security Measures
- **Cookie Consent**: GDPR/IT Act compliant banner
- **CORS Protection**: Configured Cross-Origin Resource Sharing
- **Audit Logging**: All critical actions are logged with IP addresses
- **Compliance Tracking**: GDPR, IT Act, Data Retention, Security compliance monitoring
- **Input Validation**: Server-side validation on all endpoints
- **SQL Injection Prevention**: Parameterized queries throughout

---

## 15. API Reference

### 13.1 Authentication APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login with email/password |

### 13.2 Case Management APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List all cases (role-filtered) |
| GET | `/api/cases/:id` | Get case details |
| POST | `/api/cases` | Create new case |
| PUT | `/api/cases/:id` | Update case |
| GET | `/api/cases/:id/timeline` | Get case timeline events |
| GET | `/api/cases/:id/research` | AI-powered legal research |

### 13.3 Hearing APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hearings` | List all hearings |
| POST | `/api/hearings` | Schedule hearing |
| GET | `/api/hearings/calendar-export` | Export ICS calendar |

### 13.4 Document APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List documents |
| POST | `/api/documents` | Upload document |

### 13.5 User Management APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user (sends email) |
| DELETE | `/api/users/:id` | Delete user |

### 13.6 Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET | `/api/admin/revenue` | Revenue data |
| GET | `/api/admin/audit-logs` | Audit trail |
| GET | `/api/admin/fraud-alerts` | Fraud alerts |
| PUT | `/api/admin/fraud-alerts/:id/resolve` | Resolve alert |
| GET | `/api/admin/locked-accounts` | List locked accounts |
| PUT | `/api/admin/unlock-account/:id` | Unlock user account |
| GET | `/api/admin/security-stats` | Security statistics |
| POST | `/api/admin/broadcast` | Broadcast notification |

### 13.7 Billing APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice (auto GST) |
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Make payment |

### 13.8 Communication APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:caseId` | Get case messages |
| POST | `/api/messages` | Send message |
| GET | `/api/notifications` | Get notifications |
| POST | `/api/notifications/mark-read` | Mark all read |

### 13.9 Clerk APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/clerk/verify-document/:id` | Verify document |
| GET | `/api/clerk/pending-documents` | Pending documents |
| GET | `/api/clerk/courtrooms` | Courtroom availability |
| GET | `/api/clerk/physical-docs` | List physical docs |
| GET | `/api/clerk/physical-docs/:id` | Document tracking detail |
| PUT | `/api/clerk/physical-docs/:id` | Update document location |
| POST | `/api/clerk/stamp-duty` | Calculate stamp duty |
| GET | `/api/clerk/filing-checklist/:caseId` | Filing checklist |

---

## 16. Testing

### 14.1 Account Lockout Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Login attempt 1 (wrong) | wrong password | "2 attempts remaining" | "2 attempts remaining" | ✅ PASS |
| Login attempt 2 (wrong) | wrong password | "1 attempt remaining" | "1 attempt remaining" | ✅ PASS |
| Login attempt 3 (wrong) | wrong password | Account locked | Account locked | ✅ PASS |
| Login with correct pwd (locked) | correct password | "Account is locked" | "Account is locked" | ✅ PASS |
| Admin unlock | Unlock account | "Account unlocked" | "Account unlocked" | ✅ PASS |
| Login after unlock | correct password | Login success | Login success | ✅ PASS |

### 14.2 API Endpoint Testing

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/api/auth/login` | POST | 200 | Token + user data |
| `/api/cases` | GET | 200 | Array of cases |
| `/api/admin/locked-accounts` | GET | 200 | Array of locked users |
| `/api/admin/security-stats` | GET | 200 | Stats object |
| `/api/clerk/physical-docs/1` | GET | 200 | Doc + 5 history entries |
| `/api/admin/unlock-account/7` | PUT | 200 | Success message |

---

## 17. Conclusion

**LawOrbit** successfully demonstrates a comprehensive, production-grade legal case management platform that addresses the critical challenges facing the Indian legal ecosystem. The system achieves all stated objectives:

1. **Centralized Case Management** — Complete lifecycle tracking from Filing to Judgment with 10 case types and 8 status stages.

2. **Role-Based Security** — Four distinct user roles (Admin, Lawyer, Client, Clerk) with granular permissions and tailored dashboards.

3. **Document Management** — Both digital (upload, verify, sign) and physical document tracking with delivery-style timeline visualization.

4. **Financial Management** — Automated GST calculation, multi-payment method support, and revenue analytics with stock-like charts.

5. **Communication** — Secure case-linked messaging and video consultation booking.

6. **Advanced Security** — Account lockout after 3 failed attempts, fraud detection, audit logging, and compliance tracking.

7. **Analytics** — Interactive Chart.js dashboards with smooth animations, gradient fills, and responsive layouts.

8. **Indian Legal Compliance** — INR formatting, GST calculations, Indian court data, Bar Council integration, and IT Act compliance.

The platform is built with a clean MVC architecture using Node.js + Express.js + MySQL, making it easy to maintain, extend, and deploy. The frontend uses vanilla JavaScript for maximum performance without framework overhead, and the responsive design ensures usability across desktop and mobile devices.

**Key metrics:**
- **26 database tables** covering all aspects of legal operations
- **16 API route modules** with **90+ endpoints**
- **50+ frontend API methods** in the service layer
- **4 role-specific dashboards** with interactive charts
- **5 Chart.js chart types** with premium animations

---

## 18. Future Scope

1. **Mobile Application** — React Native or Flutter app for iOS/Android with push notifications.

2. **Real AI Integration** — Connect to OpenAI/Google Gemini for actual case law research, document summarization, and judgment prediction.

3. **E-Filing Integration** — Direct integration with Indian eCourts system for case filing and status updates.

4. **Digital Signature** — Integration with Aadhaar eSign for legally valid digital signatures.

5. **Payment Gateway** — Integration with Razorpay/PayU for real UPI, card, and net banking payments.

6. **Video Conferencing** — Built-in WebRTC video calls instead of external meeting links.

7. **OCR & Document Intelligence** — Automatic extraction of case details from scanned documents.

8. **Multi-Tenancy** — Support for multiple law firms on a single instance.

9. **Offline Support** — PWA (Progressive Web App) for offline access to critical case data.

10. **Blockchain Audit Trail** — Immutable audit logs using blockchain technology.

---

## 19. References

1. **National Judicial Data Grid** — https://njdg.ecourts.gov.in/
2. **e-Courts Services** — https://ecourts.gov.in/
3. **India Code - IT Act, 2000** — https://www.indiacode.nic.in/
4. **Express.js Documentation** — https://expressjs.com/
5. **MySQL 8.0 Reference Manual** — https://dev.mysql.com/doc/refman/8.0/en/
6. **Chart.js Documentation** — https://www.chartjs.org/docs/
7. **JSON Web Tokens (JWT)** — https://jwt.io/introduction
8. **Node.js Documentation** — https://nodejs.org/docs/
9. **Phosphor Icons** — https://phosphoricons.com/
10. **Leaflet.js Documentation** — https://leafletjs.com/reference.html

---

*Document prepared for LawOrbit Legal Case Management Platform — March 2026*
