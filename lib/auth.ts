import { createClient } from "@/lib/supabase/server";
import { User, UserRole } from "./types";

export interface SessionData {
    user: User;
}

/**
 * Get current authenticated session from Supabase
 * Returns null if user is not authenticated
 */
export async function getSession(): Promise<SessionData | null> {
    const supabase = await createClient();

    // Get authenticated user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    // Fetch user profile from profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Build user object
    const userData: User = {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: (profile?.role || user.user_metadata?.role || 'user') as UserRole,
        department: profile?.department || 'general',
        status: 'active',
        avatar_url: profile?.avatar_url || '',
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
    };

    return {
        user: userData
    };
}

/**
 * Check if user has one of the allowed roles
 */
export function hasRole(user: User, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(user.role);
}

/**
 * Check if user can access a specific department
 */
export function canAccessDepartment(user: User, department: string): boolean {
    // Admin can access all departments
    if (user.role === "admin") {
        return true;
    }

    // Users can access their own department
    return user.department === department;
}
