"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '@/lib/validations';
import { createExpense } from '@/app/actions/finance';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Save, DollarSign, Calendar, FileText, Tag, Loader2 } from 'lucide-react';
import { z } from 'zod';

type ExpenseFormData = z.infer<typeof expenseSchema>;

const categories = [
    { value: 'Salaries', label: 'الرواتب' },
    { value: 'Rent', label: 'الإيجار' },
    { value: 'Software', label: 'البرمجيات' },
    { value: 'Marketing', label: 'التسويق' },
    { value: 'Subscriptions', label: 'الاشتراكات' },
    { value: 'Suppliers', label: 'الموردين' },
    { value: 'Logistics', label: 'لوجستيات' },
    { value: 'Commissions', label: 'العمولات' },
    { value: 'Consulting', label: 'الاستشارات' },
    { value: 'Miscellaneous', label: 'متنوع' }
];

export default function NewExpensePage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            currency: 'EGP',
            expense_date: new Date()
        }
    });

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            const formData = new FormData();
            formData.append('category', data.category);
            if (data.subcategory) formData.append('subcategory', data.subcategory);
            formData.append('amount', String(data.amount));
            // Ensure currency is strictly string
            formData.append('currency', data.currency ?? 'EGP');
            formData.append('description', data.description);
            formData.append('date', new Date(data.expense_date).toISOString());
            
            // Explicit check for non-empty string URL
            if (data.receipt_url && typeof data.receipt_url === 'string') {
                formData.append('receipt_url', data.receipt_url);
            }

            const result = await createExpense(formData);

            if (result.success) {
                toast.success('تمت إضافة المصروف بنجاح');
                router.push('/finance/expenses');
            } else {
                toast.error(result.message || 'حدث خطأ أثناء الإضافة');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ غير متوقع');
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/finance/expenses"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowRight className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إضافة مصروف جديد</h1>
                    <p className="text-gray-500 text-sm mt-1">تأكد من إدخال البيانات بدقة للمراجعة المالية</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Amount & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                المبلغ
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('amount', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                    EGP
                                </span>
                            </div>
                            {errors.amount && (
                                <p className="text-red-500 text-xs">{errors.amount.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                التاريخ
                            </label>
                            <input
                                type="date"
                                {...register('expense_date', { valueAsDate: true })}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            {errors.expense_date && (
                                <p className="text-red-500 text-xs">{errors.expense_date.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" />
                            فئة المصروف
                        </label>
                        <select
                            {...register('category')}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="">اختر الفئة...</option>
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-red-500 text-xs">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            الوصف والتفاصيل
                        </label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            placeholder="اكتب وصفاً مفصلاً للمصروف..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Receipt URL (Optional for now) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            رابط الإيصال (اختياري)
                        </label>
                        <input
                            type="url"
                            {...register('receipt_url')}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="https://example.com/receipt.pdf"
                        />
                        {errors.receipt_url && (
                            <p className="text-red-500 text-xs">{errors.receipt_url.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <Link
                            href="/finance/expenses"
                            className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    حفظ المصروف
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
