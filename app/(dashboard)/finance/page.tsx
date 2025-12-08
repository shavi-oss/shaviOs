"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    FileText,
    Receipt,
    TrendingUp
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

interface FinanceStats {
    totalRevenue: number;
    pendingInvoices: number;
    totalExpenses: number;
    netProfit: number;
}

export default function FinanceDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setStats({
                totalRevenue: 2450000,
                pendingInvoices: 12,
                totalExpenses: 54000,
                netProfit: 2396000
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
            <div>
                <h1 className="text-3xl font-bold text-foreground">المالية</h1>
                <p className="text-muted-foreground mt-2">إدارة الفواتير والمصروفات والإيرادات</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="إجمالي الإيرادات"
                    value={`${(stats?.totalRevenue || 0) / 1000}K جنيه`}
                    icon={DollarSign}
                    description="الإيرادات الإجمالية"
                    trend={{ value: 15.3, isPositive: true }}
                />
                <StatCard
                    title="الفواتير المعلقة"
                    value={stats?.pendingInvoices || 0}
                    icon={FileText}
                    description="فاتورة قيد الانتظار"
                    trend={{ value: 5.2, isPositive: false }}
                />
                <StatCard
                    title="إجمالي المصروفات"
                    value={`${(stats?.totalExpenses || 0) / 1000}K جنيه`}
                    icon={Receipt}
                    description="المصروفات الشهرية"
                />
                <StatCard
                    title="صافي الربح"
                    value={`${(stats?.netProfit || 0) / 1000}K جنيه`}
                    icon={TrendingUp}
                    description="الربح الصافي"
                    trend={{ value: 18.7, isPositive: true }}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <button
                    onClick={() => router.push('/finance/invoices')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">الفواتير</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إدارة فواتير الطلاب</p>
                </button>
                <button
                    onClick={() => router.push('/finance/expenses')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">المصروفات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تتبع المصروفات والنف قات</p>
                </button>
                <button
                    onClick={() => router.push('/finance/reports')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right"
                >
                    <h3 className="text-lg font-semibold mb-2">التقارير المالية</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عرض التقارير والتحليلات</p>
                </button>
            </div>
        </div>
    );
}
