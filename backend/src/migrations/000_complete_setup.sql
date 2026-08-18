-- TestAi Complete Database Setup for Neon
-- Run this single file in Neon SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('SUPER_ADMIN', 'Full platform access'),
  ('TENANT_ADMIN', 'Tenant-level management access'),
  ('STUDENT', 'Student access')
ON CONFLICT (name) DO NOTHING;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
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

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- User Roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id, tenant_id)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
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

CREATE INDEX IF NOT EXISTS idx_students_tenant ON students(tenant_id);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500),
  description TEXT,
  category VARCHAR(30) NOT NULL,
  difficulty VARCHAR(10) DEFAULT 'MEDIUM',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer CHAR(1) DEFAULT 'a',
  explanation TEXT,
  question_text TEXT,
  difficulty_level VARCHAR(10) DEFAULT 'MEDIUM',
  time_limit_seconds INTEGER DEFAULT 60,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_tenant ON questions(tenant_id);

-- Coding Challenges table
CREATE TABLE IF NOT EXISTS coding_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(10) DEFAULT 'MEDIUM',
  language VARCHAR(20) DEFAULT 'javascript',
  starter_code TEXT,
  solution TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_tenant ON coding_challenges(tenant_id);

-- Job Listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  company_name VARCHAR(255),
  description TEXT NOT NULL,
  location VARCHAR(255),
  salary_min INTEGER DEFAULT 0,
  salary_max INTEGER DEFAULT 0,
  type VARCHAR(20) DEFAULT 'FULL_TIME',
  job_type VARCHAR(20) DEFAULT 'FULL_TIME',
  requirements JSONB DEFAULT '[]',
  required_skills JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON job_listings(tenant_id);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  plan VARCHAR(50),
  billing_period VARCHAR(20),
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role Permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tenant_id UUID REFERENCES tenants(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resume Designs table
CREATE TABLE IF NOT EXISTS resume_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  template_html TEXT NOT NULL,
  css_styling TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  credits_required INTEGER DEFAULT 25,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student Resumes table
CREATE TABLE IF NOT EXISTS student_resumes (
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

-- Voice Practice Sessions
CREATE TABLE IF NOT EXISTS voice_practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  session_type VARCHAR(30) DEFAULT 'GENERAL_PRACTICE',
  duration_seconds INTEGER,
  accuracy_score INTEGER,
  transcribed_text TEXT,
  ai_feedback JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Code Submissions
CREATE TABLE IF NOT EXISTS code_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  challenge_id UUID,
  language VARCHAR(20) NOT NULL,
  code_content TEXT NOT NULL,
  execution_status VARCHAR(20),
  output TEXT,
  execution_time_ms INTEGER,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Student Exams
CREATE TABLE IF NOT EXISTS student_exams (
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

-- Student Job Applications
CREATE TABLE IF NOT EXISTS student_job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'APPLIED',
  applied_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(student_id, job_id)
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Create tenant: Acme University
INSERT INTO tenants (name, slug, subscription_plan, max_students, current_students_count, is_active)
VALUES ('Acme University', 'acme', 'ENTERPRISE', 500, 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Also create test1 and techcrop tenants
INSERT INTO tenants (name, slug, subscription_plan, max_students, current_students_count, is_active)
VALUES ('test1', 'test1', 'TRIAL', 50, 0, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenants (name, slug, subscription_plan, max_students, current_students_count, is_active)
VALUES ('TechCrop', 'techcrop', 'TRIAL', 50, 0, true)
ON CONFLICT (slug) DO NOTHING;

-- Super Admin (password: Password123!)
INSERT INTO users (email, password_hash, first_name, last_name, is_active)
VALUES ('admin@testai.com', '$2a$12$6w//UDoosDQc7aMGHaej0OiG4rxiMWDv4CJgCg5Q7F8Q6jiq1NqvK', 'Super', 'Admin', true)
ON CONFLICT (email) DO NOTHING;

-- Tenant Admin (password: Password123!)
INSERT INTO users (email, password_hash, first_name, last_name, is_active)
VALUES ('tenantadmin@testai.com', '$2a$12$6w//UDoosDQc7aMGHaej0OiG4rxiMWDv4CJgCg5Q7F8Q6jiq1NqvK', 'Rajesh', 'Kumar', true)
ON CONFLICT (email) DO NOTHING;

-- Student (password: Password123!)
INSERT INTO users (email, password_hash, first_name, last_name, is_active)
VALUES ('student@testai.com', '$2a$12$6w//UDoosDQc7aMGHaej0OiG4rxiMWDv4CJgCg5Q7F8Q6jiq1NqvK', 'John', 'Doe', true)
ON CONFLICT (email) DO NOTHING;

-- Assign Super Admin role
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, t.id
FROM users u, roles r, tenants t
WHERE u.email = 'admin@testai.com' AND r.name = 'SUPER_ADMIN' AND t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Tenant Admin role
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, t.id
FROM users u, roles r, tenants t
WHERE u.email = 'tenantadmin@testai.com' AND r.name = 'TENANT_ADMIN' AND t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Student role
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, t.id
FROM users u, roles r, tenants t
WHERE u.email = 'student@testai.com' AND r.name = 'STUDENT' AND t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Create student record
INSERT INTO students (tenant_id, user_id, enrollment_date, is_active, total_credits, current_credits)
SELECT t.id, u.id, NOW(), true, 100, 100
FROM users u, tenants t
WHERE u.email = 'student@testai.com' AND t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id AND s.tenant_id = t.id);

-- Insert default permissions
INSERT INTO permissions (name, category) VALUES
  ('View Dashboard', 'Dashboard'),
  ('View Analytics', 'Dashboard'),
  ('Export Reports', 'Dashboard'),
  ('Create Tenants', 'Tenant Management'),
  ('Edit Tenants', 'Tenant Management'),
  ('Delete Tenants', 'Tenant Management'),
  ('Suspend Tenants', 'Tenant Management'),
  ('Manage Students', 'Student Management'),
  ('Create Students', 'Student Management'),
  ('Suspend Students', 'Student Management'),
  ('Manage Content', 'Content'),
  ('Add Questions', 'Content'),
  ('Manage Job Listings', 'Content'),
  ('Manage Billing', 'Billing'),
  ('View Invoices', 'Billing'),
  ('Manage Settings', 'Settings'),
  ('Manage Roles', 'Settings')
ON CONFLICT DO NOTHING;

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('platform_name', 'TestAi', 'Platform display name'),
  ('support_email', 'support@testai.com', 'Support contact email'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('max_upload_size', '10', 'Maximum file upload size in MB'),
  ('session_timeout', '30', 'Session timeout in minutes')
ON CONFLICT (key) DO NOTHING;

-- Seed invoices
INSERT INTO invoices (tenant_id, invoice_number, amount, status, plan, billing_period, due_date, paid_at)
SELECT
  t.id,
  'INV-2025-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'),
  CASE t.subscription_plan
    WHEN 'ENTERPRISE' THEN 2999
    WHEN 'PREMIUM' THEN 999
    WHEN 'BASIC' THEN 299
    ELSE 0
  END,
  'paid',
  t.subscription_plan,
  'monthly',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM invoices LIMIT 1)
LIMIT 5;

-- Create sample job listings
INSERT INTO job_listings (tenant_id, title, company, description, location, salary_min, salary_max, type)
SELECT t.id, 'Junior Software Developer', 'Acme Tech Solutions', 'Join our team as a junior developer.', 'Bangalore, India', 400000, 700000, 'FULL_TIME'
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM job_listings jl WHERE jl.title = 'Junior Software Developer');

INSERT INTO job_listings (tenant_id, title, company, description, location, salary_min, salary_max, type)
SELECT t.id, 'Data Analyst Intern', 'Acme Analytics', 'Internship for aspiring data analysts.', 'Hyderabad, India', 15000, 25000, 'INTERNSHIP'
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM job_listings jl WHERE jl.title = 'Data Analyst Intern');

INSERT INTO job_listings (tenant_id, title, company, description, location, salary_min, salary_max, type)
SELECT t.id, 'Full Stack Developer', 'Acme Digital', 'Build end-to-end web applications.', 'Remote', 800000, 1200000, 'FULL_TIME'
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM job_listings jl WHERE jl.title = 'Full Stack Developer');
