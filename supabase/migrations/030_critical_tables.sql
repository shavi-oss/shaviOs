-- ================================================================
-- MIGRATION 030: Critical Tables - Phase 1 (FIXED)
-- Description: Creates 7 critical tables with enhancements
-- Version: 3.0 (Final - Fixed)
-- Created: 2025-12-12
-- ================================================================

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS performance_reviews CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;

-- ================================================================
-- TABLE 1: campaigns
-- Purpose: Marketing campaigns with budget tracking and metrics
-- ================================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign details
  name TEXT NOT NULL CHECK (length(name) >= 3),
  type TEXT NOT NULL CHECK (type IN ('email', 'social', 'ads', 'event', 'webinar')),
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Budget tracking
  budget DECIMAL(12,2) NOT NULL CHECK (budget >= 0),
  spent DECIMAL(12,2) DEFAULT 0 CHECK (spent >= 0),
  remaining DECIMAL(12,2) GENERATED ALWAYS AS (budget - spent) STORED,
  
  -- Metrics
  impressions INTEGER DEFAULT 0 CHECK (impressions >= 0),
  clicks INTEGER DEFAULT 0 CHECK (clicks >= 0),
  conversions INTEGER DEFAULT 0 CHECK (conversions >= 0),
  ctr DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN impressions > 0 
    THEN (clicks::DECIMAL / impressions * 100) 
    ELSE 0 END
  ) STORED,
  
  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  CHECK (end_date > start_date),
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  department TEXT DEFAULT 'Marketing',
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type ON campaigns(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_assigned_to ON campaigns(assigned_to);
CREATE INDEX idx_campaigns_department ON campaigns(department);

-- ================================================================
-- TABLE 2: email_campaigns
-- Purpose: Email campaign tracking with detailed metrics
-- ================================================================

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Content
  subject TEXT NOT NULL CHECK (length(subject) >= 3),
  preview_text TEXT,
  content TEXT NOT NULL,
  template_id UUID,
  
  -- Recipients
  recipients INTEGER DEFAULT 0 CHECK (recipients >= 0),
  sent INTEGER DEFAULT 0 CHECK (sent >= 0 AND sent <= recipients),
  delivered INTEGER DEFAULT 0 CHECK (delivered >= 0 AND delivered <= sent),
  opened INTEGER DEFAULT 0 CHECK (opened >= 0 AND opened <= delivered),
  clicked INTEGER DEFAULT 0 CHECK (clicked >= 0 AND clicked <= opened),
  bounced INTEGER DEFAULT 0 CHECK (bounced >= 0),
  unsubscribed INTEGER DEFAULT 0 CHECK (unsubscribed >= 0),
  
  -- Calculated metrics
  delivery_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN sent > 0 THEN (delivered::DECIMAL / sent * 100) ELSE 0 END
  ) STORED,
  open_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN delivered > 0 THEN (opened::DECIMAL / delivered * 100) ELSE 0 END
  ) STORED,
  click_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN opened > 0 THEN (clicked::DECIMAL / opened * 100) ELSE 0 END
  ) STORED,
  
  -- Scheduling
  scheduled_date TIMESTAMPTZ,
  sent_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft' 
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for email_campaigns
CREATE INDEX idx_email_campaigns_campaign ON email_campaigns(campaign_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_sent_date ON email_campaigns(sent_date DESC);

-- ================================================================
-- TABLE 3: leave_requests
-- Purpose: Employee leave request management
-- ================================================================

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Employee reference
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Leave details
  type TEXT NOT NULL CHECK (type IN ('annual', 'sick', 'unpaid', 'emergency', 'maternity', 'paternity')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  CHECK (end_date >= start_date),
  
  -- Days calculation
  days INTEGER NOT NULL CHECK (days > 0),
  
  -- Request details
  reason TEXT NOT NULL CHECK (length(reason) >= 10),
  attachment_url TEXT,
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Notifications
  employee_notified BOOLEAN DEFAULT false,
  manager_notified BOOLEAN DEFAULT false,
  
  -- Department
  department TEXT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for leave_requests
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_department ON leave_requests(department);

-- ================================================================
-- TABLE 4: payroll_records
-- Purpose: Employee payroll management
-- ================================================================

CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  
  -- Period
  period TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Salary components
  base_salary DECIMAL(12,2) NOT NULL CHECK (base_salary >= 0),
  overtime_hours DECIMAL(5,2) DEFAULT 0 CHECK (overtime_hours >= 0),
  overtime_amount DECIMAL(12,2) DEFAULT 0 CHECK (overtime_amount >= 0),
  bonuses DECIMAL(12,2) DEFAULT 0 CHECK (bonuses >= 0),
  allowances DECIMAL(12,2) DEFAULT 0 CHECK (allowances >= 0),
  
  -- Deductions
  tax DECIMAL(12,2) DEFAULT 0 CHECK (tax >= 0),
  insurance DECIMAL(12,2) DEFAULT 0 CHECK (insurance >= 0),
  other_deductions DECIMAL(12,2) DEFAULT 0 CHECK (other_deductions >= 0),
  
  -- Calculated totals
  gross_salary DECIMAL(12,2) GENERATED ALWAYS AS (
    base_salary + overtime_amount + bonuses + allowances
  ) STORED,
  total_deductions DECIMAL(12,2) GENERATED ALWAYS AS (
    tax + insurance + other_deductions
  ) STORED,
  net_salary DECIMAL(12,2) GENERATED ALWAYS AS (
    base_salary + overtime_amount + bonuses + allowances - tax - insurance - other_deductions
  ) STORED,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_by UUID REFERENCES profiles(id),
  paid_date TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'cash', 'check')),
  
  -- Department
  department TEXT DEFAULT 'HR',
  
  -- Notes
  notes TEXT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(employee_id, period)
);

