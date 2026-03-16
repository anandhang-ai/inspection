const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    try {
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await connection.query(sql);
        console.log('Database and tables initialized successfully.');

        // Create actual bcrypt hashes for seed users if needed
        // In this basic version, we rely on the schema.sql seed.

        process.exit(0);
    } catch (err) {
        console.error('Error during setup:', err);
        process.exit(1);
    }
}

setup();
