-- Additional tables for TestAi platform

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'failed')),
  plan VARCHAR(50),
  billing_period VARCHAR(20),
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);

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

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- Add title column to questions table (alias for question_text)
DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS title VARCHAR(500);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(10);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update existing questions to use new columns
UPDATE questions SET title = question_text WHERE title IS NULL;
UPDATE questions SET description = question_text WHERE description IS NULL;
UPDATE questions SET difficulty = difficulty_level WHERE difficulty IS NULL;

-- Add columns to coding_challenges if missing
DO $$ BEGIN
  ALTER TABLE coding_challenges ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE coding_challenges ADD COLUMN IF NOT EXISTS starter_code TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add columns to job_listings if missing
DO $$ BEGIN
  ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS company VARCHAR(255);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS salary_min INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS salary_max INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS type VARCHAR(20);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS requirements JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update existing job listings
UPDATE job_listings SET company = company_name WHERE company IS NULL;
UPDATE job_listings SET salary_min = 0 WHERE salary_min IS NULL;
UPDATE job_listings SET salary_max = 0 WHERE salary_max IS NULL;
UPDATE job_listings SET type = job_type WHERE type IS NULL;

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
  ('Import Students (CSV)', 'Student Management'),
  ('Suspend Students', 'Student Management'),
  ('Manage Content', 'Content'),
  ('Add Questions', 'Content'),
  ('Manage Job Listings', 'Content'),
  ('Attempt Questions', 'Content'),
  ('Apply to Jobs', 'Content'),
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
    WHEN 'PREMISE' THEN 999
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