-- Indexes for payroll_records
CREATE INDEX idx_payroll_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_period ON payroll_records(period);
CREATE INDEX idx_payroll_status ON payroll_records(status);
CREATE INDEX idx_payroll_department ON payroll_records(department);

-- ================================================================
-- TABLE 5: performance_reviews
-- Purpose: Employee performance review management
-- ================================================================

CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Review period
  period TEXT NOT NULL,
  review_type TEXT CHECK (review_type IN ('quarterly', 'annual', 'probation', 'project')),
  
  -- Ratings (1-5 scale)
  overall_rating DECIMAL(3,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  technical_skills DECIMAL(3,1) CHECK (technical_skills >= 1 AND technical_skills <= 5),
  communication DECIMAL(3,1) CHECK (communication >= 1 AND communication <= 5),
  teamwork DECIMAL(3,1) CHECK (teamwork >= 1 AND teamwork <= 5),
  leadership DECIMAL(3,1) CHECK (leadership >= 1 AND leadership <= 5),
  problem_solving DECIMAL(3,1) CHECK (problem_solving >= 1 AND problem_solving <= 5),
  time_management DECIMAL(3,1) CHECK (time_management >= 1 AND time_management <= 5),
  
  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  feedback TEXT NOT NULL,
  
  -- Employee response
  employee_comments TEXT,
  employee_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('draft', 'pending', 'completed', 'scheduled')),
  review_date TIMESTAMPTZ,
  
  -- Follow-up
  next_review_date DATE,
  
  -- Department
  department TEXT DEFAULT 'HR',
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance_reviews
CREATE INDEX idx_performance_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_period ON performance_reviews(period);
CREATE INDEX idx_performance_status ON performance_reviews(status);
CREATE INDEX idx_performance_department ON performance_reviews(department);

-- ================================================================
-- TABLE 6: budgets
-- Purpose: Budget allocation and tracking
-- ================================================================

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Budget details
  category TEXT NOT NULL,
  subcategory TEXT,
  department TEXT NOT NULL,
  
  -- Amounts
  allocated DECIMAL(12,2) NOT NULL CHECK (allocated >= 0),
  spent DECIMAL(12,2) DEFAULT 0 CHECK (spent >= 0),
  remaining DECIMAL(12,2) GENERATED ALWAYS AS (allocated - spent) STORED,
  utilization DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN allocated > 0 THEN (spent / allocated * 100) ELSE 0 END
  ) STORED,
  
  -- Period
  period TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  
  -- Status based on utilization
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN spent / NULLIF(allocated, 0) >= 0.9 THEN 'critical'
      WHEN spent / NULLIF(allocated, 0) >= 0.75 THEN 'warning'
      ELSE 'good'
    END
  ) STORED,
  
  -- Ownership
  owner_id UUID REFERENCES profiles(id),
  
  -- Notes
  notes TEXT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(category, department, period)
);

-- Indexes for budgets
CREATE INDEX idx_budgets_category ON budgets(category);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_department ON budgets(department);
CREATE INDEX idx_budgets_status ON budgets(status);

-- ================================================================
-- TABLE 7: expenses
-- Purpose: Expense submission and approval
-- ================================================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Expense details
  category TEXT NOT NULL,
  subcategory TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'EGP',
  description TEXT NOT NULL CHECK (length(description) >= 10),
  
  -- Date
  expense_date DATE NOT NULL,
  
  -- Budget link
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  
  -- Submission
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Payment
  reimbursed_at TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'cash', 'company_card')),
  
  -- Attachments
  receipt_url TEXT,
  additional_docs TEXT[],
  
  -- Department
  department TEXT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for expenses
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_submitted_by ON expenses(submitted_by);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_budget ON expenses(budget_id);
CREATE INDEX idx_expenses_department ON expenses(department);

-- ================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ================================================================

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_records_updated_at
    BEFORE UPDATE ON payroll_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) - Enable on all tables
-- ================================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES: Temporary (will be replaced with granular ones)
-- ================================================================

CREATE POLICY "temp_all_campaigns" ON campaigns
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "temp_all_email_campaigns" ON email_campaigns
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "temp_all_leave_requests" ON leave_requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "temp_all_payroll_records" ON payroll_records
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "temp_all_performance_reviews" ON performance_reviews
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "temp_all_budgets" ON budgets
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "temp_all_expenses" ON expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 'Migration 030 completed successfully!' as status;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'email_campaigns', 'leave_requests', 'payroll_records', 'performance_reviews', 'budgets', 'expenses')
ORDER BY table_name;
