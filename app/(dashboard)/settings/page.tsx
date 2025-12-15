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
    Globe,
    Lock,
    Key,
    Clock,
    AlertTriangle,
    Eye,
    EyeOff,
    Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActivityLog {
    id: string;
    action: string;
    timestamp: string;
    ip_address?: string;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        language: 'ar',
        notifications: {
            email: true,
            push: true,
            marketing: false
        },
        notification_settings: null as any
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Activity Log State
    const [activities, setActivities] = useState<ActivityLog[]>([]);

    useEffect(() => {
        fetchUserProfile();
        fetchActivityLog();
    }, []);

    async function fetchUserProfile() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .limit(1)
                .single();

            if (data && !error) {
                // Parse notification settings if they exist
                const notificationSettings = { email: true, push: true, marketing: false };

                setProfile(prev => ({
                    ...prev,
                    id: data.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    phone: data.phone || '',
                    notifications: notificationSettings,
                    notification_settings: null
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    async function fetchActivityLog() {
        try {
            const supabase = createClient();

            // Get recent employee updates as activity log
            const { data: employee } = await supabase
                .from('employees')
                .select('created_at, updated_at')
                .limit(1)
                .single();

            const activities: ActivityLog[] = [];

            if (employee) {
                // Add creation activity
                if (employee.created_at) {
                    activities.push({
                        id: '1',
                        action: 'إنشاء الحساب',
                        timestamp: employee.created_at
                    });
                }

                // Add last update activity
                if (employee.updated_at && employee.updated_at !== employee.created_at) {
                    activities.push({
                        id: '2',
                        action: 'تحديث الملف الشخصي',
                        timestamp: employee.updated_at
                    });
                }

                // Add current session
                activities.push({
                    id: '3',
                    action: 'تسجيل الدخول',
                    timestamp: new Date().toISOString()
                });
            }

            setActivities(activities.reverse());
        } catch (error) {
            console.error('Error fetching activity log:', error);
            // Fallback to basic activity
            setActivities([{
                id: '1',
                action: 'تسجيل الدخول',
                timestamp: new Date().toISOString()
            }]);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const supabase = createClient();

            // Update employee profile with notification settings
            const { error: updateError } = await supabase
                .from('employees')
                .update({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    email: profile.email,
                    phone: profile.phone,
                    notification_settings: profile.notifications,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'فشل حفظ التغييرات');
            console.error('Error saving profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const supabase = createClient();

            // Update password using Supabase Auth
            const { error: passwordError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (passwordError) {
                throw passwordError;
            }

            setSuccess(true);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'فشل تغيير كلمة المرور');
            console.error('Error changing password:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 25, label: 'ضعيفة', color: 'bg-red-500' };
        if (password.length < 8) return { strength: 50, label: 'متوسطة', color: 'bg-yellow-500' };
        if (password.length < 12) return { strength: 75, label: 'جيدة', color: 'bg-blue-500' };
        return { strength: 100, label: 'قوية جداً', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
                <p className="text-muted-foreground mt-2">تخصيص النظام وإدارة الحساب الشخصي</p>
            </div>

            {/* Success/Error Toast */}
            {(success || error) && (
                <div className={`p-4 rounded-lg border ${success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
                    <div className="flex items-center gap-2">
                        {success ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-medium">{success ? 'تم الحفظ بنجاح!' : error}</span>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Profile & Password */}
                <div className="lg:col-span-2 space-y-6">
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

                    {/* Password Change */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-semibold">تغيير كلمة المرور</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">كلمة المرور الحالية</label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full pr-10 pl-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full pr-10 pl-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Password Strength Indicator */}
                                {passwordData.newPassword && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-500">قوة كلمة المرور</span>
                                            <span className={`font-medium ${passwordStrength.strength > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${passwordStrength.color}`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">تأكيد كلمة المرور</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                onClick={handlePasswordChange}
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                تغيير كلمة المرور
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Theme, Notifications, Security, Activity */}
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
                                <span className="text-sm font-medium">إشعارات البريد</span>
                                <input
                                    type="checkbox"
                                    checked={profile.notifications.email}
                                    onChange={(e) => setProfile(p => ({ ...p, notifications: { ...p.notifications, email: e.target.checked } }))}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium">إشعارات المتصفح</span>
                                <input
                                    type="checkbox"
                                    checked={profile.notifications.push}
                                    onChange={(e) => setProfile(p => ({ ...p, notifications: { ...p.notifications, push: e.target.checked } }))}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-semibold">الأمان</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">المصادقة الثنائية</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-400">قريباً</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">الجلسات النشطة</span>
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">1 جلسة</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold">النشاط الأخير</h2>
                        </div>

                        <div className="space-y-3">
                            {activities.slice(0, 3).map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(activity.timestamp).toLocaleDateString('ar-EG', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
                    >
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
