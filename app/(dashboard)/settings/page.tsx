"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { createClient } from '@/lib/supabase/client';
import {
    User,
    Mail,
    Bell,
    Moon,
    Sun,
    Monitor,
    Shield,
    LogOut,
    Save,
    Check,
    Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        language: 'ar',
        notifications: {
            email: true,
            push: true,
            marketing: false
        }
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    async function fetchUserProfile() {
        // In a real app, we'd get the session user ID.
        // For this demo/MVP, we'll fetch the first admin/manager employee or use a placeholder
        try {
            const supabase = createClient();
            // Try to find an employee profile that matches "admin" or just first one
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .limit(1)
                .single();

            if (data && !error) {
                setProfile(prev => ({
                    ...prev,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    phone: data.phone || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
                <p className="text-muted-foreground mt-2">تخصيص النظام وإدارة الحساب الشخصي</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">الملف الشخصي</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">الاسم الأول</label>
                                <input
                                    type="text"
                                    value={profile.first_name}
                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="الاسم الأول"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">الاسم الأخير</label>
                                <input
                                    type="text"
                                    value={profile.last_name}
                                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="الاسم الأخير"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">اللغة</label>
                            <div className="relative">
                                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={profile.language}
                                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                                    className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                >
                                    <option value="ar">العربية (Arabic)</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance & Preferences */}
                <div className="space-y-6">
                    {/* Theme */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-xl font-semibold">المظهر</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${theme === 'light'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-transparent bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Sun className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">فاتح</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${theme === 'dark'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-transparent bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Moon className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">داكن</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${theme === 'system'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-transparent bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Monitor className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">تلقائي</span>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-xl font-semibold">الإشعارات</h2>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium">إشعارات البريد الإلكتروني</span>
                                <input
                                    type="checkbox"
                                    checked={profile.notifications.email}
                                    onChange={(e) => setProfile(p => ({ ...p, notifications: { ...p.notifications, email: e.target.checked } }))}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium">إشعارات المتصفح (Push)</span>
                                <input
                                    type="checkbox"
                                    checked={profile.notifications.push}
                                    onChange={(e) => setProfile(p => ({ ...p, notifications: { ...p.notifications, push: e.target.checked } }))}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                </button>

                <div className="flex gap-3">
                    <button className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium">
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-medium disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : success ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {success ? 'تم الحفظ!' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>
        </div>
    );
}
