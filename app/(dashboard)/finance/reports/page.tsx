"use client";

import { useEffect, useState } from 'react';
import { getFinancialMetrics } from '@/app/actions/finance';
import {
    FileText,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Download,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

interface FinancialReport {
    summary: {
        revenue: number;
        expenses: number;
        profit: number;
        assets: number;
        liabilities: number;
        equity: number;
    };
    trend: Array<{
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
    }>;
}

export default function FinancialReportsPage() {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await getFinancialMetrics();
            setReport(data);
        } catch (err) {
            console.error('Failed to fetch report:', err);
            toast.error('فشل في تحميل التقارير المالية');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !report) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التقارير...</p>
                </div>
            </div>
        );
    }

    const { summary, trend } = report;

    // Simple manual calc for margin (avoid division by zero)
    const profitMargin = summary.revenue !== 0 ? (summary.profit / summary.revenue) * 100 : 0;

    // Mock ROE if equity is 0
    const roe = summary.equity > 0 ? (summary.profit / summary.equity) * 100 : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        التقارير المالية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">تقارير شاملة عن الأداء المالي (آخر 6 أشهر)</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير PDF
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            <div className="text-3xl font-bold">{(summary.revenue / 1000).toFixed(0)}K</div>
                            <div className="text-sm opacity-90">الإيرادات</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingDown className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            <div className="text-3xl font-bold">{(summary.expenses / 1000).toFixed(0)}K</div>
                            <div className="text-sm opacity-90">المصروفات</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            <div className="text-3xl font-bold">{(summary.profit / 1000).toFixed(0)}K</div>
                            <div className="text-sm opacity-90">صافي الربح</div>
                        </div>
                    </div>
                    <div className="text-sm opacity-90">هامش ربح {profitMargin.toFixed(1)}%</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <BarChart3 className="w-12 h-12 opacity-80" />
                        <div className="text-right">
                            {/* If ROE is 0, show placeholder or simple text */}
                            <div className="text-3xl font-bold">{roe > 0 ? `${roe.toFixed(1)}%` : 'N/A'}</div>
                            <div className="text-sm opacity-90">العائد على حقوق الملكية</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* P&L Statement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">قائمة الدخل (Summary)</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">الإيرادات</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {summary.revenue.toLocaleString('ar-EG')} جنيه
                        </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">المصروفات (تشمل الرواتب)</span>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            ({summary.expenses.toLocaleString('ar-EG')}) جنيه
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                        <span className="font-bold text-gray-900 dark:text-white">صافي الربح</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {summary.profit.toLocaleString('ar-EG')} جنيه
                        </span>
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">الاتجاه الشهري (آخر 6 أشهر)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" name="الإيرادات" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="المصروفات" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="الربح" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
