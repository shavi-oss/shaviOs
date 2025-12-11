"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'sla_breach' | 'assignment' | 'message' | 'escalation' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Simulate initial notifications
    useEffect(() => {
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'sla_breach',
                title: 'SLA Breach Warning',
                message: 'Ticket #1025 will breach SLA in 15 minutes',
                timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
                read: false,
                actionUrl: '/customer-success/tickets/1025',
                priority: 'urgent'
            },
            {
                id: '2',
                type: 'assignment',
                title: 'New Ticket Assigned',
                message: 'Ticket #1026 has been assigned to you',
                timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
                read: false,
                actionUrl: '/customer-success/tickets/1026',
                priority: 'high'
            },
            {
                id: '3',
                type: 'message',
                title: 'New Customer Reply',
                message: 'Ahmed Ali replied to Ticket #1025',
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
                read: true,
                actionUrl: '/customer-success/tickets/1025',
                priority: 'medium'
            }
        ];
        setNotifications(mockNotifications);

        // Simulate new notifications every 30 seconds
        const interval = setInterval(() => {
            const newNotif: Notification = {
                id: Date.now().toString(),
                type: ['message', 'assignment', 'escalation'][Math.floor(Math.random() * 3)] as any,
                title: 'New Activity',
                message: 'A new event occurred in the system',
                timestamp: new Date(),
                read: false,
                priority: 'medium'
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 20)); // Keep last 20
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
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
