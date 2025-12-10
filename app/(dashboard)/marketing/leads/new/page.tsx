"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    User,
    Mail,
    Phone,
    Building2,
    ArrowRight,
    Save,
    CheckCircle
} from 'lucide-react';

export default function NewLeadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        source: 'manual',
        status: 'new',
        temperature: 'cold'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            // 1. Insert Lead
            const { data, error } = await supabase
                .from('leads')
                .insert([
                    {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        company: formData.company,
                        source: formData.source,
                        status: formData.status,
                        temperature: formData.temperature,
                        total_score: 10 // Default score
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            console.log('Lead created:', data);

            // 2. Trigger Notification Event (Async)
            await fetch('/api/marketing/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'lead_new',
                    payload: data
                })
            });

            // 3. Redirect
            router.push('/marketing/leads');
            router.refresh();

        } catch (error) {
            console.error('Error creating lead:', error);
            alert('Failed to create lead. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6"
            >
                <ArrowRight className="w-4 h-4" />
                عودة للقائمة
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">إضافة عميل جديد</h1>
                    <p className="text-muted-foreground mt-1">أدخل بيانات العميل المحتمل لبدء المتابعة</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">الاسم الأول <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="first_name"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">اسم العائلة <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">الشركة / المؤسسة</label>
                        <div className="relative">
                            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">المصدر</label>
                            <select
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                <option value="manual">إدخال يدوي</option>
                                <option value="facebook">Facebook Ads</option>
                                <option value="website">الموقع الإلكتروني</option>
                                <option value="referral">توصية</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">درجة الاهتمام</label>
                            <select
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                <option value="cold">❄️ بارد (Cold)</option>
                                <option value="warm">🔥 دافئ (Warm)</option>
                                <option value="hot">🚀 ساخن (Hot)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            حفظ العميل
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
