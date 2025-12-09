"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    Briefcase,
    TrendingUp,
    Target
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface SalesStats {
    totalRevenue: number;
    activeDeals: number;
    winRate: number;
    pipelineValue: number;
}

export default function SalesDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStats({
                totalRevenue: 2450000,
                activeDeals: 34,
                winRate: 68.5,
                pipelineValue: 1850000
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
                <h1 className="text-3xl font-bold text-foreground">المبيعات</h1>
                <p className="text-muted-foreground mt-2">
                    إدارة الصفقات ومتابعة الأداء البيعي
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="إجمالي الإيرادات"
                    value={`${(stats?.totalRevenue || 0) / 1000}K جنيه`}
                    icon={DollarSign}
                    description="الإيرادات الإجمالية"
                    trend={{ value: 15.3, isPositive: true }}
                />
                <StatCard
                    title="الصفقات النشطة"
                    value={stats?.activeDeals || 0}
                    icon={Briefcase}
                    description="صفقة قيد التنفيذ"
                    trend={{ value: 8.2, isPositive: true }}
                />
                <StatCard
                    title="معدل الإغلاق"
                    value={`${stats?.winRate || 0}%`}
                    icon={Target}
                    description="نسبة نجاح الصفقات"
                    trend={{ value: 3.5, isPositive: true }}
                />
                <StatCard
                    title="قيمة خط الأنابيب"
                    value={`${(stats?.pipelineValue || 0) / 1000}K جنيه`}
                    icon={TrendingUp}
                    description="القيمة المتوقعة"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <button
                    onClick={() => router.push('/sales/deals')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">إدارة الصفقات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        عرض ومتابعة جميع الصفقات النشطة
                    </p>
                </button>
                <button
                    onClick={() => router.push('/sales/pipeline')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">خط الأنابيب</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        تحليل ومتابعة خط مبيعات الشركة
                    </p>
                </button>
                <button
                    onClick={() => router.push('/sales/commissions')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">العمولات والمكافآت</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        متابعة استحقاقات وصرف عمولات الموظفين
                    </p>
                </button>
            </div>
        </div>
    );
}
