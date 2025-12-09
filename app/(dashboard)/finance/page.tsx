"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const supabase = createClient();

            // 1. Fetch Transactions (Revenue & Expenses)
            const { data: transactions } = await supabase
                .from('transactions')
                .select('type, amount');

            // 2. Fetch Pending Invoices Count
            const { count } = await supabase
                .from('invoices')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (transactions) {
                let revenue = 0;
                let expenses = 0;

                transactions.forEach(t => {
                    if (t.type === 'income') revenue += t.amount;
                    else if (t.type === 'expense') expenses += t.amount;
                });

                setStats({
                    totalRevenue: revenue,
                    totalExpenses: expenses,
                    netProfit: revenue - expenses,
                    pendingInvoices: count || 0
                });
            }

        } catch (error) {
            console.error('Error fetching finance stats:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    value={`${(stats?.totalRevenue || 0).toLocaleString()} EGP`}
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
                    value={`${(stats?.totalExpenses || 0).toLocaleString()} EGP`}
                    icon={Receipt}
                    description="المصروفات الشهرية"
                />
                <StatCard
                    title="صافي الربح"
                    value={`${(stats?.netProfit || 0).toLocaleString()} EGP`}
                    icon={TrendingUp}
                    description="الربح الصافي"
                    trend={{ value: 18.7, isPositive: true }}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <button
                    onClick={() => router.push('/finance/invoices')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right group"
                >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 w-fit rounded-lg mb-4 group-hover:bg-blue-100 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">الفواتير</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إدارة فواتير الطلاب والمدفوعات</p>
                </button>
                <button
                    onClick={() => router.push('/finance/expenses')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right group"
                >
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 w-fit rounded-lg mb-4 group-hover:bg-red-100 transition-colors">
                        <Receipt className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">المصروفات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تتبع المصروفات والنفقات التشغيلية</p>
                </button>
                <button
                    onClick={() => router.push('/finance/reports')}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right group"
                >
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 w-fit rounded-lg mb-4 group-hover:bg-green-100 transition-colors">
                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">التقارير المالية</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عرض التقارير والتحليلات البيانية</p>
                </button>
            </div>
        </div>
    );
}
