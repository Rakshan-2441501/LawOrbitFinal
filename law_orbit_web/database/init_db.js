const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        console.log('✅ Connected to MySQL server.');

        await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
        await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
        console.log(`✅ Database '${process.env.DB_NAME}' created fresh.`);
        await connection.end();

        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        // ===== TABLE CREATION =====
        await db.query(`
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
            )
        `);

        await db.query(`
            CREATE TABLE permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description VARCHAR(255),
                category VARCHAR(50)
            )
        `);

        await db.query(`
            CREATE TABLE user_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT, permission_id INT,
                granted_by INT,
                granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
                FOREIGN KEY (granted_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE lawyers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                specialization VARCHAR(100),
                experience VARCHAR(50),
                location VARCHAR(100),
                bar_council_id VARCHAR(50),
                rating DECIMAL(3,1) DEFAULT 0,
                total_cases INT DEFAULT 0,
                won_cases INT DEFAULT 0,
                hourly_rate DECIMAL(10,2) DEFAULT 5000.00,
                bio TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE cases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_number VARCHAR(50) UNIQUE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                type ENUM('Criminal','Civil','Family','Corporate','Property','Labour','Consumer','Tax','Constitutional','Other') DEFAULT 'Civil',
                category VARCHAR(100),
                status ENUM('Filed','Hearing','Evidence','Arguments','Reserved','Judgment','Closed','Dismissed') DEFAULT 'Filed',
                priority ENUM('Low','Medium','High','Urgent') DEFAULT 'Medium',
                client_id INT,
                lawyer_id INT,
                court_name VARCHAR(255),
                judge_name VARCHAR(255),
                filing_date DATE,
                estimated_duration INT,
                total_fees DECIMAL(12,2) DEFAULT 0,
                paid_amount DECIMAL(12,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id),
                FOREIGN KEY (lawyer_id) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE hearings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                title VARCHAR(255),
                date DATE,
                time TIME,
                venue VARCHAR(255),
                courtroom VARCHAR(50),
                judge VARCHAR(255),
                status ENUM('Scheduled','Completed','Adjourned','Cancelled') DEFAULT 'Scheduled',
                notes TEXT,
                next_date DATE,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                name VARCHAR(255),
                type VARCHAR(50),
                size VARCHAR(50),
                uploaded_by INT,
                upload_date DATE,
                path VARCHAR(255),
                verification_status ENUM('Pending','Verified','Rejected') DEFAULT 'Pending',
                verified_by INT,
                version INT DEFAULT 1,
                is_signed TINYINT DEFAULT 0,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
                FOREIGN KEY (uploaded_by) REFERENCES users(id),
                FOREIGN KEY (verified_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE doc_versions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                document_id INT,
                version_number INT,
                change_description VARCHAR(255),
                changed_by INT,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_path VARCHAR(255),
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
                FOREIGN KEY (changed_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE courts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                location VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                type VARCHAR(100),
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                phone VARCHAR(20)
            )
        `);

        await db.query(`
            CREATE TABLE courtrooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                court_id INT,
                room_number VARCHAR(50),
                judge_name VARCHAR(255),
                capacity INT DEFAULT 50,
                is_available TINYINT DEFAULT 1,
                FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(50) UNIQUE,
                case_id INT,
                lawyer_id INT,
                client_id INT,
                amount DECIMAL(12,2),
                tax_amount DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(12,2),
                status ENUM('Draft','Sent','Paid','Overdue','Cancelled') DEFAULT 'Draft',
                due_date DATE,
                paid_date DATE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id),
                FOREIGN KEY (lawyer_id) REFERENCES users(id),
                FOREIGN KEY (client_id) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT,
                client_id INT,
                amount DECIMAL(12,2),
                payment_method ENUM('UPI','NetBanking','Card','Cash','Cheque') DEFAULT 'UPI',
                transaction_id VARCHAR(100),
                status ENUM('Pending','Success','Failed','Refunded') DEFAULT 'Pending',
                paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id),
                FOREIGN KEY (client_id) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_name VARCHAR(255),
                action VARCHAR(100),
                entity_type VARCHAR(50),
                entity_id INT,
                details TEXT,
                ip_address VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255),
                message TEXT,
                type ENUM('info','warning','success','danger','broadcast') DEFAULT 'info',
                is_read TINYINT DEFAULT 0,
                link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                sender_id INT,
                receiver_id INT,
                content TEXT,
                is_read TINYINT DEFAULT 0,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id),
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                case_id INT,
                title VARCHAR(255),
                description TEXT,
                priority ENUM('Low','Medium','High','Urgent') DEFAULT 'Medium',
                status ENUM('Pending','InProgress','Completed','Overdue') DEFAULT 'Pending',
                due_date DATE,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (case_id) REFERENCES cases(id)
            )
        `);

        await db.query(`
            CREATE TABLE ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                client_id INT,
                lawyer_id INT,
                rating INT CHECK(rating BETWEEN 1 AND 5),
                review TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id),
                FOREIGN KEY (client_id) REFERENCES users(id),
                FOREIGN KEY (lawyer_id) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                category VARCHAR(100),
                type VARCHAR(50),
                content TEXT,
                created_by INT,
                usage_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE cause_lists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                court_id INT,
                date DATE,
                uploaded_by INT,
                file_path VARCHAR(255),
                total_cases INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (court_id) REFERENCES courts(id),
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE evidence (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                title VARCHAR(255),
                type ENUM('Document','Photo','Video','Audio','Digital') DEFAULT 'Document',
                file_path VARCHAR(255),
                uploaded_by INT,
                description TEXT,
                is_verified TINYINT DEFAULT 0,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id),
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE case_timeline (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                event_title VARCHAR(255),
                event_description TEXT,
                event_date DATE,
                event_type ENUM('Filing','Hearing','Order','Evidence','Adjournment','Judgment','Other') DEFAULT 'Other',
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE consultations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT,
                lawyer_id INT,
                case_id INT,
                scheduled_date DATE,
                scheduled_time TIME,
                duration INT DEFAULT 30,
                type ENUM('Video','Audio','InPerson') DEFAULT 'Video',
                status ENUM('Requested','Confirmed','Completed','Cancelled') DEFAULT 'Requested',
                meeting_link VARCHAR(255),
                notes TEXT,
                fee DECIMAL(10,2) DEFAULT 2000.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id),
                FOREIGN KEY (lawyer_id) REFERENCES users(id),
                FOREIGN KEY (case_id) REFERENCES cases(id)
            )
        `);

        await db.query(`
            CREATE TABLE backups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                backup_name VARCHAR(255),
                size VARCHAR(50),
                type ENUM('Full','Incremental','Differential') DEFAULT 'Full',
                status ENUM('InProgress','Completed','Failed') DEFAULT 'InProgress',
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE compliance_checks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                check_type VARCHAR(100),
                category ENUM('GDPR','IT_Act','Data_Retention','Security') DEFAULT 'IT_Act',
                status ENUM('Compliant','NonCompliant','Review','Pending') DEFAULT 'Pending',
                details TEXT,
                checked_by INT,
                checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                next_review DATE,
                FOREIGN KEY (checked_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE fraud_alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                alert_type ENUM('SuspiciousLogin','DocTampering','UnusualActivity','MultipleFailedLogins') DEFAULT 'SuspiciousLogin',
                severity ENUM('Low','Medium','High','Critical') DEFAULT 'Medium',
                description TEXT,
                ip_address VARCHAR(50),
                is_resolved TINYINT DEFAULT 0,
                resolved_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (resolved_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE physical_docs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id INT,
                document_name VARCHAR(255),
                current_location ENUM('Court','Office','Archive','InTransit','Client') DEFAULT 'Office',
                location_detail VARCHAR(255),
                barcode VARCHAR(50),
                doc_type VARCHAR(100) DEFAULT 'Legal Document',
                priority ENUM('Normal','Urgent','Critical') DEFAULT 'Normal',
                tracked_by INT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id),
                FOREIGN KEY (tracked_by) REFERENCES users(id)
            )
        `);

        await db.query(`
            CREATE TABLE physical_doc_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                doc_id INT NOT NULL,
                location ENUM('Court','Office','Archive','InTransit','Client') NOT NULL,
                location_detail VARCHAR(255),
                action VARCHAR(100) NOT NULL,
                notes TEXT,
                handled_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doc_id) REFERENCES physical_docs(id),
                FOREIGN KEY (handled_by) REFERENCES users(id)
            )
        `);

        console.log('✅ All 25 tables created.');

        // ===== SEED DATA =====
        console.log('🌱 Seeding data...');

        // Users
        await db.query(`INSERT INTO users (name,email,password,role,phone) VALUES
            ('Admin Sharma','admin@laworbit.com','password','admin','9876543210'),
            ('Adv. Rajesh Kumar','rajesh@laworbit.com','password','lawyer','9876543211'),
            ('Adv. Anjali Desai','anjali@laworbit.com','password','lawyer','9876543212'),
            ('Adv. Vikram Singh','vikram@laworbit.com','password','lawyer','9876543213'),
            ('Adv. Meera Reddy','meera@laworbit.com','password','lawyer','9876543214'),
            ('Adv. Arjun Patel','arjun@laworbit.com','password','lawyer','9876543215'),
            ('Priya Sharma','priya@client.com','password','client','9876543216'),
            ('Rohit Verma','rohit@client.com','password','client','9876543217'),
            ('Neha Gupta','neha@client.com','password','client','9876543218'),
            ('Amit Joshi','amit@client.com','password','client','9876543219'),
            ('Kavita Nair','kavita@client.com','password','client','9876543220'),
            ('Suresh Patel','suresh@laworbit.com','password','clerk','9876543221'),
            ('Rekha Iyer','rekha@laworbit.com','password','clerk','9876543222'),
            ('Manoj Tiwari','manoj@laworbit.com','password','clerk','9876543223')
        `);

        // Permissions
        await db.query(`INSERT INTO permissions (name,description,category) VALUES
            ('view_all_cases','View all cases in the system','Cases'),
            ('edit_cases','Edit case details','Cases'),
            ('delete_cases','Delete cases','Cases'),
            ('manage_users','Create/edit/delete users','Users'),
            ('view_audit_logs','Access audit logs','Admin'),
            ('manage_billing','Manage invoices and payments','Billing'),
            ('manage_documents','Upload/delete documents','Documents'),
            ('schedule_hearings','Schedule and manage hearings','Hearings'),
            ('verify_documents','Verify document authenticity','Documents'),
            ('broadcast_notifications','Send system-wide notifications','Admin'),
            ('manage_compliance','Manage compliance checks','Admin'),
            ('view_analytics','View analytics dashboard','Admin'),
            ('manage_backups','Create and restore backups','Admin'),
            ('manage_courtrooms','Manage courtroom availability','Clerk')
        `);

        // Assign permissions
        await db.query(`INSERT INTO user_permissions (user_id,permission_id,granted_by) VALUES
            (1,1,1),(1,2,1),(1,3,1),(1,4,1),(1,5,1),(1,6,1),(1,7,1),(1,8,1),(1,9,1),(1,10,1),(1,11,1),(1,12,1),(1,13,1),(1,14,1),
            (2,1,1),(2,2,1),(2,7,1),(2,8,1),
            (3,1,1),(3,2,1),(3,7,1),(3,8,1),
            (12,1,1),(12,7,1),(12,8,1),(12,9,1),(12,14,1)
        `);

        // Lawyer Profiles
        await db.query(`INSERT INTO lawyers (user_id,specialization,experience,location,bar_council_id,rating,total_cases,won_cases,hourly_rate,bio) VALUES
            (2,'Criminal Law','12 Years','Bangalore','KAR/2012/1234',4.5,85,62,7500,'Senior criminal lawyer with extensive experience in High Court matters.'),
            (3,'Family Law','15 Years','Mumbai','MAH/2009/5678',4.8,120,98,8000,'Specializes in divorce, custody, and domestic violence cases.'),
            (4,'Corporate Law','10 Years','Delhi','DEL/2014/9012',4.3,65,48,10000,'Expert in mergers, acquisitions, and corporate governance.'),
            (5,'Property Law','8 Years','Chennai','TN/2016/3456',4.7,55,42,6000,'Handles property disputes, land acquisition, and real estate matters.'),
            (6,'Labour Law','20 Years','Hyderabad','TEL/2004/7890',4.9,200,165,9000,'Veteran labour law practitioner with Supreme Court experience.')
        `);

        // Courts
        await db.query(`INSERT INTO courts (name,location,city,state,type,latitude,longitude,phone) VALUES
            ('Supreme Court of India','Tilak Marg','New Delhi','Delhi','Apex Court',28.6225,77.2400,'011-23388922'),
            ('Allahabad High Court','Civil Lines','Prayagraj','Uttar Pradesh','High Court',25.4358,81.8463,'0532-2621335'),
            ('Andhra Pradesh High Court','Nelapadu','Amaravati','Andhra Pradesh','High Court',16.5150,80.5180,'0863-2340501'),
            ('Bombay High Court','Fort','Mumbai','Maharashtra','High Court',18.9281,72.8320,'022-22620831'),
            ('Calcutta High Court','Esplanade Row West','Kolkata','West Bengal','High Court',22.5726,88.3497,'033-22133253'),
            ('Chhattisgarh High Court','Bodri, Bilaspur','Bilaspur','Chhattisgarh','High Court',22.0797,82.1391,'07752-234001'),
            ('Delhi High Court','Sher Shah Road','New Delhi','Delhi','High Court',28.6336,77.2413,'011-23386442'),
            ('Gauhati High Court','Panbazar','Guwahati','Assam','High Court',26.1800,91.7500,'0361-2732354'),
            ('Gujarat High Court','Sola','Ahmedabad','Gujarat','High Court',23.0600,72.5280,'079-27541450'),
            ('Himachal Pradesh High Court','The Ridge','Shimla','Himachal Pradesh','High Court',31.1048,77.1734,'0177-2656210'),
            ('Jammu & Kashmir High Court','Janipur','Jammu','Jammu & Kashmir','High Court',32.7089,74.8658,'0191-2546041'),
            ('Jharkhand High Court','Dhurwa','Ranchi','Jharkhand','High Court',23.3700,85.3200,'0651-2482125'),
            ('Karnataka High Court','Dr. Ambedkar Veedhi','Bangalore','Karnataka','High Court',12.9767,77.5900,'080-22867400'),
            ('Kerala High Court','Shornur Road','Ernakulam','Kerala','High Court',9.9816,76.2999,'0484-2562570'),
            ('Madhya Pradesh High Court','Jail Road','Jabalpur','Madhya Pradesh','High Court',23.1815,79.9864,'0761-2622345'),
            ('Madras High Court','Parry Corner','Chennai','Tamil Nadu','High Court',13.0878,80.2870,'044-25301344'),
            ('Manipur High Court','Mantripukhri','Imphal','Manipur','High Court',24.7900,93.9500,'0385-2451023'),
            ('Meghalaya High Court','Lachumiere','Shillong','Meghalaya','High Court',25.5788,91.8933,'0364-2224201'),
            ('Orissa High Court','Cuttack Road','Cuttack','Odisha','High Court',20.4625,85.8828,'0671-2504093'),
            ('Patna High Court','Court Road','Patna','Bihar','High Court',25.6093,85.1376,'0612-2233051'),
            ('Punjab & Haryana High Court','Sector 1','Chandigarh','Chandigarh','High Court',30.7457,76.7882,'0172-2741940'),
            ('Rajasthan High Court','Sardar Patel Marg','Jodhpur','Rajasthan','High Court',26.2850,73.0169,'0291-2633276'),
            ('Sikkim High Court','Development Area','Gangtok','Sikkim','High Court',27.3389,88.6065,'03592-202251'),
            ('Telangana High Court','Gachibowli','Hyderabad','Telangana','High Court',17.4400,78.3489,'040-23448222'),
            ('Tripura High Court','Agartala','Agartala','Tripura','High Court',23.8315,91.2868,'0381-2324018'),
            ('Uttarakhand High Court','Kalagaon, Nainital','Nainital','Uttarakhand','High Court',29.3919,79.4542,'05942-236466'),
            ('Delhi District Court (Tis Hazari)','Tis Hazari','New Delhi','Delhi','District Court',28.6666,77.2264,'011-23911017'),
            ('Patiala House Court','India Gate','New Delhi','Delhi','District Court',28.6153,77.2373,'011-23382666'),
            ('City Civil Court Mumbai','Fort','Mumbai','Maharashtra','District Court',18.9340,72.8360,'022-22617284'),
            ('Sessions Court Bangalore','Nrupathunga Road','Bangalore','Karnataka','District Court',12.9780,77.5870,'080-22961444'),
            ('Chief Metropolitan Court Chennai','Egmore','Chennai','Tamil Nadu','District Court',13.0732,80.2609,'044-28190725'),
            ('Saket District Court','Saket','New Delhi','Delhi','District Court',28.5244,77.2167,'011-26862100'),
            ('City Civil & Sessions Court Hyderabad','Nampally','Hyderabad','Telangana','District Court',17.3850,78.4867,'040-24612345')
        `);

        // Courtrooms
        await db.query(`INSERT INTO courtrooms (court_id,room_number,judge_name,capacity,is_available) VALUES
            (13,'Court Room 1','Hon. Justice Prasanna B. Varale',60,1),
            (13,'Court Room 2','Hon. Justice Suraj Govindaraj',50,1),
            (13,'Court Room 3','Hon. Justice K.S. Mudagal',45,0),
            (4,'Court Room A','Hon. Justice G.S. Patel',70,1),
            (4,'Court Room B','Hon. Justice R.D. Dhanuka',55,1),
            (27,'Court Room 101','Hon. Judge Vinod Kumar',40,1),
            (27,'Court Room 102','Hon. Judge Shalini Nagpal',35,0),
            (30,'Court Room 5','Hon. Judge Ramesh Reddy',50,1)
        `);

        // Cases
        await db.query(`INSERT INTO cases (case_number,title,description,type,category,status,priority,client_id,lawyer_id,court_name,judge_name,filing_date,estimated_duration,total_fees,paid_amount) VALUES
            ('KHC/CRIM/2024/1001','Sharma vs. State of Karnataka','Criminal case involving alleged fraud in property documents','Criminal','White Collar Crime','Hearing','High',7,2,'Karnataka High Court','Hon. Justice Prasanna B. Varale','2024-01-15',180,150000,75000),
            ('BHC/FAM/2024/2001','Verma vs. Verma','Divorce petition with child custody dispute','Family','Divorce','Evidence','Medium',8,3,'Bombay High Court','Hon. Justice G.S. Patel','2024-02-20',120,200000,100000),
            ('DHC/CORP/2024/3001','TechBharath Pvt Ltd Merger','Corporate merger approval and regulatory compliance','Corporate','Mergers & Acquisitions','Arguments','High',9,4,'Delhi District Court','Hon. Judge Vinod Kumar','2024-03-10',90,500000,350000),
            ('MHC/PROP/2024/4001','Gupta Property Dispute','Ancestral property partition among family members','Property','Land Dispute','Hearing','Medium',10,5,'Madras High Court','Hon. Justice K. Ravichandrabaabu','2024-04-05',150,120000,60000),
            ('KHC/LAB/2024/5001','Workers Union vs. Infosys Ltd','Wrongful termination of 50 employees','Labour','Wrongful Termination','Filed','Urgent',11,6,'Karnataka High Court','Hon. Justice Suraj Govindaraj','2024-05-01',200,300000,0),
            ('DHC/CRIM/2024/6001','State vs. Rohit Mehta','Drug trafficking charges under NDPS Act','Criminal','Narcotics','Hearing','Urgent',8,2,'Patiala House Court','Hon. Judge Shalini Nagpal','2024-06-15',240,250000,125000),
            ('BHC/CIV/2023/7001','Nair vs. Mumbai Municipal Corp','Public interest litigation on water supply','Civil','PIL','Judgment','Low',11,3,'Bombay High Court','Hon. Justice R.D. Dhanuka','2023-06-20',365,80000,80000),
            ('KHC/FAM/2024/8001','Joshi Maintenance Case','Maintenance petition under Section 125 CrPC','Family','Maintenance','Reserved','Medium',10,3,'Sessions Court Bangalore','Hon. Judge Ramesh Reddy','2024-07-10',100,90000,45000),
            ('SC/CONST/2024/9001','Citizens Forum PIL','Constitutional validity of new IT amendment','Constitutional','Fundamental Rights','Filed','High',9,6,'Supreme Court of India','Hon. Justice D.Y. Chandrachud','2024-08-01',300,1000000,200000),
            ('MHC/CONS/2024/10001','Consumer Forum - Flipkart','Defective product complaint and refund','Consumer','Product Liability','Closed',  'Low',7,5,'City Civil Court','Hon. Judge Arun Mishra','2024-01-10',60,50000,50000)
        `);

        // Hearings
        await db.query(`INSERT INTO hearings (case_id,title,date,time,venue,courtroom,judge,status,notes,next_date) VALUES
            (1,'Bail Application','2024-11-15','10:00:00','Karnataka High Court','Court Room 1','Hon. Justice Prasanna B. Varale','Completed','Bail granted with conditions. Passport surrendered.','2025-01-20'),
            (1,'Evidence Examination','2025-01-20','11:00:00','Karnataka High Court','Court Room 1','Hon. Justice Prasanna B. Varale','Completed','3 witnesses examined. Cross-examination pending.','2025-03-15'),
            (1,'Cross Examination','2025-03-15','10:30:00','Karnataka High Court','Court Room 2','Hon. Justice Suraj Govindaraj','Scheduled',NULL,NULL),
            (2,'Mediation Session','2025-02-10','14:00:00','Bombay High Court','Court Room A','Hon. Justice G.S. Patel','Completed','Mediation failed. Case proceeds to trial.','2025-04-05'),
            (2,'Custody Hearing','2025-04-05','11:00:00','Bombay High Court','Court Room A','Hon. Justice G.S. Patel','Scheduled',NULL,NULL),
            (3,'Regulatory Approval','2025-03-20','15:00:00','Delhi District Court','Court Room 101','Hon. Judge Vinod Kumar','Scheduled',NULL,NULL),
            (4,'Site Inspection Order','2025-02-28','10:00:00','Madras High Court','Court Room 3','Hon. Justice K. Ravichandrabaabu','Completed','Court ordered site inspection on March 15.','2025-04-10'),
            (5,'First Hearing','2025-05-10','10:00:00','Karnataka High Court','Court Room 2','Hon. Justice Suraj Govindaraj','Scheduled',NULL,NULL),
            (6,'Charge Framing','2025-04-15','11:30:00','Patiala House Court','Court Room 102','Hon. Judge Shalini Nagpal','Scheduled',NULL,NULL),
            (9,'Admission Hearing','2025-08-20','10:00:00','Supreme Court of India','Court Room 1','Hon. Justice D.Y. Chandrachud','Scheduled',NULL,NULL)
        `);

        // Documents
        await db.query(`INSERT INTO documents (case_id,name,type,size,uploaded_by,upload_date,verification_status,verified_by,version,is_signed) VALUES
            (1,'FIR Copy No. 234/2024.pdf','PDF','2.4 MB',2,'2024-01-16','Verified',12,1,1),
            (1,'Property Documents.pdf','PDF','5.1 MB',7,'2024-01-20','Verified',12,2,0),
            (1,'Witness Statement - Ramesh.docx','DOCX','350 KB',2,'2024-02-05','Verified',12,1,1),
            (2,'Marriage Certificate.pdf','PDF','1.2 MB',8,'2024-02-21','Verified',13,1,1),
            (2,'Income Tax Returns 2023.pdf','PDF','890 KB',3,'2024-03-01','Pending',NULL,1,0),
            (3,'Merger Agreement Draft.pdf','PDF','12.5 MB',4,'2024-03-11','Verified',12,3,1),
            (3,'Board Resolution.pdf','PDF','2.1 MB',9,'2024-03-15','Verified',12,1,1),
            (4,'Sale Deed 1985.pdf','PDF','3.8 MB',10,'2024-04-06','Pending',NULL,1,0),
            (5,'Termination Letters.pdf','PDF','4.2 MB',11,'2024-05-02','Pending',NULL,1,0),
            (6,'Seizure Panchanama.pdf','PDF','1.5 MB',2,'2024-06-16','Verified',13,1,1),
            (10,'Invoice - Laptop Purchase.pdf','PDF','500 KB',7,'2024-01-11','Verified',12,1,0),
            (10,'Defective Product Photos.zip','ZIP','15.2 MB',7,'2024-01-12','Verified',12,1,0)
        `);

        // Invoices
        await db.query(`INSERT INTO invoices (invoice_number,case_id,lawyer_id,client_id,amount,tax_amount,total_amount,status,due_date,paid_date,description) VALUES
            ('INV-2024-001',1,2,7,75000,13500,88500,'Paid','2024-03-15','2024-03-10','Legal consultation and bail application'),
            ('INV-2024-002',1,2,7,75000,13500,88500,'Sent','2025-03-30',NULL,'Trial representation - Phase 2'),
            ('INV-2024-003',2,3,8,100000,18000,118000,'Paid','2024-05-20','2024-05-15','Mediation and court representation'),
            ('INV-2024-004',2,3,8,100000,18000,118000,'Overdue','2025-02-28',NULL,'Custody hearing representation'),
            ('INV-2024-005',3,4,9,350000,63000,413000,'Paid','2024-06-10','2024-06-08','Merger documentation and regulatory filing'),
            ('INV-2024-006',3,4,9,150000,27000,177000,'Sent','2025-04-15',NULL,'Final merger approval hearing'),
            ('INV-2024-007',4,5,10,60000,10800,70800,'Paid','2024-07-05','2024-07-01','Property survey and initial filing'),
            ('INV-2024-008',5,6,11,150000,27000,177000,'Draft','2025-06-01',NULL,'Initial representation fees'),
            ('INV-2024-009',9,6,9,200000,36000,236000,'Sent','2025-09-01',NULL,'Supreme Court PIL filing fees'),
            ('INV-2024-010',10,5,7,50000,9000,59000,'Paid','2024-03-10','2024-03-08','Consumer forum representation')
        `);

        // Payments
        await db.query(`INSERT INTO payments (invoice_id,client_id,amount,payment_method,transaction_id,status,paid_at) VALUES
            (1,7,88500,'UPI','UPI2024031012345','Success','2024-03-10 14:30:00'),
            (3,8,118000,'NetBanking','NB202405150001','Success','2024-05-15 10:00:00'),
            (5,9,413000,'Card','CARD202406080045','Success','2024-06-08 16:45:00'),
            (7,10,70800,'UPI','UPI2024070109876','Success','2024-07-01 09:15:00'),
            (10,7,59000,'Cheque','CHQ-456789','Success','2024-03-08 11:30:00')
        `);

        // Tasks
        await db.query(`INSERT INTO tasks (user_id,case_id,title,description,priority,status,due_date) VALUES
            (2,1,'Prepare cross-examination questions','Draft questions for prosecution witnesses','High','InProgress','2025-03-10'),
            (2,1,'File written arguments','Submit written arguments to court','Urgent','Pending','2025-03-20'),
            (2,6,'Collect forensic report','Obtain CFSL report for NDPS evidence','High','Pending','2025-04-10'),
            (3,2,'Prepare custody assessment','Compile child welfare report','Medium','InProgress','2025-03-25'),
            (3,8,'Draft maintenance calculation','Calculate income-based maintenance amount','Medium','Completed','2025-02-15'),
            (4,3,'Review SEBI compliance','Ensure merger complies with SEBI regulations','High','InProgress','2025-03-15'),
            (5,4,'Arrange surveyor visit','Coordinate with government surveyor for site inspection','Medium','Pending','2025-03-12'),
            (6,5,'File interim application','Apply for interim relief for terminated workers','Urgent','Pending','2025-05-05'),
            (6,9,'Prepare PIL brief','Draft constitutional arguments for PIL','High','InProgress','2025-08-10'),
            (12,1,'Verify all documents','Cross-check submitted documents for authenticity','Medium','InProgress','2025-03-08')
        `);

        // Notifications
        await db.query(`INSERT INTO notifications (user_id,title,message,type,is_read,link) VALUES
            (2,'Hearing Reminder','Cross-examination scheduled for March 15 at Karnataka High Court','warning',0,'cases'),
            (2,'New Task Assigned','Admin assigned: File written arguments for Case #1','info',0,'tasks'),
            (3,'Custody Hearing Update','Custody hearing for Verma case on April 5','warning',0,'hearings'),
            (7,'Payment Confirmation','₹88,500 payment received for Invoice INV-2024-001','success',1,'payments'),
            (7,'Case Update','Your case Sharma vs. State is scheduled for cross-examination','info',0,'cases'),
            (8,'Invoice Overdue','Invoice INV-2024-004 of ₹1,18,000 is overdue','danger',0,'invoices'),
            (9,'Merger Update','Regulatory approval hearing scheduled for March 20','info',0,'hearings'),
            (12,'Document Pending','5 documents awaiting verification','warning',0,'documents'),
            (NULL,'Court Holiday Notice','All courts closed on March 29 for Holi festival','broadcast',0,NULL),
            (NULL,'System Maintenance','Scheduled maintenance on April 1 from 2:00 AM to 6:00 AM','broadcast',0,NULL)
        `);

        // Messages
        await db.query(`INSERT INTO messages (case_id,sender_id,receiver_id,content,is_read) VALUES
            (1,7,2,'Rajesh ji, what is the update on bail conditions? Can I travel to Mumbai?',1),
            (1,2,7,'Priya ji, as per bail conditions you need court permission for interstate travel. I will file an application.',1),
            (1,7,2,'Thank you. Please do it at the earliest.',0),
            (2,8,3,'Anjali madam, is there any chance of settlement in the custody matter?',1),
            (2,3,8,'Rohit ji, mediation has failed but I suggest we try one more round before trial.',0),
            (3,9,4,'Vikram sir, SEBI has raised some queries on the merger proposal.',1),
            (3,4,9,'Neha ji, I have reviewed the queries. I will prepare a response by tomorrow.',0),
            (4,10,5,'Meera madam, I have found the original sale deed from 1985.',1),
            (4,5,10,'Excellent Amit ji! Please courier it to my office immediately.',0)
        `);

        // Ratings
        await db.query(`INSERT INTO ratings (case_id,client_id,lawyer_id,rating,review) VALUES
            (10,7,5,5,'Meera madam handled my consumer case excellently. Got full refund within 2 months.'),
            (7,11,3,4,'Anjali madam fought the PIL well. Result was satisfactory.')
        `);

        // Templates
        await db.query(`INSERT INTO templates (title,category,type,content,created_by,usage_count) VALUES
            ('Bail Application Format','Criminal','Application','IN THE COURT OF [Judge Name]\\n\\nCriminal Misc. Application No. ___/2024\\n\\nIn the matter of:\\n[Applicant Name] ... Applicant\\nVs.\\nState of [State] ... Respondent\\n\\nAPPLICATION FOR BAIL UNDER SECTION 439 Cr.P.C.\\n\\nMost Respectfully Showeth:\\n1. That the applicant is an accused in FIR No. ___\\n2. That the applicant is willing to abide by any conditions...',2,45),
            ('Divorce Petition Format','Family','Petition','IN THE FAMILY COURT AT [City]\\n\\nPetition No. ___/2024\\n\\n[Petitioner Name] ... Petitioner\\nVs.\\n[Respondent Name] ... Respondent\\n\\nPETITION UNDER SECTION 13 OF THE HINDU MARRIAGE ACT, 1955\\n\\nThe petitioner above named begs to state as follows:...',3,32),
            ('Vakalatnama Format','General','Authorization','VAKALATNAMA\\n\\nIN THE [Court Name]\\n\\nCase No. ___/2024\\n\\nI/We [Client Name] do hereby appoint and retain [Advocate Name] as my/our advocate...',2,78),
            ('Written Statement Format','Civil','Statement','IN THE COURT OF [Judge Name]\\n\\nSuit No. ___/2024\\n\\n[Plaintiff] ... Plaintiff\\nVs.\\n[Defendant] ... Defendant\\n\\nWRITTEN STATEMENT ON BEHALF OF THE DEFENDANT...',4,25),
            ('RTI Application Format','Administrative','Application','To,\\nThe Public Information Officer,\\n[Department Name]\\n\\nSubject: Application under Right to Information Act, 2005\\n\\nSir/Madam,\\nI would like to seek the following information...',6,55),
            ('Consumer Complaint Format','Consumer','Complaint','BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL FORUM\\n\\nComplaint No. ___/2024\\n\\n[Complainant Name] ... Complainant\\nVs.\\n[Opposite Party] ... Opposite Party\\n\\nCOMPLAINT UNDER SECTION 35 OF CONSUMER PROTECTION ACT, 2019...',5,18)
        `);

        // Case Timeline
        await db.query(`INSERT INTO case_timeline (case_id,event_title,event_description,event_date,event_type,created_by) VALUES
            (1,'FIR Filed','FIR No. 234/2024 registered at Koramangala PS','2024-01-14','Filing',2),
            (1,'Case Filed in High Court','Criminal petition filed in Karnataka HC','2024-01-15','Filing',2),
            (1,'Bail Granted','Bail granted with conditions - ₹2,00,000 surety','2024-11-15','Order',2),
            (1,'Witness Examination','3 prosecution witnesses examined','2025-01-20','Hearing',2),
            (2,'Petition Filed','Divorce petition filed under Section 13 HMA','2024-02-20','Filing',3),
            (2,'Mediation Attempt','Court-ordered mediation - unsuccessful','2025-02-10','Hearing',3),
            (3,'Merger Application Filed','Application filed with Delhi District Court','2024-03-10','Filing',4),
            (3,'SEBI Approval Obtained','SEBI granted conditional approval','2024-12-15','Order',4),
            (10,'Complaint Filed','Consumer complaint filed at City Civil Court','2024-01-10','Filing',5),
            (10,'Judgment - Full Refund','Court ordered full refund of ₹89,999 + ₹10,000 compensation','2024-04-15','Judgment',5)
        `);

        // Audit Logs
        await db.query(`INSERT INTO audit_logs (user_id,user_name,action,entity_type,entity_id,details,ip_address) VALUES
            (1,'Admin Sharma','LOGIN','User',1,'Admin login successful','192.168.1.100'),
            (2,'Adv. Rajesh Kumar','UPLOAD_DOCUMENT','Document',1,'Uploaded FIR Copy','192.168.1.101'),
            (12,'Suresh Patel','VERIFY_DOCUMENT','Document',1,'Verified FIR Copy','192.168.1.102'),
            (1,'Admin Sharma','CREATE_USER','User',14,'Created new clerk account','192.168.1.100'),
            (3,'Adv. Anjali Desai','UPDATE_CASE','Case',2,'Updated case status to Evidence','192.168.1.103'),
            (7,'Priya Sharma','MAKE_PAYMENT','Payment',1,'Paid ₹88,500 via UPI','192.168.1.104'),
            (1,'Admin Sharma','BROADCAST','Notification',9,'Sent court holiday notice','192.168.1.100'),
            (4,'Adv. Vikram Singh','CREATE_INVOICE','Invoice',6,'Generated invoice INV-2024-006','192.168.1.105')
        `);

        // Compliance Checks
        await db.query(`INSERT INTO compliance_checks (check_type,category,status,details,checked_by,next_review) VALUES
            ('Data Encryption Audit','Security','Compliant','All sensitive data encrypted with AES-256',1,'2025-06-01'),
            ('Data Retention Policy','Data_Retention','Compliant','Case data retained for 8 years as per Bar Council rules',1,'2025-06-01'),
            ('GDPR Consent Verification','GDPR','Compliant','All users provided explicit consent for data processing',1,'2025-04-01'),
            ('IT Act Section 43A Compliance','IT_Act','Compliant','Reasonable security practices implemented as per IT Act',1,'2025-06-01'),
            ('Access Control Audit','Security','Review','RBAC implementation needs review for new clerk accounts',1,'2025-03-15'),
            ('Backup Verification','Security','Compliant','Daily encrypted backups verified and restorable',1,'2025-04-01')
        `);

        // Fraud Alerts
        await db.query(`INSERT INTO fraud_alerts (user_id,alert_type,severity,description,ip_address,is_resolved) VALUES
            (8,'MultipleFailedLogins','Medium','5 failed login attempts from unknown IP','103.45.67.89',0),
            (NULL,'SuspiciousLogin','High','Login attempt from unusual location (Russia)','185.220.101.45',0),
            (3,'DocTampering','Critical','Document hash mismatch detected for Marriage Certificate','192.168.1.103',1),
            (NULL,'UnusualActivity','Low','Bulk document download attempt detected','203.45.78.90',0)
        `);

        // Backups
        await db.query(`INSERT INTO backups (backup_name,size,type,status,created_by) VALUES
            ('backup_2025_03_01_full','2.3 GB','Full','Completed',1),
            ('backup_2025_03_02_incr','156 MB','Incremental','Completed',1),
            ('backup_2025_03_03_incr','142 MB','Incremental','Completed',1)
        `);

        // Cause Lists
        await db.query(`INSERT INTO cause_lists (court_id,date,uploaded_by,total_cases) VALUES
            (2,'2025-03-15',12,45),
            (2,'2025-03-16',12,38),
            (3,'2025-04-05',13,52),
            (5,'2025-03-20',12,28)
        `);

        // Evidence
        await db.query(`INSERT INTO evidence (case_id,title,type,uploaded_by,description,is_verified) VALUES
            (1,'CCTV Footage - Property Office','Video',2,'CCTV recording showing accused at property registrar office',1),
            (1,'WhatsApp Chat Screenshots','Digital',7,'Screenshots of conversation between accused parties',0),
            (6,'Seized Substance Lab Report','Document',2,'CFSL analysis report of seized substance',1),
            (4,'Google Earth Survey Map','Digital',5,'Satellite imagery showing property boundaries',0),
            (2,'Child School Report Card','Document',3,'Academic performance report of minor child',1)
        `);

        // Physical Document Tracking
        await db.query(`INSERT INTO physical_docs (case_id,document_name,current_location,location_detail,barcode,doc_type,priority,tracked_by) VALUES
            (1,'Original FIR Copy','Court','Karnataka HC Registry - Rack 12B','LO-DOC-2024-001','FIR / Complaint','Urgent',12),
            (1,'Property Registration Papers','Office','Rajesh Kumar Office - File Cabinet A3','LO-DOC-2024-002','Registration Deed','Normal',12),
            (2,'Marriage Certificate Original','Court','Bombay HC Family Division - File Room 2','LO-DOC-2024-003','Certificate','Normal',13),
            (4,'Sale Deed 1985 Original','InTransit','Courier from Chennai to Bangalore (AWB: DL123456)','LO-DOC-2024-004','Sale Deed','Critical',12),
            (3,'Board Resolution Original','Archive','Delhi Office Archive - Box 45','LO-DOC-2024-005','Corporate Filing','Normal',12)
        `);

        // Physical Doc Tracking History
        await db.query(`INSERT INTO physical_doc_history (doc_id,location,location_detail,action,notes,handled_by,created_at) VALUES
            (1,'Office','Rajesh Kumar Office','Document Received','Original FIR copy received from client Mr. Vikram',12,'2025-08-10 09:30:00'),
            (1,'Office','Rajesh Kumar Office - Scanned','Document Verified','Verified authenticity, scanned digital copy uploaded',12,'2025-08-10 11:00:00'),
            (1,'InTransit','Courier to Karnataka HC (AWB: KA789012)','Dispatched to Court','Sent via registered post for filing',12,'2025-08-12 14:00:00'),
            (1,'Court','Karnataka HC Registry','Received at Court','Received by registry clerk, acknowledgment obtained',13,'2025-08-14 10:30:00'),
            (1,'Court','Karnataka HC Registry - Rack 12B','Filed in Registry','Document filed and indexed in Rack 12B',13,'2025-08-14 15:00:00'),
            (2,'Client','Client Residence','Document Collected','Collected marriage certificate from client residence',12,'2025-09-01 10:00:00'),
            (2,'Office','Main Office - Verified','Verification Complete','Document verified with registrar records',12,'2025-09-02 11:30:00'),
            (2,'InTransit','Courier to Bombay HC','Dispatched to Court','Sent to Bombay HC for family case filing',12,'2025-09-03 09:00:00'),
            (2,'Court','Bombay HC Family Division - File Room 2','Filed at Court','Filed in family division file room',13,'2025-09-05 14:00:00'),
            (4,'Client','Client Office Chennai','Document Collected','Original sale deed collected for verification',12,'2025-11-20 10:00:00'),
            (4,'Office','Chennai Branch - Legal Review','Under Review','Legal team reviewing document authenticity',12,'2025-11-21 09:30:00'),
            (4,'InTransit','Courier from Chennai to Bangalore (AWB: DL123456)','Dispatched','Sent to Bangalore head office for court filing',12,'2025-11-25 11:00:00'),
            (3,'Office','Delhi Office','Document Received','Board resolution received from corporate client',12,'2025-10-05 10:00:00'),
            (3,'Office','Delhi Office - Notarized','Notarization Complete','Document notarized by authorized notary',12,'2025-10-07 16:00:00'),
            (3,'Archive','Delhi Office Archive - Box 45','Archived','Case concluded, document moved to long-term archive',12,'2025-12-15 11:00:00')
        `);

        // Consultations
        await db.query(`INSERT INTO consultations (client_id,lawyer_id,case_id,scheduled_date,scheduled_time,duration,type,status,meeting_link,fee) VALUES
            (7,2,1,'2025-03-12','16:00:00',30,'Video','Confirmed','https://meet.laworbit.com/room-abc123',2000),
            (8,3,2,'2025-03-18','14:00:00',45,'Video','Requested',NULL,3000),
            (9,4,3,'2025-03-20','11:00:00',60,'InPerson','Confirmed',NULL,5000),
            (10,5,4,'2025-03-14','10:00:00',30,'Audio','Completed',NULL,1500),
            (11,6,5,'2025-05-08','15:00:00',45,'Video','Requested',NULL,4000)
        `);

        console.log('✅ All seed data inserted successfully!');
        console.log('✅ Database initialization complete!');
        await db.end();
        process.exit(0);

    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

initDB();
