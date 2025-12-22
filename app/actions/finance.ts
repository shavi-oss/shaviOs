'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/auth';

import { Database } from '@/lib/database.types';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type ExpenseWithSubmitter = ExpenseRow & { submitter: { full_name: string } | null };
type CategoryAmount = { category: string; amount: number };

export type Expense = ExpenseRow & {
    submitted_by_name?: string; // joined
};

export async function getExpenses(
    page: number = 1,
    limit: number = 10,
    category: string = 'all',
    search: string = ''
) {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('expenses')
        .select(`
            *,
            submitter:profiles!expenses_submitted_by_fkey(full_name)
        `, { count: 'exact' })
        .order('expense_date', { ascending: false })
        .range(from, to);

    if (category !== 'all') {
        query = query.eq('category', category);
    }

    if (search) {
        query = query.textSearch('description', search, { type: 'websearch' });
        // Or ilike for partial match if textSearch not configured
        // query = query.ilike('description', `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
        logger.error('Error fetching expenses', { error });
        throw new Error('Failed to fetch expenses');
    }

    const expenses: Expense[] = data.map((item: ExpenseRow & { submitter: { full_name: string | null } | null }) => ({
        ...item,
        submitted_by_name: item.submitter?.full_name ?? 'Unknown'
    }));

    return {
        data: expenses,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

export async function createExpense(formData: FormData) {
    const session = await getSession();
    if (!session || !session.user) return { message: 'Unauthorized', success: false };
    const user = session.user;
    const supabase = await createClient();

    const rawData = {
        category: String(formData.get('category')),
        amount: parseFloat(String(formData.get('amount'))),
        description: String(formData.get('description')),
        expense_date: String(formData.get('date')),
        receipt_url: formData.get('receipt_url') ? String(formData.get('receipt_url')) : null,
        submitted_by: user.id,
        currency: 'EGP',
        status: 'pending' as const
    };

    // Validation
    if (!rawData.category || !rawData.amount || !rawData.description || !rawData.expense_date) {
        return { message: 'Missing required fields', success: false };
    }

    const { error } = await supabase
        .from('expenses')
        .insert(rawData);

    if (error) {
        logger.error('Create expense error', { error });
        return { message: 'Failed to create expense', success: false };
    }

    revalidatePath('/finance/expenses');
    return { message: 'Expense created successfully', success: true };
}

export async function getCategoryStats() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('expenses')
        .select('category, amount')
        .neq('status', 'rejected');

    if (error) return {};

    const stats: Record<string, number> = {};
    data.forEach((item: Pick<ExpenseRow, 'category' | 'amount'>) => {
        stats[item.category] = (stats[item.category] || 0) + Number(item.amount);
    });

    return stats;
}

export async function approveExpense(expenseId: string) {
    const session = await getSession();
    if (!session || !session.user) return { message: 'Unauthorized', success: false };
    
    // RBAC: Only Admin, Finance, or Manager can approve
    const allowedRoles = ['admin', 'finance', 'manager'];
    if (!allowedRoles.includes(session.user.role || '')) {
        return { message: 'Forbidden: Insufficient permissions', success: false };
    }

    const user = session.user;
    const supabase = await createClient();

    // 1. Get Expense Details
    const { data: expense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

    if (fetchError || !expense) return { message: 'Expense not found', success: false };

    // 2. Update Status
    const { error: updateError } = await supabase
        .from('expenses')
        .update({ 
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString()
        })
        .eq('id', expenseId);

    if (updateError) return { message: updateError.message, success: false };

    // 3. Workflow: Update Budget Spent
    // Find matching budget for category + month
    const expenseDate = new Date(expense.expense_date);
    const period = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

    const { data: budget } = await supabase
        .from('budgets')
        .select('id, spent')
        .eq('category', expense.category)
        .eq('period', period)
        .single();

    if (budget) {
        await supabase
            .from('budgets')
            .update({ spent: (budget.spent || 0) + Number(expense.amount) })
            .eq('id', budget.id);
    }

    revalidatePath('/finance/expenses');
    revalidatePath('/finance/budgets');
    return { message: 'Expense approved and budget updated', success: true };
}

export async function rejectExpense(expenseId: string, reason: string) {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) return { message: 'Unauthorized', success: false };

    const { error } = await supabase
        .from('expenses')
        .update({ 
            status: 'rejected',
            rejection_reason: reason,
            approved_by: user.id, // technically rejected_by, but using same tracking field
            approved_at: new Date().toISOString()
        })
        .eq('id', expenseId);

    if (error) return { message: error.message, success: false };

    revalidatePath('/finance/expenses');
    return { message: 'Expense rejected', success: true };
}

// ==========================================
// BUDGET ACTIONS
// ==========================================

type BudgetRow = Database['public']['Tables']['budgets']['Row'];

export type Budget = BudgetRow & {
    spent: number;
    remaining: number;
    percentage: number;
    status: 'good' | 'warning' | 'critical';
};

export async function getBudgets(period: string = '2025-12') {
    const supabase = await createClient();

    // 1. Fetch budgets for the period
    const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('period', period);

    if (error) {
        logger.error('Error fetching budgets', { error });
        return [];
    }

    if (!budgets || budgets.length === 0) {
        // Option: Auto-initialize if empty
        return await initializeBudgets(period);
    }

    // 2. Calculate real-time spent from expenses (if we want to be dynamic)
    // Or rely on the stored 'spent' column. For now, let's recalculate to be safe.
    const { data: expenses } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('status', 'approved')
        .gte('expense_date', `${period}-01`)
        .lte('expense_date', `${period}-31`); // Simple check

    const expenseMap: Record<string, number> = {};
    if (expenses) {
        expenses.forEach((e: { category: string; amount: number }) => {
            expenseMap[e.category] = (expenseMap[e.category] || 0) + Number(e.amount);
        });
    }

    // 3. Map to return type
    return budgets.map((b: BudgetRow) => {
        const spent = expenseMap[b.category] || b.spent || 0; // Use calculated or stored
        const allocated = b.allocated;
        const remaining = allocated - spent;
        const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;

        let status: 'good' | 'warning' | 'critical' = 'good';
        if (percentage >= 90) status = 'critical';
        else if (percentage >= 75) status = 'warning';

        return {
            id: b.id,
            category: b.category,
            allocated,
            spent,
            remaining,
            period: b.period,
            percentage,
            status
        };
    });
}

export async function initializeBudgets(period: string) {
    const supabase = await createClient();

    // 1. Fetch Active Categories from Logic Layer (DB)
    const { data: dbCategories } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('is_active', true);

    let categoriesToUse = [];

    if (dbCategories && dbCategories.length > 0) {
        categoriesToUse = dbCategories.map((cat: Database['public']['Tables']['budget_categories']['Row']) => ({
            category: cat.name,
            allocated: Number(cat.default_allocation),
            nameAr: cat.name_ar,
            department: 'General'
        }));
    } else {
        // Fallback: Hardcoded defaults (Disaster Recovery)
        categoriesToUse = [
            { category: 'Salaries', allocated: 900000, nameAr: 'الرواتب', department: 'General' },
            { category: 'Rent', allocated: 150000, nameAr: 'الإيجار', department: 'General' },
            { category: 'Software', allocated: 100000, nameAr: 'البرمجيات', department: 'General' },
            { category: 'Marketing', allocated: 200000, nameAr: 'التسويق', department: 'General' },
            { category: 'Subscriptions', allocated: 100000, nameAr: 'الاشتراكات', department: 'General' },
            { category: 'Logistics', allocated: 150000, nameAr: 'لوجستيات', department: 'General' },
            { category: 'Commissions', allocated: 80000, nameAr: 'العمولات', department: 'General' },
            { category: 'Consulting', allocated: 50000, nameAr: 'الاستشارات', department: 'General' },
            { category: 'Miscellaneous', allocated: 50000, nameAr: 'متنوع', department: 'General' }
        ];
    }

    // 2. Prepare Records (Check existence to avoid duplicates if partially favored)
    // The previous implementation did not check existence per item, relying on the caller checking the period.
    // However, for robustness, we map to Insert format.

    const records = categoriesToUse.map(d => ({
        category: d.category,
        department: d.department,
        allocated: d.allocated,
        period: period,
        fiscal_year: parseInt(period.split('-')[0]),
        spent: 0
    }));

    if (records.length === 0) return [];

    const { data, error } = await supabase
        .from('budgets')
        .insert(records)
        .select();

    if (error) {
        logger.error('Init budgets error', { error });
        return [];
    }

    return data.map((b: BudgetRow) => ({
        id: b.id,
        category: b.category,
        allocated: b.allocated,
        spent: 0,
        remaining: b.allocated,
        period: b.period,
        percentage: 0,
        status: 'good'
    }));
}

// ==========================================
// REPORT ACTIONS
// ==========================================

export async function getFinancialMetrics() {
    const supabase = await createClient();
    const today = new Date();
    // Start of 6 months ago (approx)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    // 1. Fetch Invoices (Revenue)
    const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('amount, paid_at, status, source_type')
        .eq('status', 'paid')
        .gte('paid_at', sixMonthsAgo.toISOString());

    // 2. Fetch Expenses
    const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('amount, expense_date, status')
        .eq('status', 'approved')
        .gte('expense_date', sixMonthsAgo.toISOString());

    // 3. Fetch Payroll
    const { data: payroll, error: payError } = await supabase
        .from('payroll_records')
        .select('net_salary, period, status') // period is string YYYY-MM
        .gte('period', sixMonthsAgo.toISOString().substring(0, 7));

    // 4. PHASE 3.3: Fetch Forecast Revenue (Proposal + Negotiation stages)
    const { data: forecastDeals, error: forecastError } = await supabase
        .from('deals')
        .select('value, stage')
        .in('stage', ['proposal', 'negotiation']);

    // 5. PHASE 3.3: Fetch Realized Revenue (Paid invoices from deals)
    const { data: realizedInvoices, error: realizedError } = await supabase
        .from('invoices')
        .select('amount, source_type')
        .eq('status', 'paid')
        .eq('source_type', 'deal');

    if (invError || expError || payError || forecastError || realizedError) {
        logger.error('Error fetching financial metrics', { invError, expError, payError, forecastError, realizedError });
        throw new Error('Failed to load financial data');
    }

    // Helper to group by month YYYY-MM
    type MonthlyData = { month: string; revenue: number; expenses: number; profit: number };
    const monthlyMap: Record<string, MonthlyData> = {};

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${yyyy}-${mm}`;
        monthlyMap[key] = { month: key, revenue: 0, expenses: 0, profit: 0 };
    }

    // Aggregate Invoices
    invoices?.forEach((inv: Pick<Database['public']['Tables']['invoices']['Row'], 'amount' | 'paid_at' | 'status'>) => {
        if (!inv.paid_at) return;
        const key = inv.paid_at.substring(0, 7);
        if (monthlyMap[key]) {
            monthlyMap[key].revenue += Number(inv.amount);
        }
    });

    // Aggregate Expenses
    expenses?.forEach((exp: Pick<Database['public']['Tables']['expenses']['Row'], 'amount' | 'expense_date' | 'status'>) => {
        if (!exp.expense_date) return;
        const key = exp.expense_date.substring(0, 7);
        if (monthlyMap[key]) {
            monthlyMap[key].expenses += Number(exp.amount);
        }
    });

    // Aggregate Payroll (treat as expense)
    payroll?.forEach((pay: Pick<Database['public']['Tables']['payroll_records']['Row'], 'net_salary' | 'period' | 'status'>) => {
        if (!pay.period) return;
        const key = pay.period;
        if (monthlyMap[key]) {
            monthlyMap[key].expenses += Number(pay.net_salary);
        }
    });

    // Calculate Profit & Convert to Array
    const trend = Object.values(monthlyMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(d => ({ ...d, profit: d.revenue - d.expenses }));

    // Calculate Totals for Summary (All time in window)
    const totalRevenue = trend.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = trend.reduce((sum, m) => sum + m.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;

    // PHASE 3.3: Calculate Forecast Revenue (Weighted by stage probability)
    const stageProbability: Record<string, number> = {
        'proposal': 0.3,
        'negotiation': 0.6
    };
    
    const forecastRevenue = forecastDeals?.reduce((total, deal) => {
        const probability = stageProbability[deal.stage || ''] || 0;
        const weighted = Number(deal.value || 0) * probability;
        return total + weighted;
    }, 0) || 0;

    const forecastTotal = forecastDeals?.reduce((total, deal) => {
        return total + Number(deal.value || 0);
    }, 0) || 0;

    // PHASE 3.3: Calculate Realized Revenue (from deal invoices only)
    const realizedRevenue = realizedInvoices?.reduce((total, inv) => {
        return total + Number(inv.amount || 0);
    }, 0) || 0;

    // PHASE 3.3: Revenue Attribution by Source
    type RevenueBySource = {
        deal: number;
        manual: number;
        [key: string]: number;
    };

    const revenueBySource: RevenueBySource = invoices?.reduce((acc, inv) => {
        const source = inv.source_type || 'manual';
        acc[source] = (acc[source] || 0) + Number(inv.amount || 0);
        return acc;
    }, { deal: 0, manual: 0 } as RevenueBySource) || { deal: 0, manual: 0 };

    // Calculate total expected revenue (realized + forecast)
    const totalExpected = realizedRevenue + forecastRevenue;

    return {
        summary: {
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: totalProfit,
            assets: 0,
            liabilities: 0,
            equity: 0
        },
        trend: trend,
        // PHASE 3.3: New metrics
        forecast: {
            weightedRevenue: forecastRevenue,
            totalValue: forecastTotal,
            dealCount: forecastDeals?.length || 0
        },
        realized: {
            fromDeals: realizedRevenue,
            fromManual: revenueBySource.manual || 0,
            total: totalRevenue
        },
        attribution: revenueBySource,
        totalExpected: totalExpected
    };
}
