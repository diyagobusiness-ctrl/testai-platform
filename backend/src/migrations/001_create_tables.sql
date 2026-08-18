-- TestAi Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('SUPER_ADMIN', 'Full platform access'),
  ('TENANT_ADMIN', 'Tenant-level management access'),
  ('STUDENT', 'Student access');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  subscription_plan VARCHAR(20) DEFAULT 'TRIAL',
  max_students INTEGER DEFAULT 50,
  current_students_count INTEGER DEFAULT 0,
  billing_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  suspended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_active ON tenants(is_active);

-- User Roles junction table
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id, tenant_id)
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  suspended_at TIMESTAMP,
  total_credits INTEGER DEFAULT 100,
  current_credits INTEGER DEFAULT 100,
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_user ON students(user_id);

-- Questions table (for Aptitude Arena)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('QUANTITATIVE', 'LOGICAL_REASONING', 'VERBAL_ABILITY')),
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options JSONB NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  difficulty_level VARCHAR(10) DEFAULT 'MEDIUM' CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
  time_limit_seconds INTEGER DEFAULT 60,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_questions_tenant ON questions(tenant_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);

-- Job Listings table
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills JSONB DEFAULT '[]',
  location VARCHAR(255),
  salary_min INTEGER,
  salary_max INTEGER,
  job_type VARCHAR(20) DEFAULT 'FULL_TIME' CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP')),
  application_url TEXT,
  posted_date TIMESTAMP DEFAULT NOW(),
  deadline TIMESTAMP,
  source VARCHAR(20) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'EXTERNAL_API')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_listings_tenant ON job_listings(tenant_id);
CREATE INDEX idx_job_listings_type ON job_listings(job_type);

-- Student Job Applications
CREATE TABLE student_job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED')),
  applied_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(student_id, job_id)
);

CREATE INDEX idx_applications_student ON student_job_applications(student_id);

-- Resume Designs table
CREATE TABLE resume_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  template_html TEXT NOT NULL,
  css_styling TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  credits_required INTEGER DEFAULT 25,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student Resumes table
CREATE TABLE student_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  design_id UUID REFERENCES resume_designs(id),
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  credits_used INTEGER DEFAULT 25,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resumes_student ON student_resumes(student_id);

-- Voice Practice Sessions
CREATE TABLE voice_practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  session_type VARCHAR(30) DEFAULT 'GENERAL_PRACTICE' CHECK (session_type IN ('INTERVIEW_PREP', 'GENERAL_PRACTICE')),
  duration_seconds INTEGER,
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  transcribed_text TEXT,
  ai_feedback JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_sessions_student ON voice_practice_sessions(student_id);

-- Code Submissions (Y-Codes)
CREATE TABLE code_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  challenge_id UUID,
  language VARCHAR(20) NOT NULL CHECK (language IN ('javascript', 'python', 'java', 'cpp')),
  code_content TEXT NOT NULL,
  execution_status VARCHAR(20) CHECK (execution_status IN ('SUCCESS', 'ERROR', 'TIMEOUT')),
  output TEXT,
  execution_time_ms INTEGER,
  memory_used_mb DECIMAL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_code_submissions_student ON code_submissions(student_id);

-- Student Exams
CREATE TABLE student_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL,
  question_count INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  answers JSONB,
  score INTEGER,
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP
);

CREATE INDEX idx_exams_student ON student_exams(student_id);

-- Video Call Sessions (for Voice AI with face detection)
CREATE TABLE video_call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  session_date TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  face_detected_percentage DECIMAL,
  unusual_movement_warnings INTEGER DEFAULT 0,
  session_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_video_sessions_student ON video_call_sessions(student_id);
