'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createDeal } from '@/app/actions/sales';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function NewDealForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<{id: string, name: string}[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        currency: 'EGP',
        stage: 'lead',
        customer_name: '',
        customer_company: '',
        expected_close_date: '',
        notes: ''
    });

    useEffect(() => {
        // No fetch needed for now as we are using text input for customer name/company
        // per schema (denormalized or simple CRM).
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createDeal({
            title: formData.title,
            value: parseFloat(formData.value) || 0,
            currency: formData.currency,
            stage: formData.stage,
            customer_name: formData.customer_name,
            customer_company: formData.customer_company,
            expected_close_date: formData.expected_close_date || null,
            notes: formData.notes
        });

        if (result.success) {
            router.push('/sales/deals');
            router.refresh();
        } else {
            alert('Failed to create deal: ' + result.error);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">صفقة جديدة</h1>
                    <p className="text-gray-500">أضف فرصة بيع جديدة إلى القائمة</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">عنوان الصفقة <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="مثال: صفقة توريد أجهزة - شركة الأمل"
                    />
                </div>
                
                 {/* Customer Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">اسم العميل</label>
                        <input 
                            type="text" 
                            value={formData.customer_name}
                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="اسم الشخص المسؤول"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">اسم الشركة</label>
                        <input 
                            type="text" 
                            value={formData.customer_company}
                            onChange={(e) => setFormData({...formData, customer_company: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="الشركة (اختياري)"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium mb-2">القيمة المتوقعة</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0"
                                value={formData.value}
                                onChange={(e) => setFormData({...formData, value: e.target.value})}
                                className="w-full p-3 pl-16 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="0.00"
                            />
                            <select 
                                value={formData.currency}
                                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                className="absolute left-0 top-0 bottom-0 px-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 rounded-l-lg text-sm outline-none"
                            >
                                <option value="EGP">EGP</option>
                                <option value="USD">USD</option>
                                <option value="SAR">SAR</option>
                                <option value="AED">AED</option>
                            </select>
                        </div>
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="block text-sm font-medium mb-2">المرحلة</label>
                        <select 
                            value={formData.stage}
                            onChange={(e) => setFormData({...formData, stage: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="lead">عميل محتمل (Lead)</option>
                            <option value="contacted">تم التواصل (Contacted)</option>
                            <option value="proposal">عرض سعر (Proposal)</option>
                            <option value="negotiation">تفاوض (Negotiation)</option>
                            <option value="closed_won">تم الإغلاق - نجاح (Won)</option>
                            <option value="closed_lost">تم الإغلاق - خسارة (Lost)</option>
                        </select>
                    </div>
                </div>

                {/* Date & Customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">تاريخ الإغلاق المتوقع</label>
                        <input 
                            type="date" 
                            value={formData.expected_close_date}
                            onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات</label>
                    <textarea 
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        placeholder="تفاصيل إضافية حول الصفقة..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        إلغاء
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        حفظ الصفقة
                    </button>
                </div>

            </form>
        </div>
    );
}
