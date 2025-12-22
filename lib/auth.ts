import { createClient } from "@/lib/supabase/server";
import { User, UserRole } from "./user.types";

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
 * Verify user credentials and return user if valid
 * Used by login API route
 */
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !data.user) {
        return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    // Build user object
    const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        full_name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        role: (profile?.role || data.user.user_metadata?.role || 'user') as UserRole,
        department: profile?.department || 'general',
        status: 'active',
        avatar_url: profile?.avatar_url || '',
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
    };

    return userData;
}

/**
 * Create a session for the authenticated user
 * Session is managed by Supabase Auth automatically
 */
export async function createSession(_user: User): Promise<void> {
    // Session is already created by Supabase Auth during signInWithPassword
    // This function exists for API compatibility but doesn't need to do anything
    // as Supabase handles session management automatically
    return;
}

/**
 * Destroy the current session (logout)
 */
export async function destroySession(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
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

