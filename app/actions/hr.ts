'use server';

import { createClient } from '@/lib/supabase/server';
import { leaveRequestSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

// Type definitions
type LeaveRequestRow = Database['public']['Tables']['leave_requests']['Row'];
type EmployeeBasic = Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name'>;

export type LeaveRequest = LeaveRequestRow & {
    employee: EmployeeBasic;
};

export async function getLeaveRequests(
    page: number = 1,
    limit: number = 10,
    status?: string,
    department?: string
) {
    const supabase = await createClient();

    // Calculate offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('leave_requests')
        .select(`
      *,
      employee:employees!inner(first_name, last_name)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (department && department !== 'all') {
        query = query.eq('department', department);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching leave requests:', error);
        throw new Error('Failed to fetch leave requests');
    }

    return {
        data: data as LeaveRequest[],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

// ==============================================================================
// CREATE LEAVE REQUEST
// ==============================================================================

// Define ActionState type
export type ActionState = {
    message?: string;
    success: boolean;
    errors?: Record<string, string[]>;
};

export async function createLeaveRequest(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();

    // 1. Auth & Employee Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return { message: 'Unauthorized', success: false };

    const { data: employee } = await supabase
        .from('employees')
        .select('id, department, annual_leave_balance, sick_leave_balance')
        .eq('email', user.email)
        .single();

    if (!employee) {
        return { message: 'Employee record not found', success: false };
    }

    // 2. Data Validation
    const rawData = {
        type: formData.get('type'),
        start_date: new Date(String(formData.get('start_date'))),
        end_date: new Date(String(formData.get('end_date'))),
        reason: formData.get('reason'),
        attachment_url: formData.get('attachment_url') ? String(formData.get('attachment_url')) : undefined,
    };

    const validationResult = leaveRequestSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            message: 'Validation Failed',
            errors: validationResult.error.flatten().fieldErrors,
            success: false
        };
    }
    const data = validationResult.data;

    // 3. Logic: Calculate Days
    const days = Math.ceil((data.end_date.getTime() - data.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const startISO = data.start_date.toISOString();
    const endISO = data.end_date.toISOString();

    // 4. Logic: Overlap Check
    const { data: overlaps, error: overlapError } = await supabase
        .from('leave_requests')
        .select('id')
        .eq('employee_id', employee.id)
        .neq('status', 'rejected')
        .neq('status', 'cancelled')
        .or(`and(start_date.lte.${endISO},end_date.gte.${startISO})`);

    if (overlapError) {
        logger.error('Overlap check failed', { error: overlapError });
        return { message: 'System error checking conflicts', success: false };
    }

    if (overlaps && overlaps.length > 0) {
        return { message: 'Conflict: You already have a leave request during this period', success: false };
    }

    // 5. Logic: Balance Check
    if (data.type === 'annual' && employee.annual_leave_balance < days) {
        return { message: `Insufficient annual leave balance. You have ${employee.annual_leave_balance} days remaining.`, success: false };
    }
    if (data.type === 'sick' && employee.sick_leave_balance < days) {
        return { message: `Insufficient sick leave balance. You have ${employee.sick_leave_balance} days remaining.`, success: false };
    }

    // 6. DB Insert
    try {
        const { error } = await supabase.from('leave_requests').insert({
            employee_id: employee.id,
            department: employee.department,
            type: data.type,
            start_date: startISO,
            end_date: endISO,
            reason: data.reason,
            attachment_url: data.attachment_url,
            days: days,
            status: 'pending'
        });

        if (error) throw error;
    } catch (error: unknown) {
        logger.error('Create leave error', { error });
        return { message: 'Failed to create leave request', success: false };
    }

    revalidatePath('/hr/leave');
    return { message: 'Leave request submitted successfully', success: true };
}

// ... (omitted middle section for brevity, targeting specific block would be better but doing bulk update for catch blocks)
// Actually, I can rely on AllowMultiple if I structure it right, or just do specific chunks.
// I will do specific chunks to avoids errors.

// ==============================================================================
// UPDATE STATUS (Approve/Reject)
// ==============================================================================

// Define interface for checks
interface EmployeeBalances {
    id: string;
    annual_leave_balance: number;
    sick_leave_balance: number;
}

export async function updateLeaveStatus(id: string, newStatus: 'approved' | 'rejected') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // 1. Fetch Request Details FIRST
        const { data: request, error: fetchError } = await supabase
            .from('leave_requests')
            .select('*, employee:employees(id, annual_leave_balance, sick_leave_balance)')
            .eq('id', id)
            .single();

        if (fetchError || !request) throw new Error('Request not found');

        if (newStatus === 'approved') {
            // 2. Re-Check Balance before final approval
            // Explicit safely cast, assuming the join returns an array or object. 
            // In Supabase JS, single() makes it an object if 1:1, but select with join might be array if 1:M. 
            // Here distinct relation is 1:1 from leave_request to employee via employee_id.
            const emp = request.employee as unknown as EmployeeBalances; 

            if (!emp) throw new Error('Employee record not found related to request');

            if (request.type === 'annual' && emp.annual_leave_balance < request.days) {
                throw new Error('Insufficient annual balance to approve');
            }
            if (request.type === 'sick' && emp.sick_leave_balance < request.days) {
                throw new Error('Insufficient sick balance to approve');
            }

            // 3. Deduct Balance
            if (request.type === 'annual' || request.type === 'sick') {
                const columnToUpdate = request.type === 'annual' ? 'annual_leave_balance' : 'sick_leave_balance';
                const newBalance = emp[columnToUpdate] - request.days;

                const { error: deductionError } = await supabase
                    .from('employees')
                    .update({ [columnToUpdate]: newBalance })
                    .eq('id', emp.id);

                if (deductionError) throw new Error('Failed to update employee balance');
            }
        }

        // 4. Update Status
        const { error } = await supabase
            .from('leave_requests')
            .update({
                status: newStatus,
                approved_by: user.id,
                approved_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/hr/leave');
        return { success: true };
    } catch (error: unknown) {
        logger.error('Update status error', { error });
        const message = error instanceof Error ? error.message : 'Failed to update status';
        throw new Error(message);
    }
}

// ==============================================================================
// EMPLOYEE ACTIONS
// ==============================================================================

export async function createEmployee(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { message: 'Unauthorized', success: false };

    // 1. Extract Data
    const rawData = {
        first_name: String(formData.get('first_name')),
        last_name: String(formData.get('last_name')),
        email: String(formData.get('email')),
        phone: String(formData.get('phone')),
        department: String(formData.get('department')),
        position: String(formData.get('position')),
        salary: parseFloat(String(formData.get('salary'))),
        join_date: String(formData.get('join_date')),
        status: 'active'
    };

    // 2. Insert Employee
    const { data: emp, error: empError } = await supabase
        .from('employees')
        .insert(rawData)
        .select()
        .single();

    if (empError) {
        logger.error('Create employee error', empError);
        return { message: empError.message, success: false };
    }

    // 3. Workflow: Auto-Enroll in Payroll for Current Month
    if (emp && emp.salary > 0) {
        const today = new Date();
        const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        // Calculate Net (Basic logic, can import full calculator if needed, but keeping simple here to avoid circular dep risks if not carefully managed)
        // Accessing payroll logic via import
        const { calculateNetSalary } = await import('./payroll');
        const net = calculateNetSalary(emp.salary);

        const { error: payError } = await supabase
            .from('payroll_records')
            .insert({
                employee_id: emp.id,
                month: month,
                basic_salary: emp.salary,
                net_salary: net,
                status: 'pending',
                additions: 0,
                deductions: 0
            });
            
        if (payError) logger.warn('Failed to auto-create payroll', payError);
    }

    revalidatePath('/hr/employees');
    revalidatePath('/finance/payroll');
    return { message: 'Employee created and enrolled', success: true };
}
