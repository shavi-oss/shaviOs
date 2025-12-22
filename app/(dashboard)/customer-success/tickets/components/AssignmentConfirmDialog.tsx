"use client";

import { X } from 'lucide-react';

interface AssignmentConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    ticketTitle: string;
    currentStatus: string;
    currentAssignee: string | null;
    targetAgent: string | null;
}

export function AssignmentConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    ticketTitle,
    currentStatus,
    currentAssignee,
    targetAgent,
}: AssignmentConfirmDialogProps) {
    const isUnassigning = targetAgent === null;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={() => onOpenChange(false)}
            />
            
            {/* Dialog */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isUnassigning ? 'إلغاء تخصيص التذكرة' : 'تخصيص التذكرة'}
                    </h2>
                </div>

                {/* Content */}
                <div className="space-y-3 text-sm mb-6">
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">التذكرة:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{ticketTitle}</p>
                    </div>
                    
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">الحالة الحالية:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{currentStatus}</p>
                    </div>

                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">المخصص حالياً:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {currentAssignee || 'غير مخصص'}
                        </p>
                    </div>

                    {!isUnassigning && (
                        <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">سيتم التخصيص إلى:</span>
                            <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                                {targetAgent}
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-4">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            {isUnassigning 
                                ? '⚠️ سيتم تغيير حالة التذكرة إلى "مفتوحة" تلقائياً'
                                : '✓ سيتم تغيير حالة التذكرة إلى "قيد المعالجة" تلقائياً'
                            }
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        تأكيد التخصيص
                    </button>
                </div>
            </div>
        </div>
    );
}
