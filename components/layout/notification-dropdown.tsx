"use client";

import { useNotifications } from '@/contexts/notification-context';
import { Bell, CheckCheck, Clock, AlertTriangle, MessageSquare, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

    if (!isOpen) return null;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'sla_breach': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'assignment': return <UserPlus className="w-4 h-4 text-blue-500" />;
            case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
            case 'escalation': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'border-l-4 border-red-500 bg-red-50/50 dark:bg-red-900/10';
            case 'high': return 'border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
            case 'medium': return 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
            default: return 'border-l-4 border-gray-300';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose}></div>

            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                        >
                            <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors relative group ${!notif.read ? getPriorityColor(notif.priority) : 'border-l-4 border-transparent'
                                        }`}
                                >
                                    {notif.actionUrl ? (
                                        <Link
                                            href={notif.actionUrl}
                                            onClick={() => {
                                                markAsRead(notif.id);
                                                onClose();
                                            }}
                                            className="block"
                                        >
                                            <NotificationContent notification={notif} />
                                        </Link>
                                    ) : (
                                        <div onClick={() => markAsRead(notif.id)} className="cursor-pointer">
                                            <NotificationContent notification={notif} />
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearNotification(notif.id);
                                        }}
                                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-red-50 hover:border-red-300"
                                    >
                                        <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <Link
                            href="/notifications"
                            onClick={onClose}
                            className="text-xs text-center block text-blue-600 hover:text-blue-700 font-bold"
                        >
                            View all notifications
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

function NotificationContent({ notification }: { notification: any }) {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'sla_breach': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'assignment': return <UserPlus className="w-4 h-4 text-blue-500" />;
            case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
            case 'escalation': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/30'
                }`}>
                {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-bold ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                    </h4>
                    {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </div>
            </div>
        </div>
    );
}
