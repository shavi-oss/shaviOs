"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/lib/types";

interface NotificationItemProps {
    notification: Notification;
    onDismiss?: (id: string) => void;
}

export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
    const typeStyles = {
        info: "bg-blue-50 border-blue-200 text-blue-800",
        success: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        error: "bg-red-50 border-red-200 text-red-800",
    };

    return (
        <div
            className={cn(
                "relative flex items-start gap-3 p-4 border rounded-lg",
                typeStyles[notification.type] || typeStyles.info,
                !notification.read && "font-medium"
            )}
        >
            <div className="flex-1">
                <h4 className="text-sm font-semibold">{notification.title}</h4>
                {notification.message && (
                    <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                )}
                <p className="text-xs mt-2 opacity-70">
                    {new Date(notification.created_at).toLocaleString("ar-EG")}
                </p>
            </div>
            {onDismiss && (
                <button
                    onClick={() => onDismiss(notification.id)}
                    className="p-1 hover:bg-black/5 rounded"
                    aria-label="Dismiss notification"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
