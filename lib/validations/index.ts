import { z } from 'zod';

// ==============================================================================
// COMMON VALIDATORS
// ==============================================================================

export const commonValidators = {
  id: z.string().uuid('معرف غير صالح'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  phone: z.string().regex(/^(\+20|0)?1[0125]\d{8}$/, 'رقم هاتف مصري غير صالح'),
  positiveDecimal: z.number().positive('يجب أن يكون الرقم موجباً'),
  futureDate: z.date().min(new Date(), 'التاريخ يجب أن يكون في المستقبل'),
  pastDate: z.date().max(new Date(), 'التاريخ يجب أن يكون في الماضي'),
  dateRange: (start: string, end: string) =>
    z.object({ [start]: z.date(), [end]: z.date() })
      .refine(data => data[end as keyof typeof data] >= data[start as keyof typeof data], {
        message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
        path: [end]
      })
};

// ==============================================================================
// HR MODULE VALIDATORS
// ==============================================================================

export const employeeSchema = z.object({
  first_name: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل'),
  last_name: z.string().min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل'),
  email: commonValidators.email,
  phone: commonValidators.phone,
  position: z.string().min(2, 'المسمى الوظيفي مطلوب'),
  department: z.enum(['management', 'hr', 'finance', 'marketing', 'sales', 'customer_success', 'tech', 'trainers']),
  join_date: z.date(),
  salary: commonValidators.positiveDecimal,
  currency: z.string().default('EGP'),
  team_lead_id: commonValidators.id.optional().nullable()
});

export const leaveRequestSchema = z.object({
  type: z.enum(['annual', 'sick', 'unpaid', 'emergency', 'maternity', 'paternity']),
  start_date: z.date(),
  end_date: z.date(),
  reason: z.string().min(10, 'السبب يجب أن يكون 10 أحرف على الأقل'),
  attachment_url: z.string().url().optional().nullable()
}).refine(data => data.end_date >= data.start_date, {
  message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
});

export const performanceReviewSchema = z.object({
  employee_id: commonValidators.id,
  period: z.string().min(1, 'الفترة مطلوبة'),
  review_type: z.enum(['quarterly', 'annual', 'probation', 'project']),
  overall_rating: z.number().min(1).max(5),
  technical_skills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  leadership: z.number().min(1).max(5),
  feedback: z.string().min(20, 'الملاحظات يجب أن تكون مفصلة (20 حرف على الأقل)'),
  strengths: z.string().optional(),
  areas_for_improvement: z.string().optional(),
  goals: z.string().optional()
});

export const payrollRecordSchema = z.object({
  employee_id: commonValidators.id,
  period: z.string().regex(/^\d{4}-\d{2}$/, 'صيغة الفترة غير صحيحة (YYYY-MM)'),
  period_start: z.date(),
  period_end: z.date(),
  base_salary: commonValidators.positiveDecimal,
  overtime_hours: z.number().nonnegative().default(0),
  overtime_amount: z.number().nonnegative().default(0),
  bonuses: z.number().nonnegative().default(0),
  allowances: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  insurance: z.number().nonnegative().default(0),
  other_deductions: z.number().nonnegative().default(0),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']).default('pending'),
  payment_method: z.enum(['bank_transfer', 'cash', 'check']).optional(),
  department: z.string().default('HR'),
  notes: z.string().optional()
}).refine(data => data.period_end >= data.period_start, {
  message: 'تاريخ نهاية الفترة يجب أن يكون بعد تاريخ البداية',
  path: ['period_end']
});

// ==============================================================================
// FINANCE MODULE VALIDATORS
// ==============================================================================

export const expenseSchema = z.object({
  category: z.string().min(2, 'الفئة مطلوبة'),
  subcategory: z.string().optional(),
  amount: commonValidators.positiveDecimal,
  currency: z.string(),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  expense_date: z.date().max(new Date(), 'لا يمكن إضافة مصروف مستقبلي'),
  budget_id: commonValidators.id.optional().nullable(),
  receipt_url: z.string().url('رابط الإيعال غير صالح').optional().nullable()
});

export const invoiceSchema = z.object({
  customer_name: z.string().min(2, 'اسم العميل مطلوب'),
  customer_email: commonValidators.email.optional().nullable(),
  amount: z.number().nonnegative(),
  currency: z.string().default('EGP'),
  status: z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled']),
  due_date: z.date(),
  items: z.array(z.object({
    description: z.string().min(3),
    quantity: z.number().int().positive(),
    unit_price: z.number().nonnegative(),
    amount: z.number().nonnegative()
  })).min(1, 'يجب إضافة بند واحد على الأقل')
});

export const budgetSchema = z.object({
  category: z.string().min(2),
  department: z.string().min(2),
  allocated: commonValidators.positiveDecimal,
  period: z.string(),
  fiscal_year: z.number().int().min(2025)
});

// ==============================================================================
// CRM & SALES MODULE VALIDATORS
// ==============================================================================

export const dealSchema = z.object({
  title: z.string().min(3, 'العنوان مطلوب'),
  value: commonValidators.positiveDecimal,
  currency: z.string().default('EGP'),
  stage: z.enum(['lead', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  customer_name: z.string().min(2),
  customer_company: z.string().optional(),
  lead_id: commonValidators.id.optional().nullable(),
  assigned_to_id: commonValidators.id.optional().nullable(),
  expected_close_date: z.date().optional().nullable()
});

export const leadSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: commonValidators.email,
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
  source: z.string().default('manual'),
  temperature: z.enum(['hot', 'warm', 'cold']).optional()
});

// ==============================================================================
// MARKETING MODULE VALIDATORS
// ==============================================================================

export const campaignSchema = z.object({
  name: z.string().min(3, 'اسم الحملة مطلوب'),
  type: z.enum(['email', 'social', 'ads', 'event', 'webinar']),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  budget: commonValidators.positiveDecimal,
  start_date: z.date(),
  end_date: z.date(),
  department: z.string().default('Marketing')
}).refine(data => data.end_date >= data.start_date, {
  message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
});

export const emailCampaignSchema = z.object({
  campaign_id: commonValidators.id.optional().nullable(),
  subject: z.string().min(3, 'موضوع البريد مطلوب'),
  preview_text: z.string().optional(),
  content: z.string().min(10, 'المحتوى مطلوب'),
  template_id: commonValidators.id.optional().nullable(),
  scheduled_date: z.date().min(new Date(), 'وقت الإرسال يجب أن يكون في المستقبل').optional().nullable()
});

// ==============================================================================
// CUSTOMER SUCCESS VALIDATORS
// ==============================================================================

export const supportTicketSchema = z.object({
  title: z.string().min(3, 'العنوان مطلوب'),
  description: z.string().min(10, 'الوصف مطلوب'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'in_progress', 'pending', 'resolved', 'closed']),
  student_id: commonValidators.id.optional().nullable(),
  assigned_to_id: commonValidators.id.optional().nullable()
});
