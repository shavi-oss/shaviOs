-- Shavi Academy OS Database Schema
-- PostgreSQL/Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (Employees & Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'marketing', 'sales', 'customer_success', 'trainer', 'operations', 'finance', 'hr'
    department VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LEADS & STUDENTS
-- ============================================

-- Leads (from Nazmly and other sources)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nazmly_id VARCHAR(100) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    marketing_source VARCHAR(100), -- 'facebook', 'google', 'instagram', 'referral', etc.
    campaign_id VARCHAR(100),
    sales_agent_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    ai_score INTEGER, -- 0-100, AI-calculated lead quality
    temperature VARCHAR(20), -- 'hot', 'warm', 'cold'
    predicted_value DECIMAL(10,2),
    conversion_date TIMESTAMP,
    notes TEXT,
    metadata JSONB, -- Additional flexible data
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Students (converted leads)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    nazmly_student_id VARCHAR(100) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    current_course_id UUID,
    progress_percentage INTEGER DEFAULT 0,
    customer_success_agent_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'graduated', 'dropped', 'suspended'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- COURSES & SESSIONS
-- ============================================

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nazmly_course_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours INTEGER,
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'draft'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nazmly_session_id VARCHAR(100) UNIQUE,
    course_id UUID REFERENCES courses(id),
    trainer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    actual_duration INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'ongoing', 'completed', 'cancelled'
    attendance JSONB, -- {student_id: boolean}
    feedback JSONB, -- {student_id: {rating: number, comment: string}}
    recording_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    course_id UUID REFERENCES courses(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'dropped'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SALES & FINANCE
-- ============================================

-- Sales Pipeline
CREATE TABLE sales_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    stage VARCHAR(50) NOT NULL, -- 'initial_contact', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
    agent_id UUID REFERENCES users(id),
    expected_value DECIMAL(10,2),
    probability INTEGER, -- 0-100
    next_action TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    enrollment_id UUID REFERENCES enrollments(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EGP',
    payment_method VARCHAR(50), -- 'cash', 'card', 'bank_transfer', 'paymob', etc.
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TIMESTAMP,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Commissions
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES users(id),
    source_type VARCHAR(50) NOT NULL, -- 'lead_conversion', 'renewal', 'upsell'
    source_id UUID, -- Reference to lead_id, enrollment_id, etc.
    amount DECIMAL(10,2) NOT NULL,
    calculated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'paid'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TASKS & PERFORMANCE
-- ============================================

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    related_entity_type VARCHAR(50), -- 'lead', 'student', 'session', etc.
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee Performance
CREATE TABLE employee_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES users(id),
    period DATE NOT NULL, -- e.g., '2024-01-01' for January 2024
    department VARCHAR(50),
    kpis JSONB NOT NULL, -- {leads_converted: 15, revenue_generated: 50000, ...}
    rating DECIMAL(3,2), -- 0.00 to 5.00
    manager_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SUPPORT & TICKETS
-- ============================================

-- Support Tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    category VARCHAR(50), -- 'technical', 'billing', 'course_content', etc.
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS & EVENTS
-- ============================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50), -- 'info', 'success', 'warning', 'error'
    category VARCHAR(50), -- 'task', 'payment', 'lead', 'session', etc.
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Event Log (for event-driven architecture)
CREATE TABLE event_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'LEAD_CREATED', 'PAYMENT_RECEIVED', 'SESSION_COMPLETED', etc.
    entity_type VARCHAR(50),
    entity_id UUID,
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_agent ON leads(sales_agent_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_cs_agent ON students(customer_success_agent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_event_log_processed ON event_log(processed, created_at);
