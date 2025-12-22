"use client";

import { useState, useTransition } from 'react';
import { updateTicket } from '@/app/actions/tickets';
import { ChevronDown, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
    { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
];

export function StatusDropdown({ 
    ticketId, 
    currentStatus,
    onStatusChange 
}: { 
    ticketId: string;
    currentStatus: string;
    onStatusChange?: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleStatusChange(newStatus: Status) {
        if (newStatus === currentStatus) {
            setIsOpen(false);
            return;
        }

        setIsOpen(false);
        
        startTransition(async () => {
            try {
                await updateTicket(ticketId, { status: newStatus });
                toast.success(`تم تحديث الحالة إلى ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`);
                onStatusChange?.();
            } catch (error) {
                console.error('Failed to update status:', error);
                toast.error('فشل تحديث الحالة');
            }
        });
    }

    const currentOption = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0];

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${currentOption.color} hover:opacity-80 transition-opacity disabled:opacity-50`}
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        جاري التحديث...
                    </>
                ) : (
                    <>
                        {currentOption.label}
                        <ChevronDown className="w-3 h-3" />
                    </>
                )}
            </button>

            {isOpen && !isPending && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[150px]">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between first:rounded-t-lg last:rounded-b-lg"
                            >
                                <span className="font-medium">{option.label}</span>
                                {option.value === currentStatus && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
