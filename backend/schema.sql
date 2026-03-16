-- schema.sql
-- MySQL schema for Inspection Application

CREATE DATABASE IF NOT EXISTS inspection_db;
USE inspection_db;

-- Users table (stores inspectors and supervisors)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('inspector','supervisor') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_name VARCHAR(100) NOT NULL,
  inspection_date DATE NOT NULL,
  checklist_items JSON NOT NULL,
  comments TEXT,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  inspector_id INT NOT NULL,
  supervisor_id INT NULL,
  supervisor_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed default users (password: password123)
INSERT IGNORE INTO users (username, password_hash, role) VALUES
  ('inspector1', '$2a$10$7aW8hG9V5M0ZkWzQG5eOeO6y8J9K1L2M3N4O5P6Q7R8S9T0U1V2W', 'inspector'),
  ('supervisor1', '$2a$10$7aW8hG9V5M0ZkWzQG5eOeO6y8J9K1L2M3N4O5P6Q7R8S9T0U1V2W', 'supervisor');

-- Note: The password_hash values above are placeholders. Use bcrypt to generate real hashes.
