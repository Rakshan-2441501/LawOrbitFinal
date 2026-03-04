# LawOrbit Web Application (Full Stack)

This is a comprehensive Legal Case Management System built with **Node.js, Express, and MySQL**.

## Features
- **Role-Based Access Control**: Admin, Lawyer, Client, Clerk.
- **Dashboard Analytics**: Real-time charts for cases, hearings, and revenue.
- **MySQL Database**: Persistent storage for all data.
- **REST API**: Full backend API architecture.
- **Document Management**: File uploads and tracking.

## Prerequisites
- Node.js (v14+)
- MySQL Server (v8.0+)

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    - Open `.env` file.
    - Set your MySQL password in `DB_PASSWORD`.
    - Default user is `root` and database is `law_orbit_db`.

3.  **Initialize Database**
    Run the setup script to create the database and seed mock data:
    ```bash
    npm run init-db
    ```
    *Note: If this fails, ensure MySQL server is running and credentials are correct.*

4.  **Start the Server**
    ```bash
    npm start
    ```

5.  **Access the App**
    Open your browser and navigate to:
    [http://localhost:3000](http://localhost:3000)

## Default Credentials
- **Admin**: `admin@laworbit.com` / `password`
- **Lawyer**: `rajesh@laworbit.com` / `password`
- **Client**: `priya@client.com` / `password`
- **Clerk**: `suresh@laworbit.com` / `password`

## Project Structure
- `server.js`: Main entry point.
- `config/`: Database configuration.
- `routes/`: API endpoints.
- `public/`: Frontend assets (HTML, CSS, JS).
- `database/`: SQL initialization scripts.
