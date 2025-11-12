-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: resonance@123 hashed with bcrypt)
-- Hash generated using bcrypt with salt rounds 10
INSERT INTO users (name, email, password, is_admin) VALUES 
('Shubham', 'shubham.dhyani@singleinterface.com', '$2a$10$M9e8TeSVPkU8z4V4R3K5bO.7SLgVJLhJ5E8e8O8e8O8e8O8e8O8e8', TRUE)
ON DUPLICATE KEY UPDATE id=id;
