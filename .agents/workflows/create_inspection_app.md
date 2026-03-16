---
description: Setup Inspection Application (React + Node.js) with JWT auth and MySQL
---

1. **Create backend directory**
   ```
   mkdir backend
   cd backend
   ```

2. **Initialize Node.js project**
   ```
   npm init -y
   ```

3. **Install backend dependencies**
   ```
   npm install express cors dotenv jsonwebtoken bcryptjs mysql2
   ```

4. **Create basic server file** (`server.js`)
   ```
   // turbo
   // (Will be auto‑run after the workflow is executed)
   ```

5. **Create `.env` file for configuration**
   ```
   // turbo
   ```

6. **Create frontend directory**
   ```
   cd ..
   npx -y create-vite@latest frontend --template react
   cd frontend
   ```

7. **Install frontend dependencies**
   ```
   npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
   ```

8. **Set up React routing and authentication context**
   // turbo

9. **Run development servers**
   // turbo-all
   ```
   # In backend folder
   npm run dev
   # In frontend folder
   npm run dev
   ```
