"use client";

import { useState, useTransition } from 'react';
import { ArrowUpCircle, Loader2 } from 'lucide-react';
import { escalateTicket } from '@/app/actions/workflows';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/use-permission';

interface EscalationButtonProps {
    ticketId: string;
    ticketTitle: string;
    currentEscalationLevel: number;
    currentPriority: string;
    onEscalated?: () => void;
}

export function EscalationButton({
    ticketId,
    ticketTitle,
    currentEscalationLevel,
    currentPriority,
    onEscalated
}: EscalationButtonProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isPending, startTransition] = useTransition();
    const { hasRole } = usePermission();

    // RBAC: Only CS, Manager, Admin can escalate
    const canEscalate = hasRole(['admin', 'manager', 'customer_success']);

    if (!canEscalate) {
        return null;
    }

    // Max escalation level is 2
    if (currentEscalationLevel >= 2) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm">
                <ArrowUpCircle className="w-4 h-4" />
                <span>Max Escalation</span>
            </div>
        );
    }

    const handleEscalate = () => {
        if (!reason) {
            toast.error('الرجاء اختيار سبب التصعيد');
            return;
        }

        startTransition(async () => {
            try {
                const result = await escalateTicket(ticketId, reason, notes);
                
                toast.success(`تم تصعيد التذكرة إلى ${result.escalatedTo}`);
                setShowDialog(false);
                setReason('');
                setNotes('');
                onEscalated?.();
            } catch (error) {
                console.error('[ESCALATION_ERROR]', error);
                toast.error(
                    error instanceof Error 
                        ? error.message 
                        : 'فشل تصعيد التذكرة'
                );
            }
        });
    };

    const escalationPath = currentEscalationLevel === 0 
        ? 'CS Agent → Manager' 
        : 'Manager → Admin';

    return (
        <>
            <button
                onClick={() => setShowDialog(true)}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium disabled:opacity-50"
            >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Escalate</span>
            </button>

            {/* Escalation Dialog */}
            {showDialog && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => !isPending && setShowDialog(false)}
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                    <ArrowUpCircle className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        تصعيد التذكرة
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {ticketTitle}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">المستوى الحالي:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {currentEscalationLevel}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">المستوى الجديد:</span>
                                    <span className="font-medium text-orange-600">
                                        {currentEscalationLevel + 1}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">المسار:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {escalationPath}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        سبب التصعيد *
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        disabled={isPending}
                                    >
                                        <option value="">اختر السبب</option>
                                        <option value="manual">يحتاج موافقة المدير</option>
                                        <option value="priority_upgrade">أولوية عالية</option>
                                        <option value="customer_request">طلب العميل</option>
                                        <option value="sla_breach">تجاوز SLA</option>
                                        <option value="complex_issue">مشكلة معقدة</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ملاحظات (اختياري)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="أضف أي تفاصيل إضافية..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowDialog(false)}
                                    disabled={isPending}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleEscalate}
                                    disabled={isPending || !reason}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>جاري التصعيد...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpCircle className="w-4 h-4" />
                                            <span>تأكيد التصعيد</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
