'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import type { Database } from '@/lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

// --- Validation Schemas ---
const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/; // Simple international phone regex

const createStudentSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').trim(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().regex(phoneRegex, 'Invalid phone number').optional().or(z.literal('')),
    status: z.enum(['active', 'at_risk', 'completed', 'paused', 'dropped']).default('active'),
});

const updateStudentSchema = createStudentSchema.partial();

// --- Helpers ---

/**
 * Centralized RBAC Check
 * @param action - simple action name for logging context
 * @param requiredRole - minimum role required (default: 'customer_success')
 */
async function checkPermission(action: string, allowedRoles: string[] = ['admin', 'manager', 'customer_success']) {
    const session = await getSession();
    if (!session || !session.user) {
        console.error(`[RBAC] Unauthorized attempt to ${action}`);
        throw new Error('Unauthorized');
    }

    const userRole = session.user.role || '';
    if (!allowedRoles.includes(userRole)) {
        console.error(`[RBAC] Forbidden: User ${session.user.email} (${userRole}) attempted to ${action}`);
        throw new Error('Forbidden: Insufficient permissions');
    }

    return { session, user: session.user };
}

/**
 * Structured Error Logging
 */
function logError(action: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[StudentsAction] Error in ${action}:`, {
        message: errorMessage,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
    });
    // In production: Sentry.captureException(error);
}

// --- Actions ---

/**
 * Get Students List (Advanced)
 * - Pagination (Page/Limit)
 * - Multi-field Search (Name, Email, Phone)
 * - Status Filter
 */
export async function getStudents(
    query: string = '', 
    status: string = 'all', 
    page: number = 1, 
    limit: number = 10
) {
    try {
        await checkPermission('getStudents'); // Ensure user can view list

        const supabase = await createClient();
        const offset = (page - 1) * limit;

        let dbQuery = supabase
            .from('students')
            .select('*', { count: 'exact' });

        // Multi-field Search
        if (query) {
            const sanitizedQuery = query.trim();
            // Using logic OR for multiple fields
            dbQuery = dbQuery.or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%`);
        }

        if (status !== 'all') {
            dbQuery = dbQuery.eq('status', status);
        }

        const { data, count, error } = await dbQuery
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return { data: data as Student[], count: count || 0 };

    } catch (error) {
        logError('getStudents', error);
        return { data: [], count: 0 };
    }
}

/**
 * Get Single Student Details (360 View)
 */
export async function getStudentById(id: string) {
    try {
        await checkPermission('getStudentById');

        const supabase = await createClient();

        // 1. Fetch Student Profile
        const { data: student, error: sErr } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();
        
        if (sErr) throw sErr;
        if (!student) return null;

        // 2. Fetch Enrollments
        const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
            id,
            created_at,
            status,
            course_sessions!inner (
                name,
                courses!inner (
                    title,
                    code
                )
            )
        `)
        .eq('student_id', id);

    const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('id, title, status, priority, created_at')
        .eq('student_id', id)
        .order('created_at', { ascending: false });

    return {
        profile: student,
        enrollments: enrollmentsData || [],
        tickets: ticketsData || []
    };
    } catch (error) {
        logError('getStudentById', error);
        return null;
    }
}

/**
 * Create New Student
 */
export async function createStudent(prevState: any, formData: FormData) {
    try {
        // RBAC Check
        await checkPermission('create student', ['admin', 'manager', 'customer_success']);

        const rawData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: formData.get('status') || 'active'
        };

        const validatedFields = createStudentSchema.safeParse(rawData);
        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Validation Failed',
                errors: validatedFields.error.flatten().fieldErrors,
                student: null
            };
        }

        const supabase = await createClient();
        const { data: student, error } = await supabase
            .from('students')
            .insert(validatedFields.data)
            .select()
            .single();

        if (error || !student) {
            logError('createStudent', error || new Error('No student returned'));
            return { success: false, message: error?.message || 'Failed to create student', student: null };
        }

        revalidatePath('/customer-success/students');
        return { success: true, message: 'Student created successfully', student };
    } catch (error) {
        logError('createStudent', error);
        return { success: false, message: 'Failed to create student', student: null };
    }
}

export async function updateStudent(id: string, formData: FormData) {
    try {
        // RBAC Check
        await checkPermission('update student', ['admin', 'manager', 'customer_success']);

        const rawData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: formData.get('status')
        };

        const validatedFields = updateStudentSchema.safeParse(rawData);
        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Validation Failed',
                errors: validatedFields.error.flatten().fieldErrors
            };
        }

        const supabase = await createClient();
        const { data: student, error } = await supabase
            .from('students')
            .update(validatedFields.data)
            .eq('id', id)
            .select()
            .single();

        if (error || !student) {
            logError('updateStudent', error || new Error('No student returned'));
            return { success: false, message: error?.message || 'Update failed', student: null };
        }

        // TODO: Trigger notification hook if status changed to 'at_risk'
        if (student.status === 'at_risk') {
            // await triggerStatusChangeNotification(student.id, 'at_risk');
        }

        revalidatePath('/customer-success/students');
        return { success: true, message: 'Student updated successfully', student };
    } catch (error) {
        logError('updateStudent', error);
        return { success: false, message: 'Failed to update student', student: null };
    }
}
