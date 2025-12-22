"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTicket } from '@/app/actions/tickets';
import { 
    ArrowLeft, 
    AlertCircle, 
    CheckCircle2,
    Loader2,
    Ticket
} from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formState, setFormState] = useState({
        success: false,
        message: '',
        errors: {} as Record<string, string[]>
    });

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await createTicket(null, formData);
            
            if (result.success) {
                setFormState({
                    success: true,
                    message: result.message,
                    errors: {}
                });
                
                // Redirect after 1.5 seconds
                setTimeout(() => {
                    router.push('/customer-success/tickets');
                }, 1500);
            } else {
                setFormState({
                    success: false,
                    message: result.message,
                    errors: result.errors || {}
                });
            }
        });
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link 
                    href="/customer-success/tickets"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    العودة إلى التذاكر
                </Link>
                
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">تذكرة جديدة</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            إنشاء تذكرة دعم فني للطلاب
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {formState.success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="font-bold text-green-900 dark:text-green-100">
                            نجح إنشاء التذكرة!
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {formState.message}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            جاري التحويل إلى قائمة التذاكر...
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {!formState.success && formState.message && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-900 dark:text-red-100">
                            خطأ في الإنشاء
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {formState.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form action={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                {/* Subject Field */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-foreground mb-2">
                        الموضوع <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        minLength={5}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="مثال: مشكلة في تسجيل الدخول"
                        disabled={isPending || formState.success}
                    />
                    {formState.errors.subject && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {formState.errors.subject[0]}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        يجب أن يكون الموضوع 5 أحرف على الأقل
                    </p>
                </div>

                {/* Description Field */}
                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-foreground mb-2">
                        الوصف التفصيلي <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        minLength={10}
                        rows={5}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="اشرح المشكلة بالتفصيل..."
                        disabled={isPending || formState.success}
                    />
                    {formState.errors.description && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {formState.errors.description[0]}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        يجب أن يكون الوصف 10 أحرف على الأقل
                    </p>
                </div>

                {/* Priority Field */}
                <div>
                    <label htmlFor="priority" className="block text-sm font-bold text-foreground mb-2">
                        الأولوية <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={isPending || formState.success}
                    >
                        <option value="low">منخفضة - Low</option>
                        <option value="medium">متوسطة - Medium</option>
                        <option value="high">عالية - High</option>
                        <option value="urgent">عاجلة - Urgent</option>
                    </select>
                    {formState.errors.priority && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {formState.errors.priority[0]}
                        </p>
                    )}
                </div>

                {/* Student Info */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <label htmlFor="student_name" className="block text-sm font-bold text-foreground mb-2">
                            اسم الطالب (اختياري)
                        </label>
                        <input
                            type="text"
                            id="student_name"
                            name="student_name"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="أحمد محمد"
                            disabled={isPending || formState.success}
                        />
                    </div>

                    <div>
                        <label htmlFor="student_email" className="block text-sm font-bold text-foreground mb-2">
                            بريد الطالب (اختياري)
                        </label>
                        <input
                            type="email"
                            id="student_email"
                            name="student_email"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="student@example.com"
                            disabled={isPending || formState.success}
                        />
                        {formState.errors.student_email && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {formState.errors.student_email[0]}
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isPending || formState.success}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري الإنشاء...
                            </>
                        ) : formState.success ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                تم الإنشاء بنجاح
                            </>
                        ) : (
                            <>
                                <Ticket className="w-4 h-4" />
                                إنشاء التذكرة
                            </>
                        )}
                    </button>
                    
                    <Link
                        href="/customer-success/tickets"
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        إلغاء
                    </Link>
                </div>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-foreground mb-2">نصائح لإنشاء تذكرة فعالة:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>استخدم عنوان واضح ومحدد للموضوع</li>
                    <li>اذكر تفاصيل المشكلة بدقة في الوصف</li>
                    <li>حدد الأولوية بناءً على مدى تأثير المشكلة</li>
                    <li>أضف معلومات الطالب إذا كانت التذكرة تخصه</li>
                </ul>
            </div>
        </div>
    );
}
