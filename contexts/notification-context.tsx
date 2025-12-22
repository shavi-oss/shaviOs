"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface Notification {
    id: string;
    type: 'sla_breach' | 'assignment' | 'message' | 'escalation' | 'system' | 'ticket_assigned' | 'ticket_escalated';
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    action_url?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    user_id: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const router = useRouter();
    const supabase = createClient();

    const [userId, setUserId] = useState<string | null>(null);

    // Initial Fetch & Auth Check
    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setNotifications(data as Notification[]);
            }
        };

        fetchNotifications();
    }, [supabase]);

    // Real-time Subscription
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                    
                    // Optional: Play sound or show browser notification here
                    console.log('New Notification:', newNotif);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
        );

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
            
        router.refresh();
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

        if (userId) {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false); // Only update unread ones
        }
    };

    const clearNotification = async (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        // We might want to actually delete it or just hide it? 
        // For now, let's just delete it from view or mark as dismissed if DB supports it.
        // Assuming delete for 'clear'
        await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                clearNotification
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
