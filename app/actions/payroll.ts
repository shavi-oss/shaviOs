'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';


export type PayrollRecord = Database['public']['Tables']['payroll_records']['Row'] & {
    employee: {
        first_name: string;
        last_name: string;
        position: string;
        department: string;
    };
    employee_name: string;
    month: string;
};

export type TrainerPayment = Database['public']['Tables']['trainer_payments']['Row'] & {
    trainer: {
        full_name: string;
    } | null; // Trainer might be deleted or RLS hidden
    trainer_name: string;
};

export async function getPayrollRecords(
    month: string,
    department?: string,
    status?: string,
    page: number = 1,
    limit: number = 10
) {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('payroll_records')
        .select(`
            *,
            employee:employees!inner(first_name, last_name, position, department)
        `, { count: 'exact' })
        .eq('period', month)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (department && department !== 'all') {
        query = query.eq('employee.department', department);
    }

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching payroll:', error);
        throw new Error('Failed to fetch payroll records');
    }

    // Transform
    const records = (data as any[]).map(record => ({
        ...record,
        employee_name: `${record.employee.first_name} ${record.employee.last_name}`,
        month: record.period
    }));

    return {
        data: records as PayrollRecord[],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

export async function getTrainerPayments(
    month: string,
    status?: string,
    page: number = 1,
    limit: number = 10
) {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Convert month (YYYY-MM) to date range overlap check
    // Actually trainer_payments has period_start/end.
    // simpler to just filter by period_start within the month
    const [year, monthStr] = month.split('-');
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Approx

    let query = supabase
        .from('trainer_payments')
        .select(`
            *,
            trainer:trainers(full_name)
        `, { count: 'exact' })
        .gte('period_start', startDate)
        .lte('period_start', endDate)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching trainer payments:', error);
        throw new Error('Failed to fetch trainer payments');
    }

    const records = (data as any[]).map(record => ({
        ...record,
        trainer_name: record.trainer ? record.trainer.full_name : 'Unknown Trainer'
    }));

    return {
        data: records as TrainerPayment[],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

// Helper to calculate Net Salary
const calculateNetSalary = (base: number, bonuses: number = 0, deductions: number = 0) => {
    return Math.max(0, base + bonuses - deductions);
};

export async function generatePayrollForMonth(month: string) {
    const supabase = await createClient();
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;

    // Use explicit UTC dates for the month boundaries
    const startDate = new Date(Date.UTC(year, monthIndex, 1));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0));

    // Format YYYY-MM-DD for Supabase queries
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // --- 1. GENERATE EMPLOYEE PAYROLL ---
    
    // Check existing
    const { count: existingEmpPayroll } = await supabase
        .from('payroll_records')
        .select('id', { count: 'exact', head: true })
        .eq('period', month);

    let empCount = 0;

    if (!existingEmpPayroll || existingEmpPayroll === 0) {
        const { data: employees } = await supabase
            .from('employees')
            .select('*')
            .eq('status', 'active');

        if (employees && employees.length > 0) {
            const records: Database['public']['Tables']['payroll_records']['Insert'][] = employees.map(emp => {
                const base = emp.salary || 0;
                // Initialize bonuses/deductions to 0. 
                // Future: Pull from a deductions table if one exists.
                const bonuses = 0; 
                const deductions = 0;
                
                return {
                    employee_id: emp.id,
                    period: month,
                    period_start: startDateStr,
                    period_end: endDateStr,
                    base_salary: base,
                    bonuses: bonuses,
                    total_deductions: deductions,
                    net_salary: calculateNetSalary(base, bonuses, deductions),
                    status: 'pending'
                };
            });

            const { error: empError } = await supabase.from('payroll_records').insert(records);
            if (empError) console.error('Error generating employee payroll:', empError);
            else empCount = records.length;
        }
    }

    // --- 2. GENERATE TRAINER PAYROLL ---

    // Check existing
    const { count: existingTrainerPayroll } = await supabase
        .from('trainer_payments')
        .select('id', { count: 'exact', head: true })
        .gte('period_start', startDateStr)
        .lte('period_end', endDateStr);

    let trainerCount = 0;

    if (!existingTrainerPayroll || existingTrainerPayroll === 0) {
        // Fetch ALL sessions for this month first (more efficient than looping queries)
        // Optimized: Only fetch necessary columns
        const { data: sessions, error: sessionsError } = await supabase
            .from('course_sessions')
            .select('trainer_id')
            .gte('start_date', startDateStr)
            .lte('start_date', endDateStr)
            .neq('status', 'cancelled');

        if (!sessionsError && sessions && sessions.length > 0) {
            // Aggregate in memory (O(N) pass)
            const sessionsByTrainer: Record<string, number> = {};
            sessions.forEach(s => {
                if (s.trainer_id) {
                    sessionsByTrainer[s.trainer_id] = (sessionsByTrainer[s.trainer_id] || 0) + 1;
                }
            });

            // Get rates for relevant trainers only
            const trainerIds = Object.keys(sessionsByTrainer);
            if (trainerIds.length > 0) {
                const { data: trainers } = await supabase
                    .from('trainers')
                    .select('id, hourly_rate')
                    .in('id', trainerIds);

                if (trainers) {
                    const trainerRecords: Database['public']['Tables']['trainer_payments']['Insert'][] = [];
                    
                    for (const trainer of trainers) {
                        const count = sessionsByTrainer[trainer.id] || 0;
                        const rate = trainer.hourly_rate || 0;
                        const amount = count * rate;

                        trainerRecords.push({
                            trainer_id: trainer.id,
                            amount: amount,
                            sessions_count: count,
                            period_start: startDateStr,
                            period_end: endDateStr,
                            status: 'pending',
                            notes: `Auto-generated: ${count} sessions @ ${rate}/hr`
                        });
                    }

                    if (trainerRecords.length > 0) {
                        const { error: trError } = await supabase.from('trainer_payments').insert(trainerRecords);
                        if (trError) console.error('Error generating trainer payroll:', trError);
                        else trainerCount = trainerRecords.length;
                    }
                }
            }
        }
    }

    revalidatePath('/hr/payroll');
    
    if (existingEmpPayroll && existingTrainerPayroll) {
        return { message: 'Payroll already generated for this month', success: false };
    }

    return { 
        message: `Generated payroll: ${empCount} employees, ${trainerCount} trainers`, 
        success: true 
    };
}

