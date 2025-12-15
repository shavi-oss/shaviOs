'use client';

import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/lib/types';

export function usePermission() {
    const { user, loading } = useAuth();

    const hasRole = (allowedRoles: UserRole[]) => {
        if (loading || !user) return false;
        return allowedRoles.includes(user.role);
    };

    const isAdmin = () => {
        if (loading || !user) return false;
        return user.role === 'admin' || user.role === 'developer';
    };

    const isDepartment = (dept: string) => {
        if (loading || !user) return false;
        return isAdmin() || user.department === dept;
    };

    return {
        user,
        loading,
        hasRole,
        isAdmin,
        isDepartment
    };
}
