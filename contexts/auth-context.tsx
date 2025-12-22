'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/user.types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    const fetchUser = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (!authUser) {
                setUser(null);
            } else {
                // Fetch profile to get role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    full_name: profile?.full_name || authUser.user_metadata?.full_name || 'User',
                    role: profile?.role || authUser.user_metadata?.role || 'user',
                    department: profile?.department || 'general',
                    status: 'active',
                    avatar_url: profile?.avatar_url || '',
                    created_at: profile?.created_at || new Date().toISOString(),
                    updated_at: profile?.updated_at || new Date().toISOString(),
                } as User);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, _session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await fetchUser();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchUser, router, supabase.auth]);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
