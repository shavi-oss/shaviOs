import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { calculateNetSalary } from '@/lib/payroll-utils';

export async function generateEmployeePayrollHelper(month: string, startDateStr: string, endDateStr: string, supabase: SupabaseClient<Database>) {
    // Check existing
    const { count: existingEmpPayroll } = await supabase
        .from('payroll_records')
        .select('id', { count: 'exact', head: true })
        .eq('period', month);

    if (existingEmpPayroll && existingEmpPayroll > 0) return 0;

    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active');

    if (!employees || employees.length === 0) return 0;

    const records: Database['public']['Tables']['payroll_records']['Insert'][] = employees.map((emp: Database['public']['Tables']['employees']['Row']) => {
        const base = emp.salary || 0;
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
    if (empError) {
        console.error('Error generating employee payroll:', empError);
        return 0;
    }
    return records.length;
}

export async function generateTrainerPayrollHelper(startDateStr: string, endDateStr: string, supabase: SupabaseClient<Database>) {
    // Check existing
    const { count: existingTrainerPayroll } = await supabase
        .from('trainer_payments')
        .select('id', { count: 'exact', head: true })
        .gte('period_start', startDateStr)
        .lte('period_end', endDateStr);

    if (existingTrainerPayroll && existingTrainerPayroll > 0) return 0;

    // Fetch sessions
    const { data: sessions, error: sessionsError } = await supabase
        .from('course_sessions')
        .select('trainer_id')
        .gte('start_date', startDateStr)
        .lte('start_date', endDateStr)
        .neq('status', 'cancelled');

    if (sessionsError || !sessions || sessions.length === 0) return 0;

    // Aggregate
    const sessionsByTrainer: Record<string, number> = {};
    sessions.forEach((s: Pick<Database['public']['Tables']['course_sessions']['Row'], 'trainer_id'>) => {
        if (s.trainer_id) {
            sessionsByTrainer[s.trainer_id] = (sessionsByTrainer[s.trainer_id] || 0) + 1;
        }
    });

    const trainerIds = Object.keys(sessionsByTrainer);
    if (trainerIds.length === 0) return 0;

    const { data: trainers } = await supabase
        .from('trainers')
        .select('id, hourly_rate')
        .in('id', trainerIds);

    if (!trainers) return 0;

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
        if (trError) {
            console.error('Error generating trainer payroll:', trError);
            return 0;
        }
    }
    return trainerRecords.length;
}
