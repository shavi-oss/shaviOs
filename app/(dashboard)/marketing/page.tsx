"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserPlus,
    BarChart3,
    TrendingUp,
    Megaphone,
    Radio,
    Settings,
    Bell,
    Share2,
    Activity,
    ArrowUpRight,
    Clock
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { createClient } from '@/lib/supabase/client';

interface MarketingStats {
    totalLeads: number;
    qualifiedLeads: number;
    activeCampaigns: number;
    conversionRate: number;
}

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    time: string;
    icon: React.ElementType;
    color: string;
}

export default function MarketingDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<MarketingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityLog[]>([]);

    useEffect(() => {
        // In a real app, fetch these from an 'audit_logs' or 'events' table
        // For now, we simulate "Latest Updates"
        setStats({
            totalLeads: 245,
            qualifiedLeads: 87,
            activeCampaigns: 5,
            conversionRate: 35.5
        });

        setActivities([
            { id: '1', action: 'New Lead', details: 'Added "Ahmed Ali" from Facebook Ads', time: '10 min ago', icon: UserPlus, color: 'text-green-500 bg-green-50' },
            { id: '2', action: 'Campaign Started', details: 'Summer Bootcamp 2025 is now Active', time: '1 hour ago', icon: Megaphone, color: 'text-blue-500 bg-blue-50' },
            { id: '3', action: 'Ad Spend Alert', details: 'Daily budget reached for Google Search', time: '2 hours ago', icon: BarChart3, color: 'text-red-500 bg-red-50' },
            { id: '4', action: 'Social Post', details: 'Published to Instagram & LinkedIn', time: '4 hours ago', icon: Share2, color: 'text-purple-500 bg-purple-50' }
        ]);

        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل لوحة التحكم...</p>
                </div>
            </div>
        );
    }

    const MENU_ITEMS = [
        { title: 'إدارة العملاء (Leads)', icon: Users, path: '/marketing/leads', color: 'text-blue-600 bg-blue-50', desc: 'متابعة العملاء المحتملين' },
        { title: 'مدير الإعلانات (Ads)', icon: Megaphone, path: '/marketing/ads', color: 'text-purple-600 bg-purple-50', desc: 'Meta, Google, TikTok' },
        { title: 'الحملات (Campaigns)', icon: BarChart3, path: '/marketing/campaigns', color: 'text-indigo-600 bg-indigo-50', desc: 'ادارة الحملات الداخلية' },
        { title: 'التحليلات (Analytics)', icon: TrendingUp, path: '/marketing/analytics', color: 'text-green-600 bg-green-50', desc: 'تقارير الأداء والعائد' },
        { title: 'منصات التواصل (Social)', icon: Share2, path: '/marketing/social', color: 'text-pink-600 bg-pink-50', desc: 'إدارة المنشورات' },
        { title: 'الإشعارات (Notifications)', icon: Bell, path: '/marketing/notifications', color: 'text-yellow-600 bg-yellow-50', desc: 'تنبيهات تيليجرام' },
        { title: 'الإعدادات (Settings)', icon: Settings, path: '/marketing/settings', color: 'text-gray-600 bg-gray-50', desc: 'ربط الحسابات والـ API' },
    ];

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">مركز التسويق الموحد</h1>
                    <p className="text-muted-foreground mt-2">
                        نظرة عامة على الأداء، الحملات، والنشاطات الأخيرة
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/marketing/leads/new')} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        إضافة عميل
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="العملاء (شوي)"
                    value={stats?.totalLeads || 0}
                    icon={Users}
                    description="عميل هذا الشهر"
                    trend={{ value: 12.5, isPositive: true }}
                />
                <StatCard
                    title="مؤهلون للبيع"
                    value={stats?.qualifiedLeads || 0}
                    icon={UserPlus}
                    description="جاهز للإغلاق"
                    trend={{ value: 8.2, isPositive: true }}
                />
                <StatCard
                    title="حملات نشطة"
                    value={stats?.activeCampaigns || 0}
                    icon={Radio}
                    description="عبر جميع المنصات"
                />
                <StatCard
                    title="معدل التحويل"
                    value={`${stats?.conversionRate || 0}%`}
                    icon={Activity}
                    description="نسبة نجاح"
                    trend={{ value: 3.5, isPositive: true }}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Menu Grid (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500" />
                        أدوات التحكم
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {MENU_ITEMS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => router.push(item.path)}
                                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md transition-all text-right group"
                                >
                                    <div className={`p-3 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity Feed (1/3 width) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        آخر التحديثات
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <div className="space-y-6">
                            {activities.map((activity, idx) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Connector Line */}
                                        {idx !== activities.length - 1 && (
                                            <div className="absolute top-10 right-5 bottom-[-24px] w-0.5 bg-gray-100 dark:bg-gray-700" />
                                        )}

                                        <div className={`relative z-10 p-2 rounded-full h-fit ${activity.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{activity.action}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.details}</p>
                                            <p className="text-[10px] text-gray-400 mt-2">{activity.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-6 py-2 text-xs text-center text-gray-500 hover:text-primary transition-colors border-t border-gray-100 dark:border-gray-700">
                            عرض كل النشاطات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
