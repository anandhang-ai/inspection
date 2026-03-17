// server.js
require('dotenv').config();
const mcpClient = require('./mcpClient');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to verify JWT and attach user info
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // { id, username, role }
        next();
    });
}

// Role‑based access control middleware
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) return res.sendStatus(401);
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
        next();
    };
}

// ---------- Auth Routes ----------
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (rows.length) return res.status(409).json({ message: 'User already exists' });
        const hashed = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, hashed, role]);
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    try {
        const [rows] = await pool.query('SELECT id, password_hash, role FROM users WHERE username = ?', [username]);
        if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, role: user.role, username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ---------- Inspection Routes ----------
// Inspector creates a new inspection
app.post('/api/inspections', authenticateToken, authorizeRoles('inspector'), async (req, res) => {
    const { equipmentName, inspectionDate, checklistItems, comments } = req.body;
    try {
        const [result] = await pool.query(
            `INSERT INTO inspections (equipment_name, inspection_date, checklist_items, comments, status, inspector_id) 
       VALUES (?, ?, ?, ?, 'pending', ?)`,
            [equipmentName, inspectionDate, JSON.stringify(checklistItems), comments, req.user.id]
        );
        res.status(201).json({ id: result.insertId, message: 'Inspection submitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Supervisor fetches pending inspections
app.get('/api/inspections/pending', authenticateToken, authorizeRoles('supervisor'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT i.*, u.username AS inspector_name FROM inspections i 
       JOIN users u ON i.inspector_id = u.id WHERE i.status = 'pending'`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Supervisor approves or rejects an inspection
app.put('/api/inspections/:id/review', authenticateToken, authorizeRoles('supervisor'), async (req, res) => {
    const { id } = req.params;
    const { decision, supervisorComments } = req.body; // decision: 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
        return res.status(400).json({ message: 'Invalid decision' });
    }
    try {
        await pool.query(
            `UPDATE inspections SET status = ?, supervisor_comments = ?, supervisor_id = ? WHERE id = ?`,
            [decision, supervisorComments, req.user.id, id]
        );
        res.json({ message: `Inspection ${decision}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Inspector can fetch own inspections (including rejected for correction)
app.get('/api/inspections/mine', authenticateToken, authorizeRoles('inspector'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM inspections WHERE inspector_id = ? ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Inspector updates a rejected inspection (resubmission)
app.put('/api/inspections/:id', authenticateToken, authorizeRoles('inspector'), async (req, res) => {
    const { id } = req.params;
    const { equipmentName, inspectionDate, checklistItems, comments } = req.body;
    try {
        // Verify ownership and status
        const [rows] = await pool.query('SELECT status, inspector_id FROM inspections WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        if (rows[0].inspector_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
        if (rows[0].status !== 'rejected') return res.status(400).json({ message: 'Only rejected inspections can be updated' });

        await pool.query(
            `UPDATE inspections SET equipment_name = ?, inspection_date = ?, checklist_items = ?, comments = ?, status = 'pending' 
             WHERE id = ?`,
            [equipmentName, inspectionDate, JSON.stringify(checklistItems), comments, id]
        );
        res.json({ message: 'Inspection resubmitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// ---------- Material Routes (Integrated with Pillir Flow SAP) ----------

// Fetch material details from SAP
app.get('/api/materials/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { plant = '1000' } = req.query;

    try {
        const result = await mcpClient.getMaterialDetail(id, plant);

        if (result.type === "error") {
            return res.status(400).json({ message: 'SAP Error', error: result.result });
        }

        res.json(result);
    } catch (err) {
        console.error('MCP Error:', err);
        res.status(500).json({ message: 'Error communicating with SAP server' });
    }
});

// Create Material (Integrated with BAPI_MATERIAL_SAVEDATA)
app.post('/api/materials', authenticateToken, authorizeRoles('admin', 'supervisor', 'inspector'), async (req, res) => {
    const materialData = req.body;
    try {
        const result = await mcpClient.saveMaterial(materialData);
        if (result.type === "error") {
            return res.status(400).json({ message: 'SAP Error during Create', error: result.result });
        }
        res.json(result);
    } catch (err) {
        console.error('MCP Create Error:', err);
        res.status(500).json({ message: 'Error creating material in SAP' });
    }
});

// Update Material (Integrated with BAPI_MATERIAL_SAVEDATA)
app.put('/api/materials/:id', authenticateToken, authorizeRoles('admin', 'supervisor', 'inspector'), async (req, res) => {
    const { id } = req.params;
    const materialData = { ...req.body, MATERIAL: id };
    try {
        const result = await mcpClient.saveMaterial(materialData);
        if (result.type === "error") {
            return res.status(400).json({ message: 'SAP Error during Update', error: result.result });
        }
        res.json(result);
    } catch (err) {
        console.error('MCP Update Error:', err);
        res.status(500).json({ message: 'Error updating material in SAP' });
    }
});

// Delete Material (Integrated with BAPI_MATERIAL_SAVEDATA - flag for deletion)
app.delete('/api/materials/:id', authenticateToken, authorizeRoles('admin', 'supervisor', 'inspector'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await mcpClient.deleteMaterial(id);
        if (result.type === "error") {
            return res.status(400).json({ message: 'SAP Error during Delete', error: result.result });
        }
        res.json(result);
    } catch (err) {
        console.error('MCP Delete Error:', err);
        res.status(500).json({ message: 'Error flagging material for deletion in SAP' });
    }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
