-- ============================================================
-- Smart College Notes Exchange with AI Note Summarization
-- Database Schema for MySQL
-- Database: smart_college_notes
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_college_notes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_college_notes;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100) NULL,
    year INT NULL,
    semester INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: subjects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    INDEX idx_subject_dept_sem (department, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: notes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    unit VARCHAR(50) NULL,
    description TEXT NULL,
    tags VARCHAR(255) NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0,
    uploaded_by BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_uploaded_by FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notes_status (status),
    INDEX idx_notes_dept_sem (department, semester),
    INDEX idx_notes_subject (subject),
    INDEX idx_notes_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: bookmarks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    note_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmarks_note FOREIGN KEY (note_id) 
        REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_note_bookmark UNIQUE (user_id, note_id),
    INDEX idx_bookmarks_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: downloads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS downloads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    note_id BIGINT NOT NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_downloads_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_downloads_note FOREIGN KEY (note_id) 
        REFERENCES notes(id) ON DELETE CASCADE,
    INDEX idx_downloads_user (user_id),
    INDEX idx_downloads_note (note_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    note_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_note FOREIGN KEY (note_id) 
        REFERENCES notes(id) ON DELETE CASCADE,
    INDEX idx_reviews_note (note_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: ai_summaries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_summaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    note_id BIGINT NOT NULL UNIQUE,
    summary MEDIUMTEXT NOT NULL,
    key_points LONGTEXT NOT NULL,
    important_topics LONGTEXT NOT NULL,
    keywords LONGTEXT NOT NULL,
    one_mark_questions LONGTEXT NOT NULL,
    three_mark_questions LONGTEXT NOT NULL,
    six_mark_questions LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_summaries_note FOREIGN KEY (note_id) 
        REFERENCES notes(id) ON DELETE CASCADE,
    INDEX idx_ai_summaries_note (note_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Seed Initial Subject Catalog
-- ------------------------------------------------------------
INSERT INTO subjects (name, department, semester) VALUES
('Data Structures & Algorithms', 'Computer Science', 3),
('Database Management Systems', 'Computer Science', 4),
('Operating Systems', 'Computer Science', 4),
('Computer Networks', 'Computer Science', 5),
('Artificial Intelligence & Machine Learning', 'Computer Science', 6),
('Software Engineering', 'Computer Science', 5),
('Analog & Digital Electronics', 'Electronics & Comm', 3),
('Signals and Systems', 'Electronics & Comm', 4),
('Thermodynamics', 'Mechanical Engineering', 3),
('Engineering Mathematics', 'First Year Common', 1);

-- ------------------------------------------------------------
-- Initial Default Admin User (Password: admin123 hashed with BCrypt)
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, role, department, year, semester)
VALUES (
    'System Admin',
    'admin@smartnotes.edu',
    '$2a$10$wK2dJj6g8u4q2jNvx5i5a.J4o3a4J6JkI9E.a1RzB9p3W0sS/WwK.',
    'ADMIN',
    'Administration',
    4,
    8
) ON DUPLICATE KEY UPDATE email=email;
