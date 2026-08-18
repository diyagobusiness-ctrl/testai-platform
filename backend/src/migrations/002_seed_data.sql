-- Seed data for TestAi platform

-- Create tenant: Acme University
INSERT INTO tenants (name, slug, subscription_plan, max_students, current_students_count, is_active)
VALUES ('Acme University', 'acme', 'ENTERPRISE', 500, 3, true)
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

-- Assign Super Admin role (tenant_id is nullable via unique constraint workaround)
-- Since PK is (user_id, role_id, tenant_id), we need a dummy tenant for super admin
-- Let's use the acme tenant for super admin too
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, t.id
FROM users u, roles r, tenants t
WHERE u.email = 'admin@testai.com' AND r.name = 'SUPER_ADMIN' AND t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Tenant Admin role (assigned to Acme tenant)
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, t.id
FROM users u, roles r, tenants t
WHERE u.email = 'tenantadmin@testai.com' AND r.name = 'TENANT_ADMIN' AND t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Student role (assigned to Acme tenant)
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

-- Create some sample aptitude questions
INSERT INTO questions (tenant_id, category, question_text, options, correct_answer, difficulty_level, explanation, time_limit_seconds)
SELECT t.id, 'QUANTITATIVE', 'What is 15% of 200?', '["25","30","35","40"]'::jsonb, 'b', 'EASY', '15% of 200 = 0.15 * 200 = 30', 60
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_text = 'What is 15% of 200?');

INSERT INTO questions (tenant_id, category, question_text, options, correct_answer, difficulty_level, explanation, time_limit_seconds)
SELECT t.id, 'QUANTITATIVE', 'If a train travels 360 km in 4 hours, what is its speed?', '["80 km/h","90 km/h","100 km/h","110 km/h"]'::jsonb, 'b', 'EASY', 'Speed = Distance/Time = 360/4 = 90 km/h', 60
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_text LIKE '%train travels 360%');

INSERT INTO questions (tenant_id, category, question_text, options, correct_answer, difficulty_level, explanation, time_limit_seconds)
SELECT t.id, 'LOGICAL_REASONING', 'Complete the series: 2, 6, 12, 20, ?', '["28","30","32","36"]'::jsonb, 'b', 'MEDIUM', 'Pattern: n(n+1) where n=1,2,3,4,5. Next is 5*6=30', 90
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_text LIKE '%Complete the series%');

INSERT INTO questions (tenant_id, category, question_text, options, correct_answer, difficulty_level, explanation, time_limit_seconds)
SELECT t.id, 'VERBAL_ABILITY', 'Choose the synonym of "Eloquent":', '["Fluent","Silent","Dull","Rude"]'::jsonb, 'a', 'EASY', 'Eloquent means fluent or persuasive in speaking or writing', 60
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_text LIKE '%synonym of%');

INSERT INTO questions (tenant_id, category, question_text, options, correct_answer, difficulty_level, explanation, time_limit_seconds)
SELECT t.id, 'LOGICAL_REASONING', 'If all roses are flowers and some flowers fade quickly, which is true?', '["All roses fade quickly","Some roses may fade quickly","No roses fade quickly","All flowers are roses"]'::jsonb, 'b', 'MEDIUM', 'Some flowers fade quickly, and roses are flowers, so some roses may fade quickly', 90
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_text LIKE '%all roses are flowers%');

-- Create sample job listings
INSERT INTO job_listings (tenant_id, title, company_name, description, required_skills, location, salary_min, salary_max, job_type)
SELECT t.id, 'Junior Software Developer', 'Acme Tech Solutions', 'Join our team as a junior developer. You will work on exciting projects using modern technologies.', '["JavaScript","React","Node.js"]'::jsonb, 'Bangalore, India', 400000, 700000, 'FULL_TIME'
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM job_listings jl WHERE jl.title = 'Junior Software Developer');

INSERT INTO job_listings (tenant_id, title, company_name, description, required_skills, location, salary_min, salary_max, job_type)
SELECT t.id, 'Data Analyst Intern', 'Acme Analytics', 'Internship opportunity for aspiring data analysts. Learn from industry experts.', '["Python","SQL","Excel"]'::jsonb, 'Hyderabad, India', 15000, 25000, 'INTERNSHIP'
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM job_listings jl WHERE jl.title = 'Data Analyst Intern');

INSERT INTO job_listings (tenant_id, title, company_name, description, required_skills, location, salary_min, salary_max, job_type)
SELECT t.id, 'Full Stack Developer', 'Acme Digital', 'Build end-to-end web applications. Work with React, Node.js, and PostgreSQL.', '["React","Node.js","PostgreSQL","TypeScript"]'::jsonb, 'Remote', 800000, 1200000, 'FULL_TIME'
FROM tenants t WHERE t.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM job_listings jl WHERE jl.title = 'Full Stack Developer');

-- Create sample resume designs
INSERT INTO resume_designs (name, template_html, css_styling, is_premium, credits_required)
VALUES
('Modern', '<div class="resume modern">{{content}}</div>', '.modern { font-family: Arial; }', false, 0),
('Classic', '<div class="resume classic">{{content}}</div>', '.classic { font-family: Georgia; }', false, 0),
('Creative', '<div class="resume creative">{{content}}</div>', '.creative { font-family: Helvetica; color: #333; }', true, 25)
ON CONFLICT DO NOTHING;
