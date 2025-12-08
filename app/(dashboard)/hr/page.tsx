"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserCheck,
    Calendar,
    Banknote
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface HRStats {
    totalEmployees: number;
    onLeave: number;
    pendingLeave: number;
}

export default function HRDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<HRStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setStats({
                totalEmployees: 45,
                onLeave: 3,
                pendingLeave: 5
            });
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">الموارد البشرية</h1>
                <p className="text-muted-foreground mt-2">إدارة الموظفين والرواتب والإجازات</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="إجمالي الموظفين"
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    description="موظف نشط"
                    trend={{ value: 8.3, isPositive: true }}
                />
                <StatCard
                    title="موظفون في إجازة"
                    value={stats?.onLeave || 0}
                    icon={Calendar}
                    description="إجازة حالية"
                />
                <StatCard
                    title="طلبات إجازة معلقة"
                    value={stats?.pendingLeave || 0}
                    icon={UserCheck}
                    description="تحتاج موافقة"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <button
                    onClick={() => router.push('/hr/employees')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">دليل الموظفين</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عرض وإدارة الموظفين</p>
                </button>
                <button
                    onClick={() => router.push('/hr/leave')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">إدارة الإجازات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">طلبات وموافقات الإجازات</p>
                </button>
                <button
                    onClick={() => router.push('/hr/payroll')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">كشوف المرتبات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">معالجة الرواتب الشهرية</p>
                </button>
            </div>
        </div>
    );
}
