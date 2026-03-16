# Inspection Pro Application

A full-stack inspection management application with a two-role workflow (Inspector and Supervisor).

## Features
- **JWT Authentication**: Secure login and registration.
- **RBAC (Role-Based Access Control)**: Separate dashboards and permissions for Inspectors and Supervisors.
- **Inspection Workflow**: 
  - Inspectors submit equipment details and checklists.
  - Supervisors review (Approve/Reject) pending inspections.
  - Rejected inspections are returned to the inspector.
- **Premium UI**: Dark mode with glassmorphism and Material UI.

## Tech Stack
- **Frontend**: React, Vite, Material UI, Axios, React Router.
- **Backend**: Node.js, Express, JWT, Bcrypt, MySQL.
- **Database**: MySQL.

## Prerequisites
- Node.js (v16+)
- MySQL Server

## Getting Started

### 1. Database Setup
1. Log into your MySQL server.
2. Run the schema found in `backend/schema.sql`:
   ```sql
   source backend/schema.sql
   ```
3. Update `backend/.env` with your DB credentials.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials
- **Inspector**: `inspector1` / `password123`
- **Supervisor**: `supervisor1` / `password123`
*(Note: These are seeded in schema.sql. Ensure your .env JWT_SECRET is set.)*
