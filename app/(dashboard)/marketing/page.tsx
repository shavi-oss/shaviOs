"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserPlus,
    BarChart3,
    TrendingUp
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface MarketingStats {
    totalLeads: number;
    qualifiedLeads: number;
    activeCampaigns: number;
    conversionRate: number;
}

export default function MarketingDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<MarketingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStats({
                totalLeads: 245,
                qualifiedLeads: 87,
                activeCampaigns: 5,
                conversionRate: 35.5
            });
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">التسويق</h1>
                <p className="text-muted-foreground mt-2">
                    إدارة العملاء المحتملين والحملات التسويقية
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="إجمالي العملاء المحتملين"
                    value={stats?.totalLeads || 0}
                    icon={Users}
                    description="عميل محتمل"
                    trend={{ value: 12.5, isPositive: true }}
                />
                <StatCard
                    title="عملاء مؤهلون"
                    value={stats?.qualifiedLeads || 0}
                    icon={UserPlus}
                    description="جاهز للتحويل"
                    trend={{ value: 8.2, isPositive: true }}
                />
                <StatCard
                    title="الحملات النشطة"
                    value={stats?.activeCampaigns || 0}
                    icon={BarChart3}
                    description="حملة قيد التنفيذ"
                />
                <StatCard
                    title="معدل التحويل"
                    value={`${stats?.conversionRate || 0}%`}
                    icon={TrendingUp}
                    description="نسبة التحويل الإجمالية"
                    trend={{ value: 3.5, isPositive: true }}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <button
                    onClick={() => router.push('/marketing/leads')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">إدارة العملاء المحتملين</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        عرض ومتابعة جميع العملاء المحتملين
                    </p>
                </button>
                <button
                    onClick={() => router.push('/marketing/campaigns')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">الحملات التسويقية</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        إنشاء وإدارة الحملات الإعلانية
                    </p>
                </button>
            </div>
        </div>
    );
}