export async function updatePayrollAmounts(id: string, bonuses: number, deductions: number) {
    const supabase = await createClient();

    // Fetch current base salary to recalc net
    const { data: record } = await supabase
        .from('payroll_records')
        .select('base_salary')
        .eq('id', id)
        .single();

    if (!record) throw new Error('Record not found');

    const net = calculateNetSalary(record.base_salary, bonuses, deductions);

    const { error } = await supabase
        .from('payroll_records')
        .update({
            bonuses: bonuses,
            total_deductions: deductions,
            net_salary: net
        })
        .eq('id', id);

    if (error) throw new Error('Failed to update payroll amounts');

    revalidatePath('/hr/payroll');
    return { success: true };
}

export async function paySingleEmployee(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('payroll_records')
        .update({
            status: 'paid',
            paid_date: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw new Error('Failed to update status');

    revalidatePath('/hr/payroll');
    return { success: true };
}

export async function paySingleTrainer(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('trainer_payments')
        .update({status: 'paid'})
        .eq('id', id);
    if(error) throw new Error('Failed to pay trainer');
    revalidatePath('/hr/payroll');
    return {success: true};
}

export async function payAllPending(month: string) {
    const supabase = await createClient();

    // Pay Employees
    const { error: empError } = await supabase
        .from('payroll_records')
        .update({
            status: 'paid',
            paid_date: new Date().toISOString()
        })
        .eq('period', month)
        .eq('status', 'pending');

    if (empError) throw new Error('Failed to bulk pay employees');

    revalidatePath('/hr/payroll');
    return { success: true };
}
